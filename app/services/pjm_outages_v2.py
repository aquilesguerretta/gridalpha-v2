"""Wave-5 outage feed.

PJM Data Miner 2 does not expose a public per-unit outage feed
(``gen_outages_by_unit`` returns 404 from api.pjm.com under the public
subscription key V1 and V2 use). The aggregated feed
``gen_outages_by_type`` is the only public alternative, and despite its
name it does NOT break outages down by fuel type - it publishes one row
per region per day with separate columns for planned, maintenance and
forced megawatts.

Actual response shape from gen_outages_by_type::

    {
      "forecast_execution_date_ept": "2026-05-10T00:00:00",
      "forecast_date":               "2026-05-10T00:00:00",
      "region":                      "PJM RTO" | "Mid Atlantic - Dominion" | "Western",
      "total_outages_mw":            66047,
      "planned_outages_mw":          49208,
      "maintenance_outages_mw":      7349,
      "forced_outages_mw":           9490
    }

Each contract row produced here therefore represents an *aggregate*
outage bucket (one region x one outage_type). ``meta.degraded_mode`` is
set true so the frontend renders the disclaimer that per-unit data is
unavailable on the public feeds.

The contract row shape stays the same as the per-unit version so the
frontend table does not need to branch::

    {
      "generator":       "All Mid Atlantic - Dominion units (FORCED, aggregated)",
      "zone":            "Mid Atlantic - Dominion",
      "capacity_mw":     2620.0,
      "outage_type":     "FORCED" | "PLANNED",
      "start_timestamp": "2026-05-10T00:00:00",
      "expected_return": null,
      "fuel_type":       "various"
    }
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from app.services.envelope import build_envelope, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import _pjm_fetch

EPT = ZoneInfo("America/New_York")


def _f(x: Any) -> float:
    if x is None:
        return 0.0
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0


def _ept_window(days_back: int, days_forward: int) -> str:
    """``forecast_execution_date_ept`` filter spanning the recent forecast.

    The full archive has ~84k rows back to 2015, so we narrow to a
    +/- few day window which keeps the response under the 100-row
    page cap (3 regions x N days)."""
    now = datetime.now(tz=EPT)
    start = (now - timedelta(days=days_back)).replace(hour=0, minute=0)
    end = (now + timedelta(days=days_forward)).replace(hour=23, minute=59)
    return f"{start.strftime('%Y-%m-%d %H:%M')} to {end.strftime('%Y-%m-%d %H:%M')}"


async def _fetch_outages_aggregated() -> list[dict[str, Any]]:
    """Fetch the latest gen_outages_by_type snapshot and flatten it.

    PJM publishes a single forecast per execution date, with one row
    per region (3 regions). We pull a +/- 2-day window, pick the most
    recent execution date, and emit one contract row per (region x
    outage_type=FORCED or PLANNED).
    """
    rows = await _pjm_fetch(
        "gen_outages_by_type",
        {
            "startRow": "1",
            "rowCount": "100",
            "forecast_execution_date_ept": _ept_window(days_back=3, days_forward=3),
            "fields": (
                "forecast_execution_date_ept,forecast_date,region,"
                "total_outages_mw,planned_outages_mw,"
                "maintenance_outages_mw,forced_outages_mw"
            ),
        },
    )
    if not rows:
        return []

    # Use the latest execution date (most recently published forecast)
    # for the closest forecast_date to today.
    latest_exec = max(
        str(r.get("forecast_execution_date_ept") or "") for r in rows
    )
    today_str = datetime.now(tz=EPT).strftime("%Y-%m-%d")

    def _row_score(r: dict[str, Any]) -> tuple[str, str]:
        # Sort by execution_date desc, then prefer forecast_date == today
        fd = str(r.get("forecast_date") or "")
        return (
            "0" if fd.startswith(today_str) else "1",
            str(r.get("forecast_execution_date_ept") or ""),
        )

    latest_rows = [
        r
        for r in rows
        if str(r.get("forecast_execution_date_ept") or "") == latest_exec
    ]
    # Within latest exec, prefer rows for today; if none, just take all.
    today_rows = [
        r for r in latest_rows if str(r.get("forecast_date") or "").startswith(today_str)
    ]
    pick = today_rows or latest_rows

    observed = str((pick[0] if pick else {}).get("forecast_date") or "")

    out: list[dict[str, Any]] = []
    for r in pick:
        region = str(r.get("region") or "PJM").strip() or "PJM"
        forced_mw = round(_f(r.get("forced_outages_mw")), 2)
        planned_mw = round(
            _f(r.get("planned_outages_mw")) + _f(r.get("maintenance_outages_mw")),
            2,
        )
        if forced_mw > 0:
            out.append(
                {
                    "generator": f"All {region} units (FORCED, aggregated)",
                    "zone": region,
                    "capacity_mw": forced_mw,
                    "outage_type": "FORCED",
                    "start_timestamp": observed or None,
                    "expected_return": None,
                    "fuel_type": "various",
                }
            )
        if planned_mw > 0:
            out.append(
                {
                    "generator": f"All {region} units (PLANNED + maintenance, aggregated)",
                    "zone": region,
                    "capacity_mw": planned_mw,
                    "outage_type": "PLANNED",
                    "start_timestamp": observed or None,
                    "expected_return": None,
                    "fuel_type": "various",
                }
            )
    out.sort(key=lambda r: r["capacity_mw"], reverse=True)
    return out


async def _load_outages_current() -> dict[str, Any]:
    rows = await _fetch_outages_aggregated()
    return {"rows": rows, "degraded_mode": True}


async def get_outages_current() -> dict[str, Any]:
    payload = await get_cached(
        "outages:current",
        300.0,
        _load_outages_current,
    )
    rows = payload["rows"]

    forced = [r for r in rows if r["outage_type"] == "FORCED"]
    forced_total = round(sum(r["capacity_mw"] for r in forced), 2)
    largest = max(rows, key=lambda r: r["capacity_mw"], default=None)

    if forced and largest:
        summary = (
            f"{len(forced)} forced-outage buckets totaling {forced_total:,.0f} MW. "
            f"Largest: {largest['zone']} "
            f"({largest['capacity_mw']:.0f} MW, {largest['outage_type']})."
        )
    elif rows:
        total = round(sum(r["capacity_mw"] for r in rows), 2)
        summary = f"{len(rows)} outage records totaling {total:,.0f} MW."
    else:
        summary = "No active generator outages reported."

    meta: dict[str, Any] = {
        "timestamp": utc_now_iso(),
        "outage_count": len(rows),
        "source": "pjm-gen-outages-by-type",
        "degraded_mode": True,
        "note": (
            "PJM does not expose a public per-unit outage feed; rows are "
            "aggregated region x outage-type buckets."
        ),
    }

    return build_envelope(meta=meta, data=rows, summary=summary)

"""Wave-5 outage feed.

Tries the per-unit ``gen_outages_by_unit`` dataset first; if our PJM
subscription tier does not expose it, falls back to the aggregated
``gen_outages_by_type`` feed and surfaces ``meta.degraded_mode = true``
so callers know the rows collapse to one entry per fuel family.

The contract row shape is::

    {
      "generator":       "Salem 2",
      "zone":            "PSEG",
      "capacity_mw":     1170,
      "outage_type":     "FORCED",
      "start_timestamp": "2026-05-02T18:42:00Z",
      "expected_return": null,
      "fuel_type":       "nuclear"
    }

In degraded mode ``generator`` is a fuel-family bucket label, ``zone``
is ``"PJM"``, and ``start_timestamp`` is the PJM observation timestamp.
"""

from __future__ import annotations

from typing import Any

import httpx

from app.services.envelope import build_envelope, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import _pjm_fetch
from app.services.pjm_zones import normalize_fuel, zone_id_for_pnode


def _f(x: Any) -> float:
    if x is None:
        return 0.0
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0


def _norm_outage_type(raw: str) -> str:
    raw = (raw or "").strip().upper()
    if "FORCED" in raw or "UNPLAN" in raw:
        return "FORCED"
    if "PLANNED" in raw or "MAINT" in raw or "SCHED" in raw:
        return "PLANNED"
    return raw or "UNKNOWN"


def _normalize_zone(raw: str) -> str:
    if not raw:
        return ""
    z = zone_id_for_pnode(raw)
    return z or raw.strip().upper()


async def _fetch_per_unit() -> list[dict[str, Any]] | None:
    """Try the per-unit dataset. ``None`` signals a graceful fallback."""
    try:
        rows = await _pjm_fetch(
            "gen_outages_by_unit",
            {
                "rowCount": "200",
                "fields": (
                    "generator_name,unit_name,zone,fuel_type,outage_mw,"
                    "outage_type,outage_status,start_date,start_time,"
                    "actual_return,expected_return,datetime_beginning_utc"
                ),
            },
        )
    except httpx.HTTPStatusError as e:
        if e.response.status_code in (400, 404):
            return None
        raise
    return rows or []


def _coerce_per_unit_row(row: dict[str, Any]) -> dict[str, Any] | None:
    capacity = round(_f(row.get("outage_mw") or row.get("capacity_mw")), 2)
    if capacity <= 0:
        return None
    name = (
        str(row.get("generator_name") or row.get("unit_name") or "").strip()
        or "Unknown unit"
    )
    zone = _normalize_zone(str(row.get("zone") or ""))
    fuel = normalize_fuel(str(row.get("fuel_type") or ""))
    start_ts = str(
        row.get("start_date")
        or row.get("datetime_beginning_utc")
        or row.get("start_time")
        or ""
    )
    expected = row.get("expected_return") or row.get("actual_return")
    return {
        "generator": name,
        "zone": zone,
        "capacity_mw": capacity,
        "outage_type": _norm_outage_type(
            str(row.get("outage_type") or row.get("outage_status") or "")
        ),
        "start_timestamp": start_ts or None,
        "expected_return": expected if expected else None,
        "fuel_type": fuel,
    }


async def _fetch_aggregated() -> list[dict[str, Any]]:
    """Aggregated fallback feed (gen_outages_by_type)."""
    rows = await _pjm_fetch(
        "gen_outages_by_type",
        {
            "rowCount": "200",
            "fields": "datetime_beginning_ept,fuel_type,outage_mw,reason",
        },
    )
    by_fuel: dict[str, dict[str, Any]] = {}
    for row in rows:
        family = normalize_fuel(str(row.get("fuel_type") or ""))
        mw = _f(row.get("outage_mw"))
        if mw <= 0:
            continue
        key = family
        bucket = by_fuel.setdefault(
            key,
            {
                "fuel_type": family,
                "capacity_mw": 0.0,
                "start_timestamp": str(row.get("datetime_beginning_ept") or ""),
                "outage_type": _norm_outage_type(str(row.get("reason") or "")),
            },
        )
        bucket["capacity_mw"] += mw

    return [
        {
            "generator": f"All {family} units (aggregated)",
            "zone": "PJM",
            "capacity_mw": round(b["capacity_mw"], 2),
            "outage_type": b["outage_type"],
            "start_timestamp": b["start_timestamp"] or None,
            "expected_return": None,
            "fuel_type": family,
        }
        for family, b in by_fuel.items()
    ]


async def _load_outages_current() -> dict[str, Any]:
    per_unit = await _fetch_per_unit()
    if per_unit is None or not per_unit:
        rows = await _fetch_aggregated()
        return {"rows": rows, "degraded_mode": True}
    rows = []
    for raw in per_unit:
        coerced = _coerce_per_unit_row(raw)
        if coerced is not None:
            rows.append(coerced)
    rows.sort(key=lambda r: r["capacity_mw"], reverse=True)
    return {"rows": rows, "degraded_mode": False}


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
            f"{len(forced)} forced outages totaling {forced_total:,.0f} MW. "
            f"Largest: {largest['generator']} "
            f"({largest['capacity_mw']:.0f} MW, {largest['zone'] or 'PJM'})."
        )
    elif rows:
        total = round(sum(r["capacity_mw"] for r in rows), 2)
        summary = f"{len(rows)} outage records totaling {total:,.0f} MW."
    else:
        summary = "No active generator outages reported."

    meta: dict[str, Any] = {
        "timestamp": utc_now_iso(),
        "outage_count": len(rows),
        "source": "pjm-gen-outages-by-unit",
    }
    if payload["degraded_mode"]:
        meta["degraded_mode"] = True
        meta["source"] = "pjm-gen-outages-by-type (fallback)"

    return build_envelope(meta=meta, data=rows, summary=summary)

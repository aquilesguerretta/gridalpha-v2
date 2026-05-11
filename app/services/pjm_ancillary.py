"""Ancillary services market clearing prices.

PJM publishes a single public feed (``ancillary_services``) that
unifies regulation, synchronized reserve, secondary reserve, and
non-synchronized reserve clearing prices. The per-market feeds
``regulation_market_results`` and ``synchronized_reserve_market_results``
return 404 under the public APIM subscription key.

Schema of ``ancillary_services`` (long format, one row per service x
unit x hour)::

    {
      "datetime_beginning_ept":  "2026-05-10T15:00:00",
      "datetime_beginning_utc":  "2026-05-10T19:00:00",
      "ancillary_service":       "RTO Regulation Capability" | "RTO Regulation Mileage"
                                 | "RTO Synchronized Reserve" | "RTO Mileage Ratio"
                                 | "RTO Non-Synchronized Reserve" | "RTO Secondary Reserve"
                                 | "MAD Synchronized Reserve" | ...,
      "unit":                    "Price" | "Ratio",
      "value":                   float,
      "row_is_current":          true,
      "version_nbr":             1
    }

Contract mapping:
  * ``regulation_a_mcp``  = ``RTO Regulation Capability`` (Price)
  * ``regulation_d_mcp``  = ``RTO Regulation Capability`` (Price)
                          + ``RTO Regulation Mileage`` (Price)
    Reg-D resources earn capability + mileage payments; the dataset
    publishes them separately and we sum to a single headline number.
  * ``spinning_reserve_mcp`` = ``RTO Synchronized Reserve`` (Price)
  * ``regulation_mileage_payment`` = ``RTO Regulation Mileage`` (Price)

The feed rejects ``sort`` on ``datetime_beginning_utc`` ("Sort field
is not sortable"), so we filter to a 24-hour window and pick the
latest hour client-side.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import httpx

from app.services.envelope import build_envelope, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import _pjm_fetch

EPT = ZoneInfo("America/New_York")

# Canonical service-name labels from the ancillary_services feed.
_REG_CAPABILITY = "RTO Regulation Capability"
_REG_MILEAGE = "RTO Regulation Mileage"
_SYNC_RESERVE = "RTO Synchronized Reserve"


def _f(x: Any) -> float:
    if x is None:
        return 0.0
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0


async def _try_fetch(
    dataset: str, params: dict[str, str]
) -> list[dict[str, Any]]:
    try:
        return await _pjm_fetch(dataset, params)
    except (httpx.HTTPStatusError, httpx.RequestError):
        return []


def _latest_price(
    rows: list[dict[str, Any]], service_name: str
) -> tuple[float, str]:
    """Return ``(price, observed_utc)`` for the most recent Price row
    matching ``service_name``. Returns (0.0, "") when not found."""
    matches = [
        r
        for r in rows
        if str(r.get("ancillary_service") or "").strip() == service_name
        and str(r.get("unit") or "").strip() == "Price"
    ]
    if not matches:
        return 0.0, ""
    latest = max(matches, key=lambda r: str(r.get("datetime_beginning_utc") or ""))
    return _f(latest.get("value")), str(latest.get("datetime_beginning_utc") or "")


async def _load_ancillary_current() -> dict[str, Any]:
    notes: list[str] = []

    now = datetime.now(tz=EPT)
    window = (
        f"{(now - timedelta(hours=24)).strftime('%Y-%m-%d %H:%M')} to "
        f"{now.strftime('%Y-%m-%d %H:%M')}"
    )
    rows = await _try_fetch(
        "ancillary_services",
        {
            "rowCount": "200",
            "datetime_beginning_ept": window,
            "fields": (
                "datetime_beginning_ept,datetime_beginning_utc,"
                "ancillary_service,unit,value,row_is_current"
            ),
        },
    )
    if not rows:
        notes.append("ancillary_services feed unavailable")

    rmccp, ts_rmccp = _latest_price(rows, _REG_CAPABILITY)
    rmpcp, ts_rmpcp = _latest_price(rows, _REG_MILEAGE)
    spinning, ts_spin = _latest_price(rows, _SYNC_RESERVE)

    if not ts_rmccp:
        notes.append("regulation capability price unavailable")
    if not ts_rmpcp:
        notes.append("regulation mileage price unavailable")
    if not ts_spin:
        notes.append("synchronized reserve price unavailable")

    regulation_a = round(rmccp, 2)
    regulation_d = round(rmccp + rmpcp, 2)
    mileage_payment = round(rmpcp, 2)
    total_reg = regulation_d

    observed = max(filter(None, [ts_rmccp, ts_rmpcp, ts_spin]), default="")

    return {
        "regulation_a_mcp": regulation_a,
        "regulation_d_mcp": regulation_d,
        "spinning_reserve_mcp": round(spinning, 2),
        "regulation_mileage_payment": mileage_payment,
        "total_regulation_mcp": round(total_reg, 2),
        "observed_at": observed,
        "degraded_mode": bool(notes),
        "notes": notes,
    }


async def get_ancillary_current(zone: str = "all") -> dict[str, Any]:
    payload = await get_cached(
        "ancillary:current",
        300.0,
        _load_ancillary_current,
    )

    summary = (
        f"Reg-D ${payload['regulation_d_mcp']:.2f}/MW, "
        f"Reg-A ${payload['regulation_a_mcp']:.2f}, "
        f"Spin ${payload['spinning_reserve_mcp']:.2f}, "
        f"Mileage ${payload['regulation_mileage_payment']:.2f}/MWh."
    )

    meta: dict[str, Any] = {
        "timestamp": payload["observed_at"] or utc_now_iso(),
        "market": "PJM-ASM",
        "source": "pjm-ancillary-services",
    }
    if payload["degraded_mode"]:
        meta["degraded_mode"] = True
        meta["notes"] = payload["notes"]
    if zone and zone != "all":
        meta["zone_requested"] = zone
        meta["scope_fallback"] = True

    return build_envelope(
        meta=meta,
        data={
            "regulation_d_mcp": payload["regulation_d_mcp"],
            "regulation_a_mcp": payload["regulation_a_mcp"],
            "spinning_reserve_mcp": payload["spinning_reserve_mcp"],
            "regulation_mileage_payment": payload["regulation_mileage_payment"],
        },
        summary=summary,
    )

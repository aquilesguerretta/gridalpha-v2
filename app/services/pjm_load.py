"""Reserve-margin computation - load actual + forecast + capacity.

Data sources:
  * ``inst_load`` - instantaneous load (filtered to PJM-RTO total).
  * ``load_frcstd_7_day`` - 7-day load forecast (hourly, ``forecasted_load_mw``).
  * ``forecasted_capacity_outlook`` - committed/forecasted capacity outlook.

Each PJM call is wrapped in its own try/except so a single dataset
outage does not break the endpoint - the response carries
``meta.degraded_mode = true`` and the unavailable values fall back to
an estimate (capacity defaults to 200 GW, the PJM 2025 summer peak
nameplate, which keeps the regime classification useful even when
``forecasted_capacity_outlook`` is unreachable).
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from dateutil import parser as dateparser

from app.services.envelope import build_envelope, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import _pjm_fetch

DEFAULT_NAMEPLATE_CAPACITY_MW = 200_000.0  # PJM 2025 summer peak ~190 GW


def _f(x: Any) -> float:
    if x is None:
        return 0.0
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0


def _pick_pjm_rto_row(rows: list[dict[str, Any]]) -> dict[str, Any] | None:
    """Pick the most recent PJM-RTO total row from an inst_load page."""
    candidates: list[dict[str, Any]] = []
    for row in rows:
        area = str(row.get("area") or row.get("zone") or "").strip().upper()
        if area in {"PJM RTO", "PJM-RTO", "RTO", "PJM"}:
            candidates.append(row)
    pool = candidates or rows
    return max(
        pool,
        key=lambda r: str(r.get("datetime_beginning_utc") or ""),
        default=None,
    )


def _classify_regime(reserve_pct: float) -> str:
    if reserve_pct < 12.0:
        return "TIGHT"
    if reserve_pct > 25.0:
        return "COMFORTABLE"
    return "ADEQUATE"


async def _try_pjm_fetch(
    dataset: str, params: dict[str, str]
) -> list[dict[str, Any]]:
    """Wrapper that swallows transient failures so partial responses still ship."""
    try:
        return await _pjm_fetch(dataset, params)
    except (httpx.HTTPStatusError, httpx.RequestError):
        return []


async def _load_reserve_margin() -> dict[str, Any]:
    notes: list[str] = []

    # ── load actual ─────────────────────────────────────────────────────────
    inst_rows = await _try_pjm_fetch(
        "inst_load",
        {
            "rowCount": "100",
            "fields": "datetime_beginning_utc,area,instantaneous_load",
        },
    )
    actual_row = _pick_pjm_rto_row(inst_rows)
    load_actual_mw = round(_f((actual_row or {}).get("instantaneous_load")), 2)
    if not actual_row:
        notes.append("inst_load unavailable")

    # ── load forecast (next interval) ───────────────────────────────────────
    forecast_rows = await _try_pjm_fetch(
        "load_frcstd_7_day",
        {
            "rowCount": "48",
            "fields": "datetime_beginning_utc,forecasted_load_mw,area",
        },
    )
    forecast_pjm = [
        r
        for r in forecast_rows
        if str(r.get("area") or "").strip().upper() in {"PJM RTO", "RTO", "PJM"}
    ] or forecast_rows
    forecast_pjm.sort(key=lambda r: str(r.get("datetime_beginning_utc") or ""))
    nowish = datetime.now(timezone.utc) - timedelta(minutes=5)
    next_forecast = None
    for r in forecast_pjm:
        try:
            dt = dateparser.parse(str(r.get("datetime_beginning_utc") or ""))
        except (TypeError, ValueError):
            continue
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        if dt >= nowish:
            next_forecast = r
            break
    load_forecast_mw = round(_f((next_forecast or {}).get("forecasted_load_mw")), 2)
    if not next_forecast:
        notes.append("load_frcstd_7_day unavailable")

    # ── available capacity ──────────────────────────────────────────────────
    cap_rows = await _try_pjm_fetch(
        "forecasted_capacity_outlook",
        {
            "rowCount": "5",
            "fields": "datetime_beginning_utc,total_committed_capacity",
        },
    )
    cap_rows.sort(
        key=lambda r: str(r.get("datetime_beginning_utc") or ""), reverse=True
    )
    available_capacity_mw = round(
        _f((cap_rows or [{}])[0].get("total_committed_capacity")), 2
    )
    capacity_estimated = False
    if available_capacity_mw <= 0:
        available_capacity_mw = DEFAULT_NAMEPLATE_CAPACITY_MW
        capacity_estimated = True
        notes.append("capacity from nameplate fallback")

    # ── reserve margin ──────────────────────────────────────────────────────
    if load_actual_mw <= 0:
        # If we have no live load reading, anchor regime calculation on the
        # forecast so the response is still meaningful.
        denom = load_forecast_mw or 1.0
    else:
        denom = load_actual_mw
    reserve_margin_pct = round(
        (available_capacity_mw - denom) / denom * 100.0,
        2,
    )
    regime = _classify_regime(reserve_margin_pct)

    return {
        "load_actual_mw": load_actual_mw,
        "load_forecast_mw": load_forecast_mw,
        "available_capacity_mw": available_capacity_mw,
        "reserve_margin_pct": reserve_margin_pct,
        "regime": regime,
        "degraded_mode": bool(notes),
        "notes": notes,
        "capacity_estimated": capacity_estimated,
        "observed_at": str(
            (actual_row or {}).get("datetime_beginning_utc") or ""
        ),
    }


async def get_reserve_margin_current(zone: str = "all") -> dict[str, Any]:
    """Build the canonical envelope for ``/api/reserve-margin/current``.

    ``zone`` accepts ``all`` (PJM-wide, the only fully supported scope in
    Wave 5) or a contract zone id. Specific-zone queries fall back to the
    PJM-wide reading and surface ``meta.scope_fallback = true`` so the
    frontend can render a hint.
    """
    payload = await get_cached("reserve-margin:pjm", 60.0, _load_reserve_margin)

    summary = (
        f"PJM reserve margin {payload['reserve_margin_pct']:.1f}%, "
        f"{payload['regime']}."
    )

    meta: dict[str, Any] = {
        "timestamp": payload["observed_at"] or utc_now_iso(),
        "scope": "PJM",
        "source": "pjm-inst-load+load-forecast+capacity-outlook",
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
            "load_actual_mw": payload["load_actual_mw"],
            "load_forecast_mw": payload["load_forecast_mw"],
            "available_capacity_mw": payload["available_capacity_mw"],
            "reserve_margin_pct": payload["reserve_margin_pct"],
            "regime": payload["regime"],
        },
        summary=summary,
    )

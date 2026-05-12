"""Reserve-margin computation - load actual + forecast + capacity.

Data sources (all PJM Data Miner 2 public feeds):
  * ``inst_load`` - instantaneous load by area. PJM-wide total comes
    from the row where ``area`` = ``"PJM RTO"`` (with a space).
  * ``load_frcstd_7_day`` - 7-day load forecast. PJM-wide total comes
    from the row where ``forecast_area`` = ``"RTO_COMBINED"``. The
    columns are ``forecast_datetime_beginning_ept`` and
    ``forecast_load_mw`` - NOT ``datetime_beginning_utc`` /
    ``forecasted_load_mw`` as our first cut assumed.
  * Available capacity has no public dataset on api.pjm.com -
    ``forecasted_capacity_outlook`` returns 404 under the public key.
    We fall back to a static nameplate (PJM 2025 summer peak ~ 190 GW)
    so the regime classification stays meaningful and surface the
    estimate via ``capacity_estimated=true``.

Each PJM call is wrapped in its own try/except so a single dataset
outage does not break the endpoint. ``meta.degraded_mode = true``
marks any partial response.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

import httpx
from dateutil import parser as dateparser

from app.services.envelope import build_envelope, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import _pjm_fetch

EPT = ZoneInfo("America/New_York")
DEFAULT_NAMEPLATE_CAPACITY_MW = 200_000.0  # PJM 2025 summer peak ~190 GW
PJM_RTO_FORECAST_AREA = "RTO_COMBINED"     # confirmed via dataminer probe


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
        # inst_load uses "PJM RTO" with a space. The other variants are
        # defensive in case PJM changes capitalisation/punctuation.
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


def _ept_window(hours_back: int, hours_forward: int) -> str:
    now = datetime.now(tz=EPT)
    start = now - timedelta(hours=hours_back)
    end = now + timedelta(hours=hours_forward)
    return f"{start.strftime('%Y-%m-%d %H:%M')} to {end.strftime('%Y-%m-%d %H:%M')}"


async def _load_reserve_margin() -> dict[str, Any]:
    notes: list[str] = []

    # ── load actual (inst_load, latest "PJM RTO" row) ───────────────────────
    inst_rows = await _try_pjm_fetch(
        "inst_load",
        {
            "rowCount": "100",
            "datetime_beginning_ept": _ept_window(hours_back=1, hours_forward=0),
            "fields": "datetime_beginning_utc,datetime_beginning_ept,area,instantaneous_load",
        },
    )
    actual_row = _pick_pjm_rto_row(inst_rows)
    load_actual_mw = round(_f((actual_row or {}).get("instantaneous_load")), 2)
    if not actual_row or load_actual_mw <= 0:
        notes.append("inst_load PJM-RTO total unavailable")

    # ── load forecast (load_frcstd_7_day, RTO_COMBINED) ─────────────────────
    # PJM accepts ``forecast_area`` as a server-side filter on this feed,
    # so we scope directly to the system-wide aggregate and get exactly
    # the 168 hourly rows (7 days x 24h) we care about.
    forecast_rto = await _try_pjm_fetch(
        "load_frcstd_7_day",
        {
            "rowCount": "200",
            "forecast_area": PJM_RTO_FORECAST_AREA,
            "fields": (
                "evaluated_at_datetime_ept,forecast_datetime_beginning_ept,"
                "forecast_area,forecast_load_mw"
            ),
        },
    )

    def _row_dt(r: dict[str, Any]) -> datetime | None:
        raw = str(r.get("forecast_datetime_beginning_ept") or "")
        if not raw:
            return None
        try:
            dt = dateparser.parse(raw)
        except (TypeError, ValueError):
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=EPT)
        return dt.astimezone(timezone.utc)

    forecast_rto.sort(key=lambda r: str(r.get("forecast_datetime_beginning_ept") or ""))
    nowish = datetime.now(timezone.utc) - timedelta(minutes=5)
    next_forecast = None
    for r in forecast_rto:
        dt = _row_dt(r)
        if dt is None:
            continue
        if dt >= nowish:
            next_forecast = r
            break
    load_forecast_mw = round(_f((next_forecast or {}).get("forecast_load_mw")), 2)
    if not next_forecast:
        notes.append("load_frcstd_7_day RTO_COMBINED forecast unavailable")

    # ── available capacity (no public dataset; static fallback) ─────────────
    available_capacity_mw = DEFAULT_NAMEPLATE_CAPACITY_MW
    capacity_estimated = True
    notes.append("capacity from static nameplate fallback (no public PJM capacity feed)")

    # ── reserve margin ──────────────────────────────────────────────────────
    if load_actual_mw <= 0:
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
        "degraded_mode": True,  # capacity is always estimated; always degraded
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

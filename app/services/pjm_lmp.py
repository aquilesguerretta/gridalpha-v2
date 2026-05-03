"""LMP fetchers for PJM Data Miner 2 (RT 5-min + DA hourly).

This module hosts the helpers used by the canonical Wave-5 LMP endpoints
(``/api/lmp/current``, ``/api/lmp/all-zones``, ``/api/lmp/24h``,
``/api/lmp/da-forecast``, ``/api/lmp/da-forecast/all-zones``,
``/api/lmp/history``).

Datasets:
  * ``rt_unverified_fivemin_lmps`` - real-time 5-minute LMP, fields
    suffixed ``_rt`` (``total_lmp_rt``, ``congestion_price_rt``,
    ``marginal_loss_price_rt``, ``system_energy_price_rt``).
  * ``da_hrl_lmps`` - day-ahead hourly LMP, fields suffixed ``_da``.

PJM caps each response at 100 rows. ``_paginated_fetch`` loops with
``startRow=1,101,201,...`` until the page comes back short. All
fetchers are wrapped in the existing in-process TTL cache from
``app.services.intelligence_cache``.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

from dateutil import parser as dateparser

from app.services.envelope import build_envelope, data_age_seconds, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import _pjm_fetch
from app.services.pjm_zones import (
    ZONE_IDS,
    is_valid_zone,
    pnode_name_for,
    zone_id_for_pnode,
)

EPT = ZoneInfo("America/New_York")

PJM_PAGE_SIZE = 100
RT_DATASET = "rt_unverified_fivemin_lmps"
DA_DATASET = "da_hrl_lmps"

# Field selectors kept tight so PJM responses stay under the 100-row cap.
_RT_FIELDS = (
    "datetime_beginning_utc,datetime_beginning_ept,pnode_name,"
    "total_lmp_rt,system_energy_price_rt,congestion_price_rt,"
    "marginal_loss_price_rt"
)
_DA_FIELDS = (
    "datetime_beginning_utc,datetime_beginning_ept,pnode_name,"
    "total_lmp_da,system_energy_price_da,congestion_price_da,"
    "marginal_loss_price_da"
)


def _f(x: Any) -> float:
    if x is None:
        return 0.0
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0


async def _paginated_fetch(
    dataset: str,
    base_params: dict[str, str],
    *,
    max_rows: int = 5_000,
) -> list[dict[str, Any]]:
    """Loop ``startRow=1,101,...`` until PJM returns a short page.

    ``max_rows`` is a defensive ceiling (``5000`` accommodates the
    7-day x 5-min historical worst case of ~2,016 rows with headroom).
    """
    rows: list[dict[str, Any]] = []
    start = 1
    while len(rows) < max_rows:
        page_params = {
            **base_params,
            "rowCount": str(PJM_PAGE_SIZE),
            "startRow": str(start),
        }
        page = await _pjm_fetch(dataset, page_params)
        if not page:
            break
        rows.extend(page)
        if len(page) < PJM_PAGE_SIZE:
            break
        start += PJM_PAGE_SIZE
    return rows


def _row_pnode(row: dict[str, Any]) -> str:
    return str(row.get("pnode_name") or "").strip()


def _row_dt_utc(row: dict[str, Any]) -> str:
    return str(row.get("datetime_beginning_utc") or "").strip()


def _sort_by_dt_desc(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(rows, key=_row_dt_utc, reverse=True)


def _sort_by_dt_asc(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(rows, key=_row_dt_utc)


def _parse_utc(raw: str) -> datetime | None:
    if not raw:
        return None
    try:
        dt = dateparser.parse(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except (TypeError, ValueError, OverflowError):
        return None


def _ept_filter(start_utc: datetime, end_utc: datetime) -> str:
    """Format a PJM ``datetime_beginning_ept`` range filter.

    PJM Data Miner 2 expects ``M/D/YYYY HH:MM`` (24-hour) with the
    literal `` to `` separator and EPT (America/New_York) timestamps.
    """
    s = start_utc.astimezone(EPT)
    e = end_utc.astimezone(EPT)
    fmt = "{m}/{d}/{y} {hh:02d}:{mm:02d}"
    s_str = fmt.format(m=s.month, d=s.day, y=s.year, hh=s.hour, mm=s.minute)
    e_str = fmt.format(m=e.month, d=e.day, y=e.year, hh=e.hour, mm=e.minute)
    return f"{s_str} to {e_str}"


def _to_iso_z(dt_utc: datetime) -> str:
    return dt_utc.strftime("%Y-%m-%dT%H:%M:%SZ")


def _ept_clock(dt_utc: datetime) -> str:
    """Render UTC datetime as 'HH:MM ET' for summary lines."""
    e = dt_utc.astimezone(EPT)
    return f"{e.hour:02d}:{e.minute:02d} ET"


# ── Endpoint 1: current LMP, single zone ─────────────────────────────────────


async def _load_lmp_current(zone_id: str) -> dict[str, Any]:
    pname = pnode_name_for(zone_id)
    rows = await _pjm_fetch(
        RT_DATASET,
        {
            "rowCount": "12",  # ~1 hour @ 5-min, plenty for delta calc
            "fields": _RT_FIELDS,
            "pnode_name": pname,
        },
    )
    rows = _sort_by_dt_desc(rows)
    if not rows:
        raise LookupError(f"PJM returned no RT rows for {zone_id} ({pname})")

    latest = rows[0]
    prev = rows[1] if len(rows) > 1 else None

    lmp_total = round(_f(latest.get("total_lmp_rt")), 2)
    lmp_energy = round(_f(latest.get("system_energy_price_rt")), 2)
    lmp_cong = round(_f(latest.get("congestion_price_rt")), 2)
    lmp_loss = round(_f(latest.get("marginal_loss_price_rt")), 2)

    delta_pct = 0.0
    if prev is not None:
        prev_total = _f(prev.get("total_lmp_rt"))
        if prev_total:
            delta_pct = round((lmp_total - prev_total) / prev_total * 100.0, 2)

    observed = _row_dt_utc(latest)
    return {
        "zone": zone_id,
        "pnode_name": pname,
        "observed_at": observed,
        "data_age_seconds": data_age_seconds(observed),
        "lmp_total": lmp_total,
        "lmp_energy": lmp_energy,
        "lmp_congestion": lmp_cong,
        "lmp_loss": lmp_loss,
        "delta_pct_5min": delta_pct,
    }


async def get_lmp_current(zone_id: str) -> dict[str, Any]:
    """Build the canonical envelope for ``/api/lmp/current?zone=``."""
    if not is_valid_zone(zone_id):
        raise ValueError(f"unknown zone id: {zone_id}")

    payload = await get_cached(
        f"lmp:current:{zone_id}",
        60.0,
        lambda: _load_lmp_current(zone_id),
    )

    direction = "+" if payload["delta_pct_5min"] >= 0 else ""
    summary = (
        f"{zone_id} LMP ${payload['lmp_total']:.2f}/MWh, "
        f"{direction}{payload['delta_pct_5min']}% over last 5 min."
    )
    return build_envelope(
        meta={
            "zone": zone_id,
            "timestamp": payload["observed_at"] or utc_now_iso(),
            "data_age_seconds": payload["data_age_seconds"],
            "source": "pjm-rt",
        },
        data={
            "lmp_total": payload["lmp_total"],
            "lmp_energy": payload["lmp_energy"],
            "lmp_congestion": payload["lmp_congestion"],
            "lmp_loss": payload["lmp_loss"],
            "delta_pct_5min": payload["delta_pct_5min"],
        },
        summary=summary,
    )


# ── Endpoint 2: current LMP, all 20 zones ───────────────────────────────────


async def _load_lmp_all_zones() -> dict[str, Any]:
    """Fan out across all 20 zones in parallel; reuse per-zone cache."""
    results = await asyncio.gather(
        *(get_cached(f"lmp:current:{z}", 60.0, lambda zid=z: _load_lmp_current(zid))
          for z in ZONE_IDS),
        return_exceptions=True,
    )

    zones: dict[str, dict[str, Any]] = {}
    failures: list[str] = []
    latest_observed: str = ""
    max_age = 0
    for zone_id, res in zip(ZONE_IDS, results):
        if isinstance(res, BaseException):
            failures.append(zone_id)
            continue
        zones[zone_id] = {
            "lmp_total": res["lmp_total"],
            "delta_pct_5min": res["delta_pct_5min"],
        }
        if res["observed_at"] and res["observed_at"] > latest_observed:
            latest_observed = res["observed_at"]
        if res["data_age_seconds"] > max_age:
            max_age = res["data_age_seconds"]

    return {
        "zones": zones,
        "failures": failures,
        "observed_at": latest_observed,
        "data_age_seconds": max_age,
    }


async def get_lmp_all_zones() -> dict[str, Any]:
    """Build the canonical envelope for ``/api/lmp/all-zones``."""
    payload = await get_cached(
        "lmp:all-zones",
        60.0,
        _load_lmp_all_zones,
    )

    zones = payload["zones"]
    if not zones:
        raise LookupError("PJM returned no RT rows for any zone")

    prices = [z["lmp_total"] for z in zones.values()]
    avg = round(sum(prices) / len(prices), 2)
    lo = round(min(prices), 2)
    hi = round(max(prices), 2)
    summary = (
        f"{len(zones)} zones reporting. Average ${avg}, range ${lo}-${hi}."
    )

    meta: dict[str, Any] = {
        "timestamp": payload["observed_at"] or utc_now_iso(),
        "data_age_seconds": payload["data_age_seconds"],
        "zone_count": len(zones),
        "source": "pjm-rt",
    }
    if payload["failures"]:
        meta["zones_unavailable"] = payload["failures"]
        meta["degraded_mode"] = True

    return build_envelope(meta=meta, data=zones, summary=summary)


# ── Endpoint 3: 24-hour LMP history, single zone ────────────────────────────


async def _load_lmp_24h(zone_id: str) -> dict[str, Any]:
    pname = pnode_name_for(zone_id)
    end_utc = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    # round end down to nearest 5-min boundary
    end_utc = end_utc - timedelta(minutes=end_utc.minute % 5)
    start_utc = end_utc - timedelta(hours=24)

    base_params = {
        "pnode_name": pname,
        "fields": _RT_FIELDS,
        "datetime_beginning_ept": _ept_filter(start_utc, end_utc),
    }
    rows = await _paginated_fetch(RT_DATASET, base_params, max_rows=400)

    series: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in _sort_by_dt_asc(rows):
        dt = _parse_utc(_row_dt_utc(row))
        if dt is None:
            continue
        if dt < start_utc or dt > end_utc:
            continue
        ts = _to_iso_z(dt)
        if ts in seen:
            continue
        seen.add(ts)
        series.append(
            {
                "timestamp": ts,
                "lmp_total": round(_f(row.get("total_lmp_rt")), 2),
            }
        )

    return {
        "zone": zone_id,
        "start_utc": _to_iso_z(start_utc),
        "end_utc": _to_iso_z(end_utc),
        "series": series,
    }


async def get_lmp_24h(zone_id: str) -> dict[str, Any]:
    """Build the canonical envelope for ``/api/lmp/24h?zone=``."""
    if not is_valid_zone(zone_id):
        raise ValueError(f"unknown zone id: {zone_id}")

    payload = await get_cached(
        f"lmp:24h:{zone_id}",
        300.0,  # 5-minute cache
        lambda: _load_lmp_24h(zone_id),
    )

    series = payload["series"]
    row_count = len(series)
    if row_count == 0:
        raise LookupError(f"PJM returned no 24h rows for {zone_id}")

    prices = [pt["lmp_total"] for pt in series]
    lo = round(min(prices), 2)
    hi = round(max(prices), 2)
    avg = round(sum(prices) / len(prices), 2)
    peak_pt = max(series, key=lambda p: p["lmp_total"])
    peak_dt = _parse_utc(peak_pt["timestamp"])
    peak_clock = _ept_clock(peak_dt) if peak_dt else "?"

    summary = (
        f"24h range ${lo}-${hi}, average ${avg}, peak at {peak_clock}."
    )

    meta: dict[str, Any] = {
        "zone": zone_id,
        "interval_minutes": 5,
        "row_count": row_count,
        "start": payload["start_utc"],
        "end": payload["end_utc"],
        "source": "pjm-rt",
    }
    if row_count < 280:
        # 288 expected; small gaps are normal but flag aggressive shortfalls
        meta["degraded_mode"] = True

    return build_envelope(meta=meta, data=series, summary=summary)


# ── Endpoint 4: day-ahead hourly forecast, single zone ──────────────────────


def _resolve_market_date(date_iso: str | None) -> datetime:
    """Default to tomorrow (EPT) when ``date_iso`` is empty.

    Returns a naive EPT datetime at 00:00 on the requested market date.
    """
    if date_iso:
        try:
            d = dateparser.parse(date_iso).date()
        except (TypeError, ValueError, OverflowError) as e:
            raise ValueError(f"invalid date '{date_iso}'") from e
    else:
        d = (datetime.now(EPT) + timedelta(days=1)).date()
    return datetime(d.year, d.month, d.day, 0, 0, tzinfo=EPT)


def _ept_day_filter(market_day_ept: datetime) -> str:
    """PJM ``datetime_beginning_ept`` filter spanning a full EPT day."""
    end = market_day_ept + timedelta(hours=23)
    fmt = "{m}/{d}/{y} {hh:02d}:{mm:02d}"
    s = fmt.format(
        m=market_day_ept.month,
        d=market_day_ept.day,
        y=market_day_ept.year,
        hh=0,
        mm=0,
    )
    e = fmt.format(m=end.month, d=end.day, y=end.year, hh=23, mm=0)
    return f"{s} to {e}"


def _fmt_iso_date(ept_dt: datetime) -> str:
    return f"{ept_dt.year:04d}-{ept_dt.month:02d}-{ept_dt.day:02d}"


async def _load_lmp_da_forecast(zone_id: str, date_iso: str | None) -> dict[str, Any]:
    pname = pnode_name_for(zone_id)
    market_day = _resolve_market_date(date_iso)

    rows = await _paginated_fetch(
        DA_DATASET,
        {
            "pnode_name": pname,
            "fields": _DA_FIELDS,
            "datetime_beginning_ept": _ept_day_filter(market_day),
        },
        max_rows=48,  # 24 hours expected; pad for DST spring-forward/fall-back
    )

    by_hour: dict[int, float] = {}
    for row in rows:
        dt = _parse_utc(_row_dt_utc(row))
        if dt is None:
            continue
        hour_ept = dt.astimezone(EPT)
        if (hour_ept.year, hour_ept.month, hour_ept.day) != (
            market_day.year,
            market_day.month,
            market_day.day,
        ):
            continue
        by_hour[hour_ept.hour] = round(_f(row.get("total_lmp_da")), 2)

    series = [
        {"hour": h, "lmp": by_hour[h]} for h in sorted(by_hour.keys())
    ]

    return {
        "zone": zone_id,
        "market_date": _fmt_iso_date(market_day),
        "series": series,
    }


async def get_lmp_da_forecast(
    zone_id: str, date_iso: str | None = None
) -> dict[str, Any]:
    """Build the canonical envelope for ``/api/lmp/da-forecast``."""
    if not is_valid_zone(zone_id):
        raise ValueError(f"unknown zone id: {zone_id}")

    market_day = _resolve_market_date(date_iso)
    cache_key = f"lmp:da-forecast:{zone_id}:{_fmt_iso_date(market_day)}"
    payload = await get_cached(
        cache_key,
        3600.0,
        lambda: _load_lmp_da_forecast(zone_id, date_iso),
    )

    series = payload["series"]
    if not series:
        raise LookupError(
            f"PJM returned no DA forecast for {zone_id} on {payload['market_date']}"
        )

    peak = max(series, key=lambda p: p["lmp"])
    trough = min(series, key=lambda p: p["lmp"])
    summary = (
        f"Day-ahead {zone_id} forecast: peak ${peak['lmp']:.2f} at hour {peak['hour']}, "
        f"trough ${trough['lmp']:.2f} at hour {trough['hour']}."
    )

    meta = {
        "zone": zone_id,
        "market_date": payload["market_date"],
        "interval": "hourly",
        "row_count": len(series),
        "source": "pjm-da",
    }
    return build_envelope(meta=meta, data=series, summary=summary)

"""LMP fetchers for PJM Data Miner 2 (V1-compatible request shape).

This module hosts the helpers used by the canonical Wave-5 LMP endpoints
(``/api/lmp/current``, ``/api/lmp/all-zones``, ``/api/lmp/24h``,
``/api/lmp/da-forecast``, ``/api/lmp/da-forecast/all-zones``,
``/api/lmp/history``).

Datasets:
  * ``rt_unverified_hrl_lmps`` - real-time HOURLY unverified LMP, with
    a row per pricing node per hour. The 5-minute feed
    (``rt_unverified_fivemin_lmps``) refuses the ``type`` filter and
    returns ~5,000 individual bus prices per page, so it is unusable
    for zone-level pricing. V1 uses the hourly feed and so do we.
    Fields: ``total_lmp_rt``, ``congestion_price_rt``,
    ``marginal_loss_price_rt``. The energy component is derived as
    ``total - congestion - loss`` (PJM omits the system energy column
    on the unverified feeds).
  * ``da_hrl_lmps`` - day-ahead hourly LMP, fields suffixed ``_da``.
  * ``rt_hrl_lmps`` - verified hourly archive, used for historical
    queries. Archived data rejects the ``fields`` parameter, so we
    do not pass it for queries older than ~30 days.

Request shape (matches V1's ``data/lmp.py`` exactly):
  * datetime filter: ``datetime_beginning_ept`` = ``YYYY-MM-DD HH:MM to YYYY-MM-DD HH:MM``
  * subtype filter:  ``type`` = ``ZONE`` or ``HUB`` (NOT ``pnode_subtype``)
  * pricing node:    filter client-side by ``pnode_name`` - the
    field is not accepted as a server-side filter on these feeds.

PJM caps each response at 100 rows. ``_paginated_fetch`` walks the
``startRow=1,101,...`` window until the page comes back short. All
fetchers are wrapped in the existing in-process TTL cache from
``app.services.intelligence_cache``.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

import httpx
from dateutil import parser as dateparser

from app.services.envelope import build_envelope, data_age_seconds, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import _pjm_fetch
from app.services.pjm_zones import (
    ZONE_IDS,
    is_valid_zone,
    pnode_name_for,
    subtype_for,
    zone_id_for_pnode,
)

EPT = ZoneInfo("America/New_York")
LOG = logging.getLogger("gridalpha.pjm-lmp")

PJM_PAGE_SIZE = 100

# Dataset choice is load-bearing - read this before changing it.
#
# We tried the 5-minute unverified feed first (``rt_unverified_fivemin_lmps``)
# because the contract spec promised 5-min cadence. PJM rejects the
# ``type`` filter on that feed (``Filters: One or more filter field
# name(s) are invalid. detail: ["type"]``) and there is no equivalent
# zone-subtype filter - the feed returns every bus-level pricing node
# (~5,000 rows per 5-min slot) and the only way to scope it to a zone is
# to filter pnode_name client-side after pulling thousands of rows. The
# 100-row page cap makes that impractical.
#
# V1's gridalpha production backend uses the HOURLY unverified feed
# (``rt_unverified_hrl_lmps``) which accepts ``type=ZONE`` or
# ``type=HUB`` and returns exactly 22 zones / 12 hubs per hour. We
# adopted the same dataset. Frontend cadence is hourly as a result;
# the meta.interval_minutes field on /api/lmp/24h reflects this.
RT_DATASET = "rt_unverified_hrl_lmps"
RT_HISTORY_DATASET = "rt_hrl_lmps"            # verified hourly archive
DA_DATASET = "da_hrl_lmps"

HISTORY_MAX_HOURS = 168  # 7 days
HISTORY_CACHE_TTL = 30 * 24 * 3600.0  # historical data is immutable

# Field selectors. PJM's unverified feeds do NOT publish a
# ``system_energy_price_*`` column, so we omit it and derive the energy
# component as ``total - congestion - loss``. We keep ``type`` so we can
# distinguish ZONE rows from HUB rows when we pull the all-zones snapshot
# in one fetch.
_RT_FIELDS = (
    "datetime_beginning_utc,datetime_beginning_ept,pnode_name,type,"
    "total_lmp_rt,congestion_price_rt,marginal_loss_price_rt"
)
_DA_FIELDS = (
    "datetime_beginning_utc,datetime_beginning_ept,pnode_name,type,"
    "total_lmp_da,congestion_price_da,marginal_loss_price_da"
)
# Archived data rejects the fields filter, so we strip it for history.
_RT_HISTORY_FIELDS: str | None = None


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

    PJM Data Miner 2 expects ``YYYY-MM-DD HH:MM`` (24-hour, padded)
    with the literal `` to `` separator and EPT (America/New_York)
    timestamps. The older ``M/D/YYYY HH:MM`` shape is silently rejected
    on some feeds; V1 uses the ISO-style format and so do we.
    """
    s = start_utc.astimezone(EPT)
    e = end_utc.astimezone(EPT)
    return f"{s.strftime('%Y-%m-%d %H:%M')} to {e.strftime('%Y-%m-%d %H:%M')}"


def _ept_filter_ept(start_ept: datetime, end_ept: datetime) -> str:
    """Same as ``_ept_filter`` but accepts EPT-naive / EPT-aware inputs."""
    if start_ept.tzinfo is None:
        start_ept = start_ept.replace(tzinfo=EPT)
    if end_ept.tzinfo is None:
        end_ept = end_ept.replace(tzinfo=EPT)
    return _ept_filter(start_ept.astimezone(timezone.utc), end_ept.astimezone(timezone.utc))


def _to_iso_z(dt_utc: datetime) -> str:
    return dt_utc.strftime("%Y-%m-%dT%H:%M:%SZ")


def _ept_clock(dt_utc: datetime) -> str:
    """Render UTC datetime as 'HH:MM ET' for summary lines."""
    e = dt_utc.astimezone(EPT)
    return f"{e.hour:02d}:{e.minute:02d} ET"


# ── Shared snapshot helper ──────────────────────────────────────────────────


async def _fetch_rt_snapshot(
    *,
    window_hours: int = 2,
    subtypes: tuple[str, ...] = ("ZONE", "HUB"),
) -> list[dict[str, Any]]:
    """Single ``rt_unverified_hrl_lmps`` fetch covering the last
    ``window_hours`` for the requested subtypes (``ZONE`` and/or ``HUB``).

    Returns the raw PJM rows (one per pnode per hour). Callers filter
    client-side by ``pnode_name``. We hit the feed once per subtype -
    typically 22 zones x 2h = 44 rows for ZONE, 12 hubs x 2h = 24 rows
    for HUB - both well under the 100-row page cap.
    """
    end_utc = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    start_utc = end_utc - timedelta(hours=window_hours)
    dt_filter = _ept_filter(start_utc, end_utc)

    out: list[dict[str, Any]] = []
    for subtype in subtypes:
        page = await _paginated_fetch(
            RT_DATASET,
            {
                "fields": _RT_FIELDS,
                "datetime_beginning_ept": dt_filter,
                "type": subtype,
                "sort": "datetime_beginning_ept",
                "order": "1",
            },
            max_rows=PJM_PAGE_SIZE * 6,
        )
        out.extend(page)
    return out


def _latest_two_rows(
    rows: list[dict[str, Any]], pnode_name: str
) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    matches = [r for r in rows if _row_pnode(r).upper() == pnode_name.upper()]
    matches = _sort_by_dt_desc(matches)
    latest = matches[0] if matches else None
    prev = matches[1] if len(matches) > 1 else None
    return latest, prev


def _decompose_lmp_row(row: dict[str, Any]) -> tuple[float, float, float, float]:
    """Return ``(total, energy, congestion, loss)`` from a PJM RT row.

    The unverified feeds publish total + congestion + loss only. By
    PJM's pricing identity the energy component is the residual:
    ``energy = total - congestion - loss``. Returns rounded $/MWh.
    """
    total = _f(row.get("total_lmp_rt"))
    cong = _f(row.get("congestion_price_rt"))
    loss = _f(row.get("marginal_loss_price_rt"))
    energy = total - cong - loss
    return (round(total, 2), round(energy, 2), round(cong, 2), round(loss, 2))


# ── Endpoint 1: current LMP, single zone ─────────────────────────────────────


async def _fetch_lmp_current_pjm(zone_id: str) -> dict[str, Any]:
    """Hit PJM directly for a single zone's RT hourly LMP.

    Pulls the last ~2h of rows for the zone's subtype, then filters
    client-side to the requested pnode_name.
    """
    pname = pnode_name_for(zone_id)
    subtype = subtype_for(zone_id)
    rows = await _fetch_rt_snapshot(window_hours=2, subtypes=(subtype,))
    latest, prev = _latest_two_rows(rows, pname)
    if latest is None:
        raise LookupError(f"PJM returned no RT rows for {zone_id} ({pname})")

    lmp_total, lmp_energy, lmp_cong, lmp_loss = _decompose_lmp_row(latest)

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
        # Hourly cadence: this is hour-over-hour change, kept under the
        # original contract field name for frontend stability.
        "delta_pct_5min": delta_pct,
    }


async def _load_lmp_current(zone_id: str) -> dict[str, Any]:
    """RT LMP for one zone via the public PJM hourly feed."""
    payload = await _fetch_lmp_current_pjm(zone_id)
    # Recompute data_age_seconds against now so cache hits stay fresh.
    if payload.get("observed_at"):
        payload["data_age_seconds"] = data_age_seconds(payload["observed_at"])
    return payload


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
        f"{direction}{payload['delta_pct_5min']}% vs prior hour."
    )
    meta: dict[str, Any] = {
        "zone": zone_id,
        "timestamp": payload["observed_at"] or utc_now_iso(),
        "data_age_seconds": payload["data_age_seconds"],
        "source": "pjm-rt",
    }

    return build_envelope(
        meta=meta,
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
    """One PJM call per subtype, then split by pnode_name.

    Replaces the original per-zone fan-out with a batch fetch:
      * ``type=ZONE`` -> 22 PJM zones x 2h = ~44 rows
      * ``type=HUB``  -> 12 PJM hubs  x 2h = ~24 rows

    Each row carries the latest hourly LMP for its pnode; the latest
    two rows per zone drive the hour-over-hour delta. The whole
    snapshot is built from at most two PJM requests.
    """
    rows = await _fetch_rt_snapshot(window_hours=2, subtypes=("ZONE", "HUB"))

    zones: dict[str, dict[str, Any]] = {}
    failures: list[str] = []
    latest_observed: str = ""
    max_age = 0

    for zone_id in ZONE_IDS:
        pname = pnode_name_for(zone_id)
        latest, prev = _latest_two_rows(rows, pname)
        if latest is None:
            failures.append(zone_id)
            continue
        lmp_total, _energy, _cong, _loss = _decompose_lmp_row(latest)
        delta_pct = 0.0
        if prev is not None:
            prev_total = _f(prev.get("total_lmp_rt"))
            if prev_total:
                delta_pct = round((lmp_total - prev_total) / prev_total * 100.0, 2)
        zones[zone_id] = {
            "lmp_total": lmp_total,
            "delta_pct_5min": delta_pct,
        }
        obs = _row_dt_utc(latest)
        if obs and obs > latest_observed:
            latest_observed = obs
        age = data_age_seconds(obs)
        if age > max_age:
            max_age = age

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
    subtype = subtype_for(zone_id)
    end_utc = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    start_utc = end_utc - timedelta(hours=24)

    base_params = {
        "fields": _RT_FIELDS,
        "datetime_beginning_ept": _ept_filter(start_utc, end_utc),
        "type": subtype,
        "sort": "datetime_beginning_ept",
        "order": "1",
    }
    # 24h x 22 zones = 528 ZONE rows, 24h x 12 hubs = 288 HUB rows.
    # Either case fits in ~6 paginated pages.
    rows = await _paginated_fetch(RT_DATASET, base_params, max_rows=PJM_PAGE_SIZE * 7)

    series: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in _sort_by_dt_asc(rows):
        if _row_pnode(row).upper() != pname.upper():
            continue
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
        "interval_minutes": 60,  # hourly cadence per PJM rt_unverified_hrl_lmps
        "row_count": row_count,
        "start": payload["start_utc"],
        "end": payload["end_utc"],
        "source": "pjm-rt",
    }
    if row_count < 20:
        # 24 expected; small gaps are normal but flag aggressive shortfalls
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
    end = market_day_ept + timedelta(hours=23, minutes=59)
    return _ept_filter_ept(market_day_ept, end)


def _fmt_iso_date(ept_dt: datetime) -> str:
    return f"{ept_dt.year:04d}-{ept_dt.month:02d}-{ept_dt.day:02d}"


async def _fetch_da_snapshot(
    market_day_ept: datetime, subtype: str
) -> list[dict[str, Any]]:
    """Single ``da_hrl_lmps`` fetch covering one EPT day for a subtype.

    Returns the raw rows for every pnode matching the subtype filter
    (~23 zones x 24 hours = 552 rows for ZONE, ~12 hubs x 24h = 288
    for HUB). Both fit in 6 paginated pages.
    """
    return await _paginated_fetch(
        DA_DATASET,
        {
            "fields": _DA_FIELDS,
            "datetime_beginning_ept": _ept_day_filter(market_day_ept),
            "type": subtype,
            "sort": "datetime_beginning_ept",
            "order": "1",
        },
        max_rows=PJM_PAGE_SIZE * 7,
    )


async def _load_lmp_da_forecast(zone_id: str, date_iso: str | None) -> dict[str, Any]:
    pname = pnode_name_for(zone_id)
    subtype = subtype_for(zone_id)
    market_day = _resolve_market_date(date_iso)

    rows = await _fetch_da_snapshot(market_day, subtype)

    by_hour: dict[int, float] = {}
    for row in rows:
        if _row_pnode(row).upper() != pname.upper():
            continue
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


# ── Endpoint 11: day-ahead hourly forecast, all 20 zones ────────────────────


async def _load_lmp_da_forecast_all(date_iso: str | None) -> dict[str, Any]:
    """One DA fetch per subtype, then split by pnode_name.

    Replaces the per-zone fan-out (20 PJM round-trips) with at most two
    batched fetches (``type=ZONE`` and ``type=HUB``).
    """
    market_day = _resolve_market_date(date_iso)
    market_date_str = _fmt_iso_date(market_day)

    needed_subtypes = sorted({subtype_for(z) for z in ZONE_IDS})
    rows: list[dict[str, Any]] = []
    for subtype in needed_subtypes:
        rows.extend(await _fetch_da_snapshot(market_day, subtype))

    by_zone: dict[str, list[dict[str, Any]]] = {}
    failures: list[str] = []
    for zone_id in ZONE_IDS:
        pname = pnode_name_for(zone_id)
        by_hour: dict[int, float] = {}
        for row in rows:
            if _row_pnode(row).upper() != pname.upper():
                continue
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
        if not by_hour:
            failures.append(zone_id)
            continue
        by_zone[zone_id] = [
            {"hour": h, "lmp": by_hour[h]} for h in sorted(by_hour.keys())
        ]

    return {
        "market_date": market_date_str,
        "by_zone": by_zone,
        "failures": failures,
    }


async def get_lmp_da_forecast_all_zones(
    date_iso: str | None = None,
) -> dict[str, Any]:
    """Build the canonical envelope for ``/api/lmp/da-forecast/all-zones``."""
    market_day = _resolve_market_date(date_iso)
    cache_key = f"lmp:da-forecast:all-zones:{_fmt_iso_date(market_day)}"
    payload = await get_cached(
        cache_key,
        3600.0,
        lambda: _load_lmp_da_forecast_all(date_iso),
    )

    by_zone = payload["by_zone"]
    if not by_zone:
        raise LookupError(
            f"PJM returned no DA forecast for any zone on {payload['market_date']}"
        )

    # System-wide stats for the summary line.
    all_lmps = [pt["lmp"] for series in by_zone.values() for pt in series]
    avg = round(sum(all_lmps) / len(all_lmps), 2) if all_lmps else 0.0
    lo = round(min(all_lmps), 2) if all_lmps else 0.0
    hi = round(max(all_lmps), 2) if all_lmps else 0.0
    summary = (
        f"Day-ahead {payload['market_date']}: {len(by_zone)} zones, "
        f"system average ${avg}, range ${lo}-${hi}."
    )

    meta: dict[str, Any] = {
        "market_date": payload["market_date"],
        "interval": "hourly",
        "zone_count": len(by_zone),
        "source": "pjm-da",
    }
    if payload["failures"]:
        meta["zones_unavailable"] = payload["failures"]
        meta["degraded_mode"] = True

    return build_envelope(meta=meta, data=by_zone, summary=summary)


# ── Endpoint 5: historical LMP, single zone, arbitrary range ────────────────


def _parse_history_range(start_iso: str, end_iso: str) -> tuple[datetime, datetime]:
    """Parse + validate a history range. Returns UTC datetimes."""
    if not start_iso or not end_iso:
        raise ValueError("'start' and 'end' are required ISO timestamps")
    try:
        s = dateparser.parse(start_iso)
        e = dateparser.parse(end_iso)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError(f"unparseable timestamp: {exc}") from exc
    if s.tzinfo is None:
        s = s.replace(tzinfo=timezone.utc)
    if e.tzinfo is None:
        e = e.replace(tzinfo=timezone.utc)
    s = s.astimezone(timezone.utc)
    e = e.astimezone(timezone.utc)
    if e <= s:
        raise ValueError("'end' must be after 'start'")
    span_hours = (e - s).total_seconds() / 3600.0
    if span_hours > HISTORY_MAX_HOURS:
        raise ValueError(
            f"range too wide: {span_hours:.1f}h exceeds max {HISTORY_MAX_HOURS}h"
        )
    return s, e


def _aggregate_to_hourly(
    rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Average 5-min total_lmp_rt values into hourly buckets (UTC)."""
    buckets: dict[str, list[float]] = {}
    for row in rows:
        dt = _parse_utc(_row_dt_utc(row))
        if dt is None:
            continue
        key = dt.replace(minute=0, second=0, microsecond=0)
        key_iso = _to_iso_z(key)
        buckets.setdefault(key_iso, []).append(_f(row.get("total_lmp_rt")))
    out: list[dict[str, Any]] = []
    for ts in sorted(buckets):
        vals = buckets[ts]
        if not vals:
            continue
        out.append(
            {
                "timestamp": ts,
                "lmp_total": round(sum(vals) / len(vals), 2),
            }
        )
    return out


async def _load_lmp_history(
    zone_id: str,
    start_utc: datetime,
    end_utc: datetime,
    interval: str,
) -> dict[str, Any]:
    """Fetch historical hourly LMP for a single zone.

    Uses the verified hourly archive ``rt_hrl_lmps``. PJM treats this
    feed as archived data and rejects three things on archived calls:

      * ``fields`` filter   ("not an available filter for archived data")
      * ``sort`` parameter  ("Custom Sort is not an available option")
      * ``order`` parameter ("Custom Order is not an available option")

    so we drop all three for history queries. The response carries the
    full schema; we filter client-side to the requested pnode.

    The ``interval`` field is preserved for backward compatibility but
    the underlying data is always hourly - 5-min granularity is not
    available in the verified archive on a multi-day window.
    """
    pname = pnode_name_for(zone_id)
    subtype = subtype_for(zone_id)

    # Worst case: 7 days x 24 hours x 22 ZONE pnodes (or 12 HUB) = ~3,700
    # rows. We allow 4,000 (40 pages) to keep the safety margin reasonable.
    rows = await _paginated_fetch(
        RT_HISTORY_DATASET,
        {
            "datetime_beginning_ept": _ept_filter(start_utc, end_utc),
            "type": subtype,
        },
        max_rows=4_000,
    )

    series: list[dict[str, Any]] = []
    seen: set[str] = set()
    for row in _sort_by_dt_asc(rows):
        if _row_pnode(row).upper() != pname.upper():
            continue
        dt = _parse_utc(_row_dt_utc(row))
        if dt is None or dt < start_utc or dt > end_utc:
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
        "interval_minutes": 60,
        "series": series,
    }


async def get_lmp_history(
    zone_id: str,
    start_iso: str,
    end_iso: str,
    interval: str = "5min",
) -> dict[str, Any]:
    """Build the canonical envelope for ``/api/lmp/history``."""
    if not is_valid_zone(zone_id):
        raise ValueError(f"unknown zone id: {zone_id}")
    interval = (interval or "5min").lower()
    if interval not in {"5min", "hourly"}:
        raise ValueError("interval must be '5min' or 'hourly'")

    start_utc, end_utc = _parse_history_range(start_iso, end_iso)

    cache_key = (
        f"lmp:history:{zone_id}:{_to_iso_z(start_utc)}:"
        f"{_to_iso_z(end_utc)}:{interval}"
    )
    payload = await get_cached(
        cache_key,
        HISTORY_CACHE_TTL,
        lambda: _load_lmp_history(zone_id, start_utc, end_utc, interval),
    )

    series = payload["series"]
    if not series:
        raise LookupError(
            f"PJM returned no rows for {zone_id} in "
            f"{payload['start_utc']}..{payload['end_utc']}"
        )

    prices = [pt["lmp_total"] for pt in series]
    lo = round(min(prices), 2)
    hi = round(max(prices), 2)
    avg = round(sum(prices) / len(prices), 2)
    peak_pt = max(series, key=lambda p: p["lmp_total"])
    peak_dt = _parse_utc(peak_pt["timestamp"])
    peak_clock_ept = (
        peak_dt.astimezone(EPT).strftime("%b %d %H:%M ET")
        if peak_dt
        else "?"
    )
    summary = (
        f"{zone_id} {payload['start_utc'][:10]} to {payload['end_utc'][:10]}. "
        f"Range ${lo}-${hi}, average ${avg}. Peak at {peak_clock_ept}."
    )

    meta = {
        "zone": zone_id,
        "start": payload["start_utc"],
        "end": payload["end_utc"],
        "interval_minutes": payload["interval_minutes"],
        "row_count": len(series),
        "source": "pjm-rt-verified",
    }
    return build_envelope(meta=meta, data=series, summary=summary)

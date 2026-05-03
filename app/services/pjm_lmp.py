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

from app.services.envelope import build_envelope, data_age_seconds, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import _pjm_fetch
from app.services.pjm_zones import (
    ZONE_IDS,
    is_valid_zone,
    pnode_name_for,
    zone_id_for_pnode,
)

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

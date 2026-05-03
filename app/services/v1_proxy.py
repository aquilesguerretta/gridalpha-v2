"""V1 backend proxy used as a fallback when V2 cannot reach PJM directly.

Background:

The V2 backend authenticates against PJM Data Miner 2 with the same
``PJM_USERNAME`` / ``PJM_PASSWORD`` credentials V1 uses, but PJM has
been observed rate-limiting V2's egress IP after deploy storms. When
that happens, V2 sees ``HTTP 401`` on every PJM call while V1 keeps
working (different IP, different session cache).

This module proxies a small slice of V1's public surface back into the
Wave-5 envelope so the frontend stays usable. Responses produced via
this proxy carry ``meta.source = "v1-proxy"`` so consumers can tell the
data was reached through the older service.

V1 surface coverage (from ``https://gridalpha-production.up.railway.app/openapi.json``):

  * ``GET /lmp``           - 22-zone snapshot of latest 5-min LMP
  * ``GET /spark-spread``  - 22-zone spark-spread snapshot (heat_rate 7000, gas $4)
  * ``GET /battery-arb``   - arb-signal (charge/discharge hours), NOT a DA forecast
  * ``GET /generation``    - already used as fuel-mix fallback in
    ``intelligence_data._fetch_generation_fuel_from_v1``

V1 has no hub data and no historical / DA-hourly endpoints, so this
proxy can cover Endpoints 1, 2, and 6. Endpoints 3, 4, 5, 9, 11 still
require working V2 PJM auth.
"""

from __future__ import annotations

import os
from typing import Any

import httpx
from dateutil import parser as dateparser

from app.services.intelligence_cache import get_cached
from app.services.pjm_zones import ZONE_IDS

# Map our contract zone ids to the zone_name strings V1 returns.
# WEST_HUB is intentionally absent - V1 does not expose hubs.
CONTRACT_TO_V1: dict[str, str] = {
    "COMED": "COMED",
    "AEP": "AEP",
    "ATSI": "ATSI",
    "DAY": "DAY",
    "DEOK": "DEOK",
    "DUQ": "DUQ",
    "DOMINION": "DOM",
    "DPL": "DPL",
    "EKPC": "EKPC",
    "PPL": "PPL",
    "PECO": "PECO",
    "PSEG": "PSEG",
    "JCPL": "JCPL",
    "PEPCO": "PEPCO",
    "BGE": "BGE",
    "METED": "METED",
    "PENELEC": "PENELEC",
    "RECO": "RECO",
    "OVEC": "OVEC",
}

# Zones we cannot reach through V1 (caller should preserve the upstream
# error for these).
NO_V1_COVERAGE: set[str] = set(ZONE_IDS) - set(CONTRACT_TO_V1.keys())


def v1_base_url() -> str:
    return (
        os.environ.get("V1_BACKEND_URL", "").strip()
        or "https://gridalpha-production.up.railway.app"
    ).rstrip("/")


def has_v1_coverage(zone_id: str) -> bool:
    return zone_id in CONTRACT_TO_V1


async def _v1_get(path: str) -> dict[str, Any]:
    url = f"{v1_base_url()}{path}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(
            url,
            headers={
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (compatible; GridAlphaV2-Fallback/1.0)",
            },
        )
        r.raise_for_status()
        return r.json()


# ── LMP snapshot ────────────────────────────────────────────────────────────


async def _fetch_v1_lmp_snapshot() -> dict[str, dict[str, Any]]:
    """Return latest 5-min LMP keyed by V1 zone_name.

    Cached briefly so the per-zone fan-out for Endpoint 2 only triggers
    one upstream call.
    """
    body = await _v1_get("/lmp?demo=false")
    rows = body.get("data") or []
    by_zone: dict[str, dict[str, Any]] = {}
    for row in rows:
        zname = str(row.get("zone_name") or "").strip()
        if not zname:
            continue
        by_zone[zname] = row
    return by_zone


async def get_v1_lmp_snapshot() -> dict[str, dict[str, Any]]:
    return await get_cached("v1-proxy:lmp-snapshot", 60.0, _fetch_v1_lmp_snapshot)


def reshape_v1_lmp_row(zone_id: str, prev_lmp_total: float | None = None) -> Any:
    """Best-effort builder used by callers that already have the row in hand."""
    raise NotImplementedError("call build_v1_lmp_payload instead")


def _f(x: Any) -> float:
    if x is None:
        return 0.0
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0


async def build_v1_lmp_payload(zone_id: str) -> dict[str, Any]:
    """V1-sourced equivalent of ``pjm_lmp._load_lmp_current``.

    The shape mirrors what the V2 path returns so the rest of
    ``pjm_lmp`` does not have to special-case fallback responses.
    """
    if not has_v1_coverage(zone_id):
        raise LookupError(
            f"V1 backend has no data for {zone_id} (V1 exposes zones only, not hubs)"
        )

    snapshot = await get_v1_lmp_snapshot()
    v1_name = CONTRACT_TO_V1[zone_id]
    row = snapshot.get(v1_name)
    if not row:
        raise LookupError(f"V1 returned no row for {v1_name}")

    lmp_total = round(_f(row.get("lmp_total")), 2)
    energy = round(_f(row.get("energy_component")), 2)
    cong = round(_f(row.get("congestion_component")), 2)
    loss = round(_f(row.get("loss_component")), 2)

    # Best-effort observed_at: V1 row carries timestamp_utc (preferred)
    # then falls back to timestamp (EPT, no offset).
    observed = str(row.get("timestamp_utc") or row.get("timestamp") or "").strip()
    # Re-render to canonical 'Z' suffix when we have an offset-aware string.
    try:
        if observed:
            dt = dateparser.parse(observed)
            if dt.tzinfo is not None:
                observed = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    except (TypeError, ValueError, OverflowError):
        pass

    # V1 publishes a single snapshot, so we have no prior interval to
    # compute delta_pct_5min against. Frontend treats absent delta as 0.
    return {
        "zone": zone_id,
        "pnode_name": v1_name,
        "observed_at": observed,
        "data_age_seconds": 0,  # caller can recompute from observed_at
        "lmp_total": lmp_total,
        "lmp_energy": energy,
        "lmp_congestion": cong,
        "lmp_loss": loss,
        "delta_pct_5min": 0.0,
        "_via_v1_proxy": True,
    }


# ── Spark spread snapshot (only used if EIA-driven path also fails) ─────────


async def _fetch_v1_spark_spread_snapshot() -> dict[str, dict[str, Any]]:
    body = await _v1_get("/spark-spread?demo=false")
    rows = body.get("data") or []
    return {
        str(row.get("zone_name") or "").strip(): row
        for row in rows
        if row.get("zone_name")
    }


async def get_v1_spark_spread_snapshot() -> dict[str, dict[str, Any]]:
    return await get_cached(
        "v1-proxy:spark-spread-snapshot",
        60.0,
        _fetch_v1_spark_spread_snapshot,
    )

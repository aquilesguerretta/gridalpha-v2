"""Spark spread service - LMP minus gas-equivalent cost.

Formula:
    gas_equivalent_cost = heat_rate (BTU/kWh) * gas_price ($/MMBtu) / 1000
    spark_spread        = lmp_total ($/MWh) - gas_equivalent_cost ($/MWh)

The factor of 1000 converts BTU/kWh -> MMBtu/MWh (10^3 kWh/MWh and
10^-6 MMBtu/BTU multiply to 10^-3).

Regime classification (per Wave-5 contract):
    BURNING    > $5     - generators are profitable to run
    NORMAL     $0 - $5  - thin economics, marginal dispatch
    SUPPRESSED < $0     - LMP below fuel cost, generators losing money
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.services.envelope import build_envelope, data_age_seconds, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import ConfigurationError, fetch_henry_hub
from app.services.pjm_lmp import _load_lmp_current
from app.services.pjm_zones import is_valid_zone
from app.services.v1_proxy import build_v1_spark_spread_payload, has_v1_coverage

DEFAULT_HEAT_RATE_BTU_PER_KWH = 7500
LOG = logging.getLogger("gridalpha.spark-spread")


def _classify_regime(spark: float) -> str:
    if spark > 5.0:
        return "BURNING"
    if spark < 0.0:
        return "SUPPRESSED"
    return "NORMAL"


async def _spark_via_v1(
    zone_id: str, requested_heat_rate: int, reason: str
) -> dict[str, Any]:
    """Build a fully-V1-sourced spark-spread envelope.

    V1 publishes its own LMP, gas price, and heat rate together so this
    is the only honest answer when EIA is unreachable. The requested
    heat_rate is preserved in meta as ``requested_heat_rate`` so callers
    know we did not honor it.
    """
    payload = await build_v1_spark_spread_payload(zone_id)
    spark = payload["spark_spread"]
    regime = _classify_regime(spark)

    summary = (
        f"{zone_id} spark spread ${spark:.2f}/MWh, {regime} regime. "
        f"Gas ${payload['gas_price_mmbtu']:.2f}/MMBtu, heat rate "
        f"{payload['heat_rate_btu_per_kwh']} (V1 proxy)."
    )

    meta: dict[str, Any] = {
        "zone": zone_id,
        "heat_rate": payload["heat_rate_btu_per_kwh"],
        "requested_heat_rate": requested_heat_rate,
        "gas_price_mmbtu": payload["gas_price_mmbtu"],
        "timestamp": payload["observed_at"] or utc_now_iso(),
        "data_age_seconds": (
            data_age_seconds(payload["observed_at"])
            if payload.get("observed_at")
            else 0
        ),
        "source": "v1-proxy:spark-spread",
        "degraded_mode": True,
        "fallback_reason": reason,
    }
    data = {
        "lmp_total": payload["lmp_total"],
        "gas_equivalent_cost": payload["gas_equivalent_cost"],
        "spark_spread": spark,
        "regime": regime,
    }
    return build_envelope(meta=meta, data=data, summary=summary)


async def get_spark_spread_current(
    zone_id: str,
    heat_rate: int = DEFAULT_HEAT_RATE_BTU_PER_KWH,
) -> dict[str, Any]:
    """Build the canonical envelope for ``/api/spark-spread/current``.

    Three-stage cascade:
      1. PJM LMP + EIA Henry Hub gas (canonical)
      2. V1 LMP + EIA Henry Hub gas (PJM auth rejected, EIA still ok)
      3. V1 spark-spread row (both PJM and EIA unreachable)
    """
    if not is_valid_zone(zone_id):
        raise ValueError(f"unknown zone id: {zone_id}")
    if heat_rate <= 0:
        raise ValueError("heat_rate must be positive")

    lmp_payload = await get_cached(
        f"lmp:current:{zone_id}",
        60.0,
        lambda: _load_lmp_current(zone_id),
    )

    try:
        gas_payload = await fetch_henry_hub()
    except (httpx.HTTPStatusError, httpx.RequestError, ConfigurationError) as e:
        if not has_v1_coverage(zone_id):
            raise
        reason = f"EIA Henry Hub unreachable ({type(e).__name__}); using V1 spark-spread row"
        LOG.warning("spark-spread %s: %s", zone_id, reason)
        return await _spark_via_v1(zone_id, heat_rate, reason)

    lmp_total = float(lmp_payload["lmp_total"])
    gas_price = float(gas_payload.get("current_price_mmbtu") or 0.0)
    gas_eq_cost = round(heat_rate * gas_price / 1000.0, 2)
    spark = round(lmp_total - gas_eq_cost, 2)
    regime = _classify_regime(spark)

    summary = (
        f"{zone_id} spark spread ${spark:.2f}/MWh, {regime} regime. "
        f"Gas ${gas_price:.2f}/MMBtu, heat rate {heat_rate}."
    )

    via_v1 = bool(lmp_payload.get("_via_v1_proxy"))
    meta: dict[str, Any] = {
        "zone": zone_id,
        "heat_rate": heat_rate,
        "gas_price_mmbtu": round(gas_price, 4),
        "timestamp": lmp_payload["observed_at"] or utc_now_iso(),
        "data_age_seconds": lmp_payload["data_age_seconds"],
        "source": (
            "v1-proxy+eia-henry-hub" if via_v1 else "pjm-rt+eia-henry-hub"
        ),
    }
    if via_v1:
        meta["degraded_mode"] = True
        meta["fallback_reason"] = "lmp via V1 proxy (V2 PJM auth rejected)"
    data = {
        "lmp_total": round(lmp_total, 2),
        "gas_equivalent_cost": gas_eq_cost,
        "spark_spread": spark,
        "regime": regime,
    }
    return build_envelope(meta=meta, data=data, summary=summary)

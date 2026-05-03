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

from typing import Any

from app.services.envelope import build_envelope, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import fetch_henry_hub
from app.services.pjm_lmp import _load_lmp_current
from app.services.pjm_zones import is_valid_zone

DEFAULT_HEAT_RATE_BTU_PER_KWH = 7500


def _classify_regime(spark: float) -> str:
    if spark > 5.0:
        return "BURNING"
    if spark < 0.0:
        return "SUPPRESSED"
    return "NORMAL"


async def get_spark_spread_current(
    zone_id: str,
    heat_rate: int = DEFAULT_HEAT_RATE_BTU_PER_KWH,
) -> dict[str, Any]:
    """Build the canonical envelope for ``/api/spark-spread/current``."""
    if not is_valid_zone(zone_id):
        raise ValueError(f"unknown zone id: {zone_id}")
    if heat_rate <= 0:
        raise ValueError("heat_rate must be positive")

    lmp_payload = await get_cached(
        f"lmp:current:{zone_id}",
        60.0,
        lambda: _load_lmp_current(zone_id),
    )
    gas_payload = await fetch_henry_hub()

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

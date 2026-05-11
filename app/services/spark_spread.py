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

Gas price source cascade:
    1. EIA Henry Hub spot price (v2 API, series N9HHNGSPOT) when the
       call succeeds.
    2. Static fallback $4.00/MMBtu (V1's value) when EIA returns 4xx /
       network errors. V1 hardcodes this constant outright; we use it
       as a soft fallback so a working EIA key takes precedence.
       ``meta.degraded_mode = true`` is set in fallback mode.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.services.envelope import build_envelope, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import ConfigurationError, fetch_henry_hub
from app.services.pjm_lmp import _load_lmp_current
from app.services.pjm_zones import is_valid_zone

DEFAULT_HEAT_RATE_BTU_PER_KWH = 7500
# V1's value, sourced from EIA data as of Feb 2026 (post-Storm-Fern range).
# Used when the live EIA call is unreachable.
STATIC_GAS_PRICE_FALLBACK_MMBTU = 4.00
LOG = logging.getLogger("gridalpha.spark-spread")


def _classify_regime(spark: float) -> str:
    if spark > 5.0:
        return "BURNING"
    if spark < 0.0:
        return "SUPPRESSED"
    return "NORMAL"


async def _resolve_gas_price() -> tuple[float, str, str | None]:
    """Return (price, source_label, fallback_reason).

    Tries EIA; on any HTTP / network / config failure, falls back to
    the V1-style static constant. ``fallback_reason`` is None on the
    success path and a human string on fallback.
    """
    try:
        gas_payload = await fetch_henry_hub()
        price = float(gas_payload.get("current_price_mmbtu") or 0.0)
        if price <= 0:
            raise ValueError("EIA returned non-positive price")
        return price, "eia-henry-hub", None
    except (httpx.HTTPStatusError, httpx.RequestError, ConfigurationError, ValueError) as e:
        reason = f"EIA Henry Hub unreachable ({type(e).__name__}); using static fallback"
        LOG.warning("spark-spread gas price: %s", reason)
        return STATIC_GAS_PRICE_FALLBACK_MMBTU, "static-fallback", reason


async def get_spark_spread_current(
    zone_id: str,
    heat_rate: int = DEFAULT_HEAT_RATE_BTU_PER_KWH,
) -> dict[str, Any]:
    """Build the canonical envelope for ``/api/spark-spread/current``.

    LMP comes from the direct PJM hourly feed (see ``pjm_lmp``). Gas
    price comes from EIA when reachable, static $4.00/MMBtu otherwise.
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

    gas_price, gas_source, fallback_reason = await _resolve_gas_price()
    lmp_total = float(lmp_payload["lmp_total"])
    gas_eq_cost = round(heat_rate * gas_price / 1000.0, 2)
    spark = round(lmp_total - gas_eq_cost, 2)
    regime = _classify_regime(spark)

    summary = (
        f"{zone_id} spark spread ${spark:.2f}/MWh, {regime} regime. "
        f"Gas ${gas_price:.2f}/MMBtu, heat rate {heat_rate}."
    )

    meta: dict[str, Any] = {
        "zone": zone_id,
        "heat_rate": heat_rate,
        "gas_price_mmbtu": round(gas_price, 4),
        "gas_price_source": gas_source,
        "timestamp": lmp_payload["observed_at"] or utc_now_iso(),
        "data_age_seconds": lmp_payload["data_age_seconds"],
        "source": f"pjm-rt+{gas_source}",
    }
    if fallback_reason:
        meta["degraded_mode"] = True
        meta["fallback_reason"] = fallback_reason

    data = {
        "lmp_total": round(lmp_total, 2),
        "gas_equivalent_cost": gas_eq_cost,
        "spark_spread": spark,
        "regime": regime,
    }
    return build_envelope(meta=meta, data=data, summary=summary)

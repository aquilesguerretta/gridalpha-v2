"""Wave-5 fuel mix snapshot.

Re-uses the existing ``fetch_generation_fuel`` helper from
``intelligence_data`` (which already wraps PJM's ``gen_by_fuel`` dataset
with a 5-minute TTL cache and the V1 fallback) and enriches the rows
with:

  * canonical fuel family (``natural_gas``, ``coal``, ``oil``, ``nuclear``,
    ``wind``, ``solar``, ``hydro``, ``other``)
  * percentage share of total MW
  * static carbon-intensity constants (kg CO2 / MWh)
  * system-wide carbon intensity weighted by output

The legacy ``/api/atlas/generation-fuel`` route is preserved for existing
consumers and returns the raw PJM-shaped payload.
"""

from __future__ import annotations

from typing import Any

from app.services.envelope import build_envelope, utc_now_iso
from app.services.intelligence_data import fetch_generation_fuel
from app.services.pjm_zones import (
    FUEL_CARBON_INTENSITY,
    normalize_fuel,
)

# Stable display order for the contract response.
_DISPLAY_ORDER: tuple[str, ...] = (
    "natural_gas",
    "nuclear",
    "coal",
    "wind",
    "solar",
    "hydro",
    "oil",
    "other",
)


def _ensure_all_families(by_family: dict[str, float]) -> dict[str, float]:
    """Make sure every contract fuel family appears in the response."""
    out = {family: 0.0 for family in _DISPLAY_ORDER}
    out.update(by_family)
    return out


async def get_fuel_mix_current() -> dict[str, Any]:
    """Build the canonical envelope for ``/api/fuel-mix/current``."""
    raw = await fetch_generation_fuel()
    raw_fuels = raw.get("fuels") or []
    timestamp = raw.get("timestamp") or ""

    by_family: dict[str, float] = {}
    for row in raw_fuels:
        family = normalize_fuel(str(row.get("type") or row.get("fuel") or ""))
        mw = float(row.get("mw") or 0.0)
        by_family[family] = by_family.get(family, 0.0) + mw

    by_family = _ensure_all_families(by_family)
    total_mw = sum(by_family.values())

    fuels: list[dict[str, Any]] = []
    weighted_carbon = 0.0
    for family in _DISPLAY_ORDER:
        mw = round(by_family[family], 2)
        pct = round((mw / total_mw * 100.0) if total_mw else 0.0, 2)
        ci = FUEL_CARBON_INTENSITY.get(family, 0)
        fuels.append(
            {
                "fuel": family,
                "mw": mw,
                "pct": pct,
                "carbon_intensity_kg_per_mwh": ci,
            }
        )
        weighted_carbon += mw * ci

    system_ci = round(weighted_carbon / total_mw, 2) if total_mw else 0.0

    leaders = sorted(
        ((f["fuel"], f["pct"]) for f in fuels if f["pct"] > 0),
        key=lambda kv: kv[1],
        reverse=True,
    )[:3]
    leader_summary = ", ".join(
        f"{name.replace('_', ' ')} {pct:.0f}%" for name, pct in leaders
    ) or "no data"
    summary = (
        f"PJM at {total_mw / 1000.0:.1f} GW. {leader_summary}."
    )

    meta = {
        "timestamp": timestamp or utc_now_iso(),
        "footprint": "PJM",
        "source": raw.get("source") or "pjm-gen-by-fuel",
    }
    data = {
        "fuels": fuels,
        "total_mw": round(total_mw, 2),
        "system_carbon_intensity_kg_per_mwh": system_ci,
    }
    return build_envelope(meta=meta, data=data, summary=summary)

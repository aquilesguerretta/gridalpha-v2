"""PJM zone catalog and fuel taxonomy for Wave-5 endpoints.

Maps the 20 contract zone IDs (``WEST_HUB``, ``COMED``, ...) to the
``pnode_name`` strings PJM Data Miner 2 returns on the
``rt_unverified_fivemin_lmps`` and ``da_hrl_lmps`` datasets, plus the
``subtype`` (``HUB`` vs ``ZONE``).

The contract list mixes one HUB (``WEST_HUB``) with 19 zones, which is
why the catalog tracks subtype explicitly. Endpoints that fan out across
all of them filter PJM's response by membership in this catalog rather
than by ``pnode_subtype`` alone.

Carbon-intensity values for ``/api/fuel-mix/current`` are documented in
the Wave-5 contract (see ``docs/v2-backend-contract.md``).
"""

from __future__ import annotations

from typing import Literal, TypedDict

ZoneId = Literal[
    "WEST_HUB",
    "COMED",
    "AEP",
    "ATSI",
    "DAY",
    "DEOK",
    "DUQ",
    "DOMINION",
    "DPL",
    "EKPC",
    "PPL",
    "PECO",
    "PSEG",
    "JCPL",
    "PEPCO",
    "BGE",
    "METED",
    "PENELEC",
    "RECO",
    "OVEC",
]


class ZoneEntry(TypedDict):
    pnode_name: str
    subtype: Literal["HUB", "ZONE"]
    aliases: tuple[str, ...]


# Contract id -> PJM pnode_name + subtype + accepted aliases.
#
# The pnode_name strings here are PJM Data Miner 2's canonical labels on
# the LMP datasets. ``aliases`` is consulted when a row's pnode_name does
# not match the primary (PJM has been known to return e.g. "DAYTON" for
# DAY or "DOMINION" for DOM in different datasets). Phase-3 verification
# logs the first miss so the catalog can be tightened.
ZONES: dict[str, ZoneEntry] = {
    "WEST_HUB": {"pnode_name": "WESTERN HUB", "subtype": "HUB", "aliases": ("WEST HUB",)},
    "COMED":    {"pnode_name": "COMED",       "subtype": "ZONE", "aliases": ("COMED ZONE",)},
    "AEP":      {"pnode_name": "AEP",         "subtype": "ZONE", "aliases": ("AEP ZONE",)},
    "ATSI":     {"pnode_name": "ATSI",        "subtype": "ZONE", "aliases": ("ATSI ZONE",)},
    "DAY":      {"pnode_name": "DAY",         "subtype": "ZONE", "aliases": ("DAYTON", "DAY ZONE")},
    "DEOK":     {"pnode_name": "DEOK",        "subtype": "ZONE", "aliases": ("DEOK ZONE",)},
    "DUQ":      {"pnode_name": "DUQ",         "subtype": "ZONE", "aliases": ("DUQUESNE", "DUQ ZONE")},
    "DOMINION": {"pnode_name": "DOM",         "subtype": "ZONE", "aliases": ("DOMINION", "DOM ZONE")},
    "DPL":      {"pnode_name": "DPL",         "subtype": "ZONE", "aliases": ("DPL ZONE",)},
    "EKPC":     {"pnode_name": "EKPC",        "subtype": "ZONE", "aliases": ("EKPC ZONE",)},
    "PPL":      {"pnode_name": "PPL",         "subtype": "ZONE", "aliases": ("PPL ZONE",)},
    "PECO":     {"pnode_name": "PECO",        "subtype": "ZONE", "aliases": ("PECO ZONE",)},
    "PSEG":     {"pnode_name": "PSEG",        "subtype": "ZONE", "aliases": ("PSEG ZONE",)},
    "JCPL":     {"pnode_name": "JCPL",        "subtype": "ZONE", "aliases": ("JCPL ZONE",)},
    "PEPCO":    {"pnode_name": "PEPCO",       "subtype": "ZONE", "aliases": ("PEPCO ZONE",)},
    "BGE":      {"pnode_name": "BGE",         "subtype": "ZONE", "aliases": ("BGE ZONE",)},
    "METED":    {"pnode_name": "METED",       "subtype": "ZONE", "aliases": ("METED ZONE",)},
    "PENELEC":  {"pnode_name": "PENELEC",     "subtype": "ZONE", "aliases": ("PENELEC ZONE",)},
    "RECO":     {"pnode_name": "RECO",        "subtype": "ZONE", "aliases": ("RECO ZONE",)},
    "OVEC":     {"pnode_name": "OVEC",        "subtype": "ZONE", "aliases": ("OVEC ZONE",)},
}

ZONE_IDS: tuple[str, ...] = tuple(ZONES.keys())


def is_valid_zone(zone_id: str) -> bool:
    return zone_id in ZONES


def pnode_name_for(zone_id: str) -> str:
    """PJM canonical pnode_name for a contract zone id. Raises on miss."""
    entry = ZONES.get(zone_id)
    if not entry:
        raise KeyError(f"unknown zone id: {zone_id}")
    return entry["pnode_name"]


# Build a reverse lookup once at import time so per-row matching is O(1).
# Both the canonical pnode_name and any aliases collapse to the same
# contract zone id.
def _build_reverse_lookup() -> dict[str, str]:
    rev: dict[str, str] = {}
    for zone_id, entry in ZONES.items():
        rev[entry["pnode_name"].upper()] = zone_id
        for alias in entry["aliases"]:
            rev[alias.upper()] = zone_id
    return rev


_REVERSE_LOOKUP: dict[str, str] = _build_reverse_lookup()


def zone_id_for_pnode(pnode_name: str) -> str | None:
    """Reverse lookup: PJM pnode_name (or alias) -> contract zone id."""
    if not pnode_name:
        return None
    return _REVERSE_LOOKUP.get(pnode_name.strip().upper())


# ── Fuel taxonomy ────────────────────────────────────────────────────────────

# Carbon intensity in kg CO2 / MWh (typical values for the PJM footprint).
# ``other`` is a weighted estimate covering biomass, storage, multi-fuel,
# and minor fuels PJM groups together.
FUEL_CARBON_INTENSITY: dict[str, int] = {
    "natural_gas": 412,
    "coal": 920,
    "oil": 740,
    "nuclear": 0,
    "wind": 0,
    "solar": 0,
    "hydro": 0,
    "other": 200,
}

# Map PJM ``gen_by_fuel`` ``fuel_type`` strings to canonical contract
# fuel families. Anything unmatched falls back to ``other``.
PJM_FUEL_FAMILY: dict[str, str] = {
    "Gas": "natural_gas",
    "Natural Gas": "natural_gas",
    "Coal": "coal",
    "Oil": "oil",
    "Light Oil": "oil",
    "Heavy Oil": "oil",
    "Nuclear": "nuclear",
    "Wind": "wind",
    "Solar": "solar",
    "Hydro": "hydro",
    "Storage": "other",
    "Battery": "other",
    "Multiple Fuels": "other",
    "Other Renewables": "other",
    "Other": "other",
    "Biomass": "other",
    "Wood": "other",
    "Landfill Gas": "other",
}


def normalize_fuel(pjm_fuel_type: str) -> str:
    """PJM fuel_type string -> canonical contract fuel family."""
    if not pjm_fuel_type:
        return "other"
    return PJM_FUEL_FAMILY.get(pjm_fuel_type.strip(), "other")

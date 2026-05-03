"""Ancillary services market clearing prices.

PJM operates several ancillary markets; this service surfaces the four
values the contract calls out:

  * ``regulation_d_mcp``         - dynamic-response regulation clearing price
  * ``regulation_a_mcp``         - traditional regulation clearing price
  * ``spinning_reserve_mcp``     - synchronized reserve clearing price
  * ``regulation_mileage_payment`` - per-MWh mileage payment for regulation

PJM Data Miner 2 dataset names have shifted across releases. The
implementation attempts a primary dataset (``ancillary_services``) and
falls back to per-market datasets when the umbrella is unavailable.
``meta.degraded_mode = true`` is set when one or more values could not be
sourced and a default (``0.0``) is shown instead.
"""

from __future__ import annotations

from typing import Any

import httpx

from app.services.envelope import build_envelope, utc_now_iso
from app.services.intelligence_cache import get_cached
from app.services.intelligence_data import _pjm_fetch


def _f(x: Any) -> float:
    if x is None:
        return 0.0
    try:
        return float(x)
    except (TypeError, ValueError):
        return 0.0


def _latest(rows: list[dict[str, Any]], ts_field: str) -> dict[str, Any] | None:
    if not rows:
        return None
    return max(rows, key=lambda r: str(r.get(ts_field) or ""))


async def _try_fetch(
    dataset: str, params: dict[str, str]
) -> list[dict[str, Any]]:
    try:
        return await _pjm_fetch(dataset, params)
    except (httpx.HTTPStatusError, httpx.RequestError):
        return []


async def _load_ancillary_current() -> dict[str, Any]:
    notes: list[str] = []

    # ── regulation market (Reg-A, Reg-D, mileage) ───────────────────────────
    reg_rows = await _try_fetch(
        "ancillary_services",
        {
            "rowCount": "12",
            "fields": (
                "datetime_beginning_utc,reg_market_clearing_price,"
                "reg_market_clearing_price_rmccp,"
                "reg_market_clearing_price_rmpcp"
            ),
        },
    )
    if not reg_rows:
        reg_rows = await _try_fetch(
            "regulation_market_results",
            {
                "rowCount": "12",
                "fields": (
                    "datetime_beginning_utc,rmccp,rmpcp,total_mcp"
                ),
            },
        )
        if reg_rows:
            notes.append("regulation via fallback dataset")
    if not reg_rows:
        notes.append("regulation market unavailable")

    reg_latest = _latest(reg_rows, "datetime_beginning_utc") or {}

    rmccp = _f(
        reg_latest.get("reg_market_clearing_price_rmccp")
        or reg_latest.get("rmccp")
    )
    rmpcp = _f(
        reg_latest.get("reg_market_clearing_price_rmpcp")
        or reg_latest.get("rmpcp")
    )
    total_reg = _f(
        reg_latest.get("reg_market_clearing_price")
        or reg_latest.get("total_mcp")
    ) or (rmccp + rmpcp)

    # PJM publishes the headline RMCCP for Reg-A and the dynamic add-on
    # (RMPCP, performance) is the bulk of Reg-D's payment - we expose
    # the canonical values plus the mileage component below.
    regulation_a = round(rmccp, 2)
    regulation_d = round(rmccp + rmpcp, 2)
    mileage_payment = round(rmpcp, 2)

    # ── synchronized reserve ────────────────────────────────────────────────
    sr_rows = await _try_fetch(
        "synchronized_reserve_market_results",
        {
            "rowCount": "12",
            "fields": "datetime_beginning_utc,total_mcp,clearing_price",
        },
    )
    if not sr_rows:
        sr_rows = await _try_fetch(
            "ancillary_services",
            {
                "rowCount": "12",
                "fields": "datetime_beginning_utc,sr_market_clearing_price",
            },
        )
        if sr_rows:
            notes.append("sync-reserve via fallback dataset")
    if not sr_rows:
        notes.append("sync-reserve unavailable")

    sr_latest = _latest(sr_rows, "datetime_beginning_utc") or {}
    spinning = round(
        _f(
            sr_latest.get("clearing_price")
            or sr_latest.get("total_mcp")
            or sr_latest.get("sr_market_clearing_price")
        ),
        2,
    )

    observed = str(
        reg_latest.get("datetime_beginning_utc")
        or sr_latest.get("datetime_beginning_utc")
        or ""
    )

    return {
        "regulation_a_mcp": regulation_a,
        "regulation_d_mcp": regulation_d,
        "spinning_reserve_mcp": spinning,
        "regulation_mileage_payment": mileage_payment,
        "total_regulation_mcp": round(total_reg, 2),
        "observed_at": observed,
        "degraded_mode": bool(notes),
        "notes": notes,
    }


async def get_ancillary_current(zone: str = "all") -> dict[str, Any]:
    payload = await get_cached(
        "ancillary:current",
        300.0,
        _load_ancillary_current,
    )

    summary = (
        f"Reg-D ${payload['regulation_d_mcp']:.2f}/MW, "
        f"Reg-A ${payload['regulation_a_mcp']:.2f}, "
        f"Spin ${payload['spinning_reserve_mcp']:.2f}, "
        f"Mileage ${payload['regulation_mileage_payment']:.2f}/MWh."
    )

    meta: dict[str, Any] = {
        "timestamp": payload["observed_at"] or utc_now_iso(),
        "market": "PJM-ASM",
        "source": "pjm-ancillary-services",
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
            "regulation_d_mcp": payload["regulation_d_mcp"],
            "regulation_a_mcp": payload["regulation_a_mcp"],
            "spinning_reserve_mcp": payload["spinning_reserve_mcp"],
            "regulation_mileage_payment": payload["regulation_mileage_payment"],
        },
        summary=summary,
    )

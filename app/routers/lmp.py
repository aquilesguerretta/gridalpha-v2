"""Wave-5 canonical LMP endpoints.

All routes return the ``{meta, data, summary}`` envelope described in
``docs/v2-backend-contract.md``.
"""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.services.intelligence_data import ConfigurationError
from app.services.pjm_lmp import (
    get_lmp_24h,
    get_lmp_all_zones,
    get_lmp_current,
    get_lmp_da_forecast,
)
from app.services.pjm_zones import ZONE_IDS, is_valid_zone

router = APIRouter(prefix="/api/lmp", tags=["lmp"])


def _validate_zone(zone: str) -> None:
    if not is_valid_zone(zone):
        raise HTTPException(
            status_code=422,
            detail=f"unknown zone '{zone}'. valid: {', '.join(ZONE_IDS)}",
        )


@router.get("/current")
async def lmp_current(zone: str = Query(..., description="Contract zone id")):
    _validate_zone(zone)
    try:
        return await get_lmp_current(zone)
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except LookupError as e:
        raise HTTPException(404, detail=str(e)) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e


@router.get("/all-zones")
async def lmp_all_zones():
    try:
        return await get_lmp_all_zones()
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except LookupError as e:
        raise HTTPException(502, detail=str(e)) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e


@router.get("/24h")
async def lmp_24h(zone: str = Query(..., description="Contract zone id")):
    _validate_zone(zone)
    try:
        return await get_lmp_24h(zone)
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except LookupError as e:
        raise HTTPException(404, detail=str(e)) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e


@router.get("/da-forecast")
async def lmp_da_forecast(
    zone: str = Query(..., description="Contract zone id"),
    date: str | None = Query(
        None, description="Market date YYYY-MM-DD (defaults to tomorrow EPT)"
    ),
):
    _validate_zone(zone)
    try:
        return await get_lmp_da_forecast(zone, date)
    except ValueError as e:
        raise HTTPException(422, detail=str(e)) from e
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except LookupError as e:
        raise HTTPException(404, detail=str(e)) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e

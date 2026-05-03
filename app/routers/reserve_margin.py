"""Wave-5 canonical reserve-margin endpoint."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.services.intelligence_data import ConfigurationError
from app.services.pjm_load import get_reserve_margin_current

router = APIRouter(prefix="/api/reserve-margin", tags=["reserve-margin"])


@router.get("/current")
async def reserve_margin_current(
    zone: str = Query("all", description="Contract zone id or 'all'"),
):
    try:
        return await get_reserve_margin_current(zone)
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e

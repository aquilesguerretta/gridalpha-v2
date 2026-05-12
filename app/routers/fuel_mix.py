"""Wave-5 canonical fuel-mix endpoint."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException

from app.services.intelligence_data import ConfigurationError
from app.services.pjm_fuel_mix_v2 import get_fuel_mix_current

router = APIRouter(prefix="/api/fuel-mix", tags=["fuel-mix"])


@router.get("/current")
async def fuel_mix_current():
    try:
        return await get_fuel_mix_current()
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e

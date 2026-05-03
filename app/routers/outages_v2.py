"""Wave-5 canonical outages endpoint."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException

from app.services.intelligence_data import ConfigurationError
from app.services.pjm_outages_v2 import get_outages_current

router = APIRouter(prefix="/api/outages", tags=["outages"])


@router.get("/current")
async def outages_current():
    try:
        return await get_outages_current()
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e

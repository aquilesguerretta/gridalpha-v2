"""Wave-5 canonical ancillary-services endpoint."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.services.intelligence_data import ConfigurationError
from app.services.pjm_ancillary import get_ancillary_current

router = APIRouter(prefix="/api/ancillary", tags=["ancillary"])


@router.get("/current")
async def ancillary_current(
    zone: str = Query("all", description="Contract zone id or 'all'"),
):
    try:
        return await get_ancillary_current(zone)
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e

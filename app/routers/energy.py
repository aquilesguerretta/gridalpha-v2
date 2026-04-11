"""Sprint 3B EIA energy endpoints."""

import httpx
from fastapi import APIRouter, HTTPException

from app.services.intelligence_data import (
    ConfigurationError,
    fetch_electricity_prices,
    fetch_henry_hub,
)

router = APIRouter(prefix="/api/energy", tags=["energy"])


@router.get("/henry-hub")
async def henry_hub():
    try:
        return await fetch_henry_hub()
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"EIA HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e


@router.get("/electricity-prices")
async def electricity_prices():
    try:
        return await fetch_electricity_prices()
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"EIA HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e

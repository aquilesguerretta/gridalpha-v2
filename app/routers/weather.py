"""Sprint 3B Tomorrow.io weather endpoints."""

import httpx
from fastapi import APIRouter, HTTPException

from app.services.intelligence_data import (
    ConfigurationError,
    fetch_weather_current,
    fetch_weather_forecast,
)

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("/current")
async def weather_current():
    try:
        return await fetch_weather_current()
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"Tomorrow.io HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e


@router.get("/forecast")
async def weather_forecast():
    try:
        return await fetch_weather_forecast()
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"Tomorrow.io HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e

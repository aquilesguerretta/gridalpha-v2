"""Wave-5 canonical spark-spread endpoint."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.services.intelligence_data import ConfigurationError
from app.services.pjm_zones import ZONE_IDS, is_valid_zone
from app.services.spark_spread import (
    DEFAULT_HEAT_RATE_BTU_PER_KWH,
    get_spark_spread_current,
)

router = APIRouter(prefix="/api/spark-spread", tags=["spark-spread"])


@router.get("/current")
async def spark_spread_current(
    zone: str = Query(..., description="Contract zone id"),
    heat_rate: int = Query(
        DEFAULT_HEAT_RATE_BTU_PER_KWH,
        gt=0,
        description="Heat rate in BTU/kWh (default 7500, typical CCGT)",
    ),
):
    if not is_valid_zone(zone):
        raise HTTPException(
            422, detail=f"unknown zone '{zone}'. valid: {', '.join(ZONE_IDS)}"
        )
    try:
        return await get_spark_spread_current(zone, heat_rate)
    except ValueError as e:
        raise HTTPException(422, detail=str(e)) from e
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except LookupError as e:
        raise HTTPException(404, detail=str(e)) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"upstream HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e

"""Sprint 3B Grid Atlas intelligence (PJM + HIFLD)."""

import httpx
from fastapi import APIRouter, HTTPException

from app.services.intelligence_data import (
    ConfigurationError,
    fetch_binding_constraints,
    fetch_gas_pipelines_geojson,
    fetch_generation_fuel,
    fetch_interface_flows,
    fetch_outages,
    fetch_substations_geojson,
)

router = APIRouter(prefix="/api/atlas", tags=["atlas"])


@router.get("/generation-fuel")
async def generation_fuel():
    try:
        return await fetch_generation_fuel()
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e


@router.get("/binding-constraints")
async def binding_constraints():
    try:
        return await fetch_binding_constraints()
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e


@router.get("/interface-flows")
async def interface_flows():
    try:
        return await fetch_interface_flows()
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e


@router.get("/outages")
async def outages():
    try:
        return await fetch_outages()
    except ConfigurationError as e:
        raise HTTPException(503, detail=e.message) from e
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"PJM HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e


@router.get("/substations")
async def substations():
    try:
        return await fetch_substations_geojson()
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"ArcGIS HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e


@router.get("/gas-pipelines")
async def gas_pipelines():
    try:
        return await fetch_gas_pipelines_geojson()
    except httpx.HTTPStatusError as e:
        raise HTTPException(502, detail=f"ArcGIS HTTP {e.response.status_code}") from e
    except httpx.RequestError as e:
        raise HTTPException(502, detail=str(e)) from e

import os
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/ai", tags=["ai"])

_ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
_ANTHROPIC_VERSION = "2023-06-01"


@router.post("/complete")
async def complete(payload: dict[str, Any]):
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(503, detail="ANTHROPIC_API_KEY is not configured")

    required_fields = ("model", "max_tokens", "messages")
    missing = [field for field in required_fields if field not in payload]
    if missing:
        raise HTTPException(422, detail=f"Missing required fields: {', '.join(missing)}")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                _ANTHROPIC_URL,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": api_key,
                    "anthropic-version": _ANTHROPIC_VERSION,
                },
                json=payload,
            )

        content = resp.json()
        return JSONResponse(status_code=resp.status_code, content=content)
    except httpx.RequestError as e:
        raise HTTPException(502, detail=f"Anthropic request failed: {e}") from e
    except ValueError as e:
        raise HTTPException(502, detail=f"Anthropic response parse failed: {e}") from e

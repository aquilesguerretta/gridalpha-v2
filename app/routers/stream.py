"""Wave-5 SSE stream endpoint - ``GET /api/stream``."""

from __future__ import annotations

from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

from app.services.pjm_stream import HUB, event_generator

router = APIRouter(prefix="/api", tags=["stream"])


@router.get("/stream")
async def stream(request: Request) -> EventSourceResponse:
    queue = await HUB.subscribe()

    async def gen():
        try:
            async for frame in event_generator(queue):
                if await request.is_disconnected():
                    break
                yield frame
        finally:
            await HUB.unsubscribe(queue)

    return EventSourceResponse(
        gen(),
        ping=15,  # uvicorn-friendly comment ping
        headers={"Cache-Control": "no-cache, no-transform"},
    )

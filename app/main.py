import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    ai,
    ancillary,
    atlas,
    energy,
    fuel_mix,
    lmp,
    news,
    outages_v2,
    reserve_margin,
    spark_spread,
    stream,
    weather,
)
from app.services.pjm_stream import HUB


@asynccontextmanager
async def lifespan(app: FastAPI):
    await HUB.start()
    try:
        yield
    finally:
        await HUB.stop()


app = FastAPI(title="GridAlpha API", version="2.0", lifespan=lifespan)

_cors_origins = [
    "https://gridalpha.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
_extra = os.environ.get("CORS_ORIGINS", "").strip()
if _extra:
    _cors_origins.extend(x.strip() for x in _extra.split(",") if x.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    # Vercel previews + any localhost/127.0.0.1 port (Vite falls back when 5173 is busy)
    allow_origin_regex=(
        r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Peregrine + Sprint 3B/3C intelligence (legacy, frozen).
app.include_router(news.router)  # /api/news/*
app.include_router(atlas.router)  # /api/atlas/*
app.include_router(energy.router)  # /api/energy/*
app.include_router(weather.router)  # /api/weather/*
app.include_router(ai.router)  # /api/ai/*

# Wave 5 canonical endpoints (see docs/v2-backend-contract.md).
app.include_router(lmp.router)  # /api/lmp/*
app.include_router(spark_spread.router)  # /api/spark-spread/*
app.include_router(fuel_mix.router)  # /api/fuel-mix/*
app.include_router(reserve_margin.router)  # /api/reserve-margin/*
app.include_router(outages_v2.router)  # /api/outages/*
app.include_router(ancillary.router)  # /api/ancillary/*
app.include_router(stream.router)  # /api/stream (SSE)


@app.get("/health")
def health():
    return {"status": "ok"}

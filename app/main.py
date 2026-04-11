import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import atlas, energy, news, weather

app = FastAPI(title="GridAlpha API", version="2.0")

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

app.include_router(news.router)
app.include_router(atlas.router)
app.include_router(energy.router)
app.include_router(weather.router)


@app.get("/health")
def health():
    return {"status": "ok"}

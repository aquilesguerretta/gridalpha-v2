from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import news

app = FastAPI(title="GridAlpha API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gridalpha.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(news.router)


@app.get("/health")
def health():
    return {"status": "ok"}

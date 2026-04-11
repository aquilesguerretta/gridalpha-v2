from fastapi import APIRouter, Query

from app.services.news_service import fetch_news

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("/feed")
async def get_news_feed(
    source: str = Query(None),
    category: str = Query(None),
    limit: int = Query(30, le=100),
):
    items = await fetch_news()
    if source:
        items = [i for i in items if i["source"] == source.upper()]
    if category:
        items = [i for i in items if i["category"] == category.upper()]
    return {
        "items": items[:limit],
        "total": len(items),
        "sources": ["EIA", "PJM", "FERC"],
    }


@router.get("/sources")
async def get_sources():
    return {
        "sources": [
            {"id": "EIA", "name": "U.S. Energy Information Administration", "color": "#10B981"},
            {"id": "PJM", "name": "PJM Interconnection", "color": "#06B6D4"},
            {"id": "FERC", "name": "Federal Energy Regulatory Commission", "color": "#F59E0B"},
        ]
    }

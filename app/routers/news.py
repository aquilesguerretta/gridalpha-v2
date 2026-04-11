from fastapi import APIRouter, Query

from app.services.news_service import RSS_FEEDS, fetch_news

router = APIRouter(prefix="/api/news", tags=["news"])


def _source_shorts_ordered() -> list[str]:
    seen: set[str] = set()
    order: list[str] = []
    for f in RSS_FEEDS:
        s = f["short"]
        if s not in seen:
            seen.add(s)
            order.append(s)
    return order


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
        "sources": _source_shorts_ordered(),
    }


@router.get("/sources")
async def get_sources():
    return {
        "sources": [
            {"id": "EIA", "name": "U.S. Energy Information Administration", "color": "#10B981"},
            {"id": "PJM", "name": "PJM Interconnection", "color": "#06B6D4"},
            {"id": "FERC", "name": "Federal Energy Regulatory Commission", "color": "#F59E0B"},
            {"id": "BLOOMBERG", "name": "Bloomberg", "color": "#F59E0B"},
            {"id": "REUTERS", "name": "Reuters", "color": "#3B82F6"},
        ]
    }

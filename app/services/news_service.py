import asyncio
import time
from datetime import datetime, timezone

import feedparser
import httpx
from dateutil import parser as dateparser

# URLs verified fetchable (FERC’s on-site RSS often 403s from servers; FR mirror is official filings).
RSS_FEEDS = [
    {
        "id": "eia",
        "name": "U.S. Energy Information Administration",
        "short": "EIA",
        "url": "https://www.eia.gov/rss/todayinenergy.xml",
        "color": "#10B981",
        "priority": "HIGH",
    },
    {
        "id": "pjm",
        "name": "PJM Interconnection",
        "short": "PJM",
        "url": "https://insidelines.pjm.com/feed/",
        "color": "#06B6D4",
        "priority": "CRITICAL",
    },
    {
        "id": "ferc",
        "name": "Federal Energy Regulatory Commission",
        "short": "FERC",
        "url": "https://www.federalregister.gov/api/v1/documents.rss?conditions%5Bagency_ids%5D=167",
        "color": "#F59E0B",
        "priority": "HIGH",
    },
]

_FETCH_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; GridAlpha/2.0; +https://gridalpha.vercel.app)",
    "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
}

_cache: dict = {"items": [], "updated_at": 0, "ttl": 300}

CATEGORY_KEYWORDS = {
    "CONGESTION": ["congestion", "transmission", "constraint", "interface", "flowgate"],
    "PRICE": ["price", "lmp", "$/mwh", "spot", "day-ahead", "real-time"],
    "GENERATION": ["generation", "capacity", "outage", "wind", "solar", "nuclear", "coal", "gas"],
    "DISPATCH": ["dispatch", "emergency", "eea", "reliability", "must-run", "curtail"],
    "WEATHER": ["weather", "temperature", "forecast", "demand", "load", "cold", "heat"],
    "REGULATORY": ["ferc", "order", "rule", "regulation", "tariff", "filing"],
}


def classify(title: str, summary: str) -> str:
    text = (title + " " + summary).lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return category
    return "SYSTEM"


def time_ago(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    diff = now - (dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt)
    seconds = int(diff.total_seconds())
    if seconds < 3600:
        return f"{seconds // 60} min ago"
    if seconds < 86400:
        return f"{seconds // 3600} hr ago"
    return f"{seconds // 86400} d ago"


async def parse_feed(feed_config: dict) -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(
                feed_config["url"],
                headers=_FETCH_HEADERS,
            )
            resp.raise_for_status()
            body = resp.text
        parsed = feedparser.parse(body)
        items = []
        for entry in parsed.entries[:15]:
            title = entry.get("title", "").strip()
            summary = entry.get("summary", entry.get("description", "")).strip()
            link = entry.get("link", "")
            pub = entry.get("published_parsed") or entry.get("updated_parsed")
            try:
                dt = (
                    dateparser.parse(entry.get("published", ""))
                    if pub is None
                    else datetime(*pub[:6], tzinfo=timezone.utc)
                )
            except Exception:
                dt = datetime.now(timezone.utc)
            items.append(
                {
                    "id": f"{feed_config['id']}_{abs(hash(title)) % 100000}",
                    "source": feed_config["short"],
                    "sourceFull": feed_config["name"],
                    "sourceColor": feed_config["color"],
                    "priority": feed_config["priority"],
                    "title": title,
                    "summary": summary[:280] if summary else "",
                    "url": link,
                    "category": classify(title, summary),
                    "timeAgo": time_ago(dt),
                    "publishedAt": dt.isoformat() if dt else datetime.now(timezone.utc).isoformat(),
                    "videoId": None,
                    "thumbnail": None,
                }
            )
        return items
    except Exception as e:
        print(f"[NewsService] Failed to parse {feed_config['id']}: {e}")
        return []


async def fetch_news() -> list[dict]:
    now = time.time()
    if now - _cache["updated_at"] < _cache["ttl"] and _cache["items"]:
        return _cache["items"]
    results = await asyncio.gather(*[parse_feed(f) for f in RSS_FEEDS])
    all_items = [item for sublist in results for item in sublist]
    all_items.sort(key=lambda x: x["publishedAt"], reverse=True)
    _cache["items"] = all_items
    _cache["updated_at"] = now
    return all_items

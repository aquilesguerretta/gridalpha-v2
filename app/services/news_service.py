import asyncio
import time
from datetime import datetime, timezone
from typing import Optional

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
        # Inside Lines often works from browsers; Railway/datacenter IPs may get empty/error responses.
        "url": "https://insidelines.pjm.com/feed/",
        "fallback_urls": [
            # Official pjm.com RSS (verified 200 + application/rss+xml; user-suggested /library/rss etc. redirect to not-found)
            "https://www.pjm.com/about-pjm/who-we-are/pjm-board/public-disclosures.aspx?publicdisclosures=All&rss=1",
        ],
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
    {
        "id": "eia_video",
        "name": "EIA Video Updates",
        "short": "EIA",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCO2GEMkCfPBEGKNBK8E7gYg",
        "color": "#10B981",
        "priority": "NORMAL",
        "type": "video",
    },
    {
        "id": "bloomberg_energy",
        "name": "Bloomberg Energy",
        "short": "BLOOMBERG",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCIALMKvObZNtJ6AmdCLP7Hg",
        "color": "#F59E0B",
        "priority": "NORMAL",
        "type": "video",
    },
    {
        "id": "spglobal",
        "name": "S&P Global Commodity Insights",
        "short": "S&P",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCzirgDcCKKfPHuWwdTbN-qw",
        "color": "#06B6D4",
        "priority": "NORMAL",
        "type": "video",
    },
]

_FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 GridAlpha/2.0"
    ),
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


def _youtube_video_id(entry: feedparser.FeedParserDict, link: str) -> Optional[str]:
    vid = entry.get("yt_videoid")
    if vid:
        return str(vid).strip()
    if "youtube.com/watch?v=" in link:
        return link.split("v=")[-1].split("&")[0].strip()
    if "youtube.com/shorts/" in link:
        return link.split("shorts/")[-1].split("?")[0].strip()
    return None


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
    urls = [feed_config["url"]] + list(feed_config.get("fallback_urls") or [])
    body: Optional[str] = None
    last_error: Optional[str] = None

    try:
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
            for attempt_url in urls:
                try:
                    resp = await client.get(attempt_url, headers=_FETCH_HEADERS)
                    resp.raise_for_status()
                    candidate = resp.text
                    parsed_probe = feedparser.parse(candidate)
                    if not parsed_probe.entries:
                        last_error = f"no RSS entries from {attempt_url}"
                        print(f"[NewsService] {feed_config['id']}: {last_error}")
                        continue
                    body = candidate
                    break
                except Exception as e:
                    last_error = f"{attempt_url}: {e}"
                    print(f"[NewsService] Failed to parse {feed_config['id']} ({attempt_url}): {e}")
        if body is None:
            if last_error:
                print(f"[NewsService] Failed to parse {feed_config['id']}: exhausted URLs — {last_error}")
            return []

        parsed = feedparser.parse(body)
        items = []
        for entry in parsed.entries[:15]:
            title = entry.get("title", "").strip()
            summary = (entry.get("summary") or entry.get("description") or "").strip()
            link = (entry.get("link") or "").strip()
            media_desc = entry.get("media_description")
            if not summary and media_desc:
                summary = str(media_desc).strip()
            if not summary and getattr(entry, "summary", None):
                summary = str(entry.summary).strip()

            video_id = _youtube_video_id(entry, link)
            thumbnail: Optional[str] = None
            if video_id:
                thumbnail = f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"
            else:
                mt = entry.get("media_thumbnail")
                if mt and isinstance(mt, list) and len(mt) > 0 and mt[0].get("url"):
                    thumbnail = mt[0].get("url")

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
                    "videoId": video_id,
                    "thumbnail": thumbnail,
                    "contentType": feed_config.get("type", "article"),
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

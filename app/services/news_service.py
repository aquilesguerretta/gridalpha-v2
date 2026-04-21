import asyncio
import json
import re
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
        # Prefer pjm.com RSS first — insidelines often returns no entries from datacenter IPs.
        "url": "https://www.pjm.com/about-pjm/who-we-are/pjm-board/public-disclosures.aspx?publicdisclosures=All&rss=1",
        "fallback_urls": [
            "https://insidelines.pjm.com/feed/",
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
        "id": "eia_presentations_video",
        "name": "EIA Presentations",
        "short": "EIA",
        "url": "https://www.eia.gov/rss/presentations.xml",
        "color": "#10B981",
        "priority": "NORMAL",
        "type": "video",
    },
    {
        "id": "bloomberg_energy",
        "name": "Bloomberg Television",
        "short": "BLOOMBERG",
        "url": "https://www.youtube.com/@markets/videos",
        "color": "#F59E0B",
        "priority": "NORMAL",
        "type": "video",
        "parser": "youtube_handle",
    },
    {
        "id": "reuters_energy",
        "name": "Reuters",
        "short": "REUTERS",
        "url": "https://www.youtube.com/@Reuters/videos",
        "color": "#3B82F6",
        "priority": "NORMAL",
        "type": "video",
        "parser": "youtube_handle",
    },
]

_FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 GridAlpha/2.0"
    ),
    "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
}

_cache: dict = {"items": [], "updated_at": 0.0, "ttl": 300, "seeded": False}
_fetch_news_lock = asyncio.Lock()

CATEGORY_KEYWORDS = {
    "CONGESTION": ["congestion", "transmission", "constraint", "interface", "flowgate"],
    "PRICE": ["price", "lmp", "$/mwh", "spot", "day-ahead", "real-time"],
    "GENERATION": ["generation", "capacity", "outage", "wind", "solar", "nuclear", "coal", "gas"],
    "DISPATCH": ["dispatch", "emergency", "eea", "reliability", "must-run", "curtail"],
    "WEATHER": ["weather", "temperature", "forecast", "demand", "load", "cold", "heat"],
    "REGULATORY": ["ferc", "order", "rule", "regulation", "tariff", "filing"],
}

ENERGY_TYPE_KEYWORDS = {
    "NATURAL_GAS": [
        "natural gas",
        "henry hub",
        "gas price",
        "gas-fired",
        "lng",
        "gas generation",
        "gas plant",
        "gas turbine",
        "pipeline",
        "gas supply",
    ],
    "COAL": [
        "coal",
        "coal-fired",
        "coal plant",
        "coal generation",
        "coal retirement",
        "thermal coal",
    ],
    "NUCLEAR": [
        "nuclear",
        "reactor",
        "uranium",
        "nuclear plant",
        "nuclear generation",
        "baseload",
    ],
    "WIND": [
        "wind",
        "wind farm",
        "wind generation",
        "wind turbine",
        "wind power",
        "offshore wind",
        "onshore wind",
        "wind curtailment",
        "wind ramp",
    ],
    "SOLAR": [
        "solar",
        "photovoltaic",
        "pv",
        "solar farm",
        "solar generation",
        "solar power",
        "rooftop solar",
    ],
    "HYDRO": [
        "hydro",
        "hydroelectric",
        "hydropower",
        "dam",
        "water generation",
    ],
    "BATTERY": [
        "battery",
        "bess",
        "storage",
        "energy storage",
        "battery arbitrage",
        "charge",
        "discharge",
        "lithium",
        "grid storage",
    ],
    "TRANSMISSION": [
        "transmission",
        "grid",
        "interface",
        "congestion",
        "flowgate",
        "constraint",
        "import",
        "export",
        "interconnection",
        "substation",
    ],
}

ENERGY_RELEVANCE_KEYWORDS = [
    # Power markets
    "energy",
    "electricity",
    "power",
    "grid",
    "utility",
    "megawatt",
    "gigawatt",
    "mwh",
    "kwh",
    "lmp",
    "pjm",
    "eia",
    "ferc",
    "iso",
    "rto",
    "nerc",
    # Fuels
    "natural gas",
    "coal",
    "nuclear",
    "solar",
    "wind",
    "renewable",
    "fossil fuel",
    "petroleum",
    "oil",
    "lng",
    "hydrogen",
    "battery storage",
    "bess",
    # Market concepts
    "capacity",
    "transmission",
    "congestion",
    "dispatch",
    "generation",
    "load",
    "demand",
    "supply",
    "tariff",
    "carbon",
    "emissions",
    "climate",
    "clean energy",
    "pipeline",
    "refinery",
    "power plant",
    "substation",
    # Economic/policy
    "energy price",
    "fuel cost",
    "electric",
    "volt",
    "kilowatt",
    "watt",
    "ampere",
    "transformer",
    "interconnection",
    "curtailment",
    "reserve margin",
]

VIDEO_TITLE_KEYWORDS = [
    "energy",
    "electricity",
    "grid",
    "utility",
    "megawatt",
    "gigawatt",
    "mwh",
    "kwh",
    "lmp",
    "pjm",
    "eia",
    "ferc",
    "iso",
    "rto",
    "nerc",
    "natural gas",
    "coal",
    "nuclear",
    "solar",
    "wind",
    "renewable",
    "fossil fuel",
    "petroleum",
    "oil",
    "lng",
    "hydrogen",
    "battery",
    "bess",
    "capacity",
    "transmission",
    "congestion",
    "dispatch",
    "generation",
    "load",
    "demand",
    "supply",
    "tariff",
    "carbon",
    "emissions",
    "climate",
    "clean energy",
    "pipeline",
    "refinery",
    "power plant",
    "substation",
]


def is_energy_relevant(title: str, summary: str) -> bool:
    text = (title + " " + summary).lower()
    for kw in ENERGY_RELEVANCE_KEYWORDS:
        pattern = r"\b" + re.escape(kw).replace(r"\ ", r"\s+") + r"\b"
        if re.search(pattern, text):
            return True
    return False


def is_energy_video_title(title: str) -> bool:
    text = title.lower()
    for kw in VIDEO_TITLE_KEYWORDS:
        pattern = r"\b" + re.escape(kw).replace(r"\ ", r"\s+") + r"\b"
        if re.search(pattern, text):
            return True
    return False


def classify_energy_type(title: str, summary: str) -> list[str]:
    text = (title + " " + summary).lower()
    types: list[str] = []
    for energy_type, keywords in ENERGY_TYPE_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            types.append(energy_type)
    return types if types else ["GENERAL"]


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
    if "youtu.be/" in link:
        return link.split("youtu.be/")[-1].split("?")[0].strip()
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


def _text_from_yt_field(field: Optional[dict]) -> str:
    if not field or not isinstance(field, dict):
        return ""
    simple = field.get("simpleText")
    if simple:
        return str(simple)
    runs = field.get("runs")
    if isinstance(runs, list):
        return "".join(str(run.get("text", "")) for run in runs if isinstance(run, dict))
    return ""


def _iter_video_renderers(node):
    stack = [node]
    while stack:
        current = stack.pop()
        if isinstance(current, dict):
            video_renderer = current.get("videoRenderer")
            if isinstance(video_renderer, dict):
                yield video_renderer
            for value in current.values():
                stack.append(value)
        elif isinstance(current, list):
            stack.extend(current)


async def _parse_youtube_handle_feed(feed_config: dict) -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
            resp = await client.get(feed_config["url"], headers=_FETCH_HEADERS)
            resp.raise_for_status()
    except Exception as e:
        print(f"[NewsService] Failed to fetch {feed_config['id']} handle page: {e}")
        return []

    match = re.search(r"var ytInitialData = (\{.*?\});</script>", resp.text, re.S)
    if not match:
        print(f"[NewsService] Failed to parse {feed_config['id']}: ytInitialData missing")
        return []

    try:
        initial_data = json.loads(match.group(1))
    except Exception as e:
        print(f"[NewsService] Failed to parse {feed_config['id']}: invalid ytInitialData ({e})")
        return []

    now = datetime.now(timezone.utc)
    items: list[dict] = []
    seen_video_ids: set[str] = set()
    for vr in _iter_video_renderers(initial_data):
        video_id = str(vr.get("videoId") or "").strip()
        if not video_id or video_id in seen_video_ids:
            continue
        seen_video_ids.add(video_id)

        title = _text_from_yt_field(vr.get("title")).strip()
        if not title:
            continue
        summary = _text_from_yt_field(vr.get("descriptionSnippet")).strip()

        # For mixed-topic channels, use strict title gating to avoid off-topic clips.
        if not is_energy_video_title(title):
            continue

        thumbs = ((vr.get("thumbnail") or {}).get("thumbnails") or [])
        thumbnail: Optional[str] = None
        if thumbs and isinstance(thumbs, list):
            thumbnail = thumbs[-1].get("url")
        if not thumbnail:
            thumbnail = f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"

        published_label = _text_from_yt_field(vr.get("publishedTimeText")).strip()
        items.append(
            {
                "id": f"{feed_config['id']}_{video_id}",
                "source": feed_config["short"],
                "sourceFull": feed_config["name"],
                "sourceColor": feed_config["color"],
                "priority": feed_config["priority"],
                "title": title,
                "summary": summary[:280] if summary else "",
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "category": classify(title, summary),
                "energyTypes": classify_energy_type(title, summary),
                "timeAgo": published_label or "recent",
                "publishedAt": now.isoformat(),
                "videoId": video_id,
                "thumbnail": thumbnail,
                "contentType": "video",
            }
        )
        if len(items) >= 15:
            break

    return items


async def parse_feed(feed_config: dict) -> list[dict]:
    if feed_config.get("parser") == "youtube_handle":
        return await _parse_youtube_handle_feed(feed_config)

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
            item = {
                "id": f"{feed_config['id']}_{abs(hash(title)) % 100000}",
                "source": feed_config["short"],
                "sourceFull": feed_config["name"],
                "sourceColor": feed_config["color"],
                "priority": feed_config["priority"],
                "title": title,
                "summary": summary[:280] if summary else "",
                "url": link,
                "category": classify(title, summary),
                "energyTypes": classify_energy_type(title, summary),
                "timeAgo": time_ago(dt),
                "publishedAt": dt.isoformat() if dt else datetime.now(timezone.utc).isoformat(),
                "videoId": video_id,
                "thumbnail": thumbnail,
                "contentType": feed_config.get("type", "article"),
            }
            # Only include energy-relevant content
            if not is_energy_relevant(title, summary):
                continue
            items.append(item)
        return items
    except Exception as e:
        print(f"[NewsService] Failed to parse {feed_config['id']}: {e}")
        return []


async def fetch_news() -> list[dict]:
    """Merge RSS feeds with TTL cache. Uses a lock so concurrent requests share one upstream refresh."""
    now = time.time()
    if _cache["seeded"] and (now - _cache["updated_at"] < _cache["ttl"]):
        return _cache["items"]
    async with _fetch_news_lock:
        now = time.time()
        if _cache["seeded"] and (now - _cache["updated_at"] < _cache["ttl"]):
            return _cache["items"]
        results = await asyncio.gather(*[parse_feed(f) for f in RSS_FEEDS])
        all_items = [item for sublist in results for item in sublist]
        all_items.sort(key=lambda x: x["publishedAt"], reverse=True)
        _cache["items"] = all_items
        _cache["updated_at"] = now
        _cache["seeded"] = True
        return all_items

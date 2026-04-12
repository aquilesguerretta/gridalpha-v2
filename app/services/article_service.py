"""Fetch and extract article HTML from a small allowlist of energy-policy domains."""

from __future__ import annotations

import re
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

ALLOWED_DOMAINS = [
    "eia.gov",
    "pjm.com",
    "insidelines.pjm.com",
    "ferc.gov",
    "federalregister.gov",
    "energy.gov",
]


def is_allowed(url: str) -> bool:
    try:
        host = (urlparse(url).hostname or "").lower()
    except Exception:
        return False
    if not host:
        return False
    for domain in ALLOWED_DOMAINS:
        d = domain.lower()
        if host == d or host.endswith("." + d):
            return True
    return False


def clean_text(text: str) -> str:
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)
    return text.strip()


async def fetch_article(url: str) -> dict:
    if not is_allowed(url):
        return {
            "success": False,
            "error": "Domain not in allowed list",
            "url": url,
            "content": None,
            "title": None,
            "wordCount": 0,
            "paragraphs": None,
        }

    try:
        async with httpx.AsyncClient(
            timeout=10.0,
            follow_redirects=True,
            headers={
                "User-Agent": "GridAlpha/2.0 (energy market intelligence platform)",
                "Accept": "text/html,application/xhtml+xml",
            },
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text

        soup = BeautifulSoup(html, "lxml")

        for tag in soup(
            [
                "nav",
                "footer",
                "script",
                "style",
                "header",
                "aside",
                "form",
                "iframe",
                "noscript",
                "figure",
            ]
        ):
            tag.decompose()

        content = None
        for selector in [
            "article",
            "main",
            '[role="main"]',
            ".article-content",
            ".entry-content",
            ".post-content",
            "#content",
            ".content",
        ]:
            found = soup.select_one(selector)
            if found:
                content = found
                break

        if not content:
            content = soup.find("body")

        title = None
        h1 = soup.find("h1")
        if h1:
            title = h1.get_text(strip=True)
        elif soup.find("title"):
            title = soup.find("title").get_text(strip=True)

        paragraphs: list[dict[str, str]] = []
        if content:
            for p in content.find_all(["p", "h2", "h3", "li"]):
                text = clean_text(p.get_text(" ", strip=True))
                if len(text) > 40:
                    tag = p.name
                    paragraphs.append(
                        {
                            "type": (
                                "heading"
                                if tag in ("h2", "h3")
                                else "bullet"
                                if tag == "li"
                                else "paragraph"
                            ),
                            "text": text,
                        }
                    )

        full_text = " ".join(block["text"] for block in paragraphs)
        word_count = len(full_text.split())

        return {
            "success": True,
            "url": url,
            "title": title,
            "paragraphs": paragraphs[:60],
            "wordCount": word_count,
            "error": None,
            "content": None,
        }

    except httpx.HTTPStatusError as e:
        return {
            "success": False,
            "error": f"HTTP {e.response.status_code}",
            "url": url,
            "content": None,
            "title": None,
            "wordCount": 0,
            "paragraphs": None,
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e) or type(e).__name__,
            "url": url,
            "content": None,
            "title": None,
            "wordCount": 0,
            "paragraphs": None,
        }

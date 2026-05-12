"""figma_reference_lookup tool — searches src/design/figma-reference/
for design files matching a component, screen, or date.

The current repo state has two reference exports:
  - src/design/figma-reference/v1/ — card-heavy system
  - src/design/figma-reference/v2/ — chromeless system

Both ship as TSX files (Figma Make exports), not images. The tool
still handles images (PNG/JPG/JPEG/SVG/GIF/WebP) for forward-compat:
if it finds any, it returns a base64-encoded thumbnail alongside the
text metadata.

Search matches against:
  - Filename / basename (case-insensitive, partial)
  - Path components (any directory in the file's path)
  - Version tag (v1, v2)
  - Leading // or /** ... */ comment block (for TSX files)
  - File extension type group ("image", "design", "code")
"""

from __future__ import annotations

import base64
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from fastmcp import FastMCP


# ── Caches (Phase 6 will hook these into watchdog) ──────────────────
_REF_CACHE: dict[Path, list["FigmaRef"]] = {}
_REF_CACHE_MTIME: dict[Path, float] = {}

# Limit on how much of an image we encode into a base64 thumbnail.
# 64 KB raw → ~85 KB base64. Anything bigger is reported as path-only.
_THUMBNAIL_MAX_BYTES = 64 * 1024

# Recognized extensions.
_IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}
_DESIGN_EXTS = {".fig", ".sketch", ".xd"}
_CODE_EXTS = {".tsx", ".ts", ".jsx", ".js", ".css", ".html"}


@dataclass
class FigmaRef:
    path: Path                       # absolute path on disk
    rel_path: str                    # forward-slash, repo-relative
    name: str                        # basename without extension
    extension: str                   # ".tsx", ".png", ...
    version: str                     # "v1" | "v2" | ""
    kind: str                        # "image" | "design" | "code" | "other"
    size_bytes: int = 0
    description: str = ""            # leading comment block (TSX only)
    path_components: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "path": self.rel_path,
            "name": self.name,
            "extension": self.extension,
            "version": self.version,
            "kind": self.kind,
            "size_bytes": self.size_bytes,
            "description": self.description,
            "path_components": self.path_components,
        }


def _classify_kind(ext: str) -> str:
    ext = ext.lower()
    if ext in _IMAGE_EXTS:
        return "image"
    if ext in _DESIGN_EXTS:
        return "design"
    if ext in _CODE_EXTS:
        return "code"
    return "other"


def _extract_version(rel_path: str) -> str:
    """Pull v1 or v2 from a figma-reference path."""
    m = re.search(r"figma-reference/(v\d+)/", rel_path)
    return m.group(1) if m else ""


_LEADING_COMMENT_LINE = re.compile(r"^\s*//\s?(.*)$")
_BLOCK_COMMENT_OPEN = re.compile(r"^\s*/\*+\s?(.*)$")


def _extract_description(text: str) -> str:
    """Return the leading comment block (best-effort, multi-line)."""
    out: list[str] = []
    in_block = False
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            if not out:
                continue  # skip leading blank lines
            out.append("")
            continue
        if in_block:
            if "*/" in stripped:
                content = stripped.split("*/", 1)[0].strip().lstrip("*").strip()
                if content:
                    out.append(content)
                in_block = False
                continue
            out.append(stripped.lstrip("*").strip())
            continue
        if stripped.startswith("/*"):
            in_block = True
            content = stripped[2:].lstrip("*").strip()
            if "*/" in content:
                in_block = False
                content = content.split("*/", 1)[0].strip()
            if content:
                out.append(content)
            continue
        m = _LEADING_COMMENT_LINE.match(line)
        if m:
            out.append(m.group(1))
            continue
        break
    # Drop trailing blank lines and join
    while out and not out[-1].strip():
        out.pop()
    return "\n".join(out).strip()


def _load_refs(figma_root: Path) -> list[FigmaRef]:
    """Walk the figma-reference directory and build the FigmaRef list.

    Cached against the max mtime across all referenced files.
    """
    if not figma_root.is_dir():
        return []

    all_files = sorted(p for p in figma_root.rglob("*") if p.is_file())
    if not all_files:
        return []

    latest_mtime = max(p.stat().st_mtime for p in all_files)
    if (
        _REF_CACHE_MTIME.get(figma_root) == latest_mtime
        and figma_root in _REF_CACHE
    ):
        return _REF_CACHE[figma_root]

    refs: list[FigmaRef] = []
    for path in all_files:
        ext = path.suffix.lower()
        kind = _classify_kind(ext)
        rel = path.relative_to(figma_root.parent.parent.parent)  # repo root
        rel_str = str(rel).replace("\\", "/")
        version = _extract_version(rel_str)
        components = [p for p in rel_str.split("/") if p and p != "src"]
        description = ""
        if ext in {".tsx", ".ts", ".jsx", ".js"}:
            try:
                text = path.read_text(encoding="utf-8")
                description = _extract_description(text)
            except (OSError, UnicodeDecodeError):
                description = ""

        try:
            size_bytes = path.stat().st_size
        except OSError:
            size_bytes = 0

        refs.append(
            FigmaRef(
                path=path,
                rel_path=rel_str,
                name=path.stem,
                extension=ext,
                version=version,
                kind=kind,
                size_bytes=size_bytes,
                description=description,
                path_components=components,
            )
        )

    _REF_CACHE[figma_root] = refs
    _REF_CACHE_MTIME[figma_root] = latest_mtime
    return refs


def _normalize(s: str) -> str:
    return re.sub(r"[\s_\-/]+", "", s.lower())


@dataclass
class _Hit:
    ref: FigmaRef
    score: int
    reason: str


def _score_ref(ref: FigmaRef, query: str) -> _Hit | None:
    q_raw = query.strip()
    q = _normalize(q_raw)
    if not q:
        return None

    name_norm = _normalize(ref.name)
    path_norm = _normalize(ref.rel_path)

    # Exact filename
    if name_norm == q:
        return _Hit(ref, 100, "exact filename match")

    # Filename starts with query
    if name_norm.startswith(q):
        return _Hit(ref, 80, f"filename starts with {q_raw!r}")

    # Version filter
    if q_raw.lower() in {"v1", "v2"} and ref.version == q_raw.lower():
        return _Hit(ref, 75, f"version {ref.version}")

    # Path component match (any directory)
    for comp in ref.path_components:
        if _normalize(comp) == q:
            return _Hit(ref, 70, f"path component {comp!r}")

    # Filename substring
    if q in name_norm:
        return _Hit(ref, 60, f"filename contains {q_raw!r}")

    # Path substring
    if q in path_norm:
        return _Hit(ref, 50, f"path contains {q_raw!r}")

    # Description keyword (case-insensitive substring)
    if ref.description:
        if q_raw.lower() in ref.description.lower():
            return _Hit(ref, 40, "description match")

    return None


def _try_thumbnail(ref: FigmaRef) -> str | None:
    """Return a data: URL for the file, or None if it doesn't qualify
    (too big, or not an image)."""
    if ref.kind != "image":
        return None
    if ref.size_bytes > _THUMBNAIL_MAX_BYTES:
        return None
    try:
        raw = ref.path.read_bytes()
    except OSError:
        return None
    ext = ref.extension.lstrip(".")
    mime = {
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "gif": "image/gif",
        "webp": "image/webp",
        "svg": "image/svg+xml",
    }.get(ext, "application/octet-stream")
    encoded = base64.b64encode(raw).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def register_figma_reference_lookup(mcp: FastMCP, *, repo_root: Path) -> None:
    """Attach the figma_reference_lookup tool to the given FastMCP instance."""

    figma_root = repo_root / "src" / "design" / "figma-reference"

    @mcp.tool(
        name="figma_reference_lookup",
        description=(
            "Search src/design/figma-reference/ for design files (Figma "
            "Make exports under v1/ and v2/). Matches by filename, "
            "path component, version tag (\"v1\" or \"v2\"), or content "
            "keyword in the file's leading comment block.\n\n"
            "Each match includes path, name, extension, version, kind "
            "(image | design | code | other), size, leading comment "
            "description, and — for small image files (PNG/JPG/SVG, "
            "< 64 KB) — a base64 data URL suitable for inline preview."
        ),
    )
    def figma_reference_lookup(query: str, limit: int = 20) -> dict[str, Any]:
        if not query or not query.strip():
            return {
                "status": "error",
                "error": "query is required",
                "hint": "Try a component name, version tag (v1/v2), or path component.",
            }

        refs = _load_refs(figma_root)
        if not refs:
            return {
                "status": "error",
                "error": f"No reference files found under {figma_root}",
            }

        hits = []
        for ref in refs:
            h = _score_ref(ref, query)
            if h is not None:
                hits.append(h)
        hits.sort(key=lambda h: (-h.score, h.ref.rel_path))
        bounded = hits[: max(1, int(limit))]

        results = []
        for h in bounded:
            entry = h.ref.to_dict()
            entry["match_score"] = h.score
            entry["match_reason"] = h.reason
            entry["thumbnail_data_url"] = _try_thumbnail(h.ref)
            results.append(entry)

        return {
            "status": "ok",
            "query": query,
            "match_count": len(hits),
            "returned": len(bounded),
            "source_root": str(figma_root.relative_to(repo_root)),
            "matches": results,
        }

"""tokens_search tool — parses src/design/tokens.ts and serves it
through MCP.

The tokens.ts file follows a stable shape:

    export const C = {
      // ─── BACKGROUNDS (4-tier elevation) — warm dark ──────
      bgBase:       '#111117',
      bgElevated:   '#18181f',
      ...
    } as const;

    export const F = { ... } as const;
    export const R = { ... } as const;
    export const S = { ... } as const;
    export const T = {
      ...
      pageTitle: {
        fontFamily: F.mono,
        fontSize:   '22px',
        ...
      },
      ...
    } as const;

Five top-level namespaces (C, F, R, S, T). Categories are introduced
by lines that start with ``// ─── NAME`` (the U+2500 box-drawing rune).
Nested objects (T.pageTitle, T.headline, ...) are captured as
compound tokens whose ``value`` is a dict of their sub-keys.

The search supports three query shapes:

- Exact-name lookup:   ``"falconGold"``, ``"electric_blue"``, ``"C.falconGold"``
- Substring/prefix:    ``"bg"`` → all background tokens
- Hex value:           ``"#F59E0B"`` → tokens whose value matches that hex
- Category keyword:    ``"alert"`` → matches category names too

Results are ranked: exact matches first, then namespace-qualified
substring matches, then value matches, then category matches.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from fastmcp import FastMCP


# ── Module-level cache (Phase 6 will invalidate this via watchdog) ──
_TOKEN_CACHE: dict[Path, list["Token"]] = {}
_TOKEN_CACHE_MTIME: dict[Path, float] = {}


@dataclass
class Token:
    """A single token entry from tokens.ts."""

    namespace: str  # "C", "F", "R", "S", "T"
    key: str        # "bgBase", "falconGold", ...
    value: Any      # raw string or dict (for nested T entries)
    category: str   # e.g. "BACKGROUNDS (4-tier elevation)"
    inline_comment: str = ""   # trailing // comment, if any
    is_compound: bool = False  # True for nested T entries
    raw_value: str = ""        # original source string, for tokens that
                               # reference other tokens (e.g. ``F.mono``)

    def qualified_name(self) -> str:
        return f"{self.namespace}.{self.key}"

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.qualified_name(),
            "namespace": self.namespace,
            "key": self.key,
            "value": self.value,
            "raw_source": self.raw_value or repr(self.value),
            "category": self.category,
            "inline_comment": self.inline_comment,
            "import_hint": f"import {{ {self.namespace} }} from '@/design/tokens'",
        }


# ── Parser ──────────────────────────────────────────────────────────

# Matches a category header like:
#   // ─── BACKGROUNDS (4-tier elevation) — warm dark ─────
# The U+2500 char (─) marks these. Strip surrounding decoration.
_CATEGORY_RE = re.compile(r"//\s*─+\s*(.+?)\s*─+")

# Matches the start of a top-level export const block.
_EXPORT_RE = re.compile(r"export\s+const\s+([A-Z])\s*=\s*\{")

# Matches a simple ``key: 'value',`` line. Captures key + raw value
# (without the trailing comma + inline comment).
_KV_RE = re.compile(
    r"^\s*"
    r"(?P<key>[a-zA-Z_][a-zA-Z0-9_]*)"      # identifier
    r"\s*:\s*"
    r"(?P<value>"                            # value — one of:
    r"'[^']*'"                               #   single-quoted string
    r'|"[^"]*"'                              #   double-quoted string
    r"|[A-Z]\.[a-zA-Z_][a-zA-Z0-9_]*"        #   token reference (F.mono)
    r"|[A-Za-z0-9_'\".+\-/, ]+?"              #   bare identifier / number
    r")"
    r"\s*(?:as\s+const)?\s*,?\s*"
    r"(?://\s*(?P<comment>.*))?$"
)

# Matches a nested object opener: ``  pageTitle: {``
_NESTED_OPEN_RE = re.compile(
    r"^\s*(?P<key>[a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{\s*$"
)


def _strip_quotes(s: str) -> str:
    s = s.strip()
    if (s.startswith("'") and s.endswith("'")) or (s.startswith('"') and s.endswith('"')):
        return s[1:-1]
    return s


def _parse_tokens_ts(tokens_ts_path: Path) -> list[Token]:
    """Parse tokens.ts into a flat list of Token records.

    Cached by mtime — re-parses only when the file changes.
    """
    try:
        mtime = tokens_ts_path.stat().st_mtime
    except FileNotFoundError:
        return []

    cached_mtime = _TOKEN_CACHE_MTIME.get(tokens_ts_path)
    if cached_mtime == mtime and tokens_ts_path in _TOKEN_CACHE:
        return _TOKEN_CACHE[tokens_ts_path]

    text = tokens_ts_path.read_text(encoding="utf-8")
    lines = text.splitlines()

    tokens: list[Token] = []
    namespace: str | None = None
    category = ""
    pending_nested: dict[str, Any] | None = None  # accumulates a T-nested object
    pending_nested_key: str | None = None
    pending_nested_lines: list[str] = []

    for line in lines:
        # Track category from comments.
        cat_match = _CATEGORY_RE.match(line.strip())
        if cat_match and pending_nested is None:
            category = cat_match.group(1).strip()
            continue

        # Top-level export const begins.
        exp_match = _EXPORT_RE.search(line)
        if exp_match and pending_nested is None:
            namespace = exp_match.group(1)
            category = ""  # categories reset within each namespace
            continue

        # Inside a nested-object accumulation (only inside T).
        if pending_nested is not None and pending_nested_key is not None and namespace is not None:
            stripped = line.strip()
            pending_nested_lines.append(line)
            if stripped.startswith("},") or stripped == "}":
                # Close the nested object. Parse the captured lines as
                # sub-properties.
                sub = _parse_nested(pending_nested_lines)
                raw_source = "\n".join(pending_nested_lines).strip()
                tokens.append(
                    Token(
                        namespace=namespace,
                        key=pending_nested_key,
                        value=sub,
                        category=category,
                        is_compound=True,
                        raw_value=raw_source,
                    )
                )
                pending_nested = None
                pending_nested_key = None
                pending_nested_lines = []
            continue

        if namespace is None:
            continue

        # End of export block? Reset namespace.
        if line.strip().startswith("} as const") or line.strip() == "};":
            namespace = None
            category = ""
            continue

        # Nested object opener inside T (e.g. ``pageTitle: {``).
        nested_open = _NESTED_OPEN_RE.match(line)
        if nested_open and namespace == "T":
            pending_nested = {}
            pending_nested_key = nested_open.group("key")
            pending_nested_lines = []
            continue

        # Regular key: value pair.
        kv = _KV_RE.match(line)
        if kv:
            key = kv.group("key")
            raw_value = kv.group("value").strip().rstrip(",")
            comment = (kv.group("comment") or "").strip()
            value: Any = _strip_quotes(raw_value)
            tokens.append(
                Token(
                    namespace=namespace,
                    key=key,
                    value=value,
                    category=category,
                    inline_comment=comment,
                    raw_value=raw_value,
                )
            )

    _TOKEN_CACHE[tokens_ts_path] = tokens
    _TOKEN_CACHE_MTIME[tokens_ts_path] = mtime
    return tokens


def _parse_nested(lines: list[str]) -> dict[str, Any]:
    """Parse the body of a nested object inside T."""
    out: dict[str, Any] = {}
    for line in lines:
        # Strip "as const" annotations.
        cleaned = re.sub(r"\s+as\s+const\b", "", line)
        kv = _KV_RE.match(cleaned)
        if not kv:
            continue
        key = kv.group("key")
        raw_value = kv.group("value").strip().rstrip(",")
        out[key] = _strip_quotes(raw_value)
    return out


# ── Search ──────────────────────────────────────────────────────────


def _normalize(s: str) -> str:
    return s.lower().replace("_", "").replace("-", "").strip()


def _is_hex_query(q: str) -> bool:
    return bool(re.fullmatch(r"#?[0-9A-Fa-f]{3,8}", q.strip()))


def _hex_match(value: Any, hex_q: str) -> bool:
    """Does the token's value contain the given hex code?"""
    if not isinstance(value, str):
        return False
    target = hex_q.lstrip("#").lower()
    found = re.findall(r"#?[0-9A-Fa-f]{3,8}", value.lower())
    return any(f.lstrip("#") == target for f in found)


@dataclass
class _Match:
    token: Token
    score: int
    reason: str = ""


def _score(token: Token, query: str) -> _Match | None:
    """Return a Match record if the token matches the query, else None.

    Higher score = better match. The caller sorts descending.
    """
    q = _normalize(query)
    name_norm = _normalize(token.key)
    qualified_norm = _normalize(token.qualified_name())
    category_norm = _normalize(token.category)

    # Exact qualified-name hit (``C.falconGold``).
    if qualified_norm == q:
        return _Match(token, score=100, reason="exact qualified name")

    # Exact unqualified-name hit.
    if name_norm == q:
        return _Match(token, score=95, reason="exact key match")

    # Hex-value query.
    if _is_hex_query(query) and _hex_match(token.value, query):
        return _Match(token, score=90, reason=f"hex value matches {query}")

    # Prefix on the key (``bg`` matches ``bgBase``).
    if name_norm.startswith(q):
        return _Match(token, score=75, reason=f"key starts with '{query}'")

    # Substring on the key.
    if q in name_norm:
        return _Match(token, score=60, reason=f"key contains '{query}'")

    # Category match.
    if q in category_norm:
        return _Match(token, score=45, reason=f"category contains '{query}'")

    # Substring on raw_value or compound dict — catches font names, rgba, etc.
    haystack = (token.raw_value or "").lower()
    if isinstance(token.value, dict):
        haystack += " " + " ".join(str(v).lower() for v in token.value.values())
    elif isinstance(token.value, str):
        haystack += " " + token.value.lower()
    if q in haystack:
        return _Match(token, score=30, reason="value substring")

    return None


def register_tokens_search(mcp: FastMCP, *, repo_root: Path) -> None:
    """Attach the tokens_search tool to the given FastMCP instance."""

    tokens_ts_path = repo_root / "src" / "design" / "tokens.ts"

    @mcp.tool(
        name="tokens_search",
        description=(
            "Search src/design/tokens.ts for GridAlpha design tokens.\n\n"
            "Accepts:\n"
            "  • token name      (e.g. \"falconGold\", \"electricBlue\", \"C.bgBase\")\n"
            "  • hex value       (e.g. \"#F59E0B\")\n"
            "  • category keyword (e.g. \"alert\", \"fuel\", \"border\")\n"
            "  • prefix          (e.g. \"bg\" → all background tokens)\n\n"
            "Returns up to `limit` matches ranked best-first, each with "
            "name, namespace, key, resolved value, raw source, category, "
            "any inline comment, and a TypeScript import hint."
        ),
    )
    def tokens_search(query: str, limit: int = 20) -> dict[str, Any]:
        if not query or not query.strip():
            return {
                "status": "error",
                "error": "query is required",
                "hint": "Try a token name like 'falconGold', a hex like '#F59E0B', or a category like 'alert'.",
            }

        tokens = _parse_tokens_ts(tokens_ts_path)
        if not tokens:
            return {
                "status": "error",
                "error": f"tokens.ts not found or empty at {tokens_ts_path}",
            }

        matches: list[_Match] = []
        for token in tokens:
            m = _score(token, query)
            if m is not None:
                matches.append(m)

        # Stable rank: score desc, then qualified-name asc for determinism.
        matches.sort(key=lambda m: (-m.score, m.token.qualified_name()))
        bounded = matches[: max(1, int(limit))]

        return {
            "status": "ok",
            "query": query,
            "match_count": len(matches),
            "returned": len(bounded),
            "source": str(tokens_ts_path.relative_to(repo_root)),
            "matches": [
                {
                    **m.token.to_dict(),
                    "match_score": m.score,
                    "match_reason": m.reason,
                }
                for m in bounded
            ],
        }

"""tokens_search tool — Phase 1 stub.

Phase 2 will parse src/design/tokens.ts and return matching tokens by
name, category, or hex value. For now this stub registers the tool so
the server starts cleanly and returns a "not yet implemented" payload.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from fastmcp import FastMCP


def register_tokens_search(mcp: FastMCP, *, repo_root: Path) -> None:
    """Attach the tokens_search tool to the given FastMCP instance."""
    _ = repo_root  # Phase 2 will use this.

    @mcp.tool(
        name="tokens_search",
        description=(
            "Search src/design/tokens.ts for design tokens by name, "
            "category, or hex value. Returns matching tokens with name, "
            "value, category, and usage notes. (Phase 1 stub.)"
        ),
    )
    def tokens_search(query: str) -> dict[str, Any]:
        return {
            "status": "stub",
            "query": query,
            "message": "tokens_search is a Phase 1 stub. Phase 2 ships the real implementation.",
        }

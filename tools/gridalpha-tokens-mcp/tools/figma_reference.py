"""figma_reference_lookup tool — Phase 1 stub.

Phase 4 will search src/design/figma-reference/{v1,v2}/ for files
matching a component, screen, or date query. For now this stub returns
a "not yet implemented" payload.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from fastmcp import FastMCP


def register_figma_reference_lookup(mcp: FastMCP, *, repo_root: Path) -> None:
    """Attach the figma_reference_lookup tool to the given FastMCP instance."""
    _ = repo_root  # Phase 4 will use this.

    @mcp.tool(
        name="figma_reference_lookup",
        description=(
            "Search src/design/figma-reference/ for design files and "
            "screenshots matching a component name, screen, or date. "
            "Returns paths, descriptions, and optional thumbnails. "
            "(Phase 1 stub.)"
        ),
    )
    def figma_reference_lookup(query: str) -> dict[str, Any]:
        return {
            "status": "stub",
            "query": query,
            "message": "figma_reference_lookup is a Phase 1 stub. Phase 4 ships the real implementation.",
        }

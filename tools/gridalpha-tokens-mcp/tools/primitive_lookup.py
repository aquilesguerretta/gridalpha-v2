"""primitive_lookup tool — Phase 1 stub.

Phase 3 will parse src/components/terminal/ and return primitive APIs
(props, variants, defaults, usage examples). For now this stub returns
a "not yet implemented" payload.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from fastmcp import FastMCP


def register_primitive_lookup(mcp: FastMCP, *, repo_root: Path) -> None:
    """Attach the primitive_lookup tool to the given FastMCP instance."""
    _ = repo_root  # Phase 3 will use this.

    @mcp.tool(
        name="primitive_lookup",
        description=(
            "Look up a FOUNDRY primitive (Skeleton, StaleBadge, "
            "HeroNumber, etc.) and return its TypeScript interface, "
            "props, variants, defaults, and a usage example. "
            "(Phase 1 stub.)"
        ),
    )
    def primitive_lookup(component: str) -> dict[str, Any]:
        return {
            "status": "stub",
            "component": component,
            "message": "primitive_lookup is a Phase 1 stub. Phase 3 ships the real implementation.",
        }

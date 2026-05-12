"""FastMCP server — exposes GridAlpha design tokens, FOUNDRY primitives,
and figma-reference files as MCP tools queryable from any Claude Code
session.

Run via:
    fastmcp run /path/to/gridalpha-v2/tools/gridalpha-tokens-mcp/server.py

Or via stdio directly (what Claude Code does after configuration):
    python /path/to/gridalpha-v2/tools/gridalpha-tokens-mcp/server.py

The three tools registered here (tokens_search, primitive_lookup,
figma_reference_lookup) read from the repo whose root contains this
file's grandparent directory:

    repo_root = <this file>/../../..
              = tools/gridalpha-tokens-mcp/server.py -> repo_root

Tools resolve paths relative to repo_root so the server works regardless
of where Claude Code starts it from.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Add this file's directory to sys.path so ``from tools.x import y`` works
# when invoked as ``python server.py`` or ``fastmcp run server.py``.
HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import logging  # noqa: E402

from fastmcp import FastMCP  # noqa: E402  (path tweak must come first)

from tools.tokens_search import register_tokens_search  # noqa: E402
from tools.primitive_lookup import register_primitive_lookup  # noqa: E402
from tools.figma_reference import register_figma_reference_lookup  # noqa: E402
from tools.watcher import start_cache_watcher, stop_cache_watcher  # noqa: E402


# Repo root — two levels above this file (tools/gridalpha-tokens-mcp/).
REPO_ROOT = HERE.parent.parent


def build_server() -> FastMCP:
    """Construct the FastMCP server and register all three tools."""
    mcp = FastMCP(
        name="gridalpha-tokens",
        instructions=(
            "GridAlpha design-system registry. Query tokens_search for "
            "design token values, primitive_lookup for FOUNDRY primitive "
            "APIs, and figma_reference_lookup for reference screenshots "
            "and design files."
        ),
    )

    register_tokens_search(mcp, repo_root=REPO_ROOT)
    register_primitive_lookup(mcp, repo_root=REPO_ROOT)
    register_figma_reference_lookup(mcp, repo_root=REPO_ROOT)

    return mcp


def main() -> None:
    """Entry point — runs the server over stdio."""
    # Log to stderr so messages don't pollute the stdio MCP channel.
    logging.basicConfig(
        level=logging.INFO,
        stream=sys.stderr,
        format="[gridalpha-tokens-mcp] %(levelname)s %(message)s",
    )
    logging.getLogger("gridalpha-tokens-mcp").setLevel(logging.INFO)

    observer = start_cache_watcher(REPO_ROOT)
    server = build_server()
    try:
        server.run()
    finally:
        stop_cache_watcher(observer)


if __name__ == "__main__":
    main()

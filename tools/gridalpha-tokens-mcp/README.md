# gridalpha-tokens-mcp

A FastMCP server that exposes GridAlpha's design tokens, FOUNDRY
primitives, and figma-reference files as MCP tools, queryable from
any Claude Code session that has the server configured.

## What this is

ui-ux-pro-max's shadcn/ui MCP grounds component generation in real
API shapes instead of statistical guesses. This server applies the
same pattern to GridAlpha's design system: when an agent's brief
references `falconGold` or the `Skeleton` primitive, the agent
queries this server rather than approximating from memory.

## Three tools

| Tool | Returns |
| --- | --- |
| `tokens_search(query)` | Design tokens from `src/design/tokens.ts` matching by name, category, or hex value. |
| `primitive_lookup(component)` | A FOUNDRY primitive's TypeScript interface, props, variants, defaults, and a usage example. |
| `figma_reference_lookup(query)` | Reference files from `src/design/figma-reference/{v1,v2}/` matching a component, screen, or date. |

## Install (Python, FastMCP)

```bash
cd tools/gridalpha-tokens-mcp
python -m venv .venv
source .venv/bin/activate    # or .venv\Scripts\activate on Windows
pip install -e .
```

This installs `fastmcp` and `watchdog` (for Phase 6 cache invalidation).

## Configure Claude Code (one-time)

See [CONFIGURATION.md](./CONFIGURATION.md) for the full setup,
including the `~/.claude.json` snippet, sample queries, and a
troubleshooting table. Short version:

```json
{
  "mcpServers": {
    "gridalpha-tokens": {
      "command": "/abs/path/to/.venv/bin/python",
      "args": ["/abs/path/to/tools/gridalpha-tokens-mcp/server.py"]
    }
  }
}
```

Then restart Claude Code. The three tools appear in `/mcp`.

## Run standalone (for debugging)

```bash
python tools/gridalpha-tokens-mcp/server.py
```

The server speaks MCP over stdio. Press Ctrl+C to stop.

## Phased rollout

This server ships in 9 phases (see ARCHITECT WAVE 3 brief and the
matching CLAUDE.md section):

1. **Phase 1** — server scaffold + stub tools (this commit).
2. **Phase 2** — real `tokens_search` against `tokens.ts`.
3. **Phase 3** — real `primitive_lookup` against
   `src/components/terminal/`.
4. **Phase 4** — real `figma_reference_lookup` against
   `src/design/figma-reference/`.
5. **Phase 5** — server configuration documentation.
6. **Phase 6** — file-watching cache invalidation.
7. **Phase 7** — multi-agent usage test (StaleBadge query from
   CHROMA or another agent).
8. **Phase 8** — brief-integration guidance in CLAUDE.md.
9. **Phase 9** — full Wave 3 documentation.

## Layout

```
tools/gridalpha-tokens-mcp/
├── README.md
├── pyproject.toml
├── server.py            # FastMCP server entry point
└── tools/
    ├── __init__.py
    ├── tokens_search.py
    ├── primitive_lookup.py
    └── figma_reference.py
```

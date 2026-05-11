# Configuring Claude Code to use gridalpha-tokens-mcp

This server exposes three MCP tools — `tokens_search`,
`primitive_lookup`, and `figma_reference_lookup` — that any Claude
Code session can call after the server is registered in
`~/.claude.json`.

## 1. Install dependencies (one-time, per machine)

```bash
cd tools/gridalpha-tokens-mcp
py -m venv .venv                        # Windows: ``py`` launcher
# or:  python3 -m venv .venv            # macOS / Linux

# Activate the venv:
#   Windows:    .venv\Scripts\activate
#   macOS/Linux: source .venv/bin/activate

pip install -e .
```

This installs `fastmcp` and `watchdog` (Phase 6 cache invalidation).

Verify with:

```bash
.venv/Scripts/python.exe -c "import fastmcp; print(fastmcp.__version__)"
# or, on macOS/Linux:
.venv/bin/python -c "import fastmcp; print(fastmcp.__version__)"
```

## 2. Add the server to `~/.claude.json`

Open (or create) `~/.claude.json` and add a `gridalpha-tokens` entry
under `mcpServers`:

```json
{
  "mcpServers": {
    "gridalpha-tokens": {
      "command": "C:/Users/<you>/path/to/gridalpha-v2/tools/gridalpha-tokens-mcp/.venv/Scripts/python.exe",
      "args": [
        "C:/Users/<you>/path/to/gridalpha-v2/tools/gridalpha-tokens-mcp/server.py"
      ]
    }
  }
}
```

**macOS / Linux:**

```json
{
  "mcpServers": {
    "gridalpha-tokens": {
      "command": "/Users/<you>/path/to/gridalpha-v2/tools/gridalpha-tokens-mcp/.venv/bin/python",
      "args": [
        "/Users/<you>/path/to/gridalpha-v2/tools/gridalpha-tokens-mcp/server.py"
      ]
    }
  }
}
```

If you'd rather use the `fastmcp` CLI on your `PATH`:

```json
{
  "mcpServers": {
    "gridalpha-tokens": {
      "command": "fastmcp",
      "args": [
        "run",
        "/absolute/path/to/gridalpha-v2/tools/gridalpha-tokens-mcp/server.py"
      ]
    }
  }
}
```

Both forms work. The first is more reproducible because it pins the
exact Python interpreter that has `fastmcp` installed.

> Use absolute paths — Claude Code's MCP runtime does not resolve
> `~` or relative paths in `mcpServers` entries.

## 3. Restart Claude Code

After saving `~/.claude.json`, fully quit and reopen Claude Code so
the MCP runtime picks up the new server. On reopening, run
`/mcp` (or check the Tools panel) and you should see three new
tools listed under `gridalpha-tokens`:

| Tool | Signature | Purpose |
| --- | --- | --- |
| `tokens_search` | `(query: string, limit?: number = 20)` | Find design tokens by name, category, or hex value. |
| `primitive_lookup` | `(component?: string)` | Get a FOUNDRY primitive's API, variants, props, examples. Empty `component` lists all primitives. |
| `figma_reference_lookup` | `(query: string, limit?: number = 20)` | Find Figma Make reference files by name, version (v1/v2), path component, or description keyword. |

## 4. Verify with a fresh session

Open a new Claude Code session in any workspace (it doesn't have to
be the GridAlpha repo) and ask:

> Use the gridalpha-tokens MCP server to look up the Falcon Gold
> token. Report the hex value, semantic role, and a usage example.

Expected response: Claude calls `tokens_search("Falcon Gold")` or
`tokens_search("falconGold")`, gets back the token entry with
`value: "#F59E0B"`, `category: "ACCENTS — calm blue-500, not neon
cyan"`, and the inline comment / import hint, then explains the
semantic role (secondary accent for warnings/profitability moments).

## 5. Sample queries

```text
tokens_search("falconGold")
tokens_search("#F59E0B")
tokens_search("alert")
tokens_search("bg")
tokens_search("Geist")
tokens_search("C.electricBlue")

primitive_lookup()                  # list all primitives
primitive_lookup("Skeleton")
primitive_lookup("StaleBadge")
primitive_lookup("HeroNumber")

figma_reference_lookup("Section3Cards")
figma_reference_lookup("v2")
figma_reference_lookup("ds")
```

## 6. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `gridalpha-tokens` does not appear in `/mcp` | `command` path wrong, or `fastmcp` not installed in that interpreter | Re-run `pip install -e .` inside the venv; verify with `python -c "import fastmcp"` |
| Tool calls return `{"status": "error", "error": "tokens.ts not found ..."}` | Server resolved the wrong repo root | `server.py` walks two levels up from itself; if you moved the server out of `tools/gridalpha-tokens-mcp/`, point an env var or edit `REPO_ROOT` |
| `primitive_lookup` returns stale variants after editing `Skeleton.tsx` | Cache hasn't invalidated yet | Phase 6 file-watching addresses this; meanwhile, restart Claude Code |
| Hex query returns no hits even though the value exists | Hex case mismatch | The hex comparison is case-insensitive; if it still misses, the value may be inside an `rgba(...)` block — search the rgba components separately |

## 7. Updating the server

The server reads source files at every tool call (cached by mtime).
After pulling the latest branch, you do not need to restart Claude
Code unless the server's own code changed. If you edit
`server.py` or `tools/*.py`, restart Claude Code (the MCP runtime
only re-spawns servers on startup).

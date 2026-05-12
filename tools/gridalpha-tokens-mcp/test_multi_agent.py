"""End-to-end MCP-transport test — simulates how another agent uses
the server.

Spawns server.py as a subprocess over stdio (exactly how Claude Code
launches MCP servers), connects with FastMCP's client, and exercises
each of the three tools.

The brief's Phase 7 specifically asks for a StaleBadge primitive
query from a "fresh Claude Code session"; this script does the
mechanical equivalent.
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from fastmcp import Client  # noqa: E402


def _extract(payload):
    """Unwrap FastMCP's structured result into a plain dict."""
    if payload is None:
        return None
    # CallToolResult-like
    if hasattr(payload, "structured_content") and payload.structured_content is not None:
        return payload.structured_content
    if hasattr(payload, "data") and payload.data is not None:
        return payload.data
    if hasattr(payload, "content") and payload.content:
        first = payload.content[0]
        text = getattr(first, "text", None)
        if text:
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                return {"text": text}
    return payload


async def run() -> int:
    server_path = HERE / "server.py"
    assert server_path.exists(), f"missing {server_path}"

    # FastMCP Client(path_to_server.py) → stdio transport, exactly how
    # Claude Code launches the server.
    async with Client(str(server_path)) as client:
        # ── List tools ───────────────────────────────────────────────
        tools = await client.list_tools()
        tool_names = sorted(t.name for t in tools)
        print(f"Server advertised {len(tools)} tools: {tool_names}")
        for expected in ("tokens_search", "primitive_lookup", "figma_reference_lookup"):
            assert expected in tool_names, f"missing tool: {expected}"

        # ── tokens_search ────────────────────────────────────────────
        print("\n-- tokens_search('falconGold') --")
        raw = await client.call_tool("tokens_search", {"query": "falconGold"})
        result = _extract(raw)
        assert result["status"] == "ok", result
        assert result["match_count"] >= 1, result
        top = result["matches"][0]
        assert top["name"] == "C.falconGold", top
        assert top["value"] == "#F59E0B", top
        print(f"  OK  top hit: {top['name']} = {top['value']}")
        print(f"      category: {top['category']!r}")
        print(f"      import_hint: {top['import_hint']}")

        # Hex query
        print("\n-- tokens_search('#F59E0B') --")
        raw = await client.call_tool("tokens_search", {"query": "#F59E0B"})
        result = _extract(raw)
        names = [m["name"] for m in result["matches"]]
        assert "C.falconGold" in names, result
        assert "C.alertWarning" in names, result
        print(f"  OK  hex query hit {result['match_count']} tokens: {names}")

        # ── primitive_lookup ─────────────────────────────────────────
        # The brief's verification: have an agent query primitive_lookup
        # for StaleBadge and verify the response is accurate.
        print("\n-- primitive_lookup('StaleBadge')  (brief's Phase 7 test) --")
        raw = await client.call_tool("primitive_lookup", {"component": "StaleBadge"})
        result = _extract(raw)
        assert result["status"] == "ok", result
        p = result["primitive"]
        assert p["name"] == "StaleBadge", p
        assert "StaleBadge" in p["exports"], p
        prop_names = {prop["name"] for iface in p["interfaces"] for prop in iface["props"]}
        assert "ageSeconds" in prop_names, prop_names
        assert "position" in prop_names, prop_names
        print(f"  OK  StaleBadge: exports={p['exports']}, default={p['default_export']}")
        print(f"      props: {sorted(prop_names)}")
        print(f"      import_hint: {p['import_hint']}")
        # Show the props more readably:
        for iface in p["interfaces"]:
            for prop in iface["props"]:
                req = "required" if prop["required"] else "optional"
                desc = prop["description"][:55]
                print(f"        {prop['name']}: {prop['type']:30}  ({req})  -- {desc!r}")

        # Skeleton (namespaced)
        print("\n-- primitive_lookup('Skeleton') --")
        raw = await client.call_tool("primitive_lookup", {"component": "Skeleton"})
        result = _extract(raw)
        assert result["status"] == "ok", result
        p = result["primitive"]
        assert "Line" in p["variants"], p
        assert "HeroNumber" in p["variants"], p
        print(f"  OK  Skeleton variants: {p['variants']}")
        print(f"      usage_examples ({len(p['usage_examples'])} found):")
        for ex in p["usage_examples"][:3]:
            print(f"        {ex}")

        # ── figma_reference_lookup ───────────────────────────────────
        print("\n-- figma_reference_lookup('Section3Cards') --")
        raw = await client.call_tool("figma_reference_lookup", {"query": "Section3Cards"})
        result = _extract(raw)
        assert result["status"] == "ok", result
        assert result["match_count"] >= 1, result
        top = result["matches"][0]
        assert top["name"] == "Section3Cards", top
        print(f"  OK  exact filename hit: {top['path']}")
        print(f"      version={top['version']}, kind={top['kind']}, size={top['size_bytes']}")

        print("\n-- figma_reference_lookup('v2') --")
        raw = await client.call_tool("figma_reference_lookup", {"query": "v2", "limit": 5})
        result = _extract(raw)
        assert result["status"] == "ok", result
        assert result["match_count"] >= 50, result
        print(f"  OK  v2 filter: {result['match_count']} hits, returned {result['returned']}")
        for m in result["matches"]:
            print(f"        {m['path']}  (reason: {m['match_reason']})")

        print("\nAll multi-agent MCP transport tests passed.")
        return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(run()))

"""Run each tool once via MCP transport and pretty-print the response.

This is the final-deliverable script that backs the "post the
responses" requirement at the end of the ARCHITECT WAVE 3 brief.
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


async def run():
    server_path = HERE / "server.py"
    async with Client(str(server_path)) as client:
        print("=" * 78)
        print("tokens_search('falconGold')")
        print("=" * 78)
        r = _extract(await client.call_tool("tokens_search", {"query": "falconGold"}))
        print(json.dumps(r, indent=2, ensure_ascii=False))

        print()
        print("=" * 78)
        print("primitive_lookup('StaleBadge')")
        print("=" * 78)
        r = _extract(await client.call_tool("primitive_lookup", {"component": "StaleBadge"}))
        print(json.dumps(r, indent=2, ensure_ascii=False))

        print()
        print("=" * 78)
        print("figma_reference_lookup('Section3Cards')")
        print("=" * 78)
        r = _extract(await client.call_tool("figma_reference_lookup", {"query": "Section3Cards"}))
        print(json.dumps(r, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(run())

"""Smoke test for primitive_lookup — exercises the parser against the
real src/components/terminal/ directory.

Run: ``.venv/Scripts/python.exe test_primitives.py``
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from tools.primitive_lookup import _load_primitives, _parse_primitive_file  # noqa: E402


def main() -> int:
    repo_root = HERE.parent.parent
    terminal_dir = repo_root / "src" / "components" / "terminal"
    assert terminal_dir.exists(), f"missing: {terminal_dir}"

    primitives = _load_primitives(terminal_dir)
    print(f"Parsed {len(primitives)} primitives from {terminal_dir.relative_to(repo_root)}")
    print("Primitives:", sorted(p.name for p in primitives.values()))

    # Spot-check Skeleton — known namespaced primitive
    skeleton = primitives.get("skeleton")
    assert skeleton is not None, "missing Skeleton primitive"
    assert "Line" in skeleton.variants, f"Skeleton.variants missing Line: {skeleton.variants}"
    assert "Block" in skeleton.variants, f"Skeleton.variants missing Block"
    assert "Circle" in skeleton.variants, f"Skeleton.variants missing Circle"
    assert "Chart" in skeleton.variants, f"Skeleton.variants missing Chart"
    print(f"  OK  Skeleton: variants={skeleton.variants}, interfaces={[i.name for i in skeleton.interfaces]}")
    print(f"      usage_examples ({len(skeleton.usage_examples)}):")
    for ex in skeleton.usage_examples[:5]:
        print(f"        {ex}")

    # Spot-check StaleBadge — single component with one interface
    sb = primitives.get("stalebadge")
    assert sb is not None, "missing StaleBadge primitive"
    assert any(p.name == "ageSeconds" for i in sb.interfaces for p in i.props), \
        "StaleBadge missing ageSeconds prop"
    print(f"  OK  StaleBadge: exports={sb.exports}, default_export={sb.default_export}")
    print(f"      Props:")
    for iface in sb.interfaces:
        for p in iface.props:
            req = "required" if p.required else "optional"
            print(f"        {p.name}: {p.type_}  ({req})  -- {p.description[:60]!r}")

    # HeroNumber — should have a Props interface
    hn = primitives.get("heronumber")
    assert hn is not None, "missing HeroNumber primitive"
    print(f"  OK  HeroNumber: exports={hn.exports}, interfaces={[i.name for i in hn.interfaces]}")

    # Render a sample full lookup payload
    print("\n-- Sample primitive_lookup('StaleBadge') payload --")
    payload = {
        "status": "ok",
        "query": "StaleBadge",
        "primitive": sb.to_dict(repo_root),
    }
    print(json.dumps(payload, indent=2)[:1200])
    print("\nAll primitive_lookup tests passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

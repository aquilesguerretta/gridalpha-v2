"""Smoke test for figma_reference_lookup."""

from __future__ import annotations

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from tools.figma_reference import _load_refs, _score_ref  # noqa: E402


def main() -> int:
    repo_root = HERE.parent.parent
    figma_root = repo_root / "src" / "design" / "figma-reference"
    assert figma_root.exists(), f"missing: {figma_root}"

    refs = _load_refs(figma_root)
    print(f"Indexed {len(refs)} reference files")
    by_version = {}
    by_kind = {}
    for r in refs:
        by_version[r.version] = by_version.get(r.version, 0) + 1
        by_kind[r.kind] = by_kind.get(r.kind, 0) + 1
    print(f"  by version: {by_version}")
    print(f"  by kind:    {by_kind}")

    queries = [
        "Section3Cards",  # exact filename
        "cards",          # substring
        "v1",             # version filter
        "v2",             # version filter
        "ds",             # path component
        "ui",             # path component
        "atlas",          # likely no match
    ]
    for q in queries:
        hits = []
        for ref in refs:
            h = _score_ref(ref, q)
            if h is not None:
                hits.append((h.score, ref.rel_path, h.reason))
        hits.sort(key=lambda r: (-r[0], r[1]))
        print(f"\nquery {q!r}: {len(hits)} hits")
        for score, path, reason in hits[:5]:
            print(f"  score={score:3d}  {path}  ({reason})")

    print("\nAll figma_reference_lookup tests passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

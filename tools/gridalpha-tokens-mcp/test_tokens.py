"""Smoke test for tokens_search — exercises the parser + search directly
without going through the MCP transport.

Run: ``.venv/Scripts/python.exe test_tokens.py``
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from tools.tokens_search import _parse_tokens_ts, _score, Token  # noqa: E402


def main() -> int:
    repo_root = HERE.parent.parent
    tokens_ts = repo_root / "src" / "design" / "tokens.ts"
    assert tokens_ts.exists(), f"missing: {tokens_ts}"

    tokens = _parse_tokens_ts(tokens_ts)
    print(f"Parsed {len(tokens)} tokens from {tokens_ts.relative_to(repo_root)}")

    # Quick sanity: namespaces present
    namespaces = sorted({t.namespace for t in tokens})
    print("Namespaces:", namespaces)
    assert namespaces == ["C", "F", "R", "S", "T"], f"unexpected: {namespaces}"

    # Spot-check a few well-known tokens
    by_qual = {t.qualified_name(): t for t in tokens}
    for name, expected in [
        ("C.bgBase", "#111117"),
        ("C.falconGold", "#F59E0B"),
        ("C.electricBlue", "#3B82F6"),
        ("R.lg", "8px"),
        ("S.xl", "24px"),
    ]:
        actual = by_qual.get(name)
        assert actual is not None, f"missing token: {name}"
        assert actual.value == expected, f"{name}: {actual.value!r} != {expected!r}"
        print(f"  OK  {name} = {expected}  (category: {actual.category!r})")

    # Compound token spot-check (T.pageTitle)
    page_title = by_qual.get("T.pageTitle")
    assert page_title is not None, "missing T.pageTitle"
    assert page_title.is_compound, "T.pageTitle should be compound"
    assert isinstance(page_title.value, dict), "T.pageTitle.value should be dict"
    print(f"  OK  T.pageTitle is compound with {len(page_title.value)} props: {sorted(page_title.value.keys())}")

    # Search tests — exercise scoring/ranking
    queries = [
        "falconGold",      # exact name
        "bg",              # prefix
        "#F59E0B",         # hex
        "alert",           # category keyword
        "C.electricBlue",  # qualified
        "Geist",           # value substring
    ]

    print("\n-- Search results --")
    for q in queries:
        matches = []
        for t in tokens:
            m = _score(t, q)
            if m is not None:
                matches.append((m.score, t.qualified_name(), m.reason))
        matches.sort(key=lambda r: (-r[0], r[1]))
        top5 = matches[:5]
        print(f"\nquery {q!r}: {len(matches)} hits")
        for score, name, reason in top5:
            print(f"  score={score:3d}  {name:30}  ({reason})")

    print("\nAll parser + scoring tests passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

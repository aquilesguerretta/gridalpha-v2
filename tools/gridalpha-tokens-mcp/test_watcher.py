"""Smoke test for cache invalidation.

Exercises both:
  1. Eager invalidation via watchdog (when installed).
  2. Lazy mtime-keyed invalidation (always-on, no dependency).

For (1) we cannot easily race against the OS event loop without
flakiness, so the test mainly proves: the watcher starts cleanly,
the cache is warm before an edit, and a touch-and-poll loop sees
the cache flip within a reasonable window.

For (2) we test the mtime path directly by mutating the file mtime
and re-querying.
"""

from __future__ import annotations

import os
import shutil
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from tools import tokens_search  # noqa: E402
from tools.watcher import start_cache_watcher, stop_cache_watcher  # noqa: E402


def main() -> int:
    repo_root = HERE.parent.parent
    tokens_ts = repo_root / "src" / "design" / "tokens.ts"
    backup = tokens_ts.with_suffix(".ts.watcher-test-bak")

    # Snapshot original content
    shutil.copy2(tokens_ts, backup)

    try:
        # ── (2) Lazy mtime path ─────────────────────────────────────
        # First call populates cache.
        tokens = tokens_search._parse_tokens_ts(tokens_ts)
        assert tokens, "first parse should return tokens"
        assert tokens_ts in tokens_search._TOKEN_CACHE, "cache should be populated"
        cached_mtime_before = tokens_search._TOKEN_CACHE_MTIME[tokens_ts]
        print(f"  OK  cache warm: {len(tokens)} tokens, mtime={cached_mtime_before}")

        # Second call hits cache (no re-parse).
        tokens_again = tokens_search._parse_tokens_ts(tokens_ts)
        assert tokens is tokens_again, "second call should return the same cached list object"
        print("  OK  second call returned cached list (same object)")

        # Touch the file (advance mtime by 2s to beat filesystem precision).
        os.utime(tokens_ts, (time.time() + 2, time.time() + 2))
        time.sleep(0.05)
        tokens_after_touch = tokens_search._parse_tokens_ts(tokens_ts)
        cached_mtime_after = tokens_search._TOKEN_CACHE_MTIME[tokens_ts]
        assert cached_mtime_after != cached_mtime_before, "mtime should change"
        assert tokens_after_touch is not tokens, "list object should be re-parsed"
        print(f"  OK  mtime invalidation triggered re-parse: new mtime={cached_mtime_after}")

        # ── (1) Eager watchdog path ─────────────────────────────────
        # Repopulate cache before starting the watcher.
        tokens_search._parse_tokens_ts(tokens_ts)
        observer = start_cache_watcher(repo_root)
        if observer is None:
            print("  -- watchdog not installed (or not started) — skipping eager test")
        else:
            # Touch the file and poll the cache: it should clear shortly after.
            os.utime(tokens_ts, (time.time() + 3, time.time() + 3))
            cleared = False
            deadline = time.time() + 3.0
            while time.time() < deadline:
                if tokens_ts not in tokens_search._TOKEN_CACHE:
                    cleared = True
                    break
                time.sleep(0.05)
            stop_cache_watcher(observer)
            assert cleared, "watchdog should have cleared the cache within 3s"
            print("  OK  watchdog eagerly cleared the cache after a touch")

        print("\nAll cache invalidation tests passed.")
        return 0

    finally:
        # Restore the original file
        shutil.copy2(backup, tokens_ts)
        os.utime(tokens_ts, (backup.stat().st_atime, backup.stat().st_mtime))
        backup.unlink()


if __name__ == "__main__":
    sys.exit(main())

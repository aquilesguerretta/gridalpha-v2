"""File-watching cache invalidation.

The three tool modules (tokens_search, primitive_lookup,
figma_reference) each maintain in-memory caches keyed by
mtime. The mtime check on every tool call already keeps results
correct — this module adds *eager* invalidation so that:

1. The very next tool call after a file edit doesn't pay the
   parse cost in the foreground.
2. The cache's correctness model is observable in logs (you can
   tell whether a re-parse happened because of a file event vs.
   because of an mtime mismatch on a tool call).

If `watchdog` is not installed, ``start_cache_watcher()`` is a
no-op and tools fall back to mtime-keyed lazy invalidation, which
is functionally identical — just slightly slower on the first call
after an edit.

Watched paths:
  - src/design/tokens.ts                  → tokens_search cache
  - src/components/terminal/              → primitive_lookup cache
  - src/design/figma-reference/           → figma_reference_lookup cache
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Any, Callable

logger = logging.getLogger("gridalpha-tokens-mcp.watcher")


def _invalidate_tokens(path: Path) -> None:
    from tools import tokens_search

    tokens_search._TOKEN_CACHE.pop(path, None)
    tokens_search._TOKEN_CACHE_MTIME.pop(path, None)
    logger.info("invalidated tokens cache for %s", path)


def _invalidate_primitives(terminal_dir: Path) -> None:
    from tools import primitive_lookup

    primitive_lookup._PRIMITIVE_CACHE.pop(terminal_dir, None)
    primitive_lookup._PRIMITIVE_CACHE_MTIME.pop(terminal_dir, None)
    logger.info("invalidated primitive cache for %s", terminal_dir)


def _invalidate_figma(figma_root: Path) -> None:
    from tools import figma_reference

    figma_reference._REF_CACHE.pop(figma_root, None)
    figma_reference._REF_CACHE_MTIME.pop(figma_root, None)
    logger.info("invalidated figma cache for %s", figma_root)


def start_cache_watcher(repo_root: Path) -> Any | None:
    """Spawn a watchdog Observer that invalidates the appropriate cache
    on file events under any watched path.

    Returns the Observer handle (so the caller can stop it on shutdown),
    or None if watchdog is unavailable.
    """
    try:
        from watchdog.events import FileSystemEventHandler
        from watchdog.observers import Observer
    except ImportError:
        logger.info(
            "watchdog not installed — falling back to mtime-keyed lazy "
            "invalidation (still correct, just slightly slower on the "
            "first tool call after an edit)"
        )
        return None

    tokens_ts = repo_root / "src" / "design" / "tokens.ts"
    terminal_dir = repo_root / "src" / "components" / "terminal"
    figma_root = repo_root / "src" / "design" / "figma-reference"

    handlers: list[tuple[Path, Callable[[Path], None]]] = []
    if tokens_ts.exists():
        handlers.append((tokens_ts.parent, lambda _p, t=tokens_ts: _invalidate_tokens(t)))
    if terminal_dir.is_dir():
        handlers.append((terminal_dir, lambda _p, d=terminal_dir: _invalidate_primitives(d)))
    if figma_root.is_dir():
        handlers.append((figma_root, lambda _p, d=figma_root: _invalidate_figma(d)))

    if not handlers:
        logger.warning("no watched paths exist under %s", repo_root)
        return None

    class _Handler(FileSystemEventHandler):
        def __init__(self, invalidator: Callable[[Path], None], scope: Path):
            self._invalidator = invalidator
            self._scope = scope

        def _maybe_invalidate(self, src: str) -> None:
            try:
                src_path = Path(src).resolve()
            except OSError:
                return
            # Cheap event filter: only react to files under the scope.
            try:
                src_path.relative_to(self._scope.resolve())
            except ValueError:
                return
            self._invalidator(src_path)

        # watchdog fires these for created/modified/deleted/moved
        def on_modified(self, event):
            if not event.is_directory:
                self._maybe_invalidate(event.src_path)

        def on_created(self, event):
            if not event.is_directory:
                self._maybe_invalidate(event.src_path)

        def on_deleted(self, event):
            if not event.is_directory:
                self._maybe_invalidate(event.src_path)

        def on_moved(self, event):
            if not event.is_directory:
                self._maybe_invalidate(event.dest_path)

    observer = Observer()
    for scope, invalidator in handlers:
        observer.schedule(_Handler(invalidator, scope), str(scope), recursive=True)
        logger.info("watching %s", scope)

    observer.daemon = True
    observer.start()
    return observer


def stop_cache_watcher(observer: Any | None) -> None:
    """Stop the watcher cleanly. Safe to call with None."""
    if observer is None:
        return
    try:
        observer.stop()
        observer.join(timeout=2)
    except Exception:  # pragma: no cover - shutdown best-effort
        logger.exception("error stopping cache watcher")

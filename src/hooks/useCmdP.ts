import { useCallback, useEffect, useRef } from 'react';
import { useCmdPStore } from '@/stores/cmdpStore';
import { useAIContextSnapshot } from '@/hooks/useAIContextSnapshot';
import { useNewsData } from '@/hooks/useNewsData';
import { resolveQuery } from '@/services/cmdp/queryResolver';
import type { CmdPQuery } from '@/lib/types/cmdp';
import type { AIContextSnapshot } from '@/services/aiContext';

// CONDUIT Wave 3 — Cmd+P orchestration hook.
//
// Bridges the cmdpStore + the resolver + ORACLE's context snapshot +
// Peregrine's live news data. Mounted ONCE at the GlobalShell level so
// resolution runs in a single React lifetime — components elsewhere
// just call `useCmdPStore` directly to read state.
//
// Responsibilities:
//   • Capture an AIContextSnapshot at the moment a query is created.
//   • Subscribe to news items so the Peregrine resolver has data.
//   • Re-trigger resolution when `currentQuery` changes (open or refine).
//   • Cancel any in-flight resolution when the query changes again.

export interface OpenWithSelectionArgs {
  rawText: string;
  triggeredFrom: 'selection' | 'manual';
}

export interface UseCmdPReturn {
  /** Open the drawer with a selected text → run resolution. */
  openWithSelection: (args: OpenWithSelectionArgs) => void;
  /** Open the drawer empty (manual mode — user types in the input). */
  openEmpty: () => void;
  /** Close the drawer and abort any in-flight resolution. */
  close: () => void;
  /** Refine the active query (typed into the drawer's input). */
  refine: (rawText: string) => void;
}

export function useCmdP(): UseCmdPReturn {
  const open = useCmdPStore((s) => s.open);
  const close = useCmdPStore((s) => s.close);
  const setQuery = useCmdPStore((s) => s.setQuery);
  const recordHistory = useCmdPStore((s) => s.recordHistory);
  const currentQuery = useCmdPStore((s) => s.currentQuery);
  const receivePartial = useCmdPStore((s) => s.receivePartialResult);

  // Snapshot the AI context at every render — getSnapshot() reads
  // the latest version inside `openWithSelection`.
  const snapshot = useAIContextSnapshot();
  const snapshotRef = useRef<AIContextSnapshot>(snapshot);
  snapshotRef.current = snapshot;

  // Subscribe to news items so the Peregrine resolver has data when
  // resolution kicks off. Errors are swallowed — Peregrine resolver
  // gracefully handles empty inputs.
  const { items: newsItems } = useNewsData();
  const newsItemsRef = useRef<typeof newsItems>(newsItems);
  newsItemsRef.current = newsItems;

  // Track the in-flight abort controller so we can cancel a resolution
  // when the query changes (refine, close, re-open).
  const abortRef = useRef<AbortController | null>(null);

  // ── Resolution effect ─────────────────────────────────────────
  // Re-runs whenever the active query changes. The store is the source
  // of truth: open()/setQuery() set the query; this effect picks it up
  // and runs resolveQuery against it.
  useEffect(() => {
    if (!currentQuery || !currentQuery.rawText.trim()) return;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const target = currentQuery;
    void resolveQuery(
      target,
      { newsItems: newsItemsRef.current },
      (category, results) => {
        if (controller.signal.aborted) return;
        // Only commit results if the store's currentQuery is still the
        // one we started against (cheap re-entry guard).
        const live = useCmdPStore.getState().currentQuery;
        if (live !== target) return;
        receivePartial(category, results);
      },
      { signal: controller.signal },
    ).then(() => {
      if (!controller.signal.aborted) recordHistory(target);
    });

    return () => controller.abort();
    // currentQuery identity changes whenever a new query is set —
    // that's the trigger. Dependencies on the stable callbacks come
    // from Zustand and don't change identity per render.
  }, [currentQuery, receivePartial, recordHistory]);

  // ── Public API ────────────────────────────────────────────────
  const openWithSelection = useCallback(
    ({ rawText, triggeredFrom }: OpenWithSelectionArgs) => {
      const text = rawText.trim();
      if (!text) {
        open();
        return;
      }
      const query: CmdPQuery = {
        rawText: text,
        contextSnapshot: snapshotRef.current,
        triggeredFrom,
      };
      open(query);
    },
    [open],
  );

  const openEmpty = useCallback(() => {
    open();
  }, [open]);

  const refine = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      if (!text) return;
      const query: CmdPQuery = {
        rawText: text,
        contextSnapshot: snapshotRef.current,
        triggeredFrom: 'manual',
      };
      setQuery(query);
    },
    [setQuery],
  );

  return { openWithSelection, openEmpty, close, refine };
}

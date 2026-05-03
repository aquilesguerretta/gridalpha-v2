import { create } from 'zustand';
import type {
  CmdPQuery,
  CmdPResult,
  CmdPResultSet,
  ResultCategory,
} from '@/lib/types/cmdp';
import { emptyResultSet } from '@/lib/types/cmdp';

// CONDUIT Wave 3 — Cmd+P drawer + query state.
//
// Tracks: open/closed, the active query, the result set as it streams
// in via the resolver, and a tiny session history (last 5 queries) for
// "recent" display in future sprints.
//
// Not persisted — Cmd+P is ephemeral by design. Closing the drawer
// clears the active query but preserves history (until the tab closes).

const HISTORY_LIMIT = 5;

interface CmdPState {
  isOpen: boolean;
  currentQuery: CmdPQuery | null;
  results: CmdPResultSet | null;
  history: CmdPQuery[];

  /** Open the drawer with an optional starting query. If a query is
   *  passed and is non-empty, the orchestration hook should pick it up
   *  and trigger resolution. */
  open: (query?: CmdPQuery) => void;
  /** Close the drawer and clear the active query/results. History stays. */
  close: () => void;
  /** Replace the active query (e.g. user refined the search). Resets
   *  the results to a fresh empty set so the drawer shows skeletons. */
  setQuery: (query: CmdPQuery) => void;
  /** Mutate the results in place as a category resolves. */
  receivePartialResult: (category: ResultCategory, results: CmdPResult[]) => void;
  /** Push the current query onto the history (called when the
   *  orchestration hook commits a resolution). */
  recordHistory: (query: CmdPQuery) => void;
}

export const useCmdPStore = create<CmdPState>((set, get) => ({
  isOpen: false,
  currentQuery: null,
  results: null,
  history: [],

  open: (query) => {
    set({
      isOpen: true,
      currentQuery: query ?? null,
      results: query ? emptyResultSet(query) : null,
    });
  },

  close: () => {
    set({ isOpen: false, currentQuery: null, results: null });
  },

  setQuery: (query) => {
    set({ currentQuery: query, results: emptyResultSet(query) });
  },

  receivePartialResult: (category, results) => {
    const cur = get().results;
    if (!cur) return;
    set({
      results: {
        ...cur,
        groups: { ...cur.groups, [category]: results },
        isLoading: { ...cur.isLoading, [category]: false },
      },
    });
  },

  recordHistory: (query) => {
    const text = query.rawText.trim();
    if (!text) return;
    const next = [
      query,
      ...get().history.filter((h) => h.rawText.trim() !== text),
    ].slice(0, HISTORY_LIMIT);
    set({ history: next });
  },
}));

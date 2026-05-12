import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ViewSnapshot } from '@/services/viewSerialization';

// CONDUIT — saved views store.
// User-named snapshots of the current view that persist across sessions.
// Persisted to localStorage (not session) so a user's saved views survive
// browser restarts. Schema versioned via the `version` field on each
// `ViewSnapshot` so future migrations can be handled in viewSerialization.

export interface SavedView {
  id: string;
  name: string;
  snapshot: ViewSnapshot;
  pinned: boolean;
}

interface SavedViewsState {
  views: SavedView[];

  saveView: (name: string, snapshot: ViewSnapshot) => SavedView;
  deleteView: (id: string) => void;
  renameView: (id: string, name: string) => void;
  togglePin: (id: string) => void;
  reorderViews: (orderedIds: string[]) => void;

  getView: (id: string) => SavedView | null;
  listViews: () => SavedView[];
  listPinned: () => SavedView[];
}

export const useSavedViewsStore = create<SavedViewsState>()(
  persist(
    (set, get) => ({
      views: [],

      saveView: (name, snapshot) => {
        const id = `view_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const view: SavedView = { id, name, snapshot, pinned: false };
        set((s) => ({ views: [...s.views, view] }));
        return view;
      },

      deleteView: (id) =>
        set((s) => ({ views: s.views.filter((v) => v.id !== id) })),

      renameView: (id, name) =>
        set((s) => ({
          views: s.views.map((v) => (v.id === id ? { ...v, name } : v)),
        })),

      togglePin: (id) =>
        set((s) => ({
          views: s.views.map((v) =>
            v.id === id ? { ...v, pinned: !v.pinned } : v,
          ),
        })),

      reorderViews: (orderedIds) =>
        set((s) => {
          const map = new Map(s.views.map((v) => [v.id, v] as const));
          return {
            views: orderedIds
              .map((id) => map.get(id))
              .filter((v): v is SavedView => v !== undefined),
          };
        }),

      getView: (id) => get().views.find((v) => v.id === id) ?? null,
      listViews: () => get().views,
      listPinned: () => get().views.filter((v) => v.pinned),
    }),
    {
      name: 'gridalpha-saved-views',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

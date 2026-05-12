import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Annotation, AnnotationDraft } from '@/lib/types/annotation';

// CONDUIT — annotation store.
// All annotations across all charts live in a single flat list, indexed by
// the per-row `chartId`. This keeps the schema simple and lets us add
// cross-chart features (search, recent, jump-to) later without a schema
// migration. Persisted to localStorage so notes survive a tab close.

interface AnnotationState {
  annotations: Annotation[];

  addAnnotation: (draft: AnnotationDraft) => Annotation;
  updateAnnotation: (id: string, text: string) => void;
  deleteAnnotation: (id: string) => void;
  getForChart: (chartId: string) => Annotation[];
  clearChart: (chartId: string) => void;
}

export const useAnnotationStore = create<AnnotationState>()(
  persist(
    (set, get) => ({
      annotations: [],

      addAnnotation: (draft) => {
        const existing = get().annotations.filter((a) => a.chartId === draft.chartId);
        const sequence = existing.length + 1;
        const now = new Date().toISOString();
        const annotation: Annotation = {
          id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          chartId: draft.chartId,
          xNormalized: draft.xNormalized,
          yNormalized: draft.yNormalized,
          text: draft.text,
          createdAt: now,
          updatedAt: now,
          sequence,
        };
        set((s) => ({ annotations: [...s.annotations, annotation] }));
        return annotation;
      },

      updateAnnotation: (id, text) =>
        set((s) => ({
          annotations: s.annotations.map((a) =>
            a.id === id ? { ...a, text, updatedAt: new Date().toISOString() } : a,
          ),
        })),

      deleteAnnotation: (id) =>
        set((s) => ({ annotations: s.annotations.filter((a) => a.id !== id) })),

      getForChart: (chartId) =>
        get()
          .annotations.filter((a) => a.chartId === chartId)
          .sort((a, b) => a.sequence - b.sequence),

      clearChart: (chartId) =>
        set((s) => ({
          annotations: s.annotations.filter((a) => a.chartId !== chartId),
        })),
    }),
    {
      name: 'gridalpha-annotations',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

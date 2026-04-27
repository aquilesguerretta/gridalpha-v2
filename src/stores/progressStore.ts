// SCRIBE — Alexandria progress store.
// Tracks (a) Lesson visited / completed for the original 4 lessons, plus
// (b) per-layer Entry visited and per-layer retrieval-prompt acknowledgment
// for the new Sub-Tier 1A entries. Persisted to localStorage; existing users
// get safe defaults for the new fields via onRehydrateStorage.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LayerKey } from '@/lib/types/curriculum';

export interface QuizAttempt {
  correct: number;
  total: number;
  at: string;
}

export interface ProgressState {
  /** Lesson IDs the user has opened (original Lesson format). */
  visited: Set<string>;
  /** Lesson IDs where the user passed the quiz (3+ correct). */
  completed: Set<string>;
  /** Per-lesson quiz attempt history. */
  quizAttempts: Record<string, QuizAttempt[]>;

  /** Layers visited per Entry (Sub-Tier 1A). */
  visitedLayers: Record<string, LayerKey[]>;
  /** Retrieval-prompt acknowledgements keyed `{entryId}:{layer}` → true. */
  retrievalAcknowledged: Record<string, boolean>;

  markVisited: (lessonId: string) => void;
  markCompleted: (lessonId: string) => void;
  recordQuizAttempt: (lessonId: string, correct: number, total: number) => void;

  markLayerVisited: (entryId: string, layer: LayerKey) => void;
  acknowledgeRetrieval: (entryId: string, layer: LayerKey) => void;

  reset: () => void;

  isVisited: (lessonId: string) => boolean;
  isCompleted: (lessonId: string) => boolean;
  getQuizHistory: (lessonId: string) => QuizAttempt[];
  isLayerVisited: (entryId: string, layer: LayerKey) => boolean;
  isRetrievalAcknowledged: (entryId: string, layer: LayerKey) => boolean;
}

interface PersistedShape {
  visited: string[];
  completed: string[];
  quizAttempts: Record<string, QuizAttempt[]>;
  visitedLayers?: Record<string, LayerKey[]>;
  retrievalAcknowledged?: Record<string, boolean>;
}

function ackKey(entryId: string, layer: LayerKey): string {
  return `${entryId}:${layer}`;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      visited: new Set<string>(),
      completed: new Set<string>(),
      quizAttempts: {},
      visitedLayers: {},
      retrievalAcknowledged: {},

      markVisited: (lessonId) =>
        set((s) => {
          if (s.visited.has(lessonId)) return s;
          const next = new Set(s.visited);
          next.add(lessonId);
          return { visited: next };
        }),

      markCompleted: (lessonId) =>
        set((s) => {
          if (s.completed.has(lessonId)) return s;
          const next = new Set(s.completed);
          next.add(lessonId);
          return { completed: next };
        }),

      recordQuizAttempt: (lessonId, correct, total) =>
        set((s) => {
          const prior = s.quizAttempts[lessonId] ?? [];
          return {
            quizAttempts: {
              ...s.quizAttempts,
              [lessonId]: [
                ...prior,
                { correct, total, at: new Date().toISOString() },
              ],
            },
          };
        }),

      markLayerVisited: (entryId, layer) =>
        set((s) => {
          const prior = s.visitedLayers[entryId] ?? [];
          if (prior.includes(layer)) return s;
          return {
            visitedLayers: {
              ...s.visitedLayers,
              [entryId]: [...prior, layer],
            },
          };
        }),

      acknowledgeRetrieval: (entryId, layer) =>
        set((s) => {
          const k = ackKey(entryId, layer);
          if (s.retrievalAcknowledged[k]) return s;
          return {
            retrievalAcknowledged: {
              ...s.retrievalAcknowledged,
              [k]: true,
            },
          };
        }),

      reset: () =>
        set({
          visited: new Set<string>(),
          completed: new Set<string>(),
          quizAttempts: {},
          visitedLayers: {},
          retrievalAcknowledged: {},
        }),

      isVisited: (lessonId) => get().visited.has(lessonId),
      isCompleted: (lessonId) => get().completed.has(lessonId),
      getQuizHistory: (lessonId) => get().quizAttempts[lessonId] ?? [],
      isLayerVisited: (entryId, layer) =>
        (get().visitedLayers[entryId] ?? []).includes(layer),
      isRetrievalAcknowledged: (entryId, layer) =>
        Boolean(get().retrievalAcknowledged[ackKey(entryId, layer)]),
    }),
    {
      name: 'gridalpha-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) =>
        ({
          visited: Array.from(s.visited),
          completed: Array.from(s.completed),
          quizAttempts: s.quizAttempts,
          visitedLayers: s.visitedLayers,
          retrievalAcknowledged: s.retrievalAcknowledged,
        }) as unknown as ProgressState,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const persisted = state as unknown as PersistedShape;
        state.visited = new Set(persisted.visited ?? []);
        state.completed = new Set(persisted.completed ?? []);
        // Defaults for new fields so existing users don't crash.
        state.visitedLayers = persisted.visitedLayers ?? {};
        state.retrievalAcknowledged = persisted.retrievalAcknowledged ?? {};
      },
    },
  ),
);

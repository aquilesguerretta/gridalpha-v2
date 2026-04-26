// SCRIBE — Alexandria progress store.
// Tracks which lessons have been visited, which have been completed
// (3+ correct on the 5-question quiz), and the per-lesson quiz attempt
// history. Persisted to localStorage so progress survives reloads and
// cross-tab sessions.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface QuizAttempt {
  correct: number;
  total: number;
  at: string;
}

export interface ProgressState {
  /** Lesson IDs the user has opened. */
  visited: Set<string>;
  /** Lesson IDs where the user passed the quiz (3+ correct). */
  completed: Set<string>;
  /** Per-lesson quiz attempt history. */
  quizAttempts: Record<string, QuizAttempt[]>;

  markVisited: (lessonId: string) => void;
  markCompleted: (lessonId: string) => void;
  recordQuizAttempt: (lessonId: string, correct: number, total: number) => void;
  reset: () => void;

  isVisited: (lessonId: string) => boolean;
  isCompleted: (lessonId: string) => boolean;
  getQuizHistory: (lessonId: string) => QuizAttempt[];
}

interface PersistedShape {
  visited: string[];
  completed: string[];
  quizAttempts: Record<string, QuizAttempt[]>;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      visited: new Set<string>(),
      completed: new Set<string>(),
      quizAttempts: {},

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

      reset: () =>
        set({
          visited: new Set<string>(),
          completed: new Set<string>(),
          quizAttempts: {},
        }),

      isVisited: (lessonId) => get().visited.has(lessonId),
      isCompleted: (lessonId) => get().completed.has(lessonId),
      getQuizHistory: (lessonId) => get().quizAttempts[lessonId] ?? [],
    }),
    {
      name: 'gridalpha-progress',
      storage: createJSONStorage(() => localStorage),
      // Sets don't serialize natively — flatten to arrays on the way out
      // and rehydrate to Sets on the way back in.
      partialize: (s) =>
        ({
          visited: Array.from(s.visited),
          completed: Array.from(s.completed),
          quizAttempts: s.quizAttempts,
        }) as unknown as ProgressState,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const persisted = state as unknown as PersistedShape;
        state.visited = new Set(persisted.visited ?? []);
        state.completed = new Set(persisted.completed ?? []);
      },
    },
  ),
);

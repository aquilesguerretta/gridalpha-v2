// ORACLE Wave 3 — graded-answer + recall-queue store.
//
// Persistence: localStorage under `gridalpha-grading`. The reasoning is
// the same as SCRIBE's progressStore — these records belong to the
// student's long-term study history, not the current tab. The recall
// queue is derived from gradedAnswers + curriculum metadata, so we
// only persist what's authoritative (gradedAnswers + lessonSummaries).

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  GradeLevel,
  GradedAnswer,
  LessonSummary,
  LessonSummaryKey,
  RecallQueueItem,
  RetrievalPromptInstance,
} from '@/lib/types/grading';
import { RECALL_PRIORITY_WEIGHTS } from '@/lib/types/grading';

export interface GradingState {
  /** All graded attempts keyed by promptId. Latest attempt is at the end. */
  gradedAnswers: Record<string, GradedAnswer[]>;
  /** AI-generated entry summaries keyed by `<entrySlug>:<layer>`. */
  lessonSummaries: Record<LessonSummaryKey, LessonSummary>;

  recordGradedAnswer: (graded: GradedAnswer) => void;
  resetGradedAnswers: (promptId: string) => void;
  clearAll: () => void;

  /** Read latest attempt for a prompt — null when no attempts exist. */
  getLatestGrade: (promptId: string) => GradedAnswer | null;
  /** Full attempt history for a prompt, oldest → newest. */
  getAttempts: (promptId: string) => GradedAnswer[];
  /** Number of attempts on a prompt — handy for the next attemptNumber. */
  attemptCount: (promptId: string) => number;

  /** Cache a generated summary. */
  setLessonSummary: (key: LessonSummaryKey, summary: LessonSummary) => void;
  /** Read a cached summary — undefined when none. */
  getLessonSummary: (key: LessonSummaryKey) => LessonSummary | undefined;

  /**
   * Build the recall queue against the supplied set of curriculum
   * prompts. Items are sorted priority descending. Pure read — does
   * not mutate state.
   */
  buildRecallQueue: (prompts: RetrievalPromptInstance[]) => RecallQueueItem[];
}

export const useGradingStore = create<GradingState>()(
  persist(
    (set, get) => ({
      gradedAnswers: {},
      lessonSummaries: {},

      recordGradedAnswer: (graded) =>
        set((s) => {
          const prior = s.gradedAnswers[graded.promptId] ?? [];
          return {
            gradedAnswers: {
              ...s.gradedAnswers,
              [graded.promptId]: [...prior, graded],
            },
          };
        }),

      resetGradedAnswers: (promptId) =>
        set((s) => {
          if (!(promptId in s.gradedAnswers)) return s;
          const next = { ...s.gradedAnswers };
          delete next[promptId];
          return { gradedAnswers: next };
        }),

      clearAll: () => set({ gradedAnswers: {}, lessonSummaries: {} }),

      getLatestGrade: (promptId) => {
        const list = get().gradedAnswers[promptId];
        if (!list || list.length === 0) return null;
        return list[list.length - 1];
      },

      getAttempts: (promptId) => get().gradedAnswers[promptId] ?? [],

      attemptCount: (promptId) =>
        (get().gradedAnswers[promptId] ?? []).length,

      setLessonSummary: (key, summary) =>
        set((s) => ({
          lessonSummaries: { ...s.lessonSummaries, [key]: summary },
        })),

      getLessonSummary: (key) => get().lessonSummaries[key],

      buildRecallQueue: (prompts) => {
        const now = Date.now();
        const items: RecallQueueItem[] = prompts.map((p) => {
          const list = get().gradedAnswers[p.promptId] ?? [];
          const last = list.length > 0 ? list[list.length - 1] : null;
          const lastSeenMs = last ? Date.parse(last.gradedAt) : null;
          const days =
            lastSeenMs !== null
              ? Math.max(0, Math.floor((now - lastSeenMs) / (1000 * 60 * 60 * 24)))
              : Number.POSITIVE_INFINITY;
          const priority = computePriority(last?.grade ?? null, days);
          return {
            promptId: p.promptId,
            entrySlug: p.entrySlug,
            daysSinceLastSeen: Number.isFinite(days) ? days : 0,
            lastGrade: last?.grade ?? null,
            priority,
          };
        });
        return items.sort((a, b) => b.priority - a.priority);
      },
    }),
    {
      name: 'gridalpha-grading',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        gradedAnswers: s.gradedAnswers,
        lessonSummaries: s.lessonSummaries,
      }),
    },
  ),
);

// ─── Priority math ───────────────────────────────────────────────────
// Priority = base-by-grade + per-day decay. Fresh prompts (never seen)
// get the `fresh` weight so they enter the queue early but below poor
// attempts. Excellent prompts age slowly.

function computePriority(
  lastGrade: GradeLevel | null,
  daysSinceLastSeen: number,
): number {
  const base = baseFor(lastGrade);
  if (lastGrade === null) {
    // Fresh prompt — base only, no per-day decay.
    return base;
  }
  return base + daysSinceLastSeen * RECALL_PRIORITY_WEIGHTS.perDay;
}

function baseFor(lastGrade: GradeLevel | null): number {
  switch (lastGrade) {
    case 'poor':
      return RECALL_PRIORITY_WEIGHTS.lastGradePoor;
    case 'partial':
      return RECALL_PRIORITY_WEIGHTS.lastGradePartial;
    case 'strong':
      return RECALL_PRIORITY_WEIGHTS.lastGradeStrong;
    case 'excellent':
      return RECALL_PRIORITY_WEIGHTS.lastGradeExcellent;
    case null:
      return RECALL_PRIORITY_WEIGHTS.fresh;
  }
}

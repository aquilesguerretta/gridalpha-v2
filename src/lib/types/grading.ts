// ORACLE Wave 3 — type system for AI-graded retrieval prompts.
//
// The contract between the curriculum, the grader service, and the UI:
//   - RetrievalPromptInstance is what the grader takes IN.
//   - GradedAnswer is what the grader returns. Persisted to the
//     gradingStore and rendered by FeedbackPanel.
//   - GradeLevel is the four-bucket ordinal scale.
//   - RecallQueueItem feeds the spaced-recall queue.

import type { LayerKey } from '@/lib/types/curriculum';

/**
 * One concrete retrieval prompt the user can answer. The promptId is
 * stable across sessions (`<entrySlug>:<layer>`) so persisted answers
 * keep mapping to the same source even when the curriculum text is
 * lightly edited.
 */
export interface RetrievalPromptInstance {
  /** `<entrySlug>:<layer>` — stable across sessions. */
  promptId: string;
  entrySlug: string;
  /** Display title of the entry — surfaced in the recall queue + summary. */
  entryTitle: string;
  layer: LayerKey;
  /** The question text the student is answering. */
  questionText: string;
  /** Concepts the answer should reference (canonical names or paraphrase). */
  expectedConcepts: string[];
  /** Human-readable rubric for the grader. */
  rubric: string;
  /** Optional anchor in the entry — a section heading the grader can
   *  point the student back to when they miss a concept. */
  defaultPointerSection?: string;
}

/** Four-bucket ordinal grade. */
export type GradeLevel = 'poor' | 'partial' | 'strong' | 'excellent';

/** A graded student attempt. Persisted in the gradingStore. */
export interface GradedAnswer {
  promptId: string;
  studentAnswer: string;
  grade: GradeLevel;
  /** Concepts the grader thinks the answer hit. */
  conceptsHit: string[];
  /** Concepts the grader thinks the answer missed. */
  conceptsMissed: string[];
  /** 2–4 sentence prose feedback from the grader. */
  feedback: string;
  /** Section anchor in the entry where the missing concepts live. */
  pointerToSection?: string;
  /** ISO timestamp. */
  gradedAt: string;
  /** 1-indexed attempt counter — increases on retry. */
  attemptNumber: number;
}

/** Item in the spaced-recall queue. */
export interface RecallQueueItem {
  promptId: string;
  entrySlug: string;
  /** Days since the user last submitted an answer for this prompt. */
  daysSinceLastSeen: number;
  /** The latest grade — null when the prompt has never been attempted. */
  lastGrade: GradeLevel | null;
  /** Higher = more urgent. See gradingStore for the priority formula. */
  priority: number;
}

/** What the grader returns to the UI. Either a graded answer or an error. */
export type GradingResult =
  | { ok: true; graded: GradedAnswer }
  | { ok: false; error: string };

/**
 * Lesson summary cache key — `<entrySlug>:<layer>`. Each entry+layer pair
 * maps to one cached summary (or none). Re-generation forces a fresh call.
 */
export type LessonSummaryKey = string;

/** Cached lesson summary. */
export interface LessonSummary {
  /** The summary paragraph itself. */
  text: string;
  /** ISO timestamp when the summary was generated. */
  generatedAt: string;
  /** Entry layer the summary is for. */
  layer: LayerKey;
  entrySlug: string;
}

/** Numeric weights used by the priority formula. */
export const RECALL_PRIORITY_WEIGHTS = {
  /** Per-day decay added on top of the base. */
  perDay: 1,
  /** Boost when the last grade was poor. */
  lastGradePoor: 8,
  /** Boost when the last grade was partial. */
  lastGradePartial: 4,
  /** Boost when the last grade was strong. */
  lastGradeStrong: 1,
  /** Boost when the last grade was excellent. */
  lastGradeExcellent: 0,
  /** Boost when the prompt has never been attempted. */
  fresh: 6,
} as const;

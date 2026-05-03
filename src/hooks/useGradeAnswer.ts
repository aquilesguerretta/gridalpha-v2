// ORACLE Wave 3 — orchestration for a single RetrievalPrompt instance.
//
// Wires the gradeAnswer service to the gradingStore. Returns the latest
// grade, the full attempt history, an isGrading flag, an error string,
// plus three actions: submit, retry (resets state for a fresh attempt),
// and clear (wipes all attempts for this prompt — used by Try Again).

import { useCallback, useState } from 'react';
import { gradeAnswer } from '@/services/grading/gradeAnswer';
import { useGradingStore } from '@/stores/gradingStore';
import type {
  GradedAnswer,
  RetrievalPromptInstance,
} from '@/lib/types/grading';

// Stable empty array reference — Zustand's getSnapshot identity check
// would loop infinitely if we returned `[]` from the selector each render.
const EMPTY_ATTEMPTS: readonly GradedAnswer[] = [];

export interface UseGradeAnswer {
  latestGrade: GradedAnswer | null;
  attempts: GradedAnswer[];
  isGrading: boolean;
  error: string | null;
  /** Submit an answer for grading. */
  submit: (studentAnswer: string) => Promise<void>;
  /** Clear the latest grade locally so the user can revise. The persisted
   *  attempts are preserved unless `resetHistory` is called. */
  retry: () => void;
  /** Wipe all persisted attempts for this prompt. */
  resetHistory: () => void;
}

export function useGradeAnswer(
  prompt: RetrievalPromptInstance,
): UseGradeAnswer {
  const recordGradedAnswer = useGradingStore((s) => s.recordGradedAnswer);
  const resetGradedAnswers = useGradingStore((s) => s.resetGradedAnswers);
  // Select the underlying entry directly so the reference is stable
  // when the prompt has no attempts (otherwise `?? []` rebuilds an empty
  // array every render and triggers a getSnapshot loop).
  const attemptsFromStore = useGradingStore(
    (s) => s.gradedAnswers[prompt.promptId],
  );
  const attempts = attemptsFromStore ?? (EMPTY_ATTEMPTS as GradedAnswer[]);

  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // `dismissed` controls in-session "Try again" — the latest grade is
  // hidden from the UI but remains in the store / history.
  const [dismissed, setDismissed] = useState(false);

  const submit = useCallback(
    async (studentAnswer: string) => {
      if (isGrading) return;
      setError(null);
      setIsGrading(true);
      try {
        const attemptNumber = attempts.length + 1;
        const result = await gradeAnswer({
          prompt,
          studentAnswer,
          attemptNumber,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        recordGradedAnswer(result.graded);
        setDismissed(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown grading error.');
      } finally {
        setIsGrading(false);
      }
    },
    [attempts.length, isGrading, prompt, recordGradedAnswer],
  );

  const retry = useCallback(() => {
    setDismissed(true);
    setError(null);
  }, []);

  const resetHistory = useCallback(() => {
    resetGradedAnswers(prompt.promptId);
    setDismissed(false);
    setError(null);
  }, [prompt.promptId, resetGradedAnswers]);

  const latestPersisted =
    attempts.length > 0 ? attempts[attempts.length - 1] : null;

  return {
    latestGrade: dismissed ? null : latestPersisted,
    attempts,
    isGrading,
    error,
    submit,
    retry,
    resetHistory,
  };
}

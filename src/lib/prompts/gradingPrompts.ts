// ORACLE Wave 3 — system prompt + per-call user prompt for the grader.
//
// The grader is asked to return a strict JSON object so the parser can
// turn it into a GradedAnswer without prose-shaped ambiguity. We keep
// the system prompt small and the per-call user prompt where the bulk
// of the variance lives.

import type { RetrievalPromptInstance } from '@/lib/types/grading';

/**
 * System message for the grader. Pinned so the grader always emits the
 * same JSON envelope regardless of the curriculum being graded.
 */
export const GRADER_SYSTEM_PROMPT = `You are an Energy Business & Finance professor grading a student's recall answer for the GridAlpha Alexandria curriculum.

Your job:
- Read the prompt, the rubric, and the expected concepts.
- Read the student's answer.
- Decide which concepts the answer hit and which it missed.
- Return a single JSON object — and nothing else.

Grading scale:
- "poor": misses the central concept or contains substantive errors.
- "partial": hits some concepts but misses key ones.
- "strong": hits the central concepts with reasonable precision.
- "excellent": hits central + nuanced concepts; would impress a professor.

Be specific in feedback. The student is a peer — direct, kind, no filler. 2 to 4 short sentences.

Output contract — return EXACTLY this shape, with no prose outside the JSON, no markdown fences:

{
  "grade": "poor" | "partial" | "strong" | "excellent",
  "conceptsHit": [string, ...],
  "conceptsMissed": [string, ...],
  "feedback": "2-4 sentences",
  "pointerToSection": string | null
}`;

/**
 * Build the per-call user prompt for a given retrieval prompt + student
 * answer. Caller is `gradeAnswer` in `services/grading/gradeAnswer.ts`.
 */
export function buildGradingPrompt(
  prompt: RetrievalPromptInstance,
  studentAnswer: string,
): string {
  const expected =
    prompt.expectedConcepts.length > 0
      ? prompt.expectedConcepts.join(', ')
      : '(no canonical list — use your judgement against the rubric)';

  return [
    `ENTRY: ${prompt.entryTitle} · Layer ${prompt.layer}`,
    '',
    'PROMPT',
    prompt.questionText,
    '',
    'EXPECTED CONCEPTS (the answer should reference these by name or paraphrase)',
    expected,
    '',
    'RUBRIC',
    prompt.rubric,
    '',
    'STUDENT ANSWER',
    studentAnswer,
  ].join('\n');
}

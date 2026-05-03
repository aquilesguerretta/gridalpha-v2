// ORACLE Wave 3 — gradeAnswer service.
//
// One-shot call to the FastAPI proxy at `/api/ai/complete`. Builds the
// grading prompt, posts the request, parses the JSON envelope the grader
// returns. Returns a typed GradingResult — `ok: true` with a GradedAnswer
// or `ok: false` with a user-facing error string. Never throws.

import {
  buildGradingPrompt,
  GRADER_SYSTEM_PROMPT,
} from '@/lib/prompts/gradingPrompts';
import type {
  GradingResult,
  RetrievalPromptInstance,
} from '@/lib/types/grading';
import { parseGraderResponse, toGradedAnswer } from './responseParser';

const ENDPOINT = '/api/ai/complete';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1500; // grader output is longer than chat — feedback + concept lists.

interface AnthropicTextBlock {
  type: 'text';
  text: string;
}
interface AnthropicResponse {
  content?: AnthropicTextBlock[];
  error?: { message?: string; type?: string };
  detail?: unknown;
}

interface GradeAnswerInput {
  prompt: RetrievalPromptInstance;
  studentAnswer: string;
  /**
   * Caller-supplied attempt counter. The hook reads it from the store
   * (length of prior attempts + 1) so it always reflects the persisted
   * history at send time.
   */
  attemptNumber: number;
  /** Optional abort signal — propagates to fetch. */
  signal?: AbortSignal;
}

export async function gradeAnswer(
  input: GradeAnswerInput,
): Promise<GradingResult> {
  const { prompt, studentAnswer, attemptNumber, signal } = input;

  const trimmed = studentAnswer.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'Please write an answer before submitting.' };
  }

  const userMessage = buildGradingPrompt(prompt, trimmed);

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: GRADER_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal,
    });
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Network error: ${err.message}`
          : 'Network error contacting the grader.',
    };
  }

  let payload: AnthropicResponse;
  try {
    payload = (await response.json()) as AnthropicResponse;
  } catch {
    return {
      ok: false,
      error: `Grader service returned an invalid response (status ${response.status}).`,
    };
  }

  if (!response.ok) {
    const detail =
      typeof payload.detail === 'string'
        ? payload.detail
        : payload.error?.message ??
          `Grader service request failed (status ${response.status}).`;
    return { ok: false, error: detail };
  }

  const fullText = (payload.content ?? [])
    .filter((b): b is AnthropicTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  if (!fullText) {
    return { ok: false, error: 'Grader returned an empty response.' };
  }

  const parsed = parseGraderResponse(fullText);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const graded = toGradedAnswer(parsed.grade, {
    promptId: prompt.promptId,
    studentAnswer: trimmed,
    attemptNumber,
    gradedAt: new Date().toISOString(),
  });

  return { ok: true, graded };
}

// ORACLE Wave 3 — lesson summary generation.
//
// Pulls the entry text from SCRIBE's curriculum, calls /api/ai/complete
// with the pinned summary system prompt, returns the resulting paragraph.
// Caller (useLessonSummary) handles caching in the gradingStore.

import {
  SUMMARY_SYSTEM_PROMPT,
  buildSummaryPrompt,
} from '@/lib/prompts/lessonSummaryPrompts';
import { getEntry } from '@/lib/curriculum/entriesIndex';
import type { LayerKey } from '@/lib/types/curriculum';

const ENDPOINT = '/api/ai/complete';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 600; // 4–5 sentence paragraph fits comfortably.

interface AnthropicTextBlock {
  type: 'text';
  text: string;
}
interface AnthropicResponse {
  content?: AnthropicTextBlock[];
  error?: { message?: string };
  detail?: unknown;
}

export type SummaryResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

interface GenerateSummaryInput {
  entrySlug: string;
  layer: LayerKey;
  signal?: AbortSignal;
}

export async function generateLessonSummary(
  input: GenerateSummaryInput,
): Promise<SummaryResult> {
  const { entrySlug, layer, signal } = input;

  const entry = getEntry(entrySlug);
  if (!entry) {
    return { ok: false, error: `Entry not found: ${entrySlug}` };
  }

  const layerContent = entry.layers[layer];
  if (!layerContent) {
    return { ok: false, error: `Layer not found: ${layer}` };
  }

  const userMessage = buildSummaryPrompt({
    entryTitle:            entry.title,
    layer,
    thresholdConcept:      entry.thresholdConcept,
    misconceptionDefeated: entry.misconceptionDefeated,
    entryBody:             layerContent.body,
  });

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SUMMARY_SYSTEM_PROMPT,
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
          : 'Network error contacting the summary service.',
    };
  }

  let payload: AnthropicResponse;
  try {
    payload = (await response.json()) as AnthropicResponse;
  } catch {
    return {
      ok: false,
      error: `Summary service returned an invalid response (status ${response.status}).`,
    };
  }

  if (!response.ok) {
    const detail =
      typeof payload.detail === 'string'
        ? payload.detail
        : payload.error?.message ??
          `Summary service request failed (status ${response.status}).`;
    return { ok: false, error: detail };
  }

  const text = (payload.content ?? [])
    .filter((b): b is AnthropicTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  if (!text) {
    return { ok: false, error: 'Summary service returned an empty response.' };
  }

  return { ok: true, text };
}

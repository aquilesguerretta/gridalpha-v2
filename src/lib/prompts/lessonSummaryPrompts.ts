// ORACLE Wave 3 — system prompt + user prompt for lesson summary generation.
//
// The summary is meant as a comparison reference for students reviewing
// their notes — concise, direct, terminal voice. We pin the system message
// to lock the format (4–5 sentence single paragraph) and feed the entry
// text + meta as the user message.

import type { LayerKey } from '@/lib/types/curriculum';

export const SUMMARY_SYSTEM_PROMPT = `You summarize Alexandria entries from the GridAlpha curriculum for students who have just finished reading them.

Your output is a SINGLE paragraph of 4 to 5 sentences. The paragraph must:
- Capture the central thesis in one sentence.
- List 3 specific concepts the entry covers (named, not paraphrased).
- Identify the one mental model the student should walk away with.

Tone: terminal voice — direct, peer-to-peer, no hype, no filler. Avoid words like "fascinating", "important to note", or "in conclusion".

Output the paragraph and nothing else. No preamble. No headings. No bullet points. No closing remarks.`;

export interface LessonSummaryInput {
  entryTitle: string;
  layer: LayerKey;
  /** Threshold concept the entry teaches. */
  thresholdConcept: string;
  /** Misconception the entry exists to defeat. */
  misconceptionDefeated: string;
  /** Full body text of the layer the student just finished. */
  entryBody: string;
}

export function buildSummaryPrompt(input: LessonSummaryInput): string {
  return [
    `ENTRY: ${input.entryTitle}`,
    `LAYER: ${input.layer}`,
    `THRESHOLD CONCEPT: ${input.thresholdConcept}`,
    `MISCONCEPTION DEFEATED: ${input.misconceptionDefeated}`,
    '',
    'ENTRY CONTENT (verbatim):',
    input.entryBody,
  ].join('\n');
}

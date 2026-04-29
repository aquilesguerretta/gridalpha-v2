// ORACLE Wave 2 — pre-built prompts for the AIAssistant's quick-action
// chips. Each entry pairs a stable id (used by InlineAITrigger and the
// quick-action UI) with the prompt text the user submits when they
// click it.
//
// Adding a new prompt:
//   1. Append a key/value pair below.
//   2. Optionally surface it in the AIAssistant's chip strip by adding
//      its id to QUICK_ACTION_CHIP_IDS.

export type ContextualPromptId =
  | 'explain-this-chart'
  | 'why-this-price'
  | 'what-does-this-mean-for-me'
  | 'related-concepts'
  | 'historical-context'
  | 'next-action';

export const CONTEXTUAL_PROMPTS: Record<ContextualPromptId, string> = {
  'explain-this-chart':
    'Explain what this chart shows and what the key signal is.',
  'why-this-price':
    'Why is the price at this level right now? What factors are driving it?',
  'what-does-this-mean-for-me':
    'Given my profile and what I see on screen, what should I be paying attention to?',
  'related-concepts':
    'What Alexandria concepts are most relevant to understanding what I see right now?',
  'historical-context':
    'How does what I see right now compare to historical patterns?',
  'next-action':
    'Based on what I see, what would be a reasonable next action?',
};

/**
 * Short labels for each prompt — these go on the chip itself. Kept
 * separate from the prompt text so the chip can stay terse while the
 * outgoing message remains a complete question.
 */
export const CONTEXTUAL_PROMPT_LABELS: Record<ContextualPromptId, string> = {
  'explain-this-chart':       'Explain this',
  'why-this-price':           'Why this price?',
  'what-does-this-mean-for-me': "What's relevant?",
  'related-concepts':         'Related concepts',
  'historical-context':       'Historical context',
  'next-action':              'Next action',
};

/**
 * Default chip strip shown in the AIAssistant input area. Trimmed to four
 * to keep the strip from wrapping on the 360-wide panel.
 */
export const QUICK_ACTION_CHIP_IDS: ContextualPromptId[] = [
  'explain-this-chart',
  'why-this-price',
  'related-concepts',
  'next-action',
];

export function promptForId(id: ContextualPromptId): string {
  return CONTEXTUAL_PROMPTS[id];
}

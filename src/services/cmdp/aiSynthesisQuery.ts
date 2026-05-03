// CONDUIT Wave 3 — AI synthesis query.
//
// Wraps ORACLE's `streamChat` proxy with a synthesis prompt: the user
// highlighted a term while looking at a specific surface. Produce a
// short, terminal-voice answer to "what is this, why does it matter
// here, what's the one number to know now."
//
// Returns a single `ai-synthesis` result. Always lands last in the
// resolver fan-out (the LLM round-trip is the slowest step).

import { streamChat, type ChatMessage } from '@/services/anthropic';
import { labelForSurface } from '@/services/aiContext';
import type { CmdPQuery, CmdPResult } from '@/lib/types/cmdp';

const MAX_TOKENS = 220;

const SYSTEM_PROMPT = `You are GridAlpha's terminal-voice synthesis engine.

When the user highlights a term and presses Cmd+P, you produce a 2-3
sentence synthesis. Voice rules:
- Terminal voice. No fluff, no hedging, no marketing language.
- Be precise about PJM market mechanics. Use canonical units ($/MWh,
  MW, MWh, gCO₂/kWh).
- Never fabricate live numbers. If you don't have a value, name the
  metric in general terms.
- Three sentences answers exactly:
  1. What this term/concept is.
  2. Why it matters for what the user is looking at.
  3. The one number or fact they should know right now (or, if no
     specific number is appropriate, the rule of thumb).
- Plain prose. No bullets, no Markdown headings, no emojis.`;

export async function aiSynthesisQuery(
  query: CmdPQuery,
): Promise<CmdPResult[]> {
  const text = query.rawText.trim();
  if (!text) return [];

  const surface = query.contextSnapshot.surface;
  const user = query.contextSnapshot.user;

  const surfaceLabel = surface.surfaceLabel || labelForSurface(surface.surface);
  const profile = user.profile ?? 'general user';
  const zone =
    surface.selectedZone ?? user.selectedZone ?? 'no zone selected';

  const userMessage = `The user highlighted "${text}" while looking at the ${surfaceLabel} surface.

Their profile is: ${profile}.
Their selected zone is: ${zone}.
Active item / context: ${describeActiveItem(query) ?? 'none'}.

Produce a 2-3 sentence synthesis following your voice rules.`;

  const messages: ChatMessage[] = [
    { role: 'user', content: userMessage },
  ];

  let collected = '';
  try {
    for await (const chunk of streamChat(messages, '', {
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: MAX_TOKENS,
      disableSimulatedStream: true,
    })) {
      if (chunk.type === 'text' && chunk.text) {
        collected += chunk.text;
      } else if (chunk.type === 'error') {
        return [errorResult(text, chunk.error ?? 'Synthesis failed.')];
      } else if (chunk.type === 'done') {
        break;
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return [errorResult(text, msg)];
  }

  const trimmed = collected.trim();
  if (!trimmed) {
    return [errorResult(text, 'Synthesis returned no content.')];
  }

  return [
    {
      category: 'ai-synthesis',
      id: `synthesis:${hashKey(text + surfaceLabel)}`,
      title: `Synthesis · "${truncate(text, 48)}"`,
      excerpt: trimmed,
      relevance: 0.5,
      metadata: {
        surface: surface.surface,
        surfaceLabel,
        zone,
        profile: String(profile ?? ''),
      },
    },
  ];
}

function describeActiveItem(query: CmdPQuery): string | null {
  const s = query.contextSnapshot.surface;
  if (s.currentItemTitle) {
    return s.currentLayer
      ? `${s.currentItemTitle} (layer ${s.currentLayer})`
      : s.currentItemTitle;
  }
  if (s.selectedTab) return `tab: ${s.selectedTab}`;
  return null;
}

function errorResult(_text: string, message: string): CmdPResult {
  return {
    category: 'ai-synthesis',
    id: `synthesis-error:${Date.now()}`,
    title: 'Synthesis unavailable',
    excerpt: message,
    relevance: 0.1,
    metadata: { error: 'true' },
  };
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function hashKey(s: string): string {
  // Cheap, stable per-string id — used as a React key, not a security
  // primitive. djb2.
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

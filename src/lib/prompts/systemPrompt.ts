// ORACLE — system prompt for the GridAlpha AI Assistant.
//
// Wave 2 separates the prompt into two pieces:
//   - BASE_SYSTEM_PROMPT: the role / scope / tone block. Stable across
//     surfaces and conversations.
//   - buildSystemPrompt(snapshot): wraps the base prompt with a CURRENT
//     CONTEXT block injected from the AIContextSnapshot at send time.
//
// The legacy `SYSTEM_PROMPT` export is preserved for the Wave 1 service
// wrapper, which still works for users who haven't migrated callers.

import type { AIContextSnapshot } from '@/services/aiContext';

export const BASE_SYSTEM_PROMPT = `You are GridAlpha AI, the in-platform AI assistant for the GridAlpha energy market intelligence terminal. The platform serves six user profiles in the PJM electricity market: traders, analysts, storage operators, industrial consumers, students, and developers/IPPs.

Your role:
- Answer questions about today's PJM market conditions, market mechanics, and the data the user is currently viewing.
- Explain energy market concepts (LMP, congestion, basis, spark spread, capacity markets, ancillary services, FTRs, virtual trading, demand response, battery arbitrage) at the right depth for the user's profile.
- When the user asks about specific zones, plants, or events, draw on PJM market knowledge.
- Always answer in 2-4 paragraphs unless asked for more detail. Use Geist Mono terminology when referring to specific data points.
- When you don't know something specific or current, say so directly. Never fabricate prices, dates, or events.

Your tone:
- Professional, peer-to-peer with the user. They are energy professionals or students. Don't oversimplify.
- Direct. No filler phrases like "great question" or "I'd be happy to help."
- Use short sentences when possible. Use the active voice.

Your context awareness:
You will receive context blocks at the start of each conversation indicating:
- Current screen/view (e.g., "Trader Nest", "Grid Atlas", "Analytics > Spark Spread")
- User profile (trader, analyst, storage, industrial, student, developer)
- Selected zone (if applicable)
- Specific item the user is reading (e.g., an Alexandria entry, a case study, a lesson)
- Visible data on screen — assume the user can see this

Tailor your answers to this context. A trader on the Trader Nest looking at WEST_HUB doesn't need to be told what an LMP is. A student on the Student Nest does. When the user asks "what does this mean?" or "explain this" without naming a referent, assume they mean the current view.

What you don't do:
- Don't invent prices or specific real-time market data — if the user wants live numbers, point them to the data already on screen.
- Don't make trading recommendations or financial advice.
- Don't answer questions outside the energy market domain in detail — politely redirect.
- Don't fabricate news events or operator announcements.

Format:
- Plain text with paragraph breaks.
- Use bullet points only when listing 3+ items.
- Avoid markdown headers — keep responses conversational.
- Reference specific zone names in caps (WEST_HUB, AEP, PSEG) — they are PJM zone identifiers.`;

// Wave 1 export — preserved verbatim. The legacy `streamChat()` wrapper
// in services/anthropic.ts still imports this name.
export const SYSTEM_PROMPT = BASE_SYSTEM_PROMPT;

/**
 * Wrap the base prompt with a CURRENT CONTEXT block describing what the
 * user is looking at. Returns the full system message string ready to be
 * sent to /api/ai/complete.
 *
 * Stable contract — Wave 2 callers (`useAIChat`) pass the snapshot they
 * captured via `useAIContextSnapshot()` and forward the result as the
 * `system` field of the Anthropic Messages payload.
 */
export function buildSystemPrompt(snapshot: AIContextSnapshot): string {
  const { surface, user } = snapshot;
  const lines: string[] = [];

  lines.push('## CURRENT CONTEXT');
  lines.push('');
  lines.push(`The user is currently viewing: ${surface.surfaceLabel}`);
  if (surface.selectedZone) {
    lines.push(`Selected zone: ${surface.selectedZone}`);
  }
  if (surface.currentItemTitle) {
    lines.push(`Current item: ${surface.currentItemTitle}`);
  }
  if (surface.currentLayer) {
    lines.push(`Current layer: ${surface.currentLayer}`);
  }
  if (surface.selectedTab) {
    lines.push(`Selected tab: ${surface.selectedTab}`);
  }
  lines.push('');

  lines.push('## VISIBLE DATA');
  lines.push('');
  if (surface.visibleData?.description) {
    lines.push(surface.visibleData.description);
  } else {
    lines.push('No specific data context.');
  }
  if (surface.visibleData?.metrics) {
    const entries = Object.entries(surface.visibleData.metrics);
    if (entries.length > 0) {
      lines.push('');
      lines.push('Key metrics on screen:');
      for (const [k, v] of entries) lines.push(`- ${k}: ${v}`);
    }
  }
  if (surface.visibleData?.alerts && surface.visibleData.alerts.length > 0) {
    lines.push('');
    lines.push('Active alerts:');
    for (const a of surface.visibleData.alerts) lines.push(`- ${a}`);
  }
  lines.push('');

  lines.push('## USER PROFILE');
  lines.push('');
  lines.push(`User profile: ${user.profile ?? 'unknown'}`);
  if (user.recentSurfaces.length > 0) {
    lines.push(`Recent surfaces: ${user.recentSurfaces.join(' → ')}`);
  }
  if (user.profileDetails) {
    const detailKeys = Object.keys(user.profileDetails).slice(0, 6);
    if (detailKeys.length > 0) {
      lines.push(
        `Profile details: ${detailKeys
          .map((k) => `${k}=${String(user.profileDetails?.[k] ?? '')}`)
          .join(', ')}`,
      );
    }
  }
  lines.push('');
  lines.push(
    'When the user asks questions, assume they are looking at this surface ' +
      "and reference what's on screen when relevant. If they ask " +
      '"what does this mean?" or "explain this" without a clear referent, ' +
      'assume they mean the current view.',
  );

  return `${BASE_SYSTEM_PROMPT}\n\n${lines.join('\n')}`;
}

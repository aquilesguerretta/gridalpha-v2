// FORGE — Trade Journal review prompt generator.
// Pure heuristic pattern detection over the trader's journal entries.
// Surfaces consistency, opportunity, reflection, and weekday-pattern
// prompts the trader should consider in their weekly review.

import type { JournalEntry, ReviewPrompt } from '@/lib/types/journal';

export interface GeneratorOptions {
  /** ISO date — generate prompts as if today is this date. Defaults to actual today. */
  asOf?: string;
  /** How far back to look for patterns. Defaults to 30 days. */
  windowDays?: number;
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function generateReviewPrompts(
  entries: JournalEntry[],
  options: GeneratorOptions = {},
): ReviewPrompt[] {
  const asOf = options.asOf ?? new Date().toISOString();
  const windowDays = options.windowDays ?? 30;
  const windowStart = new Date(
    new Date(asOf).getTime() - windowDays * 86400000,
  ).toISOString();

  const recent = entries.filter((e) => e.createdAt >= windowStart);
  const prompts: ReviewPrompt[] = [];

  // Consistency prompt: same zone, 3+ entries, mixed W/L
  const zoneCounts = new Map<string, JournalEntry[]>();
  for (const e of recent) {
    for (const z of e.zones) {
      const list = zoneCounts.get(z) ?? [];
      list.push(e);
      zoneCounts.set(z, list);
    }
  }
  for (const [zone, zoneEntries] of zoneCounts.entries()) {
    if (zoneEntries.length >= 3) {
      const wins = zoneEntries.filter((e) => (e.pnl ?? 0) > 0).length;
      const losses = zoneEntries.filter((e) => (e.pnl ?? 0) < 0).length;
      if (wins > 0 && losses > 0) {
        prompts.push({
          id: `prompt_zone_${zone}_${Date.now()}`,
          type: 'consistency',
          question: `You traded ${zone} ${zoneEntries.length} times in the past ${windowDays} days with mixed results (${wins}W / ${losses}L). What did the winners share that the losers didn't?`,
          relatedEntryIds: zoneEntries.map((e) => e.id),
          generatedAt: asOf,
        });
      }
    }
  }

  // Tag pattern prompt: same tag, 5+ entries
  const tagCounts = new Map<string, JournalEntry[]>();
  for (const e of recent) {
    for (const t of e.tags) {
      const list = tagCounts.get(t) ?? [];
      list.push(e);
      tagCounts.set(t, list);
    }
  }
  for (const [tag, tagEntries] of tagCounts.entries()) {
    if (tagEntries.length >= 5) {
      prompts.push({
        id: `prompt_tag_${tag}_${Date.now()}`,
        type: 'opportunity',
        question: `You've logged ${tagEntries.length} entries tagged '${tag}' in the past ${windowDays} days. Are you systematically looking for these, or is the market pushing them at you?`,
        relatedEntryIds: tagEntries.map((e) => e.id),
        generatedAt: asOf,
      });
    }
  }

  // Unreviewed reflection prompt: entries unreviewed for 7+ days
  const sevenDaysAgo = new Date(
    new Date(asOf).getTime() - 7 * 86400000,
  ).toISOString();
  for (const e of recent) {
    if (!e.reviewed && e.createdAt < sevenDaysAgo) {
      prompts.push({
        id: `prompt_review_${e.id}`,
        type: 'reflection',
        question: `You haven't reviewed your entry from ${e.tradingDate}: "${e.title}". What did you learn?`,
        relatedEntryIds: [e.id],
        generatedAt: asOf,
      });
    }
  }

  // Weekday pattern prompt: heuristic average P&L by day of week
  const dowPnl: Record<
    number,
    { wins: number; losses: number; total: number }
  > = {};
  for (const e of recent) {
    if (e.pnl == null) continue;
    const dow = new Date(e.tradingDate).getDay();
    const stats = dowPnl[dow] ?? { wins: 0, losses: 0, total: 0 };
    if (e.pnl > 0) stats.wins += 1;
    else if (e.pnl < 0) stats.losses += 1;
    stats.total += e.pnl;
    dowPnl[dow] = stats;
  }
  for (const [dowStr, stats] of Object.entries(dowPnl)) {
    const dow = Number(dowStr);
    const totalEntries = stats.wins + stats.losses;
    if (totalEntries < 4) continue;
    if (stats.total < 0 && stats.losses > stats.wins) {
      const dayEntries = recent.filter(
        (e) => new Date(e.tradingDate).getDay() === dow,
      );
      prompts.push({
        id: `prompt_dow_${dow}_${Date.now()}`,
        type: 'pattern',
        question: `Your ${DAY_NAMES[dow]} trades have been less profitable on average (${stats.losses}L vs ${stats.wins}W in the past ${windowDays} days). What's the common factor?`,
        relatedEntryIds: dayEntries.map((e) => e.id),
        generatedAt: asOf,
      });
    }
  }

  return prompts;
}

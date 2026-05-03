// CONDUIT Wave 3 — Peregrine query service.
//
// Search the live news feed (passed in by the orchestration layer,
// since services are pure functions and hooks can't be called from
// here) for articles whose headline or summary contains the query
// term. Score by recency × keyword density, return the top 5.
//
// Result category: `peregrine-article`. Click → routes to the
// PeregrineFullPage with the article id in the search params so the
// destination can scroll/focus the right item.

import type { NewsItem } from '@/hooks/useNewsData';
import type { CmdPQuery, CmdPResult } from '@/lib/types/cmdp';

const MAX_RESULTS = 5;
const MS_PER_HOUR = 1000 * 60 * 60;

export interface PeregrineQueryDataSource {
  /** Live news items pulled by the orchestration layer. May be empty if
   *  the news API hasn't returned yet — service handles the empty case. */
  newsItems: NewsItem[];
}

export async function peregrineQuery(
  query: CmdPQuery,
  data: PeregrineQueryDataSource,
): Promise<CmdPResult[]> {
  const text = normalize(query.rawText);
  if (!text) return [];

  const now = Date.now();

  const scored = data.newsItems
    .map((item) => ({ item, score: scoreItem(item, text, now) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);

  return scored.map(({ item, score }) => ({
    category: 'peregrine-article',
    id: `peregrine:${item.id}`,
    title: item.title,
    excerpt: item.summary,
    href: `/peregrine?article=${encodeURIComponent(item.id)}`,
    relevance: clamp(score, 0, 0.85),
    metadata: {
      source: item.source,
      sourceFull: item.sourceFull,
      timeAgo: item.timeAgo,
      category: item.category,
      contentType: item.contentType,
    },
  }));
}

function scoreItem(item: NewsItem, queryText: string, now: number): number {
  const haystack = normalize(`${item.title} ${item.summary} ${item.category}`);
  const queryTokens = tokenize(queryText);
  if (queryTokens.length === 0) return 0;

  // Density: fraction of query tokens that appear in haystack.
  let hits = 0;
  for (const tok of queryTokens) {
    if (haystack.includes(tok)) hits++;
  }
  const density = hits / queryTokens.length;
  if (density === 0) return 0;

  // Title bonus: a token matched in the title weighs more.
  const titleNorm = normalize(item.title);
  const titleHit = queryTokens.some((t) => titleNorm.includes(t));
  const titleBoost = titleHit ? 0.25 : 0;

  // Recency decay: linear from 1.0 (just now) to 0.4 (>=72h old).
  const ageHours = ageInHours(item.publishedAt, now);
  const recency =
    ageHours <= 0 ? 1 : Math.max(0.4, 1 - ageHours / 72);

  // Combine: 0.6 weight on density+title, 0.4 weight on recency.
  return (density + titleBoost) * 0.6 + recency * 0.4;
}

function ageInHours(iso: string, now: number): number {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return 999;
  return Math.max(0, (now - t) / MS_PER_HOUR);
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s$%-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(s: string): string[] {
  // Drop noise words; keep multi-token phrases by also matching the
  // full normalized string.
  const STOP = new Set([
    'the', 'a', 'an', 'of', 'in', 'on', 'and', 'to', 'for', 'is', 'it',
    'this', 'that', 'with', 'as', 'be', 'by', 'or', 'at',
  ]);
  return s.split(/\s+/).filter((t) => t.length >= 2 && !STOP.has(t));
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

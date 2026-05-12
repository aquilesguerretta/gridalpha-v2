// CONDUIT Wave 3 — Vault case-study query service.
//
// Match the user's selected text against case-study titles, headlines,
// summaries, and the full prose ("what happened"/"why it happened"/
// "trading implication"). Score by where the match landed: title hits
// rank highest, headline next, prose lowest.
//
// Result category: `vault-case-study`. Click → routes to the case
// study at `/vault/<id>`.

import { CASE_STUDIES } from '@/lib/mock/vault-mock';
import type { CaseStudy } from '@/lib/types/vault';
import type { CmdPQuery, CmdPResult } from '@/lib/types/cmdp';

const MAX_RESULTS = 4;

// Tunable per-field weights. Title hits dominate; the long-form
// "what happened" body is the weakest signal.
const FIELD_WEIGHT = {
  title: 1.0,
  headline: 0.7,
  category: 0.5,
  region: 0.4,
  body: 0.25,
} as const;

export async function vaultQuery(query: CmdPQuery): Promise<CmdPResult[]> {
  const text = normalize(query.rawText);
  if (!text) return [];

  const tokens = tokenize(text);
  if (tokens.length === 0) return [];

  const scored = CASE_STUDIES.map((study) => ({
    study,
    score: scoreStudy(study, text, tokens),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);

  return scored.map(({ study, score }) => ({
    category: 'vault-case-study',
    id: `vault:${study.id}`,
    title: study.title,
    excerpt: study.headline,
    href: `/vault/${study.id}`,
    relevance: clamp(score, 0, 0.85),
    metadata: {
      studyId: study.id,
      date: study.date,
      region: study.region,
      severity: study.severity,
      category: study.category,
    },
  }));
}

function scoreStudy(study: CaseStudy, fullText: string, tokens: string[]): number {
  const fields: Array<{ value: string; weight: number }> = [
    { value: study.title,    weight: FIELD_WEIGHT.title },
    { value: study.headline, weight: FIELD_WEIGHT.headline },
    { value: study.category, weight: FIELD_WEIGHT.category },
    { value: study.region,   weight: FIELD_WEIGHT.region },
    { value:
        `${study.whatHappened} ${study.whyItHappened} ${study.tradingImplication}`,
      weight: FIELD_WEIGHT.body,
    },
  ];

  let total = 0;
  for (const { value, weight } of fields) {
    const norm = normalize(value);
    // Whole-phrase match scores high; per-token density fills in.
    const wholePhraseHit = norm.includes(fullText);
    const density = tokens.filter((t) => norm.includes(t)).length / tokens.length;
    if (wholePhraseHit) total += weight;
    else total += density * weight;
  }
  return total;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(s: string): string[] {
  const STOP = new Set([
    'the', 'a', 'an', 'of', 'in', 'on', 'and', 'to', 'for', 'is', 'it',
    'this', 'that', 'with', 'as', 'be', 'by', 'or', 'at',
  ]);
  return s.split(/\s+/).filter((t) => t.length >= 2 && !STOP.has(t));
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

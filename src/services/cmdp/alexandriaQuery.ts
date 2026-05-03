// CONDUIT Wave 3 — Alexandria query service.
//
// Match the user's selected text against SCRIBE's `CROSS_LINK_MAP` to
// surface the canonical Alexandria entry (or Lesson) for the term.
// Whole-word matching, case-insensitive, longest-term-wins (so
// "second law of thermodynamics" beats "second law").
//
// Result categories returned: `alexandria-entry`. Each result links to
// the entry route at `/vault/alexandria/entry/<slug>`.

import { CROSS_LINK_MAP } from '@/lib/curriculum/crossLinkMap';
import { getEntry } from '@/lib/curriculum/entriesIndex';
import { getLesson } from '@/lib/curriculum/index';
import type { CmdPQuery, CmdPResult } from '@/lib/types/cmdp';

const MAX_RESULTS = 5;

export async function alexandriaQuery(
  query: CmdPQuery,
): Promise<CmdPResult[]> {
  const text = query.rawText;
  if (!text) return [];

  // Sort terms longest-first so multi-word matches win against shorter
  // substrings (mirrors ORACLE's relatedConcepts pattern).
  const terms = Object.keys(CROSS_LINK_MAP).sort(
    (a, b) => b.length - a.length,
  );

  const seenSlug = new Set<string>();
  const results: CmdPResult[] = [];

  for (const term of terms) {
    if (results.length >= MAX_RESULTS) break;
    const slug = CROSS_LINK_MAP[term];
    if (seenSlug.has(slug)) continue;

    if (!matchesWord(text, term)) continue;

    const entry = getEntry(slug);
    if (entry) {
      seenSlug.add(slug);
      results.push({
        category: 'alexandria-entry',
        id: `alexandria:${slug}`,
        title: entry.title,
        excerpt: entry.thresholdConcept,
        href: `/vault/alexandria/entry/${slug}?layer=L1`,
        relevance: relevanceFor(text, term, /* exact */ true),
        metadata: {
          slug,
          term,
          tier: 'foundation',
          kind: 'entry',
        },
      });
      continue;
    }

    // Fall back to the original-format Lesson registry — a few
    // canonical terms map there instead of an Entry.
    const lesson = getLesson(slug);
    if (lesson) {
      seenSlug.add(slug);
      results.push({
        category: 'alexandria-entry',
        id: `alexandria-lesson:${slug}`,
        title: lesson.title,
        excerpt: lesson.identity,
        href: `/vault/alexandria/lesson/${slug}`,
        relevance: relevanceFor(text, term, true),
        metadata: {
          slug,
          term,
          difficulty: lesson.difficulty,
          kind: 'lesson',
        },
      });
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance);
}

/** Whole-word, case-insensitive containment. Spaces inside `term`
 *  match literally. */
function matchesWord(haystack: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z])`, 'i');
  return re.test(haystack);
}

/**
 * Score a match. Exact full-text equality is 1.0; the term being a
 * sub-portion of the selection scales by length ratio so short terms
 * inside long selections rank below tighter matches.
 */
function relevanceFor(text: string, term: string, exact: boolean): number {
  if (!exact) return 0.5;
  const normText = text.trim().toLowerCase();
  const normTerm = term.toLowerCase();
  if (normText === normTerm) return 1.0;
  // Coverage = term length / selection length, clamped to [0.6, 0.95]
  const coverage = normTerm.length / Math.max(1, normText.length);
  return Math.max(0.6, Math.min(0.95, 0.6 + coverage * 0.4));
}

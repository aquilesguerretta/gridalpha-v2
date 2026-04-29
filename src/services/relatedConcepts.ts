// ORACLE Wave 2 — response enrichment.
//
// Scans an assistant message for canonical Alexandria concept terms and
// returns the matched terms paired with their entry slug. The AIAssistant
// renders these as Links below the message on Vault surfaces — turning
// the assistant from a chatbot into a study guide.
//
// Source of truth is SCRIBE's CROSS_LINK_MAP. If SCRIBE adds new terms,
// the enrichment picks them up automatically.

import { CROSS_LINK_MAP } from '@/lib/curriculum/crossLinkMap';
import type { SurfaceKey } from './aiContext';

// Surfaces where the related-concepts footer is shown. Restricted to the
// Vault destination so we don't clutter every AI response in the platform.
const VAULT_SURFACES: SurfaceKey[] = [
  'vault-index',
  'vault-alexandria',
  'vault-lesson',
  'vault-entry',
  'vault-case-study',
];

export function isVaultSurface(surface: SurfaceKey): boolean {
  return VAULT_SURFACES.includes(surface);
}

export interface RelatedConcept {
  /** The canonical term as it appears in the cross-link map (lowercase). */
  term: string;
  /** Entry slug — pairs with `/vault/alexandria/entry/<slug>`. */
  slug: string;
}

/**
 * Find canonical terms in `text` that map to Alexandria entries. Matches
 * are case-insensitive but whole-word — "joule" matches "Joule" but not
 * "Joules" or "joules" (a deliberate trade-off, the term list lives in
 * crossLinkMap and SCRIBE owns its plurals).
 *
 * Returns each unique slug at most once, even if the underlying term
 * appears multiple times. Result order matches first-occurrence in the
 * source text.
 */
export function extractRelatedConcepts(
  text: string,
  excludeSlug?: string,
): RelatedConcept[] {
  if (!text) return [];

  const terms = Object.keys(CROSS_LINK_MAP).sort(
    (a, b) => b.length - a.length, // longest first → "second law of thermodynamics" wins over "second law"
  );

  const seen = new Set<string>();
  const found: { idx: number; term: string; slug: string }[] = [];

  for (const term of terms) {
    const slug = CROSS_LINK_MAP[term];
    if (!slug || seen.has(slug)) continue;
    if (excludeSlug && slug === excludeSlug) continue;

    // Whole-word match, case-insensitive. The lookbehind/lookahead bracket
    // ensures we don't match inside another word (e.g. "joulebar"). Spaces
    // inside the term itself are matched literally.
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z])`, 'i');
    const m = re.exec(text);
    if (m) {
      seen.add(slug);
      found.push({ idx: m.index, term, slug });
    }
  }

  // Sort by first-occurrence so the footer reads in the order the model
  // mentioned the concepts.
  found.sort((a, b) => a.idx - b.idx);

  return found.map(({ term, slug }) => ({ term, slug }));
}

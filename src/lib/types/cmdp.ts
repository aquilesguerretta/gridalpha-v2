// CONDUIT Wave 3 — Cmd+P contextual intelligence type system.
//
// Cmd+P turns a highlighted term + the current ORACLE surface snapshot
// into a fan-out query that resolves Alexandria entries, Vault case
// studies, Peregrine articles, live data points, and an AI synthesis
// paragraph. Each result category resolves independently and renders
// progressively in the drawer.

import type { AIContextSnapshot } from '@/services/aiContext';

// ─── Query ──────────────────────────────────────────────────────────

/**
 * The unit of work the resolver consumes. `rawText` comes either from
 * the user's text selection (`triggeredFrom: 'selection'`) or from the
 * drawer's "REFINE QUERY" input (`triggeredFrom: 'manual'`).
 *
 * `contextSnapshot` is captured at query time so even if the user
 * navigates while results are streaming, the ranking and AI synthesis
 * stay anchored to where the question was asked from.
 */
export interface CmdPQuery {
  rawText: string;
  contextSnapshot: AIContextSnapshot;
  triggeredFrom: 'selection' | 'manual';
}

// ─── Results ────────────────────────────────────────────────────────

export type ResultCategory =
  | 'alexandria-entry'
  | 'peregrine-article'
  | 'vault-case-study'
  | 'live-data-point'
  | 'ai-synthesis'
  | 'related-zone'
  | 'related-asset';

/** All result categories in a stable order, used by the drawer. */
export const RESULT_CATEGORIES: ResultCategory[] = [
  'ai-synthesis',
  'live-data-point',
  'alexandria-entry',
  'vault-case-study',
  'peregrine-article',
  'related-zone',
  'related-asset',
];

/** Human-readable section headers for the drawer. */
export const CATEGORY_LABELS: Record<ResultCategory, string> = {
  'ai-synthesis':       'SYNTHESIS',
  'live-data-point':    'LIVE DATA',
  'alexandria-entry':   'ALEXANDRIA',
  'vault-case-study':   'CASE STUDIES',
  'peregrine-article':  'PEREGRINE',
  'related-zone':       'RELATED ZONES',
  'related-asset':      'RELATED ASSETS',
};

export interface CmdPResult {
  /** Category bucket for the section header in the drawer. */
  category: ResultCategory;
  /** Stable id within the category — used as React key. */
  id: string;
  /** Primary headline rendered in the row. */
  title: string;
  /** Optional snippet — 1–3 lines of supporting context. */
  excerpt?: string;
  /** If set, clicking the row routes here. */
  href?: string;
  /** Alternative click handler when no href fits (e.g. open AIAssistant). */
  action?: () => void;
  /** 0..1 used for ordering within a category. Higher = more relevant. */
  relevance: number;
  /** Free-form tags for category-specific rendering hints. Keys/values
   *  are conventionally documented in the consumer (CmdPResultItem). */
  metadata?: Record<string, string>;
}

/** Resolver progress state. */
export interface CmdPResultSet {
  query: CmdPQuery;
  groups: Record<ResultCategory, CmdPResult[]>;
  /** Per-category loading: `true` until that category's resolver returns. */
  isLoading: Record<ResultCategory, boolean>;
}

/** Empty-but-shaped result set. */
export function emptyResultSet(query: CmdPQuery): CmdPResultSet {
  const groups = {} as Record<ResultCategory, CmdPResult[]>;
  const isLoading = {} as Record<ResultCategory, boolean>;
  for (const c of RESULT_CATEGORIES) {
    groups[c] = [];
    isLoading[c] = true;
  }
  return { query, groups, isLoading };
}

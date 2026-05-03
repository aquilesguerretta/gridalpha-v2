// CONDUIT Wave 3 — Cmd+P query resolver.
//
// Fan out a single CmdPQuery to every per-category service in parallel
// and emit results progressively via `onPartialResult` as each one
// returns. The drawer renders skeleton sections until each category
// reports back.
//
// Categories without a registered resolver in `RESOLVER_REGISTRY`
// (currently: `related-zone`, `related-asset`) are reported empty
// and not-loading immediately, so the drawer doesn't show stale
// skeletons for them.

import type {
  CmdPQuery,
  CmdPResult,
  ResultCategory,
} from '@/lib/types/cmdp';
import { RESULT_CATEGORIES } from '@/lib/types/cmdp';
import type { NewsItem } from '@/hooks/useNewsData';
import { alexandriaQuery } from './alexandriaQuery';
import { vaultQuery } from './vaultQuery';
import { peregrineQuery } from './peregrineQuery';
import { dataPointQuery } from './dataPointQuery';
import { aiSynthesisQuery } from './aiSynthesisQuery';

/** Live data sources the resolver threads to per-category services
 *  that can't otherwise reach React-side state. */
export interface QueryDataSources {
  newsItems: NewsItem[];
}

/** Callback invoked once per category as that category resolves. */
export type OnPartialResult = (
  category: ResultCategory,
  results: CmdPResult[],
) => void;

/** Optional control surface — abort signal so the orchestration layer
 *  can cancel an in-flight resolution when the query changes. */
export interface ResolveOptions {
  signal?: AbortSignal;
}

type CategoryResolver = (
  query: CmdPQuery,
  data: QueryDataSources,
) => Promise<CmdPResult[]>;

const RESOLVER_REGISTRY: Partial<Record<ResultCategory, CategoryResolver>> = {
  'alexandria-entry': (q) => alexandriaQuery(q),
  'vault-case-study': (q) => vaultQuery(q),
  'live-data-point':  (q) => dataPointQuery(q),
  'peregrine-article': (q, data) => peregrineQuery(q, data),
  'ai-synthesis':     (q) => aiSynthesisQuery(q),
  // related-zone / related-asset: no V1 resolver — reported empty below.
};

/**
 * Resolve all categories in parallel, calling `onPartialResult` once
 * per category as it completes. Categories that don't have a registered
 * resolver report empty arrays immediately so the drawer can mark them
 * not-loading.
 *
 * Resolves the returned promise once every category has reported.
 */
export async function resolveQuery(
  query: CmdPQuery,
  data: QueryDataSources,
  onPartialResult: OnPartialResult,
  options: ResolveOptions = {},
): Promise<void> {
  // Categories without a resolver: report empty immediately.
  for (const category of RESULT_CATEGORIES) {
    if (!RESOLVER_REGISTRY[category]) {
      onPartialResult(category, []);
    }
  }

  const tasks: Promise<void>[] = [];
  for (const category of RESULT_CATEGORIES) {
    const fn = RESOLVER_REGISTRY[category];
    if (!fn) continue;
    tasks.push(
      runCategory(category, fn, query, data, onPartialResult, options.signal),
    );
  }
  await Promise.all(tasks);
}

async function runCategory(
  category: ResultCategory,
  fn: CategoryResolver,
  query: CmdPQuery,
  data: QueryDataSources,
  onPartialResult: OnPartialResult,
  signal: AbortSignal | undefined,
): Promise<void> {
  try {
    const results = await fn(query, data);
    if (signal?.aborted) return;
    onPartialResult(category, results);
  } catch (err) {
    if (signal?.aborted) return;
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error(`[CONDUIT cmdp] resolver "${category}" failed:`, err);
    }
    onPartialResult(category, []);
  }
}

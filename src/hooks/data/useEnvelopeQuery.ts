// FORGE Wave 4 — Shared envelope-query primitive.
// Every Wave-4 data hook returns the same shape:
//   { data, isLoading, error, ageSeconds, isStale, refresh, summary }
// This hook does the fetch, computes age + staleness against a
// per-endpoint threshold, and exposes a refresh() so callers can
// force-refetch (e.g. after a SSE outage event).

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiEnvelope } from '@/lib/types/api';
import { MOCK_MODE, envelopeAgeSeconds } from '@/services/api/client';

export interface EnvelopeQueryState<TData> {
  data: TData | null;
  isLoading: boolean;
  error: Error | null;
  ageSeconds: number;
  isStale: boolean;
  summary: string | null;
  /** Force a re-fetch. Returns the new data on success, throws on error. */
  refresh: () => Promise<TData | null>;
}

export interface EnvelopeQueryOptions<TData> {
  /** Live fetcher — called when MOCK_MODE is false. */
  fetcher: (signal: AbortSignal) => Promise<ApiEnvelope<TData>>;
  /** Mock producer — called when MOCK_MODE is true. Sync to keep hooks snappy. */
  mockProducer: () => ApiEnvelope<TData>;
  /** Stale threshold in seconds. Older responses set `isStale = true`. */
  staleSeconds: number;
  /**
   * Re-fetch interval in milliseconds. Set 0 / undefined to disable
   * polling — the hook still fetches once on mount.
   */
  pollMs?: number;
  /**
   * Dependency hash. When this string changes (e.g. selected zone), the
   * hook re-fetches. Pass a stable identity so hook order stays sane.
   */
  cacheKey: string;
}

export function useEnvelopeQuery<TData>(
  options: EnvelopeQueryOptions<TData>,
): EnvelopeQueryState<TData> {
  const { fetcher, mockProducer, staleSeconds, pollMs, cacheKey } = options;

  const [data, setData] = useState<TData | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [ageSeconds, setAgeSeconds] = useState<number>(0);

  // Keep latest fetcher/mock in a ref so re-renders don't churn the
  // effect dependency list when callers pass inline arrow functions.
  const fetcherRef = useRef(fetcher);
  const mockRef = useRef(mockProducer);
  fetcherRef.current = fetcher;
  mockRef.current = mockProducer;

  const fetchOnce = useCallback(async (): Promise<TData | null> => {
    const controller = new AbortController();
    try {
      let env: ApiEnvelope<TData>;
      if (MOCK_MODE) {
        env = mockRef.current();
      } else {
        env = await fetcherRef.current(controller.signal);
      }
      setData(env.data);
      setSummary(env.summary);
      setAgeSeconds(envelopeAgeSeconds(env));
      setError(null);
      setIsLoading(false);
      return env.data;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null;
      }
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return null;
    } finally {
      // controller already aborted by the abort hook above on unmount
    }
  }, []);

  // Mount-fetch + dependency-change refetch.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchOnce().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
    // cacheKey is the only dep we want to refire on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  // Poll if requested.
  useEffect(() => {
    if (!pollMs || pollMs <= 0) return;
    const interval = setInterval(() => {
      void fetchOnce();
    }, pollMs);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollMs, cacheKey]);

  // Tick the age counter every second locally so the stale badge
  // appears even when the server doesn't ship a fresh frame.
  useEffect(() => {
    if (data === null) return;
    const id = setInterval(() => {
      setAgeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [data]);

  const isStale = ageSeconds > staleSeconds;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    return await fetchOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnce]);

  return { data, isLoading, error, ageSeconds, isStale, summary, refresh };
}

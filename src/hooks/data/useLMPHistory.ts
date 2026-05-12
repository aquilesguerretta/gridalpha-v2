// FORGE Wave 4 — useLMPHistory(zone, start, end, interval?).

import { STALE_THRESHOLDS, type LMPHistoryData } from '@/lib/types/api';
import { fetchLMPHistory } from '@/services/api/lmp';
import { useEnvelopeQuery, type EnvelopeQueryState } from './useEnvelopeQuery';
import { mockLMPHistory } from './mocks';

export interface UseLMPHistoryArgs {
  zone: string | null;
  /** ISO-8601 timestamp. */
  start: string | null;
  /** ISO-8601 timestamp. */
  end: string | null;
  /** Default `'5min'`. */
  interval?: '5min' | 'hourly';
}

/**
 * Historical LMP for a date range. Range capped at 168 hours upstream;
 * caller should chunk longer windows. No polling — historical data
 * doesn't change.
 */
export function useLMPHistory(
  args: UseLMPHistoryArgs,
): EnvelopeQueryState<LMPHistoryData> {
  const { zone, start, end, interval = '5min' } = args;
  const enabled = Boolean(zone && start && end);
  return useEnvelopeQuery<LMPHistoryData>({
    cacheKey: `lmp-history:${zone ?? ''}:${start ?? ''}:${end ?? ''}:${interval}`,
    staleSeconds: STALE_THRESHOLDS.lmpHistory,
    pollMs: 0,
    fetcher: (signal) =>
      fetchLMPHistory(
        { zone: zone!, start: start!, end: end!, interval },
        { signal },
      ),
    mockProducer: () =>
      enabled
        ? mockLMPHistory(zone!, start!, end!, interval)
        : mockLMPHistory(
            'WEST_HUB',
            new Date(Date.now() - 24 * 3600_000).toISOString(),
            new Date().toISOString(),
            interval,
          ),
  });
}

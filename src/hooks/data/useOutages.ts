// FORGE Wave 4 — useOutages().

import { STALE_THRESHOLDS, type OutagesData } from '@/lib/types/api';
import { fetchOutages } from '@/services/api/outages';
import { useEnvelopeQuery, type EnvelopeQueryState } from './useEnvelopeQuery';
import { mockOutages } from './mocks';

/** Generator outage feed. Polls every 5 minutes. */
export function useOutages(): EnvelopeQueryState<OutagesData> {
  return useEnvelopeQuery<OutagesData>({
    cacheKey: 'outages',
    staleSeconds: STALE_THRESHOLDS.outages,
    pollMs: 5 * 60_000,
    fetcher: (signal) => fetchOutages({ signal }),
    mockProducer: () => mockOutages(),
  });
}

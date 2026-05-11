// FORGE Wave 4 — useLMP24h(zone): 24-hour LMP history for one zone.

import { STALE_THRESHOLDS, type LMP24hData } from '@/lib/types/api';
import { fetchLMP24h } from '@/services/api/lmp';
import { useEnvelopeQuery, type EnvelopeQueryState } from './useEnvelopeQuery';
import { mockLMP24h } from './mocks';

/**
 * 24-hour LMP history for one zone. Polls every 5 minutes since the
 * underlying data only refreshes every 5 minutes on the backend.
 */
export function useLMP24h(zone: string | null): EnvelopeQueryState<LMP24hData> {
  const effectiveZone = zone ?? '';
  return useEnvelopeQuery<LMP24hData>({
    cacheKey: `lmp-24h:${effectiveZone}`,
    staleSeconds: STALE_THRESHOLDS.lmp24h,
    pollMs: effectiveZone ? 5 * 60_000 : 0,
    fetcher: (signal) => fetchLMP24h(effectiveZone, { signal }),
    mockProducer: () => mockLMP24h(effectiveZone || 'WEST_HUB'),
  });
}

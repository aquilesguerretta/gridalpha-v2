// FORGE Wave 4 — useLMP(zone): real-time LMP for one zone.

import { STALE_THRESHOLDS, type LMPCurrentData } from '@/lib/types/api';
import { fetchLMPCurrent } from '@/services/api/lmp';
import { useEnvelopeQuery, type EnvelopeQueryState } from './useEnvelopeQuery';
import { mockLMPCurrent } from './mocks';

/**
 * Real-time LMP for the given zone. Polls every 60s. Pass an empty/null
 * zone string to disable (the hook still returns a stable shape so the
 * caller doesn't conditionally render hooks).
 */
export function useLMP(zone: string | null): EnvelopeQueryState<LMPCurrentData> {
  const effectiveZone = zone ?? '';
  return useEnvelopeQuery<LMPCurrentData>({
    cacheKey: `lmp:${effectiveZone}`,
    staleSeconds: STALE_THRESHOLDS.lmpCurrent,
    pollMs: effectiveZone ? 60_000 : 0,
    fetcher: (signal) => fetchLMPCurrent(effectiveZone, { signal }),
    mockProducer: () => mockLMPCurrent(effectiveZone || 'WEST_HUB'),
  });
}

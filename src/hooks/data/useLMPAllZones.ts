// FORGE Wave 4 — useLMPAllZones(): real-time LMP for all 20 zones.

import { STALE_THRESHOLDS, type LMPAllZonesData } from '@/lib/types/api';
import { fetchLMPAllZones } from '@/services/api/lmp';
import { useEnvelopeQuery, type EnvelopeQueryState } from './useEnvelopeQuery';
import { mockLMPAllZones } from './mocks';

/** Real-time LMP for all 20 PJM zones. Polls every 60s. */
export function useLMPAllZones(): EnvelopeQueryState<LMPAllZonesData> {
  return useEnvelopeQuery<LMPAllZonesData>({
    cacheKey: 'lmp-all-zones',
    staleSeconds: STALE_THRESHOLDS.lmpAllZones,
    pollMs: 60_000,
    fetcher: (signal) => fetchLMPAllZones({ signal }),
    mockProducer: () => mockLMPAllZones(),
  });
}

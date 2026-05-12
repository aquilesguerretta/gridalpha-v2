// FORGE Wave 4 — useAncillary(zone?).

import { STALE_THRESHOLDS, type AncillaryData } from '@/lib/types/api';
import { fetchAncillary } from '@/services/api/ancillary';
import { useEnvelopeQuery, type EnvelopeQueryState } from './useEnvelopeQuery';
import { mockAncillary } from './mocks';

/**
 * Ancillary services clearing prices (Reg-D / Reg-A / Spin / Mileage).
 * Drives the Storage DA Bid Optimizer's ancillary stacking.
 */
export function useAncillary(
  zone: string = 'all',
): EnvelopeQueryState<AncillaryData> {
  return useEnvelopeQuery<AncillaryData>({
    cacheKey: `ancillary:${zone}`,
    staleSeconds: STALE_THRESHOLDS.ancillary,
    pollMs: 5 * 60_000,
    fetcher: (signal) => fetchAncillary(zone, { signal }),
    mockProducer: () => mockAncillary(),
  });
}

// FORGE Wave 4 — useReserveMargin(zone?).

import { STALE_THRESHOLDS, type ReserveMarginData } from '@/lib/types/api';
import { fetchReserveMargin } from '@/services/api/reserveMargin';
import { useEnvelopeQuery, type EnvelopeQueryState } from './useEnvelopeQuery';
import { mockReserveMargin } from './mocks';

/** Reserve margin / resource adequacy. Pass `'all'` (default) for PJM-wide. */
export function useReserveMargin(
  zone: string = 'all',
): EnvelopeQueryState<ReserveMarginData> {
  return useEnvelopeQuery<ReserveMarginData>({
    cacheKey: `reserve:${zone}`,
    staleSeconds: STALE_THRESHOLDS.reserveMargin,
    pollMs: 5 * 60_000,
    fetcher: (signal) => fetchReserveMargin(zone, { signal }),
    mockProducer: () => mockReserveMargin(),
  });
}

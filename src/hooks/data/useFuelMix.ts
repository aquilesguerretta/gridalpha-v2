// FORGE Wave 4 — useFuelMix().

import { STALE_THRESHOLDS, type FuelMixData } from '@/lib/types/api';
import { fetchFuelMix } from '@/services/api/fuelMix';
import { useEnvelopeQuery, type EnvelopeQueryState } from './useEnvelopeQuery';
import { mockFuelMix } from './mocks';

/** PJM-wide fuel mix snapshot. Polls every 5 minutes. */
export function useFuelMix(): EnvelopeQueryState<FuelMixData> {
  return useEnvelopeQuery<FuelMixData>({
    cacheKey: 'fuel-mix',
    staleSeconds: STALE_THRESHOLDS.fuelMix,
    pollMs: 5 * 60_000,
    fetcher: (signal) => fetchFuelMix({ signal }),
    mockProducer: () => mockFuelMix(),
  });
}

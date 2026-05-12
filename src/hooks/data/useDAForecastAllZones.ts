// FORGE Wave 4 — useDAForecastAllZones(date?).

import { STALE_THRESHOLDS, type DAForecastAllZonesData } from '@/lib/types/api';
import { fetchDAForecastAllZones } from '@/services/api/lmp';
import { useEnvelopeQuery, type EnvelopeQueryState } from './useEnvelopeQuery';
import { mockDAForecastAllZones } from './mocks';

/**
 * DA hourly forecast for all 20 zones. Used by the Storage DA Bid
 * Optimizer when a fleet has assets spread across multiple zones.
 */
export function useDAForecastAllZones(
  date?: string,
): EnvelopeQueryState<DAForecastAllZonesData> {
  return useEnvelopeQuery<DAForecastAllZonesData>({
    cacheKey: `da-all:${date ?? 'tomorrow'}`,
    staleSeconds: STALE_THRESHOLDS.daForecast,
    pollMs: 60 * 60_000,
    fetcher: (signal) => fetchDAForecastAllZones(date, { signal }),
    mockProducer: () => mockDAForecastAllZones(date),
  });
}

// FORGE Wave 4 — useDAForecast(zone, date?): day-ahead hourly LMP forecast.

import { STALE_THRESHOLDS, type DAForecastData } from '@/lib/types/api';
import { fetchDAForecast } from '@/services/api/lmp';
import { useEnvelopeQuery, type EnvelopeQueryState } from './useEnvelopeQuery';
import { mockDAForecast } from './mocks';

/**
 * Day-ahead hourly LMP forecast for one zone. `date` defaults to
 * tomorrow on the backend; pass an explicit ISO date string to
 * override. Re-fetches every hour by default — DA prices clear
 * mid-day and don't update again.
 */
export function useDAForecast(
  zone: string | null,
  date?: string,
): EnvelopeQueryState<DAForecastData> {
  const effectiveZone = zone ?? '';
  return useEnvelopeQuery<DAForecastData>({
    cacheKey: `da:${effectiveZone}:${date ?? 'tomorrow'}`,
    staleSeconds: STALE_THRESHOLDS.daForecast,
    pollMs: effectiveZone ? 60 * 60_000 : 0,
    fetcher: (signal) => fetchDAForecast(effectiveZone, date, { signal }),
    mockProducer: () => mockDAForecast(effectiveZone || 'WEST_HUB', date),
  });
}

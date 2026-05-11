// FORGE Wave 4 — useSparkSpread(zone, heatRate?).

import { STALE_THRESHOLDS, type SparkSpreadData } from '@/lib/types/api';
import { fetchSparkSpread } from '@/services/api/sparkSpread';
import { useEnvelopeQuery, type EnvelopeQueryState } from './useEnvelopeQuery';
import { mockSparkSpread } from './mocks';

/** Spark spread (LMP minus gas-equivalent cost). Polls every 60s. */
export function useSparkSpread(
  zone: string | null,
  heatRate: number = 7500,
): EnvelopeQueryState<SparkSpreadData> {
  const effectiveZone = zone ?? '';
  return useEnvelopeQuery<SparkSpreadData>({
    cacheKey: `spark:${effectiveZone}:${heatRate}`,
    staleSeconds: STALE_THRESHOLDS.sparkSpread,
    pollMs: effectiveZone ? 60_000 : 0,
    fetcher: (signal) => fetchSparkSpread(effectiveZone, heatRate, { signal }),
    mockProducer: () => mockSparkSpread(effectiveZone || 'WEST_HUB', heatRate),
  });
}

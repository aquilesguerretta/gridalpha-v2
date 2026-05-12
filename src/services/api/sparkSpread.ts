// FORGE Wave 4 — Typed wrapper for `/api/spark-spread/current`.

import { fetchEnvelope, qs, type FetchEnvelopeOptions } from './client';
import type {
  ApiEnvelope,
  SparkSpreadData,
  SparkSpreadMeta,
} from '@/lib/types/api';

/** ENDPOINT 6 — Spark spread (LMP minus gas-equivalent cost). */
export function fetchSparkSpread(
  zone: string,
  heatRate: number = 7500,
  options?: FetchEnvelopeOptions,
): Promise<ApiEnvelope<SparkSpreadData> & { meta: SparkSpreadMeta }> {
  return fetchEnvelope<SparkSpreadData>(
    `/api/spark-spread/current${qs({ zone, heat_rate: heatRate })}`,
    options,
  ) as Promise<ApiEnvelope<SparkSpreadData> & { meta: SparkSpreadMeta }>;
}

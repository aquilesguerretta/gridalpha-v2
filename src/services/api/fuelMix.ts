// FORGE Wave 4 — Typed wrapper for `/api/fuel-mix/current`.

import { fetchEnvelope, type FetchEnvelopeOptions } from './client';
import type { ApiEnvelope, FuelMixData } from '@/lib/types/api';

/** ENDPOINT 7 — Generation fuel mix snapshot. */
export function fetchFuelMix(
  options?: FetchEnvelopeOptions,
): Promise<ApiEnvelope<FuelMixData>> {
  return fetchEnvelope<FuelMixData>('/api/fuel-mix/current', options);
}

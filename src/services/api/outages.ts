// FORGE Wave 4 — Typed wrapper for `/api/outages/current`.

import { fetchEnvelope, type FetchEnvelopeOptions } from './client';
import type {
  ApiEnvelope,
  OutagesData,
  OutagesMeta,
} from '@/lib/types/api';

/** ENDPOINT 9 — Generator outage feed. */
export function fetchOutages(
  options?: FetchEnvelopeOptions,
): Promise<ApiEnvelope<OutagesData> & { meta: OutagesMeta }> {
  return fetchEnvelope<OutagesData>('/api/outages/current', options) as Promise<
    ApiEnvelope<OutagesData> & { meta: OutagesMeta }
  >;
}

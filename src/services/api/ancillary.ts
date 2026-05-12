// FORGE Wave 4 — Typed wrapper for `/api/ancillary/current`.

import { fetchEnvelope, qs, type FetchEnvelopeOptions } from './client';
import type { AncillaryData, ApiEnvelope } from '@/lib/types/api';

/** ENDPOINT 10 — Ancillary services market clearing prices. */
export function fetchAncillary(
  zone: string = 'all',
  options?: FetchEnvelopeOptions,
): Promise<ApiEnvelope<AncillaryData>> {
  return fetchEnvelope<AncillaryData>(
    `/api/ancillary/current${qs({ zone })}`,
    options,
  );
}

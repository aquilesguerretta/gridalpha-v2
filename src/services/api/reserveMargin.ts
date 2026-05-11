// FORGE Wave 4 — Typed wrapper for `/api/reserve-margin/current`.

import { fetchEnvelope, qs, type FetchEnvelopeOptions } from './client';
import type { ApiEnvelope, ReserveMarginData } from '@/lib/types/api';

/** ENDPOINT 8 — Reserve margin. Pass `'all'` for system-wide. */
export function fetchReserveMargin(
  zone: string = 'all',
  options?: FetchEnvelopeOptions,
): Promise<ApiEnvelope<ReserveMarginData>> {
  return fetchEnvelope<ReserveMarginData>(
    `/api/reserve-margin/current${qs({ zone })}`,
    options,
  );
}

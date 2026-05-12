// FORGE Wave 4 — Typed wrappers for all `/api/lmp/*` endpoints.

import { fetchEnvelope, qs, type FetchEnvelopeOptions } from './client';
import type {
  ApiEnvelope,
  ApiEnvelopeMeta,
  DAForecastAllZonesData,
  DAForecastData,
  DAForecastMeta,
  LMP24hData,
  LMP24hMeta,
  LMPAllZonesData,
  LMPCurrentData,
  LMPHistoryData,
  LMPHistoryMeta,
} from '@/lib/types/api';

/** ENDPOINT 1 — Real-time LMP for one zone. */
export function fetchLMPCurrent(
  zone: string,
  options?: FetchEnvelopeOptions,
): Promise<ApiEnvelope<LMPCurrentData>> {
  return fetchEnvelope<LMPCurrentData>(
    `/api/lmp/current${qs({ zone })}`,
    options,
  );
}

/** ENDPOINT 2 — Real-time LMP for all 20 zones. */
export function fetchLMPAllZones(
  options?: FetchEnvelopeOptions,
): Promise<ApiEnvelope<LMPAllZonesData>> {
  return fetchEnvelope<LMPAllZonesData>('/api/lmp/all-zones', options);
}

/** ENDPOINT 3 — 24-hour LMP history for one zone. */
export function fetchLMP24h(
  zone: string,
  options?: FetchEnvelopeOptions,
): Promise<ApiEnvelope<LMP24hData> & { meta: LMP24hMeta }> {
  return fetchEnvelope<LMP24hData>(
    `/api/lmp/24h${qs({ zone })}`,
    options,
  ) as Promise<ApiEnvelope<LMP24hData> & { meta: LMP24hMeta }>;
}

/** ENDPOINT 4 — DA hourly LMP forecast for one zone. `date` defaults to tomorrow. */
export function fetchDAForecast(
  zone: string,
  date?: string,
  options?: FetchEnvelopeOptions,
): Promise<ApiEnvelope<DAForecastData> & { meta: DAForecastMeta }> {
  return fetchEnvelope<DAForecastData>(
    `/api/lmp/da-forecast${qs({ zone, date })}`,
    options,
  ) as Promise<ApiEnvelope<DAForecastData> & { meta: DAForecastMeta }>;
}

/** ENDPOINT 11 — DA hourly LMP forecast for all 20 zones. */
export function fetchDAForecastAllZones(
  date?: string,
  options?: FetchEnvelopeOptions,
): Promise<ApiEnvelope<DAForecastAllZonesData>> {
  return fetchEnvelope<DAForecastAllZonesData>(
    `/api/lmp/da-forecast/all-zones${qs({ date })}`,
    options,
  );
}

/** ENDPOINT 5 — Historical LMP for a date range. Max range 168h. */
export interface LMPHistoryParams {
  zone: string;
  /** ISO-8601 timestamp. */
  start: string;
  /** ISO-8601 timestamp. */
  end: string;
  /** Default `5min`. */
  interval?: '5min' | 'hourly';
}

export function fetchLMPHistory(
  params: LMPHistoryParams,
  options?: FetchEnvelopeOptions,
): Promise<ApiEnvelope<LMPHistoryData> & { meta: LMPHistoryMeta }> {
  return fetchEnvelope<LMPHistoryData>(
    `/api/lmp/history${qs({
      zone: params.zone,
      start: params.start,
      end: params.end,
      interval: params.interval ?? '5min',
    })}`,
    options,
  ) as Promise<ApiEnvelope<LMPHistoryData> & { meta: LMPHistoryMeta }>;
}

/** Re-export the canonical meta type for callers that destructure it. */
export type { ApiEnvelopeMeta };

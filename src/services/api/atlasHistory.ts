// ATLAS Wave 3 — Multi-zone historical-LMP fan-out wrapper.
//
// Wraps FORGE's `fetchLMPHistory` (single-zone) with a parallel
// 20-zone fetch, an optional per-zone progress callback for the
// loading UI, and graceful per-zone error tolerance — so a single
// flaky zone doesn't kill the whole event replay.
//
// PJM/Cursor cache: indefinite TTL on /api/lmp/history. The first
// call into a window primes the cache; subsequent users hit the
// cache directly.

import type { ApiEnvelope, LMPHistoryData, LMPHistoryMeta, LMPHistoryPoint } from '@/lib/types/api';
import { fetchLMPHistory } from './lmp';

/**
 * The 20 PJM zone IDs as published in `public/data/pjm-zones.geojson`.
 * Order doesn't matter — fan-out is parallel — but we list them
 * here so callers don't have to round-trip through GeoJSON.
 */
export const ALL_PJM_ZONES = [
  'WEST_HUB','COMED','AEP','ATSI','DAY','DEOK','DUQ','DOMINION','DPL','EKPC',
  'PPL','PECO','PSEG','JCPL','PEPCO','BGE','METED','PENELEC','RECO','OVEC',
] as const;

export type PJMZone = (typeof ALL_PJM_ZONES)[number];

/** Per-zone LMP series + the single-zone meta that came with it. */
export interface ZoneHistorical {
  zone: PJMZone;
  meta: LMPHistoryMeta;
  series: LMPHistoryPoint[];
}

/**
 * Result of `fetchHistoricalWindow`. `byZone` is keyed by zone_id
 * for ergonomic snapshot assembly. `failures` lists zones whose
 * fetches failed — empty on the happy path.
 */
export interface MultiZoneHistorical {
  start: string;
  end: string;
  interval: '5min' | 'hourly';
  byZone: Partial<Record<PJMZone, ZoneHistorical>>;
  failures: Array<{ zone: PJMZone; error: string }>;
}

export interface FetchWindowOptions {
  /** Data interval. Default `5min`. Storm Elliott (96h × 12 buckets/hr ≈ 1152 points/zone) fits comfortably. */
  interval?: '5min' | 'hourly';
  /** Called after each zone returns (success or failure). `done` rises monotonically; `total` = 20. */
  onProgress?: (done: number, total: number) => void;
  /** Optional cancellation. Forwarded to every parallel fetch. */
  signal?: AbortSignal;
}

/**
 * Fetch the historical LMP window across every PJM zone in parallel.
 *
 * Storm Elliott (96h) returns ~1,152 5-minute rows per zone × 20 zones
 * ≈ 23k rows total. Even on cold cache that's seconds, not tens of
 * seconds; on warm cache it's near-instant.
 *
 * Per-zone failures are tolerated — they show up in `failures` and the
 * snapshot builder fills them with the median LMP across the zones
 * that did return. A whole-fetch error is rare and is rethrown.
 */
export async function fetchHistoricalWindow(
  start: string,
  end: string,
  options: FetchWindowOptions = {},
): Promise<MultiZoneHistorical> {
  const interval: '5min' | 'hourly' = options.interval ?? '5min';
  const total = ALL_PJM_ZONES.length;
  let done = 0;

  // Wrap each per-zone fetch so a single zone failing doesn't reject
  // the parent Promise.all.
  const results = await Promise.all(
    ALL_PJM_ZONES.map(async (zone) => {
      try {
        const env: ApiEnvelope<LMPHistoryData> & { meta: LMPHistoryMeta } =
          await fetchLMPHistory({ zone, start, end, interval }, { signal: options.signal });
        return { zone, ok: true as const, env };
      } catch (err) {
        return {
          zone,
          ok: false as const,
          error: err instanceof Error ? err.message : 'unknown error',
        };
      } finally {
        done += 1;
        options.onProgress?.(done, total);
      }
    }),
  );

  const byZone: Partial<Record<PJMZone, ZoneHistorical>> = {};
  const failures: Array<{ zone: PJMZone; error: string }> = [];

  for (const r of results) {
    if (r.ok) {
      byZone[r.zone] = {
        zone:   r.zone,
        meta:   r.env.meta,
        series: r.env.data,
      };
    } else {
      failures.push({ zone: r.zone, error: r.error });
    }
  }

  return { start, end, interval, byZone, failures };
}

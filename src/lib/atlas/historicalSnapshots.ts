// ATLAS Historical snapshot API.
//
// Wave 2 — buffer-only lookups for the rolling 72-hour mock window.
// Wave 3 — `loadEvent(eventId)` convenience that fires the real
//          PJM /api/lmp/history fetch through the time-travel store.
//
// The buffer functions (getCurrentSnapshot / getBracketingSnapshots /
// getHistoricalSnapshot / getHistoricalRange) drive `live` and
// `scrubbed` modes. They return synthetic data from the rolling
// 72h mock — that buffer is the canonical "what was happening
// recently" surface, separate from the curated named events.
//
// `event-replay` mode reads from `useTimeTravelStore.eventSnapshots`
// which is populated by `useAtlasHistorical`. The lookup helpers for
// that path live in `eventLibrary.ts` (`getEventBracketingSnapshots`).
// See useTimeTravelData for the mode-routing.

import type { AtlasSnapshot } from '@/lib/types/timeTravel';
import { getHistoricalBuffer } from '@/lib/mock/atlas-historical-mock';
import { useTimeTravelStore } from '@/stores/timeTravelStore';

/** The rolling buffer's earliest snapshot timestamp (~72h ago). */
export function getHistoricalRangeStart(): string {
  const buf = getHistoricalBuffer();
  return buf[0]?.timestamp ?? new Date().toISOString();
}

/** The rolling buffer's latest snapshot timestamp (= "now"). */
export function getHistoricalRangeEnd(): string {
  const buf = getHistoricalBuffer();
  return buf[buf.length - 1]?.timestamp ?? new Date().toISOString();
}

/**
 * Returns the snapshot whose timestamp is closest to the requested one.
 * Out-of-range timestamps clamp to the boundary frame. Use
 * `interpolateSnapshots` (Phase 5) for sub-frame smoothness.
 */
export function getHistoricalSnapshot(timestamp: string): AtlasSnapshot {
  const buf = getHistoricalBuffer();
  if (buf.length === 0) {
    throw new Error('Historical buffer is empty');
  }
  const target = Date.parse(timestamp);
  if (Number.isNaN(target)) return buf[buf.length - 1];

  // Binary search for the nearest frame.
  let lo = 0;
  let hi = buf.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const midMs = Date.parse(buf[mid].timestamp);
    if (midMs < target) lo = mid + 1;
    else hi = mid;
  }
  // Compare lo with lo-1 to find the truly nearest one.
  if (lo > 0) {
    const a = Date.parse(buf[lo - 1].timestamp);
    const b = Date.parse(buf[lo].timestamp);
    if (Math.abs(target - a) <= Math.abs(target - b)) return buf[lo - 1];
  }
  return buf[lo];
}

/**
 * Returns the two adjacent frames bracketing the requested timestamp,
 * plus the [0,1] fraction of the way from `before` to `after`. Used by
 * the interpolation layer to produce smooth scrubbing between snapshots.
 *
 * If the timestamp falls outside the buffer, both frames are the
 * clamped boundary frame and `fraction` is 0.
 */
export function getBracketingSnapshots(timestamp: string): {
  before: AtlasSnapshot;
  after: AtlasSnapshot;
  fraction: number;
} {
  const buf = getHistoricalBuffer();
  if (buf.length === 0) {
    throw new Error('Historical buffer is empty');
  }
  const target = Date.parse(timestamp);
  if (Number.isNaN(target)) {
    const last = buf[buf.length - 1];
    return { before: last, after: last, fraction: 0 };
  }

  const firstMs = Date.parse(buf[0].timestamp);
  const lastMs = Date.parse(buf[buf.length - 1].timestamp);

  if (target <= firstMs) return { before: buf[0], after: buf[0], fraction: 0 };
  if (target >= lastMs)  return { before: buf[buf.length - 1], after: buf[buf.length - 1], fraction: 0 };

  // Binary search for upper bound.
  let lo = 0;
  let hi = buf.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const midMs = Date.parse(buf[mid].timestamp);
    if (midMs <= target) lo = mid + 1;
    else hi = mid;
  }
  const after = buf[lo];
  const before = buf[lo - 1];
  const aMs = Date.parse(before.timestamp);
  const bMs = Date.parse(after.timestamp);
  const fraction = bMs === aMs ? 0 : (target - aMs) / (bMs - aMs);
  return { before, after, fraction };
}

/** All snapshots whose timestamp lies in [start, end]. Inclusive both ends. */
export function getHistoricalRange(start: string, end: string): AtlasSnapshot[] {
  const buf = getHistoricalBuffer();
  const startMs = Date.parse(start);
  const endMs   = Date.parse(end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return [];
  return buf.filter((s) => {
    const ts = Date.parse(s.timestamp);
    return ts >= startMs && ts <= endMs;
  });
}

/** The current "now" snapshot — the last frame in the rolling buffer. */
export function getCurrentSnapshot(): AtlasSnapshot {
  const buf = getHistoricalBuffer();
  return buf[buf.length - 1];
}

// ── Wave 3 — event load convenience ────────────────────────────────────

/**
 * Kick off the real `/api/lmp/history` fetch for a named event.
 * Delegates to the store's `selectEvent` action — `useAtlasHistorical`
 * sees `activeEventId` change, fires the multi-zone fetch, and
 * pushes the assembled snapshots back into the store.
 *
 * Callers outside React (e.g. routing handlers, deep links) can
 * use this without mounting the hook directly. Inside React,
 * `useTimeTravelStore((s) => s.selectEvent)` is equivalent.
 */
export function loadEvent(eventId: string): void {
  useTimeTravelStore.getState().selectEvent(eventId);
}

/**
 * Returns the currently loaded event snapshots (or null when not
 * in event-replay mode / fetch hasn't completed). Read-only sugar
 * over `useTimeTravelStore.getState().eventSnapshots`.
 */
export function getLoadedEventSnapshots(): AtlasSnapshot[] | null {
  const state = useTimeTravelStore.getState();
  if (state.mode !== 'event-replay') return null;
  return state.eventSnapshots.length > 0 ? state.eventSnapshots : null;
}

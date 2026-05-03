// ATLAS Wave 2 — Historical snapshot API.
//
// Thin lookup layer over the rolling 72-hour buffer. The store calls these
// for every render cycle; they're cheap (O(log n) by binary search). When
// the FastAPI backend ships the historical endpoint, swap the buffer
// source for a streamed cache — the public surface stays the same.

import type { AtlasSnapshot } from '@/lib/types/timeTravel';
import { getHistoricalBuffer } from '@/lib/mock/atlas-historical-mock';

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

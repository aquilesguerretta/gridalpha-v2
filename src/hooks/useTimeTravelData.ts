// ATLAS Wave 2 — useTimeTravelData hook.
//
// The map's data faucet. Reads (mode, currentTimestamp, activeEventId)
// from the time-travel store and returns the AtlasSnapshot the map
// should render right now.
//
//   live          → getCurrentSnapshot()
//   scrubbed      → bracket pair from rolling buffer + interpolate
//   event-replay  → bracket pair from event timeline + interpolate
//
// Also drives the playback timer: when isPlaying is true and mode is
// scrubbed/event-replay, an interval ticks at playbackSpeed (hours per
// real second), advances scrubPosition, and stops at the range end.

import { useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTimeTravelStore } from '@/stores/timeTravelStore';
import {
  getCurrentSnapshot,
  getBracketingSnapshots,
} from '@/lib/atlas/historicalSnapshots';
import {
  getEvent,
  getEventBracketingSnapshots,
} from '@/lib/atlas/eventLibrary';
import { interpolateSnapshots } from '@/lib/atlas/interpolation';
import type { AtlasSnapshot } from '@/lib/types/timeTravel';

/**
 * Returns the AtlasSnapshot for the current store state.
 * Memoized on the store fields it actually reads — re-runs on
 * (mode, currentTimestamp, activeEventId) changes only.
 *
 * Side-effect: starts/stops the playback interval when (isPlaying,
 * playbackSpeed, mode) change. Tick advances scrubPosition by
 * `playbackSpeed * 1` step per second (one step = one frame in
 * historical mode, one event-snapshot in event-replay mode).
 */
export function useTimeTravelData(): AtlasSnapshot {
  const { mode, currentTimestamp, activeEventId } = useTimeTravelStore(
    useShallow((s) => ({
      mode: s.mode,
      currentTimestamp: s.currentTimestamp,
      activeEventId: s.activeEventId,
    })),
  );

  // Playback driver — separate selector so it doesn't re-trigger snapshot
  // recomputation.
  const isPlaying     = useTimeTravelStore((s) => s.isPlaying);
  const playbackSpeed = useTimeTravelStore((s) => s.playbackSpeed);

  // Tick handle.
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any prior tick.
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (!isPlaying || mode === 'live') return;

    // Each "step" is one hour of simulated time. We tick `playbackSpeed`
    // steps per real second; the per-frame fraction is computed by the
    // store from currentTimestamp + step duration.
    const ms = 1000 / playbackSpeed;
    tickRef.current = window.setInterval(() => {
      const state = useTimeTravelStore.getState();
      const startMs = Date.parse(state.rangeStart);
      const endMs   = Date.parse(state.rangeEnd);
      if (Number.isNaN(startMs) || Number.isNaN(endMs)) return;

      const total = endMs - startMs;
      if (total <= 0) return;

      const stepMs = 3_600_000; // one simulated hour per tick
      const nextMs = Math.min(endMs, Date.parse(state.currentTimestamp) + stepMs);
      state.scrubToTimestamp(new Date(nextMs).toISOString());

      if (nextMs >= endMs) {
        useTimeTravelStore.setState({ isPlaying: false });
      }
    }, ms);

    return () => {
      if (tickRef.current != null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, mode]);

  return useMemo<AtlasSnapshot>(() => {
    if (mode === 'live') {
      return getCurrentSnapshot();
    }
    if (mode === 'event-replay' && activeEventId) {
      const event = getEvent(activeEventId);
      if (!event) return getCurrentSnapshot();
      const { before, after, fraction } = getEventBracketingSnapshots(event, currentTimestamp);
      if (before === after || fraction === 0) return before;
      return interpolateSnapshots(before, after, fraction);
    }
    // scrubbed
    const { before, after, fraction } = getBracketingSnapshots(currentTimestamp);
    if (before === after || fraction === 0) return before;
    return interpolateSnapshots(before, after, fraction);
  }, [mode, currentTimestamp, activeEventId]);
}

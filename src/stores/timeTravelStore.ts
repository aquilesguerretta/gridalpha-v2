// ATLAS Wave 2 — Time-travel store.
//
// The single source of truth for the Atlas time-machine surface.
// Coordinates between the scrubber UI, the data hook, and the map.
//
// State machine:
//
//        ┌──────────┐  enterScrubMode    ┌────────────┐
//        │   live   │ ────────────────▶  │  scrubbed  │
//        └──────────┘                    └────────────┘
//             ▲   ▲                          │   │
//             │   │ exitToLive               │   │ scrubTo(0..1)
//             │   └──────────────────────────┘   │
//             │                                   │
//             │            selectEvent(id)        ▼
//             │     ┌──────────────────┐  ◀─────────
//             └──── │  event-replay    │
//                   └──────────────────┘
//
// Persistence: NOT persisted. Atlas always boots in `live` mode so a
// refresh during a replay doesn't keep the user stuck in the past.
// (sessionStorage would be tempting but the AtlasSnapshot anchor would
//  drift between tabs.)

import { create } from 'zustand';
import type { AtlasSnapshot, PlaybackSpeed, TimeTravelMode } from '@/lib/types/timeTravel';
import {
  getCurrentSnapshot,
  getHistoricalRangeEnd,
  getHistoricalRangeStart,
} from '@/lib/atlas/historicalSnapshots';
import { getEvent } from '@/lib/atlas/eventLibrary';

export interface TimeTravelState {
  mode: TimeTravelMode;

  /** ISO timestamp we're currently looking at. */
  currentTimestamp: string;

  /** Normalized scrub position 0..1 across the active range. */
  scrubPosition: number;

  /** ISO bounds of the active range (historical buffer or event timeline). */
  rangeStart: string;
  rangeEnd: string;

  /** Active event id when mode === 'event-replay'; null otherwise. */
  activeEventId: string | null;

  /** Auto-advance state. */
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;

  // ── Wave 3 — event-replay loading state ──────────────────────
  /** True while `/api/lmp/history` is being fetched for the active event. */
  isLoadingEvent: boolean;
  /** Per-zone fetch progress, 0..1. Drives "Loading 14 of 20 zones…". */
  loadingProgress: number;
  /** Snapshots assembled from real PJM history for the active event. */
  eventSnapshots: AtlasSnapshot[];
  /** Optional fetch error message; null on success or in-flight. */
  loadError: string | null;

  // ── Actions ───────────────────────────────────────────────────
  enterScrubMode: () => void;
  scrubTo: (position: number) => void;
  scrubToTimestamp: (timestamp: string) => void;
  selectEvent: (eventId: string) => void;
  exitToLive: () => void;
  togglePlayback: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  // Wave 3 — event loading actions (called by useAtlasHistorical)
  setLoadingEvent: (loading: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  setEventSnapshots: (snapshots: AtlasSnapshot[]) => void;
  setLoadError: (error: string | null) => void;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function timestampForPosition(start: string, end: string, position: number): string {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return start;
  const ms = startMs + (endMs - startMs) * clamp01(position);
  return new Date(ms).toISOString();
}

function positionForTimestamp(start: string, end: string, timestamp: string): number {
  const startMs = Date.parse(start);
  const endMs   = Date.parse(end);
  const tsMs    = Date.parse(timestamp);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || Number.isNaN(tsMs)) return 1;
  if (endMs <= startMs) return 1;
  return clamp01((tsMs - startMs) / (endMs - startMs));
}

export const useTimeTravelStore = create<TimeTravelState>()((set, get) => ({
  mode: 'live',
  currentTimestamp: getCurrentSnapshot().timestamp,
  scrubPosition: 1,
  rangeStart: getHistoricalRangeStart(),
  rangeEnd:   getHistoricalRangeEnd(),
  activeEventId: null,
  isPlaying: false,
  playbackSpeed: 1,
  isLoadingEvent: false,
  loadingProgress: 0,
  eventSnapshots: [],
  loadError: null,

  enterScrubMode: () => {
    const rangeStart = getHistoricalRangeStart();
    const rangeEnd   = getHistoricalRangeEnd();
    set({
      mode: 'scrubbed',
      activeEventId: null,
      rangeStart,
      rangeEnd,
      scrubPosition: 1,
      currentTimestamp: rangeEnd,
      isPlaying: false,
    });
  },

  scrubTo: (position) => {
    const state = get();
    const pos = clamp01(position);
    // Auto-enter scrub mode if user drags from live.
    if (state.mode === 'live') {
      const rangeStart = getHistoricalRangeStart();
      const rangeEnd   = getHistoricalRangeEnd();
      set({
        mode: 'scrubbed',
        activeEventId: null,
        rangeStart,
        rangeEnd,
        scrubPosition: pos,
        currentTimestamp: timestampForPosition(rangeStart, rangeEnd, pos),
      });
      return;
    }
    set({
      scrubPosition: pos,
      currentTimestamp: timestampForPosition(state.rangeStart, state.rangeEnd, pos),
    });
  },

  scrubToTimestamp: (timestamp) => {
    const state = get();
    const pos = positionForTimestamp(state.rangeStart, state.rangeEnd, timestamp);
    set({ scrubPosition: pos, currentTimestamp: timestamp });
  },

  selectEvent: (eventId) => {
    const event = getEvent(eventId);
    if (!event) return;
    set({
      mode: 'event-replay',
      activeEventId: eventId,
      rangeStart: event.startTimestamp,
      rangeEnd:   event.endTimestamp,
      scrubPosition: 0,
      currentTimestamp: event.startTimestamp,
      isPlaying: false,
      // Reset Wave 3 load state — useAtlasHistorical sees the new
      // activeEventId and kicks off a fresh fetch.
      isLoadingEvent: true,
      loadingProgress: 0,
      eventSnapshots: [],
      loadError: null,
    });
  },

  exitToLive: () => {
    const live = getCurrentSnapshot();
    set({
      mode: 'live',
      activeEventId: null,
      rangeStart: getHistoricalRangeStart(),
      rangeEnd:   getHistoricalRangeEnd(),
      scrubPosition: 1,
      currentTimestamp: live.timestamp,
      isPlaying: false,
      // Clear any in-flight or completed event load.
      isLoadingEvent: false,
      loadingProgress: 0,
      eventSnapshots: [],
      loadError: null,
    });
  },

  togglePlayback: () => set((s) => ({ isPlaying: !s.isPlaying && s.mode !== 'live' })),

  setSpeed: (speed) => set({ playbackSpeed: speed }),

  // Wave 3 — event-loading actions. `useAtlasHistorical` calls these as
  // the multi-zone fetch progresses. Selecting a new event resets these
  // via `selectEvent` above.
  setLoadingEvent:    (loading)   => set({ isLoadingEvent: loading }),
  setLoadingProgress: (progress)  => set({ loadingProgress: Math.max(0, Math.min(1, progress)) }),
  setEventSnapshots:  (snapshots) => set({ eventSnapshots: snapshots }),
  setLoadError:       (error)     => set({ loadError: error }),
}));

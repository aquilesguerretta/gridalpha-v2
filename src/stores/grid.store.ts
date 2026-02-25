/**
 * GridAlpha V2 — Core Zustand store.
 *
 * Manages the LiveDataFrame ring buffer, time-travel scrubber state,
 * and the adaptive-performance tier level.
 */

import { create } from "zustand";
import type { LiveDataFrame } from "../types/index";
import { RING_BUFFER_HOURS } from "../types/constants";

// ── derived constant ────────────────────────────────────────────
/** 5-minute intervals → 12 frames per hour. */
const FRAMES_PER_HOUR = 12;
/** Maximum frames retained in the ring buffer. */
const MAX_BUFFER_LENGTH = RING_BUFFER_HOURS * FRAMES_PER_HOUR; // 576

// ── store shape ─────────────────────────────────────────────────

export interface GridState {
  /** Ring buffer of recent frames (oldest first). */
  frames: LiveDataFrame[];

  /** Current playback / scrubber position into `frames`. */
  currentIndex: number;

  /** True when the scrubber is pinned to the latest frame. */
  isLive: boolean;

  /** Adaptive-performance fallback tier (1 = full fidelity). */
  tierLevel: 1 | 2 | 3;

  /** Push a new frame; evict the oldest if buffer is full. */
  addFrame: (frame: LiveDataFrame) => void;

  /** Jump the scrubber to an arbitrary index (disables live mode). */
  setIndex: (index: number) => void;

  /** Override the current performance tier. */
  setTierLevel: (tier: 1 | 2 | 3) => void;
}

// ── store implementation ────────────────────────────────────────

export const useGridStore = create<GridState>()((set) => ({
  frames: [],
  currentIndex: 0,
  isLive: true,
  tierLevel: 1,

  addFrame: (frame) =>
    set((state) => {
      const next =
        state.frames.length >= MAX_BUFFER_LENGTH
          ? [...state.frames.slice(1), frame]
          : [...state.frames, frame];

      return {
        frames: next,
        // Keep scrubber pinned to latest while live.
        currentIndex: state.isLive ? next.length - 1 : state.currentIndex,
      };
    }),

  setIndex: (index) =>
    set(() => ({
      currentIndex: index,
      isLive: false,
    })),

  setTierLevel: (tier) =>
    set(() => ({
      tierLevel: tier,
    })),
}));

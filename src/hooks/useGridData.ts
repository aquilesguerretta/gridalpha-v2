/**
 * GridAlpha V2 — useGridData
 *
 * Connects the polling bridge to the Zustand ring-buffer store.
 * Starts polling on mount, stops on unmount.
 */

import { useEffect } from "react";
import { startPollingBridge } from "../services/sse.service";
import { useGridStore } from "../stores/grid.store";
import type { LiveDataFrame } from "../types/index";

export interface GridDataSnapshot {
  /** All frames currently in the ring buffer. */
  frames: LiveDataFrame[];
  /** The frame at the current scrubber index, or undefined if buffer is empty. */
  currentFrame: LiveDataFrame | undefined;
  /** True when the scrubber is pinned to the latest frame. */
  isLive: boolean;
  /** Current adaptive-performance tier. */
  tierLevel: 1 | 2 | 3;
}

/**
 * Starts the polling bridge on mount and feeds every incoming
 * {@link LiveDataFrame} into the Zustand store via `addFrame`.
 *
 * Returns a reactive snapshot of the store for rendering.
 */
export function useGridData(): GridDataSnapshot {
  const frames = useGridStore((s) => s.frames);
  const currentIndex = useGridStore((s) => s.currentIndex);
  const isLive = useGridStore((s) => s.isLive);
  const tierLevel = useGridStore((s) => s.tierLevel);
  const addFrame = useGridStore((s) => s.addFrame);

  useEffect(() => {
    const stop = startPollingBridge((frame) => {
      addFrame(frame);
    });

    return () => {
      stop();
    };
  }, [addFrame]);

  return {
    frames,
    currentFrame: frames[currentIndex],
    isLive,
    tierLevel,
  };
}

// FORGE Wave 3 — Storage optimizer orchestration hook.
// Wave 4 update: run() can accept a live `MarketContext` built from
// useDAForecastAllZones + useAncillary. When omitted, falls back to
// `defaultMarketContext()` so the optimizer never breaks on a missing
// live feed. The optional context is held in a ref so the most-recent
// live data survives across run() calls.
//
// run() defers the synchronous engine work by one tick so the UI can
// paint the running state before the optimizer blocks the main thread.

import { useCallback, useRef } from 'react';
import {
  useStorageStore,
  selectActiveFleet,
} from '@/stores/storageStore';
import { runOptimization } from '@/lib/storage/runOptimization';
import { defaultMarketContext } from '@/lib/mock/storage-optimizer-mock';
import type {
  Fleet,
  FleetResult,
  MarketContext,
  ScenarioName,
} from '@/lib/types/storage';

export interface UseStorageOptimizer {
  fleet: Fleet | null;
  results: FleetResult | null;
  isRunning: boolean;
  selectedAssetId: string | null;
  selectedScenario: ScenarioName;

  /** Trigger optimization. Optional live market context overrides the
   *  built-in mock defaults; when absent, the engine falls back to
   *  `defaultMarketContext()`. */
  run: (liveMarket?: MarketContext) => void;
  setFleet: (fleet: Fleet) => void;
  selectFleet: (id: string) => void;
  selectAsset: (id: string | null) => void;
  selectScenario: (s: ScenarioName) => void;
  clear: () => void;
}

export function useStorageOptimizer(): UseStorageOptimizer {
  const fleet = useStorageStore(selectActiveFleet);
  const results = useStorageStore((s) => s.results);
  const isRunning = useStorageStore((s) => s.isRunning);
  const selectedAssetId = useStorageStore((s) => s.selectedAssetId);
  const selectedScenario = useStorageStore((s) => s.selectedScenario);

  const setFleet = useStorageStore((s) => s.setFleet);
  const selectFleet = useStorageStore((s) => s.selectFleet);
  const selectAsset = useStorageStore((s) => s.selectAsset);
  const selectScenario = useStorageStore((s) => s.selectScenario);
  const setResults = useStorageStore((s) => s.setResults);
  const setIsRunning = useStorageStore((s) => s.setIsRunning);
  const clearResults = useStorageStore((s) => s.clearResults);

  // Stash the most-recent live market context so background hook polls
  // can feed run() without re-passing the same context on every call.
  const liveMarketRef = useRef<MarketContext | undefined>(undefined);

  const run = useCallback(
    (liveMarket?: MarketContext) => {
      const current = selectActiveFleet(useStorageStore.getState());
      if (!current) return;
      if (liveMarket) liveMarketRef.current = liveMarket;
      const market = liveMarket ?? liveMarketRef.current ?? defaultMarketContext();
      setIsRunning(true);
      setTimeout(() => {
        try {
          const next = runOptimization(current, market);
          setResults(next);
        } finally {
          setIsRunning(false);
        }
      }, 50);
    },
    [setIsRunning, setResults],
  );

  return {
    fleet,
    results,
    isRunning,
    selectedAssetId,
    selectedScenario,
    run,
    setFleet,
    selectFleet,
    selectAsset,
    selectScenario,
    clear: clearResults,
  };
}

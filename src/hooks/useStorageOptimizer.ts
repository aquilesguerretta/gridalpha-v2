// FORGE Wave 3 — Storage optimizer orchestration hook.
// Thin wrapper over the storage store + runOptimization. Exposes the
// active fleet, results, isRunning, run() trigger, and selection
// setters that AssetDetail / FleetOverview consume.
//
// run() defers the synchronous engine work by one tick so the UI can
// paint the running state before the optimizer blocks the main thread.
// For an 8-asset fleet × 3 scenarios, the engine completes in well
// under 100ms.

import { useCallback } from 'react';
import {
  useStorageStore,
  selectActiveFleet,
} from '@/stores/storageStore';
import { runOptimization } from '@/lib/storage/runOptimization';
import { defaultMarketContext } from '@/lib/mock/storage-optimizer-mock';
import type {
  Fleet,
  FleetResult,
  ScenarioName,
} from '@/lib/types/storage';

export interface UseStorageOptimizer {
  fleet: Fleet | null;
  results: FleetResult | null;
  isRunning: boolean;
  selectedAssetId: string | null;
  selectedScenario: ScenarioName;

  run: () => void;
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

  const run = useCallback(() => {
    const current = selectActiveFleet(useStorageStore.getState());
    if (!current) return;
    setIsRunning(true);
    setTimeout(() => {
      try {
        const market = defaultMarketContext();
        const next = runOptimization(current, market);
        setResults(next);
      } finally {
        setIsRunning(false);
      }
    }, 50);
  }, [setIsRunning, setResults]);

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

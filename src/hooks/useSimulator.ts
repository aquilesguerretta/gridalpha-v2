// FORGE Wave 2 — Simulator orchestration hook.
// Thin wrapper over the simulator store + runSimulation. Exposes the
// active profile, results, isRunning flag, the run() trigger, and
// selection setters that StrategyDetail / StrategyRanking consume.
//
// run() defers the actual simulation by one tick so the UI can paint a
// "running…" state before the synchronous engine work blocks the main
// thread. The engine completes well under 2s for default facilities
// (~25k strategy-scenario hours).

import { useCallback } from 'react';
import {
  useSimulatorStore,
  selectActiveProfile,
} from '@/stores/simulatorStore';
import { runSimulation } from '@/lib/simulator/runSimulation';
import type {
  FacilityProfile,
  ScenarioName,
  StrategyResult,
} from '@/lib/types/simulator';

export interface UseSimulator {
  profile: FacilityProfile | null;
  results: StrategyResult[] | null;
  isRunning: boolean;
  selectedStrategyId: string | null;
  selectedScenario: ScenarioName;

  run: () => void;
  setProfile: (profile: FacilityProfile) => void;
  selectFacility: (id: string) => void;
  selectStrategy: (id: string | null) => void;
  selectScenario: (scenario: ScenarioName) => void;
  clear: () => void;
}

export function useSimulator(): UseSimulator {
  const profile = useSimulatorStore(selectActiveProfile);
  const results = useSimulatorStore((s) => s.results);
  const isRunning = useSimulatorStore((s) => s.isRunning);
  const selectedStrategyId = useSimulatorStore((s) => s.selectedStrategyId);
  const selectedScenario = useSimulatorStore((s) => s.selectedScenario);

  const setProfile = useSimulatorStore((s) => s.setFacilityProfile);
  const selectFacility = useSimulatorStore((s) => s.selectFacility);
  const selectStrategy = useSimulatorStore((s) => s.selectStrategy);
  const selectScenario = useSimulatorStore((s) => s.selectScenario);
  const setResults = useSimulatorStore((s) => s.setResults);
  const setIsRunning = useSimulatorStore((s) => s.setIsRunning);
  const clearResults = useSimulatorStore((s) => s.clearResults);

  const run = useCallback(() => {
    const current = selectActiveProfile(useSimulatorStore.getState());
    if (!current) return;
    setIsRunning(true);
    // Defer to next tick so the UI can render the running state before
    // the synchronous engine work runs.
    setTimeout(() => {
      try {
        const next = runSimulation(current);
        setResults(next);
      } finally {
        setIsRunning(false);
      }
    }, 50);
  }, [setIsRunning, setResults]);

  return {
    profile,
    results,
    isRunning,
    selectedStrategyId,
    selectedScenario,
    run,
    setProfile,
    selectFacility,
    selectStrategy,
    selectScenario,
    clear: clearResults,
  };
}

// FORGE Wave 2 — Strategy Simulator store.
// Persists the active facility profile and selections to localStorage so
// the user's last setup survives reloads. Results are NOT persisted —
// they recompute on demand because (a) they're large and (b) the engine
// is fast enough to make caching unnecessary.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  FacilityProfile,
  ScenarioName,
  StrategyResult,
} from '@/lib/types/simulator';
import { FACILITY_PROFILES } from '@/lib/mock/simulator-mock';

interface SimulatorState {
  /** Stash of all known profiles — defaults seeded from mock library. */
  facilityProfiles: FacilityProfile[];
  /** Currently selected profile id. */
  activeFacilityId: string | null;

  /** Latest run results. Not persisted. */
  results: StrategyResult[] | null;
  isRunning: boolean;
  selectedStrategyId: string | null;
  selectedScenario: ScenarioName;

  // Actions
  setFacilityProfile: (profile: FacilityProfile) => void;
  selectFacility: (id: string) => void;
  selectStrategy: (id: string | null) => void;
  selectScenario: (scenario: ScenarioName) => void;
  setResults: (results: StrategyResult[] | null) => void;
  setIsRunning: (running: boolean) => void;
  clearResults: () => void;
}

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set) => ({
      facilityProfiles: FACILITY_PROFILES,
      activeFacilityId: null,
      results: null,
      isRunning: false,
      selectedStrategyId: null,
      selectedScenario: 'base',

      setFacilityProfile: (profile) =>
        set((s) => {
          const idx = s.facilityProfiles.findIndex((p) => p.id === profile.id);
          const next =
            idx === -1
              ? [...s.facilityProfiles, profile]
              : s.facilityProfiles.map((p) => (p.id === profile.id ? profile : p));
          return {
            facilityProfiles: next,
            activeFacilityId: profile.id,
            // Invalidate stale results when the profile changes.
            results: null,
            selectedStrategyId: null,
          };
        }),

      selectFacility: (id) =>
        set({
          activeFacilityId: id,
          results: null,
          selectedStrategyId: null,
        }),

      selectStrategy: (id) => set({ selectedStrategyId: id }),

      selectScenario: (scenario) => set({ selectedScenario: scenario }),

      setResults: (results) =>
        set({
          results,
          // Auto-select the top-ranked strategy whenever results land.
          selectedStrategyId:
            results && results.length > 0 ? results[0].strategy.id : null,
        }),

      setIsRunning: (running) => set({ isRunning: running }),

      clearResults: () =>
        set({ results: null, selectedStrategyId: null, isRunning: false }),
    }),
    {
      name: 'gridalpha-simulator',
      storage: createJSONStorage(() => localStorage),
      // Only persist facility profiles + active selection. Skip results.
      partialize: (s) => ({
        facilityProfiles: s.facilityProfiles,
        activeFacilityId: s.activeFacilityId,
        selectedScenario: s.selectedScenario,
      }),
    },
  ),
);

/** Convenience selector — returns the active facility profile, or null. */
export function selectActiveProfile(
  s: SimulatorState,
): FacilityProfile | null {
  if (!s.activeFacilityId) return null;
  return s.facilityProfiles.find((p) => p.id === s.activeFacilityId) ?? null;
}

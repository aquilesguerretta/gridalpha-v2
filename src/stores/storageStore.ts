// FORGE Wave 3 — Storage DA Bid Optimizer store.
// Persists registered fleets and the user's selection across reloads.
// Optimization results stay in memory only (recompute on demand) so
// localStorage doesn't bloat with 24-hour bid plans for every fleet.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Fleet,
  FleetResult,
  ScenarioName,
} from '@/lib/types/storage';
import { FLEETS } from '@/lib/mock/storage-optimizer-mock';

interface StorageState {
  /** All known fleets — defaults seeded from the mock library. */
  fleets: Fleet[];
  activeFleetId: string | null;

  /** Latest fleet-level optimization result. Not persisted. */
  results: FleetResult | null;
  isRunning: boolean;
  selectedAssetId: string | null;
  selectedScenario: ScenarioName;

  // Actions
  setFleet: (fleet: Fleet) => void;
  selectFleet: (id: string) => void;
  selectAsset: (id: string | null) => void;
  selectScenario: (s: ScenarioName) => void;
  setResults: (results: FleetResult | null) => void;
  setIsRunning: (running: boolean) => void;
  clearResults: () => void;
}

export const useStorageStore = create<StorageState>()(
  persist(
    (set) => ({
      fleets: FLEETS,
      activeFleetId: null,
      results: null,
      isRunning: false,
      selectedAssetId: null,
      selectedScenario: 'base',

      setFleet: (fleet) =>
        set((s) => {
          const idx = s.fleets.findIndex((f) => f.id === fleet.id);
          const next =
            idx === -1
              ? [...s.fleets, fleet]
              : s.fleets.map((f) => (f.id === fleet.id ? fleet : f));
          return {
            fleets: next,
            activeFleetId: fleet.id,
            results: null,
            selectedAssetId: null,
          };
        }),

      selectFleet: (id) =>
        set({
          activeFleetId: id,
          results: null,
          selectedAssetId: null,
        }),

      selectAsset: (id) => set({ selectedAssetId: id }),

      selectScenario: (s) => set({ selectedScenario: s }),

      setResults: (results) =>
        set({
          results,
          selectedAssetId:
            results && results.perAssetRanking.length > 0
              ? results.perAssetRanking[0].asset.id
              : null,
        }),

      setIsRunning: (running) => set({ isRunning: running }),

      clearResults: () =>
        set({ results: null, selectedAssetId: null, isRunning: false }),
    }),
    {
      name: 'gridalpha-storage-optimizer',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        fleets: s.fleets,
        activeFleetId: s.activeFleetId,
        selectedScenario: s.selectedScenario,
      }),
    },
  ),
);

/** Convenience selector — returns the active fleet, or null. */
export function selectActiveFleet(s: StorageState): Fleet | null {
  if (!s.activeFleetId) return null;
  return s.fleets.find((f) => f.id === s.activeFleetId) ?? null;
}

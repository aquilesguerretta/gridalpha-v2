// FORGE Wave 3 — SOC simulator.
// Walk a 24-hour bid plan forward through state-of-charge bookkeeping.
// Charge hours add energy at RTE; discharge hours subtract directly;
// idle/ancillary hours leave SOC unchanged in V1 (mileage from
// regulation is energy-balanced over the hour and dispatch-symmetric).
// Returns the trajectory, equivalent full cycles consumed, and a
// feasibility verdict + violations list.

import type { BatteryAsset, BidHour } from '@/lib/types/storage';

export interface SOCSimulationInput {
  asset: BatteryAsset;
  bidCurve: BidHour[];
  /** 0-1 fraction. Defaults to 0.5 (mid-state) when omitted. */
  startSOCFraction: number;
}

export interface SOCSimulationOutput {
  /** SOC fraction (0-1) at hour boundaries. Length 25: index 0 = start. */
  socTrajectory: number[];
  /** Equivalent full cycles consumed by the plan. */
  cyclesUsed: number;
  /** True iff the trajectory respects [socMin, socMax] for all hours. */
  feasible: boolean;
  /** Human-readable list of violations (empty when feasible). */
  violations: string[];
}

const HOURS = 24;

export function simulateSOC(input: SOCSimulationInput): SOCSimulationOutput {
  const { asset, bidCurve, startSOCFraction } = input;
  const capacityMWh = asset.capacityKWh / 1000;
  const violations: string[] = [];
  const trajectory: number[] = new Array(HOURS + 1);
  let socFraction = clamp(startSOCFraction, 0, 1);
  trajectory[0] = socFraction;

  let chargeMWh = 0;
  let dischargeMWh = 0;

  for (let h = 0; h < HOURS; h++) {
    const slot = bidCurve.find((b) => b.hour === h);
    const action = slot?.action ?? 'idle';
    const mw = slot?.mwBid ?? 0;
    const mwhDeltaIfFull = mw * 1; // 1-hour resolution

    if (action === 'charge') {
      const energyIn = mwhDeltaIfFull * asset.rte;
      socFraction += energyIn / capacityMWh;
      chargeMWh += mwhDeltaIfFull;
    } else if (action === 'discharge') {
      socFraction -= mwhDeltaIfFull / capacityMWh;
      dischargeMWh += mwhDeltaIfFull;
    }
    // idle / ancillary: no SOC change in V1

    if (socFraction < asset.socMin - 1e-6) {
      violations.push(
        `Hour ${h}: SOC dropped to ${(socFraction * 100).toFixed(1)}% (min ${(asset.socMin * 100).toFixed(0)}%).`,
      );
    }
    if (socFraction > asset.socMax + 1e-6) {
      violations.push(
        `Hour ${h}: SOC rose to ${(socFraction * 100).toFixed(1)}% (max ${(asset.socMax * 100).toFixed(0)}%).`,
      );
    }
    socFraction = clamp(socFraction, 0, 1);
    trajectory[h + 1] = socFraction;
  }

  // Equivalent full cycles: total throughput / (2 × capacity).
  const totalThroughputMWh = chargeMWh + dischargeMWh;
  const cyclesUsed = capacityMWh > 0 ? totalThroughputMWh / (2 * capacityMWh) : 0;

  return {
    socTrajectory: trajectory,
    cyclesUsed,
    feasible: violations.length === 0,
    violations,
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

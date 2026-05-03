// FORGE Wave 3 — Bid curve optimizer (heuristic, deterministic).
//
// Algorithm:
//  1. Sort the 24 hourly LMPs ascending and descending.
//  2. Pick the N lowest-LMP hours as charge candidates and the N
//     highest-LMP hours as discharge candidates, where
//     N = min(durationHours, configured maxChargeHours/maxDischargeHours).
//  3. Build the bid curve from those windows; remaining hours are idle.
//  4. Validate via simulateSOC. If infeasible (over/under SOC), drop the
//     least-margin discharge hour and re-validate. Repeat until feasible
//     or no discharge hours left.
//  5. (Outside this function — see ancillary.ts) decorate idle hours
//     with ancillary services if the asset has it enabled.
//
// V1 simplification: single 24-hour window, no rolling re-optimization,
// no inter-asset coordination, no simultaneous energy + ancillary on a
// single asset (except across separate hours of the same day).

import type {
  BatteryAsset,
  BidHour,
  OptimizerConfig,
} from '@/lib/types/storage';
import { simulateSOC } from './socSimulator';

const HOURS = 24;

interface PickedHours {
  chargeHours: number[];
  dischargeHours: number[];
}

function pickWindows(
  daHourlyLMP: number[],
  maxCharge: number,
  maxDischarge: number,
): PickedHours {
  const indexed = daHourlyLMP.map((p, h) => ({ h, p }));
  const ascending = [...indexed].sort((a, b) => a.p - b.p);
  const descending = [...indexed].sort((a, b) => b.p - a.p);

  const chargeHours = ascending.slice(0, maxCharge).map((x) => x.h);
  // Discharge hours must be disjoint from charge hours.
  const chargeSet = new Set(chargeHours);
  const dischargeHours: number[] = [];
  for (const { h } of descending) {
    if (chargeSet.has(h)) continue;
    dischargeHours.push(h);
    if (dischargeHours.length >= maxDischarge) break;
  }
  return { chargeHours, dischargeHours };
}

function buildBidCurve(
  asset: BatteryAsset,
  daHourlyLMP: number[],
  ancillaryHourlyMCP: number[],
  picked: PickedHours,
): BidHour[] {
  const powerMW = asset.powerKW / 1000;
  const chargeSet = new Set(picked.chargeHours);
  const dischargeSet = new Set(picked.dischargeHours);

  const curve: BidHour[] = [];
  for (let h = 0; h < HOURS; h++) {
    const lmp = daHourlyLMP[h] ?? 0;
    const ancillaryMCP = ancillaryHourlyMCP[h] ?? 0;
    if (chargeSet.has(h)) {
      curve.push({
        hour: h,
        action: 'charge',
        mwBid: powerMW,
        lmp,
        ancillaryMCP,
        // Charge cost is settled in attribution; we record the negative
        // expected hourly cashflow here for chart tooltips.
        expectedRevenueUSD: -lmp * powerMW,
      });
    } else if (dischargeSet.has(h)) {
      curve.push({
        hour: h,
        action: 'discharge',
        mwBid: powerMW,
        lmp,
        ancillaryMCP,
        expectedRevenueUSD: lmp * powerMW,
      });
    } else {
      curve.push({
        hour: h,
        action: 'idle',
        mwBid: 0,
        lmp,
        ancillaryMCP,
        expectedRevenueUSD: 0,
      });
    }
  }
  return curve;
}

/**
 * Generate the optimal heuristic bid curve for one asset over 24 hours.
 * Returns the curve, the SOC trajectory after applying it, and the
 * hours actually used (post-rebalance).
 */
export interface OptimizerOutput {
  bidCurve: BidHour[];
  socTrajectory: number[];
  cyclesUsed: number;
  feasible: boolean;
  violations: string[];
}

export function generateBidCurve(
  asset: BatteryAsset,
  daHourlyLMP: number[],
  ancillaryHourlyMCP: number[],
  config: OptimizerConfig = { startSOCFraction: 0.5 },
): OptimizerOutput {
  const startSOCFraction = config.startSOCFraction ?? 0.5;
  const initialMaxCharge = config.maxChargeHours ?? asset.durationHours;
  const initialMaxDischarge =
    config.maxDischargeHours ?? asset.durationHours;

  let maxCharge = Math.max(0, Math.min(HOURS, initialMaxCharge));
  let maxDischarge = Math.max(0, Math.min(HOURS, initialMaxDischarge));

  // Try the full window first; on infeasibility, peel off the least-
  // valuable discharge hour and try again. Charge hours can also shrink
  // if discharge has already shrunk to zero.
  let attempt = 0;
  while (attempt < HOURS) {
    const picked = pickWindows(daHourlyLMP, maxCharge, maxDischarge);
    const curve = buildBidCurve(
      asset,
      daHourlyLMP,
      ancillaryHourlyMCP,
      picked,
    );
    const sim = simulateSOC({
      asset,
      bidCurve: curve,
      startSOCFraction,
    });

    if (sim.feasible) {
      return {
        bidCurve: curve,
        socTrajectory: sim.socTrajectory,
        cyclesUsed: sim.cyclesUsed,
        feasible: true,
        violations: [],
      };
    }

    if (maxDischarge > 0) {
      maxDischarge -= 1;
    } else if (maxCharge > 0) {
      maxCharge -= 1;
    } else {
      // Fully idle — give up with the empty curve.
      return {
        bidCurve: curve,
        socTrajectory: sim.socTrajectory,
        cyclesUsed: sim.cyclesUsed,
        feasible: false,
        violations: sim.violations,
      };
    }
    attempt++;
  }

  // Fallback (should be unreachable): return last attempt.
  const empty = buildBidCurve(
    asset,
    daHourlyLMP,
    ancillaryHourlyMCP,
    { chargeHours: [], dischargeHours: [] },
  );
  const sim = simulateSOC({
    asset,
    bidCurve: empty,
    startSOCFraction,
  });
  return {
    bidCurve: empty,
    socTrajectory: sim.socTrajectory,
    cyclesUsed: sim.cyclesUsed,
    feasible: sim.feasible,
    violations: sim.violations,
  };
}

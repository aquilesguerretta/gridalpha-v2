// FORGE Wave 3 — Per-asset and per-fleet revenue attribution.
// Splits a 24-hour plan into energy / ancillary / degradation cost
// components. Used by the AssetDetail card and the FleetOverview to
// label what the operator actually made today.

import type {
  AssetResult,
  BatteryAsset,
  BidHour,
  RevenueAttribution,
} from '@/lib/types/storage';
import type { AncillaryStackOutput } from './ancillary';
import { computeDegradationCost } from './degradation';

interface AttributionInput {
  asset: BatteryAsset;
  bidCurve: BidHour[];
  ancillary: AncillaryStackOutput;
  cyclesUsed: number;
}

/**
 * Compute energy, ancillary, and degradation components of net revenue
 * for a single asset over its 24-hour plan.
 *
 * Energy revenue = Σ(discharge LMP × discharge MW)
 *                − Σ(charge LMP × charge MW / RTE)
 *
 * (Charging is divided by RTE because we have to draw more grid energy
 * than we can ever discharge — efficiency loss shows up as additional
 * cost paid for charging energy.)
 */
export function computeAttribution({
  asset,
  bidCurve,
  ancillary,
  cyclesUsed,
}: AttributionInput): RevenueAttribution {
  let chargeCost = 0;
  let dischargeRevenue = 0;
  let chargeMWh = 0;
  let dischargeMWh = 0;

  for (const slot of bidCurve) {
    if (slot.action === 'charge') {
      chargeMWh += slot.mwBid; // 1-hour resolution
      chargeCost += (slot.lmp * slot.mwBid) / Math.max(0.01, asset.rte);
    } else if (slot.action === 'discharge') {
      dischargeMWh += slot.mwBid;
      dischargeRevenue += slot.lmp * slot.mwBid;
    }
  }

  const energyUSD = dischargeRevenue - chargeCost;
  const ancillaryUSD = ancillary.totalUSD;
  const degradationCostUSD = computeDegradationCost(
    asset,
    chargeMWh + dischargeMWh,
    cyclesUsed,
  );

  return {
    energyUSD,
    ancillaryUSD,
    degradationCostUSD,
    netUSD: energyUSD + ancillaryUSD - degradationCostUSD,
  };
}

/** Sum net USD across a list of asset results. */
export function fleetNetRevenue(results: AssetResult[]): number {
  return results.reduce((sum, r) => sum + r.attribution.netUSD, 0);
}

/** Sum equivalent full cycles across the fleet. */
export function fleetTotalCycles(results: AssetResult[]): number {
  return results.reduce((sum, r) => sum + r.cyclesUsed, 0);
}

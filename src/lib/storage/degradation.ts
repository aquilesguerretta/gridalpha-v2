// FORGE Wave 3 — Degradation cost model.
// V1: linear cost-per-throughput model. The asset's
// degradationCostPerMWh ($/MWh) is multiplied by the energy throughput
// (charge MWh + discharge MWh) for the day.
//
// What V1 doesn't model (acknowledged):
//   - Depth-of-discharge curve (deeper cycles degrade faster)
//   - Calendar-age degradation (battery degrades when idle too)
//   - Temperature derating (heat accelerates degradation)
//   - Asymmetric charge vs discharge stress
//
// A future revision should accept a `BatteryDegradationCurve` object on
// each asset and integrate cost over the SOC trajectory rather than the
// flat throughput total.

import type { BatteryAsset } from '@/lib/types/storage';

/**
 * Degradation cost in USD for the day's plan.
 *
 * @param asset                The battery asset.
 * @param energyThroughputMWh  Total MWh moved through the battery in the
 *                             24-hour plan (charge + discharge MWh).
 * @param _cyclesUsed          Equivalent full cycles consumed. Reserved
 *                             for the V2 model that prices the cycle
 *                             count rather than throughput.
 */
export function computeDegradationCost(
  asset: BatteryAsset,
  energyThroughputMWh: number,
  _cyclesUsed?: number,
): number {
  if (energyThroughputMWh <= 0) return 0;
  return energyThroughputMWh * asset.degradationCostPerMWh;
}

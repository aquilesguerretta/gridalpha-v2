// FORGE Wave 3 — Ancillary services stacker.
// For idle hours (not in charge or discharge windows), reserve the
// asset's full power capacity to its enabled ancillary product. The
// reservation earns capacity revenue ($/MW/h) plus a deterministic
// share of mileage revenue based on the product's typical utilization
// (V1 — real-world utilization is statistical and time-of-day shaped).

import type {
  AncillaryService,
  BatteryAsset,
  BidHour,
  MarketContext,
} from '@/lib/types/storage';
import { ANCILLARY_UTILIZATION } from '@/lib/mock/storage-optimizer-mock';

export interface AncillaryHourResult {
  hour: number;
  reservedMW: number;
  capacityRevenueUSD: number;
  mileageRevenueUSD: number;
}

export interface AncillaryStackOutput {
  perHour: AncillaryHourResult[];
  totalCapacityUSD: number;
  totalMileageUSD: number;
  totalUSD: number;
}

/**
 * Decorate the bid curve with ancillary reservations on idle hours.
 * Mutates the input array in-place AND returns the per-hour breakdown
 * so the optimizer can include it in attribution.
 */
export function stackAncillaryOnIdleHours(
  asset: BatteryAsset,
  bidCurve: BidHour[],
  market: MarketContext,
): AncillaryStackOutput {
  const out: AncillaryHourResult[] = [];
  const result: AncillaryStackOutput = {
    perHour: out,
    totalCapacityUSD: 0,
    totalMileageUSD: 0,
    totalUSD: 0,
  };

  if (!asset.ancillaryEnabled || !asset.ancillaryService) return result;

  const service: AncillaryService = asset.ancillaryService;
  const mcpCurve = market.ancillaryHourlyMCP[service];
  if (!mcpCurve) return result;

  const utilization = ANCILLARY_UTILIZATION[service] ?? 0;
  const reservedMW = asset.powerKW / 1000;

  for (const slot of bidCurve) {
    if (slot.action !== 'idle') continue;

    const mcp = mcpCurve[slot.hour] ?? 0;
    const capacityRevenue = mcp * reservedMW;
    // Mileage: utilization × 1 hour × reserved MW × mileage payment.
    const mileageRevenue =
      reservedMW * utilization * market.regulationMileagePayment;

    out.push({
      hour: slot.hour,
      reservedMW,
      capacityRevenueUSD: capacityRevenue,
      mileageRevenueUSD: mileageRevenue,
    });

    // Decorate the slot itself so the bid curve viewer sees the
    // ancillary action and revenue.
    slot.action = 'ancillary';
    slot.mwBid = reservedMW;
    slot.ancillaryMCP = mcp;
    slot.expectedRevenueUSD = capacityRevenue + mileageRevenue;

    result.totalCapacityUSD += capacityRevenue;
    result.totalMileageUSD += mileageRevenue;
    result.totalUSD += capacityRevenue + mileageRevenue;
  }

  return result;
}

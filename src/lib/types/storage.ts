// FORGE Wave 3 — Storage DA Bid Optimizer types.
// Stable contract consumed by the optimizer engine, the storage store,
// every DABidOptimizer UI component, and the StorageBidPackTemplate
// PDF exporter. Extend, don't reshape.

// ─── Ancillary services ───────────────────────────────────────────

/**
 * PJM ancillary service products a storage asset can offer when not
 * cycling energy. RegD = fast-response regulation (sub-second), RegA =
 * slower regulation, Spin = synchronized reserve.
 */
export type AncillaryService = 'reg-d' | 'reg-a' | 'spin';

// ─── Asset / fleet ────────────────────────────────────────────────

export interface BatteryAsset {
  id: string;
  name: string;
  /** PJM zone key, e.g. 'PSEG', 'JCPL', 'WEST_HUB' */
  zone: string;
  /** Power rating in kW */
  powerKW: number;
  /** Energy duration in hours (powerKW × durationHours = capacityKWh). */
  durationHours: number;
  /** Energy capacity in kWh — derived but stored for convenience. */
  capacityKWh: number;
  /** Round-trip AC-AC efficiency (0-1). */
  rte: number;
  /** Minimum SOC fraction (0-1). Default 0.10. */
  socMin: number;
  /** Maximum SOC fraction (0-1). Default 0.95. */
  socMax: number;
  /** $/MWh of energy throughput attributed to cell degradation. */
  degradationCostPerMWh: number;
  /** When true, optimizer reserves idle hours for ancillary. */
  ancillaryEnabled: boolean;
  ancillaryService?: AncillaryService;
  /** ISO date string. Used for fleet-age filtering. */
  installDate?: string;
  /** Lifetime equivalent full cycles to date. */
  cyclesToDate?: number;
}

export interface Fleet {
  id: string;
  operatorName: string;
  assets: BatteryAsset[];
  /** Source of the LMP forecast used by this fleet's optimizer runs. */
  forecastSource: 'pjm-da-forecast' | 'manual' | 'historical';
}

// ─── Bid curve ────────────────────────────────────────────────────

export type BidAction = 'charge' | 'discharge' | 'ancillary' | 'idle';

export interface BidHour {
  /** Hour-of-day, 0-23. */
  hour: number;
  action: BidAction;
  /** MW bid for this hour. Positive = absolute MW (direction implied by action). */
  mwBid: number;
  /** Forecast / cleared LMP for this hour, $/MWh. */
  lmp: number;
  /** Ancillary services market clearing price, $/MW capacity. */
  ancillaryMCP: number;
  /** Expected revenue (or cost, signed) for this hour, USD. */
  expectedRevenueUSD: number;
}

// ─── Revenue attribution ─────────────────────────────────────────

export interface RevenueAttribution {
  /** Net energy arbitrage revenue: discharge − charge − cycle losses. */
  energyUSD: number;
  /** Capacity reservation + mileage payments. */
  ancillaryUSD: number;
  /** Negative-signed convention: this is a cost subtracted from net. */
  degradationCostUSD: number;
  /** energy + ancillary − degradation. */
  netUSD: number;
}

// ─── Per-asset result ────────────────────────────────────────────

export interface AssetResult {
  asset: BatteryAsset;
  bidCurve: BidHour[];
  /** SOC fraction (0-1), length 25 (start + 24 hour-end values). */
  socTrajectory: number[];
  attribution: RevenueAttribution;
  /** Equivalent full cycles consumed by this 24-hour plan. */
  cyclesUsed: number;
  /** Empty if the plan respects all SOC / power constraints. */
  constraintViolations: string[];
}

// ─── Sensitivity scenarios ───────────────────────────────────────

export type ScenarioName = 'base' | 'volatilityUp' | 'forecastMiss';

export interface ScenarioResult {
  fleetTotalRevenueUSD: number;
  /** Map asset.id → net revenue under this scenario. */
  perAssetRevenue: Record<string, number>;
}

// ─── Fleet-level result ──────────────────────────────────────────

export interface FleetResult {
  fleet: Fleet;
  scenarios: {
    base: ScenarioResult;
    volatilityUp: ScenarioResult;
    forecastMiss: ScenarioResult;
  };
  /** Per-asset results from the BASE scenario, sorted by net revenue desc. */
  perAssetRanking: AssetResult[];
  /** Sum of cyclesUsed across the fleet under the BASE scenario. */
  fleetTotalCycles: number;
  /** Fleet revenue ÷ theoretical perfect-foresight optimum (0-1). */
  performanceVsOptimal: number;
}

// ─── Market context ──────────────────────────────────────────────

export interface MarketContext {
  /** 24 hourly DA LMPs by zone, $/MWh. */
  daHourlyLMPByZone: Record<string, number[]>;
  /** 24 hourly ancillary clearing prices by service type, $/MW. */
  ancillaryHourlyMCP: Record<AncillaryService, number[]>;
  /** Performance bonus per MWh of regulation mileage dispatched, $/MWh. */
  regulationMileagePayment: number;
  /** ISO date the market context represents (for the bid pack header). */
  asOfDate: string;
}

// ─── Optimizer config ────────────────────────────────────────────

export interface OptimizerConfig {
  /** Starting SOC fraction at hour 0. Default 0.5. */
  startSOCFraction: number;
  /** Max number of charge hours to schedule (defaults to durationHours). */
  maxChargeHours?: number;
  /** Max number of discharge hours (defaults to durationHours). */
  maxDischargeHours?: number;
}

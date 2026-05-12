// FORGE Wave 2 — Strategy Simulator type system.
// Consumed by the simulator engine, the simulator store, and every
// SimulatorView UI component. Stable contract — extend, don't reshape.

// ─── Tariffs ───────────────────────────────────────────────────────

export type TariffKind = 'flat' | 'time-of-use' | 'demand-charge' | 'real-time';

export interface TOUPeriod {
  /** 0-23 hour-of-day start, inclusive */
  startHour: number;
  /** 0-23 hour-of-day end, exclusive */
  endHour: number;
  /** $/MWh */
  rate: number;
  /** Human-readable label, e.g. "Peak", "Off-peak" */
  label: string;
}

export interface TOUSchedule {
  /** Weekday TOU periods (Monday–Friday) */
  weekday: TOUPeriod[];
  /** Weekend TOU periods (Saturday–Sunday). Falls back to weekday if absent. */
  weekend?: TOUPeriod[];
}

export interface TariffStructure {
  type: TariffKind;
  /** $/MWh — for `flat` / `real-time` baseline rate. For TOU, base rate (overridden by schedule). */
  energyRate: number;
  /** $/MW-month — additive demand charge. */
  demandCharge?: number;
  touSchedule?: TOUSchedule;
}

// ─── Facility profile ──────────────────────────────────────────────

export interface FacilityProfile {
  id: string;
  name: string;
  /** PJM zone key, e.g. 'WEST_HUB', 'AEP', 'PSEG' */
  zone: string;
  /** Annual baseline consumption in MWh/year */
  annualBaselineMWh: number;
  /**
   * Hourly load profile [month][hour] in MW.
   * Outer length 12, inner length 24. Mock profiles use representative shapes.
   */
  hourlyLoadProfile: number[][];
  tariff: TariffStructure;
  /** Existing on-site solar in kW DC */
  existingSolarKW: number;
  /** Existing battery energy capacity in kWh */
  existingBatteryKWh: number;
  /** Existing battery power rating in kW */
  existingBatteryKW: number;
  /** Capital budget for new investments, USD */
  capitalBudgetUSD: number;
  /** Optional carbon intensity goal in gCO₂/kWh. Used for ranking but never gates strategies. */
  carbonIntensityGoal?: number;
  /** Discount rate as a decimal (0.08 = 8%) */
  discountRate: number;
}

// ─── Strategy components ──────────────────────────────────────────

export type StrategyComponent =
  | { kind: 'solar-add'; capacityKW: number }
  | { kind: 'battery-add'; capacityKWh: number; powerKW: number; rte: number }
  | { kind: 'diesel-add'; capacityKW: number; fuelCostPerGallon: number }
  | { kind: 'demand-response'; targetReductionPct: number }
  | { kind: 'tariff-switch'; newTariff: TariffStructure };

export interface Strategy {
  id: string;
  name: string;
  description: string;
  components: StrategyComponent[];
  /** Total capital cost in USD (sum of component capex). */
  capExUSD: number;
}

// ─── Dispatch ──────────────────────────────────────────────────────

export interface DispatchHour {
  /** 0-23 hour-of-day. */
  hour: number;
  loadMW: number;
  solarMW: number;
  /** Positive = discharging to load. Negative = charging from solar/grid. */
  batteryDispatchMW: number;
  gridDispatchMW: number;
  dieselDispatchMW: number;
  /** Total operating cost for the hour, USD. */
  costUSD: number;
}

// ─── Sensitivity ───────────────────────────────────────────────────

export type ScenarioName = 'base' | 'optimistic' | 'pessimistic';

export interface SensitivityScenario {
  name: ScenarioName;
  /** Multiplier on grid LMP / energy rate. */
  gridPriceMultiplier: number;
  /** Multiplier on technology capex. */
  capExMultiplier: number;
  /** Multiplier on solar yield to capture irradiance/derate uncertainty. */
  solarOutputMultiplier: number;
}

export interface ScenarioResult {
  npvUSD: number;
  /** Sum of discounted cashflows over 10 years, exclusive of capex. */
  totalSavings10YrUSD: number;
  /** Capex actually paid under the scenario (after capex multiplier). */
  capExUSD: number;
}

// ─── Strategy result ──────────────────────────────────────────────

export type RiskRanking = 'low' | 'moderate' | 'high';

export interface StrategyResult {
  strategy: Strategy;
  scenarios: {
    base: ScenarioResult;
    optimistic: ScenarioResult;
    pessimistic: ScenarioResult;
  };
  /** Net CO₂ reduction vs baseline strategy, in tons over 10 years. */
  carbonReductionTons10Yr: number;
  /** Years to recoup capex from base-case savings. Null if never. */
  paybackYears: number | null;
  /** Representative day's hour-by-hour dispatch under base scenario. */
  hourlyDispatch: DispatchHour[];
  riskRanking: RiskRanking;
}

// ─── NPV inputs ───────────────────────────────────────────────────

export interface NPVCalculation {
  capExUSD: number;
  /** Annual savings vs baseline, year 1..N. */
  annualSavingsUSD: number[];
  discountRate: number;
}

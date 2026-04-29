// FORGE Wave 2 — Main simulator runner.
// Builds strategies for the facility, runs an 8760-hour heuristic dispatch
// for each strategy under each sensitivity scenario, projects to 10 years,
// computes NPV, payback, carbon delta, and produces a representative day
// of dispatch for the detail viewer. Sorted by base-case NPV descending.

import type {
  DispatchHour,
  FacilityProfile,
  ScenarioResult,
  SensitivityScenario,
  Strategy,
  StrategyComponent,
  StrategyResult,
  TariffStructure,
} from '@/lib/types/simulator';
import { calculateNPV, calculatePaybackYears } from './npv';
import { dispatchHour, tariffRateForHour } from './dispatch';
import { generateStrategies } from './scenarios';
import { SCENARIOS } from './sensitivity';
import {
  DIESEL_CARBON_INTENSITY,
  TECH_COSTS,
  ZONE_CARBON_INTENSITY,
  solarOutputCoefficient,
} from '@/lib/mock/simulator-mock';

// ─── Strategy → effective parameters ──────────────────────────────

interface EffectiveParams {
  /** Total solar capacity (existing + added) in kW DC */
  solarKW: number;
  /** Total battery energy capacity in kWh */
  batteryKWh: number;
  /** Total battery power rating in kW */
  batteryKW: number;
  /** Battery RTE — uses added system's RTE when present, else default */
  batteryRTE: number;
  /** Diesel rated power (kW). 0 if none. */
  dieselKW: number;
  /** Diesel cost per MWh delivered ($/MWh). */
  dieselCostPerMWh: number;
  /** Demand-response peak reduction fraction, 0-1. */
  drReduction: number;
  /** Tariff after any tariff-switch component. */
  tariff: TariffStructure;
  /** Capex paid (after capex multiplier). */
  capExUSD: number;
}

function effectiveParams(
  profile: FacilityProfile,
  strategy: Strategy,
  scenario: SensitivityScenario,
): EffectiveParams {
  let solarKW = profile.existingSolarKW;
  let batteryKWh = profile.existingBatteryKWh;
  let batteryKW = profile.existingBatteryKW;
  let batteryRTE = TECH_COSTS.batteryRTE;
  let dieselKW = 0;
  let drReduction = 0;
  let tariff = profile.tariff;

  for (const c of strategy.components) {
    switch (c.kind) {
      case 'solar-add':
        solarKW += c.capacityKW;
        break;
      case 'battery-add':
        batteryKWh += c.capacityKWh;
        batteryKW += c.powerKW;
        batteryRTE = c.rte;
        break;
      case 'diesel-add':
        dieselKW += c.capacityKW;
        break;
      case 'demand-response':
        drReduction = Math.max(drReduction, c.targetReductionPct);
        break;
      case 'tariff-switch':
        tariff = c.newTariff;
        break;
    }
  }

  // Diesel cost per MWh: gallons/MWh × $/gallon. Falls back to a non-zero
  // sentinel even when diesel is not installed (so the dispatch threshold
  // logic stays sane).
  const dieselCostPerMWh =
    TECH_COSTS.dieselGalPerMWh * TECH_COSTS.dieselFuelPerGallon;

  return {
    solarKW,
    batteryKWh,
    batteryKW,
    batteryRTE,
    dieselKW,
    dieselCostPerMWh,
    drReduction,
    tariff,
    capExUSD: strategy.capExUSD * scenario.capExMultiplier,
  };
}

// ─── 8760-hour annual cost simulator ──────────────────────────────

interface AnnualSimResult {
  totalCostUSD: number;
  /** Total kWh consumed from each source (used for carbon accounting). */
  fromSolarMWh: number;
  fromBatteryMWh: number;
  fromGridMWh: number;
  fromDieselMWh: number;
  /** Sample 24 hours from a representative summer-peak day. */
  representativeDay: DispatchHour[];
}

const HOURS_IN_YEAR = 8760;
const REPRESENTATIVE_MONTH = 6; // July (0-indexed) — peak load month for most profiles

function simulateAnnual(
  profile: FacilityProfile,
  params: EffectiveParams,
  scenario: SensitivityScenario,
): AnnualSimResult {
  let totalCost = 0;
  let totalSolar = 0;
  let totalBattery = 0;
  let totalGrid = 0;
  let totalDiesel = 0;

  // Battery state-of-charge in MWh, threaded across hours.
  const battCapMWh = params.batteryKWh / 1000;
  const battPowMW = params.batteryKW / 1000;
  let soc = battCapMWh * 0.5; // start at 50% SOC

  const representativeDay: DispatchHour[] = [];

  // Demand-charge proration: split annual demand charge across peak hour
  // each month. We approximate by spreading $/MW-month across the top
  // hour each day at the on-peak window. Simpler: convert to a per-MWh
  // adder that fires on hours within the on-peak window when load > 80%
  // of monthly peak.

  // Pre-compute monthly peak load for adder gating.
  const monthlyPeaks: number[] = profile.hourlyLoadProfile.map((row) =>
    row.reduce((m, v) => Math.max(m, v), 0),
  );

  // Iterate one synthetic year. We treat each day as the average of its
  // month, dispatching 8760 hours = 365 days × 24h. Day-of-week cycles 0..6.
  const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let dow = 1; // start Monday

  for (let m = 0; m < 12; m++) {
    const days = DAYS_PER_MONTH[m];
    const monthRow = profile.hourlyLoadProfile[m];
    const monthPeak = monthlyPeaks[m];

    for (let d = 0; d < days; d++) {
      for (let h = 0; h < 24; h++) {
        let loadMW = monthRow[h];

        // Demand response shaves loads near monthly peak by drReduction.
        if (params.drReduction > 0 && loadMW > 0.85 * monthPeak) {
          loadMW = loadMW * (1 - params.drReduction);
        }

        // Solar production (MW) for this hour.
        const solarKWh =
          params.solarKW *
          solarOutputCoefficient(profile.zone, m, h) *
          scenario.solarOutputMultiplier;
        const solarMW = solarKWh / 1000;

        // Tariff rate, scaled by scenario grid-price multiplier.
        const baseRate = tariffRateForHour(params.tariff, h, dow);
        const gridEnergyRate = baseRate * scenario.gridPriceMultiplier;

        // Demand-charge adder: convert $/MW-month to $/MWh during peak hours.
        // Heuristic: charge applies on ~120 peak-coincident hours per month.
        let demandChargeAdder = 0;
        if (params.tariff.demandCharge && loadMW > 0.85 * monthPeak) {
          demandChargeAdder = params.tariff.demandCharge / 120;
        }

        const out = dispatchHour({
          hour: h,
          dayOfWeek: dow,
          loadMW,
          solarMW,
          batterySOC: soc,
          batteryCapacityMWh: battCapMWh,
          batteryPowerMW: battPowMW,
          batteryRTE: params.batteryRTE,
          dieselAvailableMW: params.dieselKW / 1000,
          dieselCostPerMWh: params.dieselCostPerMWh,
          gridEnergyRate,
          demandChargeAdder,
          outage: false,
          dieselReserveOnly: true, // V1: diesel is reserve-only
        });

        soc = out.newBatterySOC;
        totalCost += out.costUSD;
        totalSolar += out.fromSolar;
        totalBattery += out.fromBattery;
        totalGrid += out.fromGrid;
        totalDiesel += out.fromDiesel;

        if (m === REPRESENTATIVE_MONTH && d === 14) {
          representativeDay.push({
            hour: h,
            loadMW,
            solarMW,
            batteryDispatchMW: out.fromBattery,
            gridDispatchMW: out.fromGrid,
            dieselDispatchMW: out.fromDiesel,
            costUSD: out.costUSD,
          });
        }
      }
      dow = (dow + 1) % 7;
    }
  }

  // Pad representative day if loop didn't run that combination.
  if (representativeDay.length === 0) {
    for (let h = 0; h < 24; h++) {
      representativeDay.push({
        hour: h,
        loadMW: profile.hourlyLoadProfile[REPRESENTATIVE_MONTH][h],
        solarMW: 0,
        batteryDispatchMW: 0,
        gridDispatchMW: profile.hourlyLoadProfile[REPRESENTATIVE_MONTH][h],
        dieselDispatchMW: 0,
        costUSD: 0,
      });
    }
  }

  // Sanity: number of hours simulated should be 8760.
  void HOURS_IN_YEAR;

  return {
    totalCostUSD: totalCost,
    fromSolarMWh: totalSolar,
    fromBatteryMWh: totalBattery,
    fromGridMWh: totalGrid,
    fromDieselMWh: totalDiesel,
    representativeDay,
  };
}

// ─── Carbon accounting ────────────────────────────────────────────

function annualCarbonTons(
  profile: FacilityProfile,
  annual: AnnualSimResult,
): number {
  const gridIntensity =
    ZONE_CARBON_INTENSITY[profile.zone] ?? ZONE_CARBON_INTENSITY.DEFAULT;
  // gCO₂ per MWh = gCO₂/kWh × 1000.
  const gridGramsPerMWh = gridIntensity * 1000;
  const dieselGramsPerMWh = DIESEL_CARBON_INTENSITY * 1000;

  // Battery losses are charged back to grid intensity.
  const batteryLosses = annual.fromBatteryMWh * (1 - TECH_COSTS.batteryRTE);

  const grams =
    annual.fromGridMWh * gridGramsPerMWh +
    annual.fromDieselMWh * dieselGramsPerMWh +
    batteryLosses * gridGramsPerMWh;

  // grams → metric tons
  return grams / 1_000_000;
}

// ─── Risk ranking ─────────────────────────────────────────────────

function assessRisk(
  base: ScenarioResult,
  optimistic: ScenarioResult,
  pessimistic: ScenarioResult,
): StrategyResult['riskRanking'] {
  // Range relative to base NPV. If the pessimistic case still beats baseline
  // by a comfortable margin, risk is low. If it goes negative or far below
  // base, risk rises.
  if (Math.abs(base.npvUSD) < 1) return 'low';
  if (pessimistic.npvUSD >= 0 && pessimistic.npvUSD > base.npvUSD * 0.6)
    return 'low';
  if (pessimistic.npvUSD < 0) return 'high';
  return 'moderate';
}

// ─── Per-strategy run ─────────────────────────────────────────────

function runScenario(
  profile: FacilityProfile,
  strategy: Strategy,
  baselineAnnualCost: number,
  scenario: SensitivityScenario,
): { result: ScenarioResult; annual: AnnualSimResult } {
  const params = effectiveParams(profile, strategy, scenario);
  const annual = simulateAnnual(profile, params, scenario);

  const annualSavings = baselineAnnualCost - annual.totalCostUSD;
  // Project savings linearly over 10 years (V1; future: model degradation).
  const cashflows = Array.from({ length: 10 }, () => annualSavings);

  const npv = calculateNPV(params.capExUSD, cashflows, profile.discountRate);
  const totalSavings10Yr = cashflows.reduce(
    (s, v, i) => s + v / Math.pow(1 + profile.discountRate, i + 1),
    0,
  );

  return {
    result: {
      npvUSD: npv,
      totalSavings10YrUSD: totalSavings10Yr,
      capExUSD: params.capExUSD,
    },
    annual,
  };
}

// ─── Entry point ──────────────────────────────────────────────────

export function runSimulation(profile: FacilityProfile): StrategyResult[] {
  const strategies = generateStrategies(profile);
  const baselineStrategy = strategies.find((s) => s.id === 'baseline')!;
  const baseScenario = SCENARIOS[0]; // 'base'

  // Baseline annual cost under base scenario — yardstick for savings.
  const baselineParams = effectiveParams(
    profile,
    baselineStrategy,
    baseScenario,
  );
  const baselineAnnual = simulateAnnual(
    profile,
    baselineParams,
    baseScenario,
  );
  const baselineCost = baselineAnnual.totalCostUSD;
  const baselineCarbon = annualCarbonTons(profile, baselineAnnual);

  const results: StrategyResult[] = strategies.map((strategy) => {
    // Run all three scenarios.
    const baseRun = runScenario(profile, strategy, baselineCost, SCENARIOS[0]);
    const optimisticRun = runScenario(
      profile,
      strategy,
      baselineCost,
      SCENARIOS[1],
    );
    const pessimisticRun = runScenario(
      profile,
      strategy,
      baselineCost,
      SCENARIOS[2],
    );

    const annualSavingsBase = baselineCost - baseRun.annual.totalCostUSD;
    const cashflows = Array.from({ length: 10 }, () => annualSavingsBase);
    const payback = calculatePaybackYears(
      baseRun.result.capExUSD,
      cashflows,
    );

    const carbonAnnual = annualCarbonTons(profile, baseRun.annual);
    const carbonReductionTons10Yr = (baselineCarbon - carbonAnnual) * 10;

    const risk = assessRisk(
      baseRun.result,
      optimisticRun.result,
      pessimisticRun.result,
    );

    return {
      strategy,
      scenarios: {
        base: baseRun.result,
        optimistic: optimisticRun.result,
        pessimistic: pessimisticRun.result,
      },
      carbonReductionTons10Yr,
      paybackYears: payback,
      hourlyDispatch: baseRun.annual.representativeDay,
      riskRanking: risk,
    };
  });

  // Sort by base NPV descending. Baseline can rank anywhere — its NPV is 0.
  return results.sort(
    (a, b) => b.scenarios.base.npvUSD - a.scenarios.base.npvUSD,
  );
}

// Re-export scenario typing for downstream callers that need it.
export type { ScenarioResult, StrategyComponent };

// FORGE Wave 2 — Hourly dispatch simulator.
// Heuristic dispatch (not MILP). Solar serves load first; surplus charges
// the battery; battery discharges to load when grid LMP is high enough to
// be worth the round-trip loss; diesel only fires under outage or as
// peak-shaving when grid + demand-charge make it economic. Demand charges
// are prorated to a per-MWh penalty applied to the peak-coincident hour.

import type { TariffStructure } from '@/lib/types/simulator';

export interface DispatchInput {
  /** Hour-of-day, 0-23. */
  hour: number;
  /** Day-of-week (0=Sun ... 6=Sat). Used to pick weekday/weekend TOU. */
  dayOfWeek: number;
  /** Load demand for this hour, MW. */
  loadMW: number;
  /** Solar production, MW (cap to inverter rating before passing in). */
  solarMW: number;
  /** Battery state-of-charge entering the hour, MWh. */
  batterySOC: number;
  /** Battery energy capacity, MWh. */
  batteryCapacityMWh: number;
  /** Battery max power (charge or discharge), MW. */
  batteryPowerMW: number;
  /** Battery roundtrip efficiency, AC-AC. */
  batteryRTE: number;
  /** Diesel rated capacity available to dispatch, MW (0 = no diesel). */
  dieselAvailableMW: number;
  /** Effective diesel cost, $/MWh delivered. */
  dieselCostPerMWh: number;
  /** Grid energy rate, $/MWh — already adjusted for TOU/realtime. */
  gridEnergyRate: number;
  /** Demand-charge contribution, $/MWh — prorated estimate for this hour. */
  demandChargeAdder: number;
  /** Outage flag — if true, grid is unavailable. */
  outage: boolean;
  /**
   * Diesel reserve mode — if true, diesel only fires under outage.
   * Set to false for peak-shaving experiments.
   */
  dieselReserveOnly: boolean;
}

export interface DispatchOutput {
  fromSolar: number;
  fromBattery: number;
  fromGrid: number;
  fromDiesel: number;
  newBatterySOC: number;
  costUSD: number;
}

/**
 * Effective tariff energy rate for the given hour. TOU lookup picks the
 * weekday or weekend schedule based on dayOfWeek.
 */
export function tariffRateForHour(
  tariff: TariffStructure,
  hour: number,
  dayOfWeek: number,
): number {
  if (tariff.type !== 'time-of-use' || !tariff.touSchedule) {
    return tariff.energyRate;
  }
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const periods =
    isWeekend && tariff.touSchedule.weekend
      ? tariff.touSchedule.weekend
      : tariff.touSchedule.weekday;
  for (const p of periods) {
    if (hour >= p.startHour && hour < p.endHour) return p.rate;
  }
  return tariff.energyRate;
}

/**
 * Dispatch one hour. Pure function; caller threads the SOC.
 */
export function dispatchHour(input: DispatchInput): DispatchOutput {
  const {
    loadMW,
    solarMW,
    batterySOC,
    batteryCapacityMWh,
    batteryPowerMW,
    batteryRTE,
    dieselAvailableMW,
    dieselCostPerMWh,
    gridEnergyRate,
    demandChargeAdder,
    outage,
    dieselReserveOnly,
  } = input;

  // 1) Solar serves load first.
  const fromSolar = Math.min(solarMW, loadMW);
  let remainingLoad = loadMW - fromSolar;
  const surplusSolar = Math.max(0, solarMW - loadMW);

  // 2) Surplus solar charges battery (capped by battery power and headroom).
  let nextSOC = batterySOC;
  const headroom = Math.max(0, batteryCapacityMWh - batterySOC);
  const chargeFromSolar = Math.min(surplusSolar, batteryPowerMW, headroom);
  nextSOC = Math.min(batteryCapacityMWh, nextSOC + chargeFromSolar);

  // 3) Battery discharges to remaining load if economic.
  // Threshold cost to deliver from battery = grid rate of charging energy
  // divided by RTE (we paid for grid energy to charge, recovering RTE). When
  // discharging energy charged from solar, the threshold collapses to zero,
  // but we don't track provenance — proxy with a simple LMP-vs-threshold
  // test. Battery will discharge whenever grid rate + demand charge exceeds
  // a discharge cost floor (we use grid_rate * 0.6 as a heuristic floor to
  // avoid round-tripping for marginal savings).
  const grossGridCost = gridEnergyRate + demandChargeAdder;
  const wantToDischarge =
    !outage ? grossGridCost > gridEnergyRate * 0.6 : true;
  let fromBattery = 0;
  if (remainingLoad > 0 && wantToDischarge && nextSOC > 0) {
    const dischargeCap = Math.min(
      remainingLoad,
      batteryPowerMW,
      nextSOC, // can't discharge more than what's stored (in MWh per hour ≈ MW)
    );
    fromBattery = dischargeCap;
    nextSOC = Math.max(0, nextSOC - fromBattery);
    remainingLoad -= fromBattery;
  }

  // 4) Grid (or diesel under outage) covers the remainder.
  let fromGrid = 0;
  let fromDiesel = 0;

  if (outage) {
    // Outage: diesel must serve whatever is left.
    fromDiesel = Math.min(remainingLoad, dieselAvailableMW);
    remainingLoad -= fromDiesel;
    // If diesel can't cover, the load is shed (we don't model unserved
    // energy economically here — V1 simplification).
  } else {
    // Normal operation: prefer grid, optionally peak-shave with diesel if
    // grossGridCost > dieselCostPerMWh and diesel is allowed to run.
    if (
      !dieselReserveOnly &&
      dieselAvailableMW > 0 &&
      grossGridCost > dieselCostPerMWh
    ) {
      fromDiesel = Math.min(remainingLoad, dieselAvailableMW);
      remainingLoad -= fromDiesel;
    }
    fromGrid = remainingLoad;
    remainingLoad = 0;
  }

  // 5) Cost.
  // Grid: gridEnergyRate + demandChargeAdder per MWh.
  // Diesel: dieselCostPerMWh per MWh.
  // Battery: roundtrip loss approximated as (1 - RTE) * fromBattery * gridEnergyRate * 0.5 — represents lost-arbitrage opportunity from prior charging. Conservative; keeps battery from looking free.
  const gridCost = fromGrid * (gridEnergyRate + demandChargeAdder);
  const dieselCost = fromDiesel * dieselCostPerMWh;
  const batteryRoundTripCost =
    fromBattery * gridEnergyRate * (1 - batteryRTE) * 0.5;
  const costUSD = gridCost + dieselCost + batteryRoundTripCost;

  return {
    fromSolar,
    fromBattery,
    fromGrid,
    fromDiesel,
    newBatterySOC: nextSOC,
    costUSD,
  };
}

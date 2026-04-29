// FORGE Wave 2 — Strategy Simulator mock data.
// Representative facility profiles, tariff library, technology cost
// assumptions, and zone-level grid carbon intensity. Frontend-only —
// these values are rough industry medians, not procurement-grade
// quotes. The shape stays stable when real data lands; the values move.

import type {
  FacilityProfile,
  TariffStructure,
} from '@/lib/types/simulator';

// ─── Technology cost assumptions ──────────────────────────────────
// All in USD, year-zero. SCENARIOS apply multipliers on top.

export const TECH_COSTS = {
  /** Installed solar PV, fully built including inverter and BOS. $/kW DC */
  solarPerKW: 1100,
  /** Battery energy capacity. $/kWh */
  batteryPerKWh: 280,
  /** Battery power conversion (inverter). $/kW */
  batteryPerKW: 90,
  /** Battery roundtrip efficiency, AC-AC */
  batteryRTE: 0.87,
  /** Diesel generator, $/kW. Includes switchgear and fuel tank. */
  dieselPerKW: 650,
  /** Diesel fuel cost, $/gallon. */
  dieselFuelPerGallon: 4.25,
  /** Diesel heat rate, gal/MWh. */
  dieselGalPerMWh: 73,
  /** One-time fixed cost for implementing demand response controls. */
  drImplementationCost: 75_000,
  /** One-time fixed cost for switching tariff (analysis + filing). */
  tariffSwitchCost: 25_000,
} as const;

// ─── Zone-level grid carbon intensity (gCO₂/kWh delivered) ────────

export const ZONE_CARBON_INTENSITY: Record<string, number> = {
  WEST_HUB: 420,
  AEP: 510,
  PSEG: 350,
  COMED: 470,
  RECO: 380,
  ATSI: 540,
  BGE: 410,
  DOM: 430,
  PEPCO: 400,
  JCPL: 360,
  DEFAULT: 420,
};

/** Diesel emissions, gCO₂/kWh of delivered electricity. */
export const DIESEL_CARBON_INTENSITY = 800;

// ─── Tariff library ────────────────────────────────────────────────

export const TARIFF_LIBRARY: Record<string, TariffStructure> = {
  flat_industrial: {
    type: 'flat',
    energyRate: 78, // $/MWh
  },
  tou_industrial: {
    type: 'time-of-use',
    energyRate: 78,
    touSchedule: {
      weekday: [
        { startHour: 0, endHour: 7, rate: 48, label: 'Off-peak' },
        { startHour: 7, endHour: 12, rate: 78, label: 'Mid-peak' },
        { startHour: 12, endHour: 19, rate: 142, label: 'On-peak' },
        { startHour: 19, endHour: 22, rate: 78, label: 'Mid-peak' },
        { startHour: 22, endHour: 24, rate: 48, label: 'Off-peak' },
      ],
      weekend: [
        { startHour: 0, endHour: 24, rate: 56, label: 'Weekend' },
      ],
    },
  },
  demand_industrial: {
    type: 'demand-charge',
    energyRate: 62,
    demandCharge: 18000, // $/MW-month
  },
  realtime_industrial: {
    type: 'real-time',
    energyRate: 72, // proxy for annual avg LMP
  },
};

// ─── Hourly load profile generator ────────────────────────────────
// Returns a 12 × 24 matrix in MW. Shape is normalized to a peak of
// peakMW; off-peak troughs scale by `seasonality[m]`.

interface ProfileShape {
  /** 24 multipliers, peak hour = 1.0 */
  daily: number[];
  /** 12 multipliers, scales the whole day per month */
  monthly: number[];
}

const SHAPE_HEAVY_INDUSTRIAL: ProfileShape = {
  // Around-the-clock baseload, mild day-shift bump.
  daily: [
    0.88, 0.86, 0.85, 0.85, 0.86, 0.88, 0.92, 0.96,
    1.00, 1.00, 0.99, 0.98, 0.97, 0.97, 0.98, 0.99,
    1.00, 0.99, 0.96, 0.93, 0.91, 0.90, 0.89, 0.88,
  ],
  monthly: [0.92, 0.93, 0.95, 0.96, 0.98, 1.00, 1.00, 1.00, 0.98, 0.96, 0.94, 0.93],
};

const SHAPE_DAYTIME_MANUFACTURING: ProfileShape = {
  // 5-day single-shift plant; weekends not modeled here, baseline annual MWh tuned.
  daily: [
    0.30, 0.28, 0.27, 0.27, 0.28, 0.40, 0.65, 0.92,
    1.00, 1.00, 1.00, 0.95, 0.85, 0.95, 1.00, 0.95,
    0.85, 0.65, 0.45, 0.35, 0.32, 0.31, 0.30, 0.30,
  ],
  monthly: [0.95, 0.95, 0.97, 0.98, 1.00, 1.00, 0.97, 0.98, 1.00, 1.00, 0.97, 0.95],
};

const SHAPE_DATACENTER: ProfileShape = {
  // Flat 24/7, slight summer cooling bump.
  daily: Array.from({ length: 24 }, () => 0.97),
  monthly: [0.94, 0.94, 0.95, 0.96, 0.98, 1.00, 1.00, 1.00, 0.98, 0.96, 0.94, 0.94],
};

const SHAPE_AGRICULTURAL: ProfileShape = {
  // Seasonal pumping + cold storage. Big summer peak, small winter.
  daily: [
    0.45, 0.42, 0.40, 0.40, 0.42, 0.55, 0.75, 0.85,
    0.92, 0.96, 1.00, 1.00, 0.98, 0.96, 0.95, 0.92,
    0.88, 0.78, 0.65, 0.55, 0.50, 0.48, 0.46, 0.45,
  ],
  monthly: [0.55, 0.58, 0.65, 0.78, 0.92, 1.00, 1.00, 1.00, 0.92, 0.78, 0.65, 0.58],
};

function buildHourlyProfile(shape: ProfileShape, peakMW: number): number[][] {
  const matrix: number[][] = [];
  for (let m = 0; m < 12; m++) {
    const row: number[] = [];
    for (let h = 0; h < 24; h++) {
      row.push(Number((shape.daily[h] * shape.monthly[m] * peakMW).toFixed(3)));
    }
    matrix.push(row);
  }
  return matrix;
}

// ─── Zone solar irradiance (kWh per kW DC per hour) ───────────────
// Capacity-factor-weighted typical day, scaled by month. Used to
// project solar output from solar capacity.

function dailySolarShape(): number[] {
  // Bell-curve around solar noon (hour 13 local).
  const peak = 13;
  const sigma = 3.4;
  return Array.from({ length: 24 }, (_, h) => {
    const x = (h - peak) / sigma;
    return Math.max(0, Math.exp(-0.5 * x * x));
  });
}

const MONTH_SOLAR_FACTORS: Record<string, number[]> = {
  // Peak hourly DC kWh/kW averaged across the month, normalized.
  WEST_HUB: [0.55, 0.65, 0.85, 1.00, 1.05, 1.10, 1.10, 1.05, 0.90, 0.75, 0.55, 0.45],
  AEP: [0.55, 0.65, 0.85, 1.00, 1.05, 1.10, 1.10, 1.05, 0.90, 0.75, 0.55, 0.45],
  PSEG: [0.50, 0.60, 0.80, 0.95, 1.00, 1.05, 1.05, 1.00, 0.85, 0.70, 0.50, 0.42],
  COMED: [0.45, 0.58, 0.80, 0.95, 1.05, 1.10, 1.10, 1.05, 0.88, 0.72, 0.50, 0.40],
  RECO: [0.50, 0.60, 0.80, 0.95, 1.00, 1.05, 1.05, 1.00, 0.85, 0.70, 0.50, 0.42],
  DEFAULT: [0.50, 0.62, 0.82, 0.97, 1.03, 1.08, 1.08, 1.03, 0.88, 0.72, 0.52, 0.42],
};

const DAILY_SOLAR_SHAPE = dailySolarShape();

/**
 * Solar output coefficient: returns kWh per kW-DC for the given month/hour.
 * Multiply by installed kW DC to get kWh, then convert to MW for dispatch.
 */
export function solarOutputCoefficient(
  zone: string,
  month: number,
  hour: number,
): number {
  const monthFactors =
    MONTH_SOLAR_FACTORS[zone] ?? MONTH_SOLAR_FACTORS.DEFAULT;
  return DAILY_SOLAR_SHAPE[hour] * monthFactors[month] * 0.55;
  // 0.55 ≈ effective capacity-factor scalar for hourly production at peak hour
}

// ─── Sample facility profiles ─────────────────────────────────────

export const FACILITY_PROFILES: FacilityProfile[] = [
  {
    id: 'mining_minas_gerais',
    name: 'Iron-ore mine — Minas Gerais analog (PJM AEP)',
    zone: 'AEP',
    annualBaselineMWh: 158_000,
    hourlyLoadProfile: buildHourlyProfile(SHAPE_HEAVY_INDUSTRIAL, 19.5),
    tariff: TARIFF_LIBRARY.demand_industrial,
    existingSolarKW: 4_000,
    existingBatteryKWh: 0,
    existingBatteryKW: 0,
    capitalBudgetUSD: 12_000_000,
    carbonIntensityGoal: 350,
    discountRate: 0.08,
  },
  {
    id: 'manufacturing_ohio',
    name: 'Auto parts plant — Ohio (PJM AEP)',
    zone: 'AEP',
    annualBaselineMWh: 42_500,
    hourlyLoadProfile: buildHourlyProfile(SHAPE_DAYTIME_MANUFACTURING, 8.5),
    tariff: TARIFF_LIBRARY.tou_industrial,
    existingSolarKW: 1_500,
    existingBatteryKWh: 0,
    existingBatteryKW: 0,
    capitalBudgetUSD: 6_000_000,
    discountRate: 0.08,
  },
  {
    id: 'datacenter_pseg',
    name: 'Hyperscale datacenter — Northern NJ (PSEG)',
    zone: 'PSEG',
    annualBaselineMWh: 320_000,
    hourlyLoadProfile: buildHourlyProfile(SHAPE_DATACENTER, 38.0),
    tariff: TARIFF_LIBRARY.realtime_industrial,
    existingSolarKW: 0,
    existingBatteryKWh: 4_000,
    existingBatteryKW: 1_000,
    capitalBudgetUSD: 35_000_000,
    carbonIntensityGoal: 200,
    discountRate: 0.08,
  },
  {
    id: 'agriculture_central_pa',
    name: 'Cold-storage / agricultural — Central PA (PPL)',
    zone: 'WEST_HUB',
    annualBaselineMWh: 24_000,
    hourlyLoadProfile: buildHourlyProfile(SHAPE_AGRICULTURAL, 6.5),
    tariff: TARIFF_LIBRARY.tou_industrial,
    existingSolarKW: 600,
    existingBatteryKWh: 0,
    existingBatteryKW: 0,
    capitalBudgetUSD: 3_500_000,
    discountRate: 0.08,
  },
];

export const DEFAULT_FACILITY_ID = 'mining_minas_gerais';

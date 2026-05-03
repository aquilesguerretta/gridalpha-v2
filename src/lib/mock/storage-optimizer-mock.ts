// FORGE Wave 3 — Storage DA Bid Optimizer mock data.
//
// Why a separate file (not `storage-mock.ts`)? FOUNDRY's
// `storage-mock.ts` defines its own `BatteryAsset` shape (location,
// mwCapacity, soc) for the Storage Nest's existing OVERVIEW tab. The
// optimizer needs a different shape (powerKW, durationHours, RTE,
// degradation), so this sibling file owns the optimizer-specific
// fleets, ancillary signals, LMP forecasts, and yesterday's actuals.
// Both files coexist; FOUNDRY's is read by OVERVIEW, this one by the
// DA BID OPTIMIZER tab.

import type {
  AncillaryService,
  BatteryAsset,
  Fleet,
  MarketContext,
} from '@/lib/types/storage';
import { ZONE_24H_PRICES } from '@/lib/pjm/mock-data';

// ─── Fleet helpers ────────────────────────────────────────────────

function makeAsset(
  id: string,
  name: string,
  zone: string,
  powerKW: number,
  durationHours: number,
  opts: Partial<BatteryAsset> = {},
): BatteryAsset {
  return {
    id,
    name,
    zone,
    powerKW,
    durationHours,
    capacityKWh: powerKW * durationHours,
    rte: opts.rte ?? 0.88,
    socMin: opts.socMin ?? 0.10,
    socMax: opts.socMax ?? 0.95,
    degradationCostPerMWh: opts.degradationCostPerMWh ?? 5,
    ancillaryEnabled: opts.ancillaryEnabled ?? false,
    ancillaryService: opts.ancillaryService,
    installDate: opts.installDate,
    cyclesToDate: opts.cyclesToDate,
  };
}

// ─── Three representative fleets ──────────────────────────────────

export const FLEETS: Fleet[] = [
  // 1) Single-asset operator — 100MW / 4hr in PSEG, ancillary stacked
  {
    id: 'fleet_singleton_pseg',
    operatorName: 'PSEG East Battery LLC',
    forecastSource: 'pjm-da-forecast',
    assets: [
      makeAsset(
        'asset_pseg_100_4h',
        'Carteret 100 MW',
        'PSEG',
        100_000,
        4,
        {
          ancillaryEnabled: true,
          ancillaryService: 'reg-d',
          installDate: '2024-09-01',
          cyclesToDate: 187,
        },
      ),
    ],
  },
  // 2) Multi-asset portfolio — 4 assets, 4 zones, ~280MW total
  {
    id: 'fleet_portfolio_280',
    operatorName: 'Mid-Atlantic Storage Partners',
    forecastSource: 'pjm-da-forecast',
    assets: [
      makeAsset(
        'asset_pseg_80_4h',
        'Newark Bay 80 MW',
        'PSEG',
        80_000,
        4,
        { ancillaryEnabled: true, ancillaryService: 'reg-d', cyclesToDate: 312 },
      ),
      makeAsset(
        'asset_jcpl_60_2h',
        'Lakewood 60 MW',
        'JCPL',
        60_000,
        2,
        { ancillaryEnabled: false, cyclesToDate: 421 },
      ),
      makeAsset(
        'asset_bge_100_4h',
        'Brandon Shores 100 MW',
        'BGE',
        100_000,
        4,
        { ancillaryEnabled: true, ancillaryService: 'spin', cyclesToDate: 95 },
      ),
      makeAsset(
        'asset_dom_40_2h',
        'Greensville 40 MW',
        'DOMINION',
        40_000,
        2,
        { ancillaryEnabled: false, cyclesToDate: 540 },
      ),
    ],
  },
  // 3) Large IPP fleet — 8 assets, 4 zones, 600MW total
  {
    id: 'fleet_ipp_600',
    operatorName: 'Falcon Energy Capital',
    forecastSource: 'pjm-da-forecast',
    assets: [
      makeAsset('asset_ipp_pseg_a', 'PSEG Hub A 75 MW', 'PSEG', 75_000, 4, {
        ancillaryEnabled: true,
        ancillaryService: 'reg-d',
      }),
      makeAsset('asset_ipp_pseg_b', 'PSEG Hub B 75 MW', 'PSEG', 75_000, 4, {
        ancillaryEnabled: true,
        ancillaryService: 'reg-a',
      }),
      makeAsset('asset_ipp_jcpl_a', 'JCPL Coastal 100 MW', 'JCPL', 100_000, 2, {
        ancillaryEnabled: false,
      }),
      makeAsset('asset_ipp_jcpl_b', 'JCPL Inland 50 MW', 'JCPL', 50_000, 4, {
        ancillaryEnabled: true,
        ancillaryService: 'reg-d',
      }),
      makeAsset('asset_ipp_bge_a', 'BGE North 80 MW', 'BGE', 80_000, 2, {
        ancillaryEnabled: false,
      }),
      makeAsset('asset_ipp_bge_b', 'BGE South 60 MW', 'BGE', 60_000, 8, {
        ancillaryEnabled: true,
        ancillaryService: 'spin',
      }),
      makeAsset('asset_ipp_dom_a', 'DOM Tidewater 80 MW', 'DOMINION', 80_000, 4, {
        ancillaryEnabled: true,
        ancillaryService: 'reg-d',
      }),
      makeAsset('asset_ipp_dom_b', 'DOM Piedmont 80 MW', 'DOMINION', 80_000, 2, {
        ancillaryEnabled: false,
      }),
    ],
  },
];

export const DEFAULT_OPTIMIZER_FLEET_ID = FLEETS[1].id;

// ─── Day-ahead LMP table ──────────────────────────────────────────
// Wraps `ZONE_24H_PRICES` from the PJM mock-data module and fills in
// any zones the fleets reference that aren't in the source map.

const DERIVED_ZONE_MULT: Record<string, number> = {
  JCPL: 1.07,
  BGE: 0.96,
  DOMINION: 1.02,
  AEP: 0.78,
  ATSI: 0.84,
  DPL: 0.99,
  EKPC: 0.81,
  OVEC: 0.79,
  PEPCO: 1.05,
  AECO: 1.01,
  DAY: 0.83,
  DUQ: 0.85,
  METED: 0.92,
  PENELEC: 0.88,
  PPL: 0.94,
};

function deriveZonePrices(zone: string, base: number[]): number[] {
  const mult = DERIVED_ZONE_MULT[zone] ?? 1.0;
  return base.map((v) => Number((v * mult).toFixed(2)));
}

const BASELINE_24H = ZONE_24H_PRICES.DEFAULT;

export const DA_FORECAST_BY_ZONE: Record<string, number[]> = (() => {
  const out: Record<string, number[]> = { ...ZONE_24H_PRICES };
  for (const z of [
    'JCPL',
    'BGE',
    'DOMINION',
    'AEP',
    'ATSI',
    'DPL',
    'PEPCO',
    'AECO',
    'METED',
    'PENELEC',
    'PPL',
    'DAY',
    'DUQ',
    'EKPC',
    'OVEC',
  ]) {
    if (!out[z]) {
      out[z] = deriveZonePrices(z, BASELINE_24H);
    }
  }
  return out;
})();

// ─── Yesterday's actual clearing prices ──────────────────────────
// Slightly perturbed from the forecast — used for performance-vs-actual
// in PerformanceVsOptimal.

export const DA_YESTERDAY_BY_ZONE: Record<string, number[]> = (() => {
  const out: Record<string, number[]> = {};
  for (const [zone, series] of Object.entries(DA_FORECAST_BY_ZONE)) {
    out[zone] = series.map((v, h) => {
      const noise = ((h * 7919 + zone.length * 31) % 11) - 5;
      return Number((v + noise * 0.4).toFixed(2));
    });
  }
  return out;
})();

// ─── Ancillary clearing prices ───────────────────────────────────
// One 24-hour curve per service product.

function buildAncillaryCurve(peakAvg: number, troughAvg: number): number[] {
  const shape = [
    0.55, 0.50, 0.48, 0.50, 0.55, 0.70, 0.85, 1.00,
    1.10, 1.15, 1.10, 1.05, 1.00, 1.05, 1.15, 1.25,
    1.30, 1.35, 1.30, 1.20, 1.05, 0.95, 0.80, 0.65,
  ];
  const mid = (peakAvg + troughAvg) / 2;
  const range = (peakAvg - troughAvg) / 2;
  return shape.map((s) => Number((mid + (s - 1) * range).toFixed(2)));
}

export const ANCILLARY_MCP: Record<AncillaryService, number[]> = {
  'reg-d': buildAncillaryCurve(38, 14),
  'reg-a': buildAncillaryCurve(22, 9),
  spin: buildAncillaryCurve(11, 4),
};

export const DEFAULT_REGULATION_MILEAGE_PAYMENT = 28; // $/MWh

// ─── Default market context ───────────────────────────────────────

export function defaultMarketContext(asOfDate?: string): MarketContext {
  return {
    daHourlyLMPByZone: DA_FORECAST_BY_ZONE,
    ancillaryHourlyMCP: ANCILLARY_MCP,
    regulationMileagePayment: DEFAULT_REGULATION_MILEAGE_PAYMENT,
    asOfDate: asOfDate ?? new Date().toISOString().slice(0, 10),
  };
}

// ─── Service product utilization (V1) ────────────────────────────
// Approximates the share of reserved MW that gets dispatched. Used by
// the ancillary stacker for mileage revenue projection.

export const ANCILLARY_UTILIZATION: Record<AncillaryService, number> = {
  'reg-d': 0.08,
  'reg-a': 0.04,
  spin: 0.0,
};

// FOUNDRY mock — Analytics destination data for the 5 placeholder tabs.
// The 'intelligence' tab uses live Peregrine RSS via useNewsData and is NOT
// mocked here.

import type {
  BidScheduleHour,
  ConvergencePoint,
  FuelGanttSegment,
  PlantProfitabilityRow,
  ReserveMarginPoint,
} from '@/lib/types/analytics';

export interface PriceIntelligenceKPIs {
  systemAvgLmp: number;
  maxLmp: number;
  minLmp: number;
  mostCongestedZone: string;
}

export interface PriceOverlaySeries {
  key: string;
  label: string;
  prices24h: number[];
}

export interface PriceComponentsHour {
  hour: number;
  energy: number;
  congestion: number;
  loss: number;
}

export interface DispatchFrontierMarker {
  gasPrice: number;
  lmp: number;
  heatRate: number;
  label: string;
}

export interface ZoneReliabilityScore {
  zone: string;
  reliabilityScore: number;
  queueSuccessRate: number;
}

export interface ConvergenceOpportunity {
  id: string;
  zone: string;
  expectedSpread: number;
  confidence: number;
}

// ── Price Intelligence ──────────────────────────────────────────────────────

export const PRICE_INTELLIGENCE_KPIS: PriceIntelligenceKPIs = {
  systemAvgLmp: 34.21,
  maxLmp: 58.40,
  minLmp: 26.80,
  mostCongestedZone: 'RECO',
};

export const PRICE_INTELLIGENCE_OVERLAY = {
  zoneA: {
    key: 'PSEG',
    label: 'PSEG',
    prices24h: [28.9,28.2,28.6,29.1,33.2,52.8,49.4,41.2,38.8,37.4,36.9,36.1,35.7,35.2,36.1,37.4,39.2,41.8,40.1,38.6,37.4,36.8,35.9,35.1],
  } satisfies PriceOverlaySeries,
  zoneB: {
    key: 'WEST_HUB',
    label: 'WEST HUB',
    prices24h: [28.1,27.4,27.8,28.2,31.5,48.2,45.1,38.4,36.2,35.1,34.8,34.2,33.9,33.5,34.1,35.2,36.8,38.4,37.2,36.1,35.4,34.8,34.2,33.6],
  } satisfies PriceOverlaySeries,
};

export const PRICE_COMPONENTS_BREAKDOWN: PriceComponentsHour[] = Array.from({ length: 24 }, (_, hour) => {
  const lmp = PRICE_INTELLIGENCE_OVERLAY.zoneA.prices24h[hour];
  const congestion = Number(((Math.sin(hour / 4) + 1) * 1.6).toFixed(2));
  const loss = Number((1.10 + (hour % 5) * 0.05).toFixed(2));
  const energy = Number((lmp - congestion - loss).toFixed(2));
  return { hour, energy, congestion, loss };
});

// ── Spark Spread ────────────────────────────────────────────────────────────

export const SPARK_SPREAD_PLANTS: PlantProfitabilityRow[] = [
  { name: 'Brunner Island Gas',   zone: 'PPL',      fuel: 'NG',   heatRate: 7850, capacity: 1490, sparkSpread: 12.8, status: 'profitable'   },
  { name: 'Fairless Hills Gas',   zone: 'PSEG',     fuel: 'NG',   heatRate: 7620, capacity: 1100, sparkSpread: 14.6, status: 'profitable'   },
  { name: 'Possum Point Gas',     zone: 'DOMINION', fuel: 'NG',   heatRate: 7980, capacity: 1247, sparkSpread: 11.4, status: 'profitable'   },
  { name: 'Salem Harbor Gas',     zone: 'PSEG',     fuel: 'NG',   heatRate: 8240, capacity:  692, sparkSpread:  9.8, status: 'profitable'   },
  { name: 'Mountaineer Coal',     zone: 'AEP',      fuel: 'COAL', heatRate: 9650, capacity: 1300, sparkSpread:  6.2, status: 'breakeven'    },
  { name: 'Conemaugh Coal',       zone: 'PENELEC',  fuel: 'COAL', heatRate: 9810, capacity: 1711, sparkSpread:  5.8, status: 'breakeven'    },
  { name: 'Homer City Coal',      zone: 'PENELEC',  fuel: 'COAL', heatRate: 9420, capacity: 1884, sparkSpread:  6.6, status: 'breakeven'    },
  { name: "Hatfield's Ferry Gas", zone: 'AEP',      fuel: 'NG',   heatRate: 8100, capacity: 1710, sparkSpread: 10.4, status: 'profitable'   },
  { name: 'Marcus Hook Gas',      zone: 'PECO',     fuel: 'NG',   heatRate: 7450, capacity:  808, sparkSpread: 13.2, status: 'profitable'   },
  { name: 'Cromby Gas (peaker)',  zone: 'PECO',     fuel: 'NG',   heatRate:10240, capacity:  444, sparkSpread: -1.2, status: 'unprofitable' },
];

export const DISPATCH_FRONTIER_MARKER: DispatchFrontierMarker = {
  gasPrice: 3.20,
  lmp: 34.93,
  heatRate: 10240,
  label: 'PSEG GAS PEAKER · BREAKEVEN',
};

// ── Battery Arb ─────────────────────────────────────────────────────────────

export const BATTERY_OPTIMAL_SCHEDULE: BidScheduleHour[] = [
  { hour: 0,  chargeMw: 0,   dischargeMw: 0,   expectedPrice: 30.1 },
  { hour: 1,  chargeMw: 80,  dischargeMw: 0,   expectedPrice: 28.4 },
  { hour: 2,  chargeMw: 200, dischargeMw: 0,   expectedPrice: 26.8 },
  { hour: 3,  chargeMw: 200, dischargeMw: 0,   expectedPrice: 26.2 },
  { hour: 4,  chargeMw: 200, dischargeMw: 0,   expectedPrice: 26.5 },
  { hour: 5,  chargeMw: 100, dischargeMw: 0,   expectedPrice: 28.9 },
  { hour: 6,  chargeMw: 0,   dischargeMw: 0,   expectedPrice: 32.4 },
  { hour: 7,  chargeMw: 0,   dischargeMw: 60,  expectedPrice: 41.5 },
  { hour: 8,  chargeMw: 0,   dischargeMw: 50,  expectedPrice: 38.9 },
  { hour: 9,  chargeMw: 0,   dischargeMw: 0,   expectedPrice: 35.8 },
  { hour: 10, chargeMw: 0,   dischargeMw: 0,   expectedPrice: 34.1 },
  { hour: 11, chargeMw: 60,  dischargeMw: 0,   expectedPrice: 32.6 },
  { hour: 12, chargeMw: 80,  dischargeMw: 0,   expectedPrice: 31.2 },
  { hour: 13, chargeMw: 40,  dischargeMw: 0,   expectedPrice: 32.0 },
  { hour: 14, chargeMw: 0,   dischargeMw: 0,   expectedPrice: 33.4 },
  { hour: 15, chargeMw: 0,   dischargeMw: 0,   expectedPrice: 36.1 },
  { hour: 16, chargeMw: 0,   dischargeMw: 80,  expectedPrice: 39.4 },
  { hour: 17, chargeMw: 0,   dischargeMw: 200, expectedPrice: 44.8 },
  { hour: 18, chargeMw: 0,   dischargeMw: 200, expectedPrice: 47.2 },
  { hour: 19, chargeMw: 0,   dischargeMw: 200, expectedPrice: 45.6 },
  { hour: 20, chargeMw: 0,   dischargeMw: 120, expectedPrice: 41.8 },
  { hour: 21, chargeMw: 0,   dischargeMw: 0,   expectedPrice: 37.4 },
  { hour: 22, chargeMw: 0,   dischargeMw: 0,   expectedPrice: 34.2 },
  { hour: 23, chargeMw: 40,  dischargeMw: 0,   expectedPrice: 31.8 },
];

// 3×3 sensitivity matrix.
// rows: efficiency = [0.80, 0.85, 0.90]
// cols: cycling cost ($/MWh-cycle) = [12, 18, 24]
// Cell value: forecast annual revenue ($/kW-yr), 4-hr battery in PSEG.
export const BATTERY_SENSITIVITY_ROWS = [0.80, 0.85, 0.90] as const;
export const BATTERY_SENSITIVITY_COLS = [12, 18, 24] as const;

export const BATTERY_SENSITIVITY_MATRIX: number[][] = [
  [148.2, 132.6, 116.4],
  [161.8, 145.4, 128.9],
  [173.6, 156.2, 138.4],
];

// ── Marginal Fuel ───────────────────────────────────────────────────────────

const FUEL_COLOR: Record<string, string> = {
  NG:    '#F97316',
  COAL:  '#6B7280',
  NUC:   '#FBBF24',
  WIND:  '#38BDF8',
  SOLAR: '#FDE047',
};

const fuelByHour: Array<keyof typeof FUEL_COLOR> = [
  'NG','NG','COAL','COAL','COAL','NG','NG','NG',
  'NG','NG','SOLAR','SOLAR','SOLAR','SOLAR','NG','NG',
  'NG','NG','NG','NG','NG','NG','NG','NG',
];

export const MARGINAL_FUEL_GANTT_24H: FuelGanttSegment[] = fuelByHour.map((fuel, hour) => ({
  hour,
  fuel,
  color: FUEL_COLOR[fuel],
}));

// ── Reserve Margin (Resource Gap tab) ───────────────────────────────────────

export const RESERVE_MARGIN_24H: ReserveMarginPoint[] = Array.from({ length: 24 }, (_, hour) => {
  const margins = [22.4,23.1,24.0,24.4,24.1,22.8,19.8,16.4,17.2,18.8,20.1,20.9,21.2,21.1,20.4,19.1,17.6,15.8,14.9,15.4,16.8,18.4,20.1,21.4];
  return { hour, margin: margins[hour], threshold: 15.0 };
});

export const ZONE_RELIABILITY_SCORES: ZoneReliabilityScore[] = [
  { zone: 'COMED',    reliabilityScore: 91, queueSuccessRate: 38.2 },
  { zone: 'AEP',      reliabilityScore: 84, queueSuccessRate: 42.6 },
  { zone: 'WEST_HUB', reliabilityScore: 78, queueSuccessRate: 31.4 },
  { zone: 'DOMINION', reliabilityScore: 71, queueSuccessRate: 24.8 },
  { zone: 'PSEG',     reliabilityScore: 64, queueSuccessRate: 21.2 },
  { zone: 'PPL',      reliabilityScore: 58, queueSuccessRate: 19.6 },
  { zone: 'BGE',      reliabilityScore: 56, queueSuccessRate: 17.4 },
  { zone: 'RECO',     reliabilityScore: 52, queueSuccessRate: 12.8 },
];

// ── Convergence (DA vs RT) ──────────────────────────────────────────────────

export const CONVERGENCE_24H: ConvergencePoint[] = Array.from({ length: 24 }, (_, hour) => {
  const da = PRICE_INTELLIGENCE_OVERLAY.zoneA.prices24h[hour];
  const noise = ((hour * 11) % 7 - 3) * 0.6;
  const rtPrice = Number((da + noise).toFixed(2));
  return {
    hour,
    daPrice: da,
    rtPrice,
    spread: Number((rtPrice - da).toFixed(2)),
  };
});

export const CONVERGENCE_OPPORTUNITIES: ConvergenceOpportunity[] = [
  { id: 'co-001', zone: 'PSEG',  expectedSpread: 4.20, confidence: 0.78 },
  { id: 'co-002', zone: 'RECO',  expectedSpread: 6.85, confidence: 0.71 },
  { id: 'co-003', zone: 'COMED', expectedSpread: -2.40, confidence: 0.82 },
];

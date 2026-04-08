// src/lib/pjm/mock-data.ts
// All mock PJM data for Sprint 2D card designs.
// ─────────────────────────────────────────────────────────────────────────────
// SPRINT 2C CONTRACT: This file is the ONLY file that changes when live data
// is wired. Replace these dictionaries with API calls. No card file changes.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types used by mock constants ────────────────────────────────────────────

export type Regime = 'SCARCITY' | 'SURPLUS' | 'TRANSITION' | 'NORMAL';

export interface AssetData {
  id: string;
  name: string;
  type: "plant" | "node";
  mwOutput: number;
  capacity: number;
  lmp: number;
  lmpDelta: number;
  heatRate: number;
  fuelType: string;
  neighbors: string[];
}

export interface TransmissionLine {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  loading: number; // 0-100, above 90 is thermal limit
  capacity: number; // MW
  name: string;
}

// ── GlobalShell mock data ────────────────────────────────────────────────────

export const ZONE_LMP: Record<string, { price: number; delta: number }> = {
  'WEST_HUB':  { price: 35.90, delta: +0.5 },
  'COMED':     { price: 32.04, delta: -0.8 },
  'AEP':       { price: 33.36, delta: +1.1 },
  'ATSI':      { price: 33.23, delta: +0.6 },
  'DAY':       { price: 33.89, delta: +1.3 },
  'DEOK':      { price: 32.69, delta: -0.2 },
  'DUQ':       { price: 33.20, delta: +0.9 },
  'DOMINION':  { price: 34.23, delta: +1.8 },
  'DPL':       { price: 35.26, delta: +2.0 },
  'EKPC':      { price: 32.48, delta: -0.5 },
  'PPL':       { price: 33.11, delta: +0.4 },
  'PECO':      { price: 34.10, delta: +1.5 },
  'PSEG':      { price: 34.93, delta: +2.1 },
  'JCPL':      { price: 34.67, delta: +1.9 },
  'PEPCO':     { price: 34.81, delta: +1.7 },
  'BGE':       { price: 34.50, delta: +1.4 },
  'METED':     { price: 34.10, delta: +1.2 },
  'PENELEC':   { price: 32.96, delta: +0.3 },
  'RECO':      { price: 36.60, delta: +3.2 },
  'OVEC':      { price: 32.56, delta: -0.4 },
};

export const ZONE_SPARK: Record<string, number> = {
  'WEST_HUB': 12.4, 'COMED': 10.2, 'AEP': 11.8, 'ATSI': 11.5,
  'DAY': 12.1, 'DEOK': 10.9, 'DUQ': 11.3, 'DOMINION': 13.8,
  'DPL': 14.2, 'EKPC': 10.5, 'PPL': 12.8, 'PECO': 13.5,
  'PSEG': 14.9, 'JCPL': 14.6, 'PEPCO': 14.0, 'BGE': 13.9,
  'METED': 13.2, 'PENELEC': 11.9, 'RECO': 16.1, 'OVEC': 10.8,
};

export const ZONE_BATTERY: Record<string, { revenue: number; charge: string; discharge: string; soc: number }> = {
  'WEST_HUB': { revenue: 4240, charge: '02:00–06:00', discharge: '16:00–20:00', soc: 71 },
  'COMED':    { revenue: 3820, charge: '01:00–05:00', discharge: '15:00–19:00', soc: 65 },
  'AEP':      { revenue: 3960, charge: '02:00–06:00', discharge: '16:00–20:00', soc: 68 },
  'ATSI':     { revenue: 3900, charge: '02:00–06:00', discharge: '17:00–21:00', soc: 67 },
  'DAY':      { revenue: 4050, charge: '01:00–05:00', discharge: '16:00–20:00', soc: 70 },
  'DEOK':     { revenue: 3780, charge: '02:00–06:00', discharge: '15:00–19:00', soc: 64 },
  'DUQ':      { revenue: 3930, charge: '03:00–07:00', discharge: '16:00–20:00', soc: 69 },
  'DOMINION': { revenue: 4380, charge: '02:00–06:00', discharge: '15:00–19:00', soc: 74 },
  'DPL':      { revenue: 4510, charge: '01:00–05:00', discharge: '16:00–20:00', soc: 76 },
  'EKPC':     { revenue: 3710, charge: '02:00–06:00', discharge: '16:00–20:00', soc: 62 },
  'PPL':      { revenue: 4160, charge: '02:00–06:00', discharge: '17:00–21:00', soc: 72 },
  'PECO':     { revenue: 4420, charge: '01:00–05:00', discharge: '16:00–20:00', soc: 75 },
  'PSEG':     { revenue: 4680, charge: '01:00–05:00', discharge: '15:00–19:00', soc: 78 },
  'JCPL':     { revenue: 4590, charge: '01:00–05:00', discharge: '15:00–19:00', soc: 77 },
  'PEPCO':    { revenue: 4490, charge: '02:00–06:00', discharge: '16:00–20:00', soc: 76 },
  'BGE':      { revenue: 4460, charge: '02:00–06:00', discharge: '16:00–20:00', soc: 75 },
  'METED':    { revenue: 4280, charge: '02:00–06:00', discharge: '17:00–21:00', soc: 73 },
  'PENELEC':  { revenue: 3980, charge: '03:00–07:00', discharge: '16:00–20:00', soc: 68 },
  'RECO':     { revenue: 5020, charge: '01:00–05:00', discharge: '14:00–18:00', soc: 82 },
  'OVEC':     { revenue: 3690, charge: '02:00–06:00', discharge: '16:00–20:00', soc: 63 },
};

export const ZONE_RESERVE: Record<string, number> = {
  'WEST_HUB': 18.4, 'COMED': 21.2, 'AEP': 19.6, 'ATSI': 20.1,
  'DAY': 19.8, 'DEOK': 22.3, 'DUQ': 18.9, 'DOMINION': 16.2,
  'DPL': 15.8, 'EKPC': 23.1, 'PPL': 17.4, 'PECO': 16.9,
  'PSEG': 14.3, 'JCPL': 14.8, 'PEPCO': 15.1, 'BGE': 15.6,
  'METED': 17.8, 'PENELEC': 19.2, 'RECO': 13.1, 'OVEC': 24.2,
};

export const REGIME_COLORS: Record<Regime, string> = {
  SCARCITY:   '#FF4444',
  SURPLUS:    '#00A3FF',
  TRANSITION: '#FFB800',
  NORMAL:     '#00FFF0',
};

export const REGIME_DESCRIPTIONS: Record<Regime, string> = {
  SCARCITY:   'High LMP · Tight reserves · Peaker dispatch active',
  SURPLUS:    'Low LMP · Ample reserves · Renewables curtailing',
  TRANSITION: 'Marginal fuel shifting · Monitor spreads',
  NORMAL:     'Balanced supply · Normal operations',
};

export const ZONE_ALERTS: Record<string, { msg: string; severity: string; time: string }[]> = {
  'WEST_HUB': [
    { msg: "Congestion spike — West Hub", severity: "critical", time: "08:50" },
    { msg: "DA/RT spread > 8% threshold", severity: "warning", time: "08:32" },
    { msg: "PJM dispatch signal: NORMAL", severity: "info", time: "08:15" },
  ],
  'PSEG': [
    { msg: "Interface limit binding — PSEG", severity: "critical", time: "09:02" },
    { msg: "Import constraint from PJM-EAST", severity: "warning", time: "08:44" },
    { msg: "Battery dispatch: ACTIVE", severity: "info", time: "08:21" },
  ],
  'RECO': [
    { msg: "LMP spike — RECO $36.60/MWh", severity: "critical", time: "09:05" },
    { msg: "NY import limit reached", severity: "critical", time: "08:50" },
    { msg: "Peaker dispatch imminent", severity: "warning", time: "08:30" },
  ],
  'COMED': [
    { msg: "Wind ramp detected — COMED", severity: "info", time: "08:40" },
    { msg: "Surplus generation — curtail watch", severity: "warning", time: "08:22" },
    { msg: "Imports from MISO elevated", severity: "info", time: "08:05" },
  ],
  'DOMINION': [
    { msg: "Dominion zone load rising", severity: "warning", time: "09:00" },
    { msg: "Gas unit on hot standby", severity: "warning", time: "08:45" },
    { msg: "Transmission line restored", severity: "info", time: "08:20" },
  ],
  'PPL': [
    { msg: "PPL congestion detected — Rte 18", severity: "critical", time: "09:15" },
    { msg: "DA/RT spread > $8 threshold", severity: "warning", time: "09:22" },
    { msg: "Battery dispatch signal: ACTIVE", severity: "warning", time: "09:36" },
  ],
  'PECO': [
    { msg: "PECO zone spread widening", severity: "warning", time: "09:15" },
    { msg: "PA demand surge detected", severity: "critical", time: "09:22" },
    { msg: "DA/RT divergence — PECO", severity: "info", time: "09:29" },
  ],
  'AEP': [
    { msg: "AEP thermal unit trip — 400MW", severity: "critical", time: "08:55" },
    { msg: "Reserve sharing activated", severity: "warning", time: "08:40" },
    { msg: "MISO tie flow elevated", severity: "info", time: "08:20" },
  ],
  'DEFAULT': [
    { msg: "Zone LMP elevated · Monitor", severity: "warning", time: "08:55" },
    { msg: "System-wide congestion moderate", severity: "info", time: "08:30" },
    { msg: "PJM dispatch signal: NORMAL", severity: "info", time: "08:10" },
  ],
};

export const sampleAssets: AssetData[] = [
  { id: "plant-1", name: "BRUNNER ISLAND", type: "plant", mwOutput: 1458, capacity: 1490, lmp: 31.85, lmpDelta: 2.4, heatRate: 7850, fuelType: "NATURAL GAS", neighbors: ["YORK", "HOLTWOOD", "PEACH BOTTOM"] },
  { id: "plant-2", name: "MONTOUR", type: "plant", mwOutput: 1590, capacity: 1600, lmp: 29.45, lmpDelta: -1.2, heatRate: 9200, fuelType: "COAL", neighbors: ["SUNBURY", "DANVILLE"] },
  { id: "node-1", name: "WEST HUB", type: "node", mwOutput: 0, capacity: 0, lmp: 31.85, lmpDelta: 2.4, heatRate: 0, fuelType: "HUB", neighbors: ["AEP", "PSEG", "PECO", "PPL"] },
];

export const transmissionLines: TransmissionLine[] = [
  { id: "line-1", from: { x: 25, y: 40 }, to: { x: 45, y: 55 }, loading: 45, capacity: 1200, name: "DUQ-WEST" },
  { id: "line-2", from: { x: 45, y: 55 }, to: { x: 75, y: 40 }, loading: 72, capacity: 1500, name: "WEST-PECO" },
  { id: "line-3", from: { x: 75, y: 40 }, to: { x: 85, y: 30 }, loading: 88, capacity: 800,  name: "PECO-PSEG" },
  { id: "line-4", from: { x: 45, y: 55 }, to: { x: 55, y: 35 }, loading: 93, capacity: 1100, name: "WEST-PPL" },
  { id: "line-5", from: { x: 20, y: 50 }, to: { x: 25, y: 40 }, loading: 38, capacity: 900,  name: "AEP-DUQ" },
  { id: "line-6", from: { x: 15, y: 30 }, to: { x: 25, y: 40 }, loading: 55, capacity: 1000, name: "COMED-DUQ" },
  { id: "line-7", from: { x: 55, y: 35 }, to: { x: 75, y: 40 }, loading: 67, capacity: 1300, name: "PPL-PECO" },
];

export const hubLocations = [
  { id: "west-hub", name: "WEST HUB", x: 45, y: 55 },
  { id: "peco",     name: "PECO",     x: 75, y: 40 },
  { id: "pseg",     name: "PSEG",     x: 85, y: 30 },
  { id: "aep",      name: "AEP",      x: 20, y: 50 },
  { id: "ppl",      name: "PPL",      x: 55, y: 35 },
  { id: "duq",      name: "DUQ",      x: 25, y: 40 },
  { id: "comed",    name: "COMED",    x: 15, y: 30 },
];

// ── LMPCard mock data ────────────────────────────────────────────────────────

export const ZONE_LMP_DETAIL: Record<string, {
  price: number;
  energy: number;
  congestion: number;
  loss: number;
  delta: number;
  avg24h: number;
  avgCongestion24h: number;
  peak: { hour: string; price: number };
  cheapest: { hour: string; price: number };
}> = {
  'WEST_HUB': { price: 35.90, energy: 32.10, congestion: 2.40,  loss: 1.40, delta: +1.2, avg24h: 33.8, avgCongestion24h: 1.8,  peak: { hour: '7AM', price: 48.2 }, cheapest: { hour: '3AM', price: 28.1 } },
  'COMED':    { price: 32.04, energy: 31.20, congestion: -0.30, loss: 1.14, delta: -0.8, avg24h: 31.2, avgCongestion24h: -0.2, peak: { hour: '8AM', price: 41.5 }, cheapest: { hour: '4AM', price: 26.8 } },
  'AEP':      { price: 33.36, energy: 31.80, congestion: 0.42,  loss: 1.14, delta: +0.4, avg24h: 32.1, avgCongestion24h: 0.3,  peak: { hour: '7AM', price: 44.2 }, cheapest: { hour: '3AM', price: 27.4 } },
  'PSEG':     { price: 34.93, energy: 32.10, congestion: 1.58,  loss: 1.25, delta: +2.1, avg24h: 33.4, avgCongestion24h: 2.1,  peak: { hour: '6AM', price: 52.8 }, cheapest: { hour: '2AM', price: 28.9 } },
  'RECO':     { price: 36.60, energy: 32.10, congestion: 3.10,  loss: 1.40, delta: +3.8, avg24h: 34.9, avgCongestion24h: 3.4,  peak: { hour: '6AM', price: 58.4 }, cheapest: { hour: '2AM', price: 29.2 } },
  'DOMINION': { price: 34.23, energy: 32.10, congestion: 0.88,  loss: 1.25, delta: +0.9, avg24h: 32.8, avgCongestion24h: 0.7,  peak: { hour: '7AM', price: 46.1 }, cheapest: { hour: '3AM', price: 27.8 } },
  'BGE':      { price: 34.50, energy: 32.10, congestion: 1.15,  loss: 1.25, delta: +1.4, avg24h: 33.1, avgCongestion24h: 1.0,  peak: { hour: '7AM', price: 47.3 }, cheapest: { hour: '3AM', price: 28.2 } },
  'PPL':      { price: 33.11, energy: 32.10, congestion: -0.18, loss: 1.19, delta: -0.2, avg24h: 32.4, avgCongestion24h: -0.1, peak: { hour: '8AM', price: 43.1 }, cheapest: { hour: '4AM', price: 27.1 } },
  'PECO':     { price: 34.10, energy: 32.10, congestion: 0.75,  loss: 1.25, delta: +1.1, avg24h: 32.9, avgCongestion24h: 0.6,  peak: { hour: '7AM', price: 45.8 }, cheapest: { hour: '3AM', price: 28.0 } },
  'DEFAULT':  { price: 33.50, energy: 32.10, congestion: 0.20,  loss: 1.20, delta: +0.3, avg24h: 32.2, avgCongestion24h: 0.5,  peak: { hour: '7AM', price: 44.0 }, cheapest: { hour: '3AM', price: 27.5 } },
};

export const ZONE_SPARKLINE: Record<string, number[]> = {
  'WEST_HUB': [0.4, 0.5, 0.8, 1.0, 0.7, 0.6],
  'COMED':    [0.3, 0.4, 0.7, 0.9, 0.6, 0.5],
  'PSEG':     [0.5, 0.6, 0.9, 1.0, 0.8, 0.7],
  'RECO':     [0.6, 0.7, 1.0, 1.0, 0.9, 0.8],
  'DEFAULT':  [0.4, 0.5, 0.7, 0.9, 0.6, 0.5],
};

export const ZONE_24H_PRICES: Record<string, number[]> = {
  'WEST_HUB': [28.1,27.4,27.8,28.2,31.5,48.2,45.1,38.4,36.2,35.1,34.8,34.2,33.9,33.5,34.1,35.2,36.8,38.4,37.2,36.1,35.4,34.8,34.2,33.6],
  'PSEG':     [28.9,28.2,28.6,29.1,33.2,52.8,49.4,41.2,38.8,37.4,36.9,36.1,35.7,35.2,36.1,37.4,39.2,41.8,40.1,38.6,37.4,36.8,35.9,35.1],
  'RECO':     [29.2,28.8,29.1,29.6,34.8,58.4,54.2,44.8,41.2,39.8,38.9,38.0,37.4,36.9,37.8,39.2,41.8,44.9,42.8,40.9,39.4,38.6,37.4,36.4],
  'COMED':    [26.8,26.2,26.5,26.9,29.8,41.5,38.9,33.4,31.8,30.9,30.4,29.8,29.5,29.1,29.8,30.9,32.4,34.8,33.2,31.9,31.1,30.5,29.9,29.4],
  'DEFAULT':  [27.5,26.9,27.2,27.6,31.0,44.0,41.2,35.8,33.9,32.8,32.2,31.6,31.2,30.8,31.5,32.6,34.2,36.9,35.4,33.8,32.9,32.2,31.6,31.0],
};

export const ZONE_CONSTRAINTS: Record<string, Array<{ name: string; impact: number }>> = {
  'PSEG':     [{ name: 'Artificial Island Interface', impact: 1.42 }, { name: 'PJM-EAST Import Limit', impact: 0.82 }, { name: 'Bergen-Linden Corridor', impact: -0.34 }],
  'RECO':     [{ name: 'NY-NJ Interface', impact: 2.18 }, { name: 'Ramapo-Waldwick Line', impact: 0.91 }, { name: 'Bergen-Linden Corridor', impact: 0.12 }],
  'BGE':      [{ name: 'Potomac River Crossing', impact: 0.88 }, { name: 'Baltimore-Backbone', impact: 0.34 }, { name: 'PJM-DOM Interface', impact: -0.07 }],
  'DOMINION': [{ name: 'Meadow Brook-Loudoun', impact: 0.72 }, { name: 'Northern VA Load Pocket', impact: 0.31 }, { name: 'PJM-DOM South', impact: -0.15 }],
  'DEFAULT':  [{ name: 'System-Wide Congestion', impact: 0.24 }, { name: 'No binding constraints', impact: 0.00 }, { name: 'Normal operations', impact: 0.00 }],
};

export const ZONE_GEN_MIX: Record<string, Array<{ fuel: string; pct: number; color: string }>> = {
  'PSEG':     [{ fuel: 'Nuclear', pct: 48, color: '#FBBF24' }, { fuel: 'Gas', pct: 38, color: '#F97316' }, { fuel: 'Solar', pct: 9,  color: '#FDE047' }, { fuel: 'Other', pct: 5,  color: '#9CA3AF' }],
  'COMED':    [{ fuel: 'Nuclear', pct: 62, color: '#FBBF24' }, { fuel: 'Gas', pct: 18, color: '#F97316' }, { fuel: 'Wind',  pct: 14, color: '#38BDF8' }, { fuel: 'Other', pct: 6,  color: '#9CA3AF' }],
  'AEP':      [{ fuel: 'Coal',   pct: 38, color: '#6B7280' }, { fuel: 'Gas', pct: 31, color: '#F97316' }, { fuel: 'Wind',  pct: 22, color: '#38BDF8' }, { fuel: 'Other', pct: 9,  color: '#9CA3AF' }],
  'DOMINION': [{ fuel: 'Nuclear', pct: 34, color: '#FBBF24' }, { fuel: 'Gas', pct: 42, color: '#F97316' }, { fuel: 'Solar', pct: 14, color: '#FDE047' }, { fuel: 'Other', pct: 10, color: '#9CA3AF' }],
  'DEFAULT':  [{ fuel: 'Gas',    pct: 42, color: '#F97316' }, { fuel: 'Nuclear', pct: 28, color: '#FBBF24' }, { fuel: 'Wind', pct: 18, color: '#38BDF8' }, { fuel: 'Other', pct: 12, color: '#9CA3AF' }],
};

export const ZONE_FORECAST: Record<string, Array<{ hour: string; price: number }>> = {
  'PSEG':    [{ hour: '+1H', price: 35.8 }, { hour: '+2H', price: 36.4 }, { hour: '+3H', price: 37.1 }, { hour: '+4H', price: 36.8 }],
  'RECO':    [{ hour: '+1H', price: 37.2 }, { hour: '+2H', price: 38.1 }, { hour: '+3H', price: 39.4 }, { hour: '+4H', price: 38.6 }],
  'COMED':   [{ hour: '+1H', price: 31.8 }, { hour: '+2H', price: 32.1 }, { hour: '+3H', price: 31.6 }, { hour: '+4H', price: 31.2 }],
  'DEFAULT': [{ hour: '+1H', price: 33.8 }, { hour: '+2H', price: 34.2 }, { hour: '+3H', price: 34.8 }, { hour: '+4H', price: 34.1 }],
};

export const CHART_HEIGHT = 240;
export const CHART_WIDTH  = 1000;
export const PRICE_MIN    = 24;
export const PRICE_MAX    = 62;

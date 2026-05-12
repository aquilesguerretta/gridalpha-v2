// FOUNDRY mock — Analyst Nest data.
// Comparison series, saved queries, annotations, correlation matrix,
// seasonal pattern, anomaly detections.

export interface AnalystSavedQuery {
  id: string;
  name: string;
  savedAt: string;
}

export interface AnalystAnnotation {
  id: string;
  text: string;
  chartRef: string;
  timestamp: string;
}

export interface AnalystAnomalyDetection {
  date: string;
  sigma: number;
  zone: string;
  description: string;
}

// 90-day deterministic daily series.
const buildDaily = (base: number, amp: number, phase: number, seed: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < 90; i++) {
    const seasonal = Math.sin((i / 90) * Math.PI * 2 + phase) * amp;
    const noise = (((seed + i * 7) % 11) - 5) * 0.4;
    out.push(Number((base + seasonal + noise).toFixed(2)));
  }
  return out;
};

export const COMPARISON_SERIES = {
  zoneA: { key: 'PSEG',     label: 'PSEG',     daily: buildDaily(34.5, 4.5, 0.0, 13) },
  zoneB: { key: 'WEST_HUB', label: 'WEST HUB', daily: buildDaily(33.2, 3.8, 0.5, 29) },
};

export const SAVED_QUERIES: AnalystSavedQuery[] = [
  { id: 'sq-001', name: 'PSEG basis vs WEST HUB',         savedAt: '2026-04-18' },
  { id: 'sq-002', name: 'COMED neg-pricing windows',       savedAt: '2026-04-12' },
  { id: 'sq-003', name: 'AEP coal retirement impact',      savedAt: '2026-03-30' },
  { id: 'sq-004', name: 'DOMINION load growth signal',     savedAt: '2026-03-22' },
  { id: 'sq-005', name: 'RECO interface congestion',       savedAt: '2026-02-14' },
  { id: 'sq-006', name: 'PJM-wide spark spread, 4-hour',   savedAt: '2026-01-08' },
];

export const ANNOTATIONS: AnalystAnnotation[] = [
  { id: 'an-001', text: 'Q1 cold snap — Feb 14 polar vortex tail.', chartRef: 'pseg-90d',     timestamp: '2026-02-14T07:00:00Z' },
  { id: 'an-002', text: 'Peach Bottom maintenance outage begins.',  chartRef: 'west-hub-90d', timestamp: '2026-03-08T00:00:00Z' },
  { id: 'an-003', text: 'PJM capacity auction results published.',  chartRef: 'pseg-90d',     timestamp: '2026-03-21T16:30:00Z' },
  { id: 'an-004', text: 'COMED wind ramp event — 1.8 GW in 90 min.', chartRef: 'comed-vol',    timestamp: '2026-04-11T03:15:00Z' },
];

// 5×5 correlation matrix in fixed row/col order:
// rows/cols = ['WEST_HUB', 'AEP', 'PSEG', 'COMED', 'RECO']
export const CORRELATION_ZONES = ['WEST_HUB', 'AEP', 'PSEG', 'COMED', 'RECO'] as const;

export const CORRELATION_MATRIX: number[][] = [
  [1.00, 0.68, 0.82, 0.49, 0.74],
  [0.68, 1.00, 0.55, 0.62, 0.59],
  [0.82, 0.55, 1.00, 0.41, 0.71],
  [0.49, 0.62, 0.41, 1.00, 0.38],
  [0.74, 0.59, 0.71, 0.38, 1.00],
];

export const SEASONAL_PATTERN: number[] = [
  41.2, 38.9, 33.4, 30.1, 31.8, 38.6,
  46.3, 47.1, 38.4, 32.6, 34.2, 39.8,
];

export const ANOMALY_DETECTIONS: AnalystAnomalyDetection[] = [
  { date: '2026-04-25', sigma: 4.2,  zone: 'RECO',     description: 'LMP printed $58.40 vs 24h avg $36.60.' },
  { date: '2026-04-25', sigma: 3.6,  zone: 'PSEG',     description: 'DA-RT spread reached $6.83 vs $1.50 baseline.' },
  { date: '2026-04-25', sigma: 2.9,  zone: 'COMED',    description: 'Wind output 6.4 GW vs 4.1 GW expected during overnight ramp.' },
  { date: '2026-04-25', sigma: -3.1, zone: 'AEP',      description: 'Reserve margin 11.2% vs 19.6% mean — 14-month low.' },
  { date: '2026-04-24', sigma: 2.4,  zone: 'DOMINION', description: 'Mid-day load 19.84 GW vs 17.9 GW forecast — data-center signal.' },
];

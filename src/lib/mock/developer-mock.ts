// FOUNDRY mock — Developer / IPP Nest data.
// 4 projects, 24-month zone revenue history, interconnection queue,
// binding constraints, PPA benchmarks, policy tracker.

export type DeveloperTechnology = 'BESS' | 'Solar' | 'Wind' | 'Hybrid';

export interface DeveloperProject {
  id: string;
  name: string;
  mw: number;
  technology: DeveloperTechnology;
  stage: string;
  forecastedIrr: number;
  expectedCod: string;
}

export interface ZoneRevenueMonth {
  month: number;
  cumulativeRevenue: number;
  cycles: number;
}

export interface InterconnectionQueueItem {
  id: string;
  queuePosition: string;
  mw: number;
  technology: string;
  attritionProbability: number;
}

export interface BindingConstraint {
  name: string;
  frequencyPct: number;
  avgCongestionRent: number;
}

export interface PPABenchmark {
  id: string;
  mw: number;
  technology: string;
  pricePerMwh: number;
  counterparty: string;
  signedDate: string;
}

export interface PolicyTrackerItem {
  id: string;
  title: string;
  date: string;
  impact: 'positive' | 'neutral' | 'negative';
}

export const PROJECT_PIPELINE: DeveloperProject[] = [
  { id: 'pj-001', name: 'PSEG Battery 200MW', mw: 200, technology: 'BESS',  stage: 'Development',           forecastedIrr: 0.142, expectedCod: '2027-06-01' },
  { id: 'pj-002', name: 'COMED Solar 100MW',  mw: 100, technology: 'Solar', stage: 'Interconnection Study', forecastedIrr: 0.098, expectedCod: '2028-09-01' },
  { id: 'pj-003', name: 'AEP Wind 150MW',     mw: 150, technology: 'Wind',  stage: 'PPA Negotiation',       forecastedIrr: 0.116, expectedCod: '2027-12-01' },
  { id: 'pj-004', name: 'WEST_HUB BESS 50MW', mw: 50,  technology: 'BESS',  stage: 'Commercial Operation',  forecastedIrr: 0.158, expectedCod: '2024-08-15' },
];

// 24 monthly cumulative revenue + cycles for a 4-hr battery in PSEG.
const buildZoneRevenue = (): ZoneRevenueMonth[] => {
  const months: ZoneRevenueMonth[] = [];
  let cumulative = 0;
  let cycles = 0;
  const base = 880_000;
  for (let i = 0; i < 24; i++) {
    const seasonal = Math.sin((i / 12) * Math.PI * 2 + Math.PI / 2) * 220_000;
    const noise = ((i * 13) % 7 - 3) * 18_000;
    const monthlyRev = Math.round(base + seasonal + noise);
    cumulative += monthlyRev;
    cycles += 28 + ((i * 5) % 7 - 3);
    months.push({ month: i + 1, cumulativeRevenue: cumulative, cycles });
  }
  return months;
};

export const ZONE_REVENUE_HISTORY_24M: ZoneRevenueMonth[] = buildZoneRevenue();

export const INTERCONNECTION_QUEUE: InterconnectionQueueItem[] = [
  { id: 'q-001', queuePosition: 'AE2-031', mw: 80,  technology: 'Solar',   attritionProbability: 0.42 },
  { id: 'q-002', queuePosition: 'AE2-074', mw: 100, technology: 'BESS',    attritionProbability: 0.31 },
  { id: 'q-003', queuePosition: 'AE2-112', mw: 150, technology: 'Hybrid',  attritionProbability: 0.58 },
  { id: 'q-004', queuePosition: 'AE2-148', mw: 250, technology: 'Wind',    attritionProbability: 0.47 },
];

export const BINDING_CONSTRAINTS_12M: BindingConstraint[] = [
  { name: 'Artificial Island Interface',     frequencyPct: 18.4, avgCongestionRent: 4.82 },
  { name: 'Bergen-Linden Corridor',          frequencyPct: 12.1, avgCongestionRent: 3.41 },
  { name: 'NY-NJ Interface',                 frequencyPct: 9.8,  avgCongestionRent: 6.18 },
  { name: 'Meadow Brook-Loudoun',            frequencyPct: 7.2,  avgCongestionRent: 2.94 },
  { name: 'Conemaugh-Hunterstown 500kV',     frequencyPct: 5.6,  avgCongestionRent: 2.18 },
];

export const PPA_BENCHMARKS: PPABenchmark[] = [
  { id: 'ppa-001', mw: 250, technology: 'Solar', pricePerMwh: 47.50, counterparty: 'Microsoft (Virginia)',  signedDate: '2026-02-14' },
  { id: 'ppa-002', mw: 180, technology: 'Wind',  pricePerMwh: 52.20, counterparty: 'Amazon (Pennsylvania)', signedDate: '2025-11-08' },
  { id: 'ppa-003', mw: 100, technology: 'BESS',  pricePerMwh: 68.40, counterparty: 'Google (Ohio)',         signedDate: '2025-09-21' },
];

export const POLICY_TRACKER: PolicyTrackerItem[] = [
  { id: 'pol-001', title: 'PJM 2025/26 BRA clears at $269.92/MW-day',      date: '2024-07-30', impact: 'positive' },
  { id: 'pol-002', title: 'FERC Order 2023 interconnection reform effective', date: '2024-04-21', impact: 'positive' },
  { id: 'pol-003', title: 'PA approves Conemaugh coal early retirement',    date: '2026-04-12', impact: 'neutral'  },
];

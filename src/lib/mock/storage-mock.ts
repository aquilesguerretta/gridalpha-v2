// FOUNDRY mock — Storage Operator Nest data.
// 4 battery assets, 30D revenue attribution, 24-hour DA bid recommendation,
// cycling tracker, ancillary signals, asset health.

import type { BidScheduleHour } from '@/lib/types/analytics';

export interface BatteryAsset {
  id: string;
  name: string;
  location: string;
  mwCapacity: number;
  mwhCapacity: number;
  soc: number;
  todayRevenue: number;
  regime: 'discharging' | 'charging' | 'idle';
  efficiency: number;
}

export interface RevenueAttributionDay {
  day: number;
  arbitrage: number;
  capacity: number;
  ancillary: number;
}

export interface CyclingTrackerSnapshot {
  todayCycles: number;
  degradationCost: number;
  netPnl: number;
}

export interface AncillarySignals {
  freqReg: number;
  reserves: number;
  regulationClearedMw: number;
}

export interface AssetHealth {
  assetId: string;
  status: 'green' | 'amber' | 'red';
  detail: string;
}

export const BATTERY_ASSETS: BatteryAsset[] = [
  { id: 'bat-pseg-a',    name: 'PSEG-A',     location: 'Newark, NJ',     mwCapacity: 200, mwhCapacity: 800,  soc: 78, todayRevenue: 4680, regime: 'discharging', efficiency: 87.5 },
  { id: 'bat-comed-1',   name: 'COMED-1',    location: 'Chicago, IL',    mwCapacity: 100, mwhCapacity: 400,  soc: 65, todayRevenue: 3820, regime: 'charging',    efficiency: 86.8 },
  { id: 'bat-aep-2',     name: 'AEP-2',      location: 'Columbus, OH',   mwCapacity: 150, mwhCapacity: 600,  soc: 68, todayRevenue: 3960, regime: 'idle',        efficiency: 88.1 },
  { id: 'bat-westhub-a', name: 'WEST-HUB-A', location: 'Pittsburgh, PA', mwCapacity: 250, mwhCapacity: 1000, soc: 71, todayRevenue: 4240, regime: 'discharging', efficiency: 87.2 },
];

const buildRevenueAttribution = (): RevenueAttributionDay[] => {
  const out: RevenueAttributionDay[] = [];
  for (let i = 0; i < 30; i++) {
    const seasonal = Math.sin((i / 30) * Math.PI * 2) * 800;
    const arbitrage = Math.round(3200 + seasonal + ((i * 13) % 9 - 4) * 60);
    const capacity = 950;
    const ancillary = Math.round(420 + ((i * 7) % 5 - 2) * 30);
    out.push({ day: i + 1, arbitrage, capacity, ancillary });
  }
  return out;
};

export const REVENUE_ATTRIBUTION_30D: RevenueAttributionDay[] = buildRevenueAttribution();

// 24-hour DA bid: charge in pre-dawn trough, discharge through evening peak.
export const DA_BID_RECOMMENDATIONS: BidScheduleHour[] = [
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

export const CYCLING_TRACKER: CyclingTrackerSnapshot = {
  todayCycles: 1.4,
  degradationCost: 612,
  netPnl: 16088,
};

export const ANCILLARY_SIGNALS: AncillarySignals = {
  freqReg: 8.2,
  reserves: 4.1,
  regulationClearedMw: 28,
};

export const ASSET_HEALTH: AssetHealth[] = [
  { assetId: 'bat-pseg-a',    status: 'green', detail: 'All systems nominal. Last full check 04:18 UTC.' },
  { assetId: 'bat-comed-1',   status: 'amber', detail: 'String 3 voltage imbalance trending. Diagnostics scheduled.' },
  { assetId: 'bat-aep-2',     status: 'green', detail: 'Idle since 11:02 UTC awaiting evening dispatch window.' },
  { assetId: 'bat-westhub-a', status: 'green', detail: 'Discharge profile tracking optimal schedule within 0.4%.' },
];

// ATLAS Wave 3 — Curated event library (metadata only).
//
// Wave 2 stored full hour-by-hour AtlasSnapshot arrays here. Wave 3 strips
// those — the snapshot data now comes from the real `/api/lmp/history`
// endpoint via `useAtlasHistorical`. What stays here is the curation:
//
//   - Stable id + display name + one-line description
//   - Start / end timestamps (the time window to fetch)
//   - Hand-authored highlight markers — the narrative arc
//
// Adding a new event is now two lines + a list of highlights. The data
// underneath is whatever PJM actually reported in the requested window.
//
// V1 ships with three named events:
//   storm-elliott-2022        — Dec 23-26 2022 cascade
//   august-heatwave-2022      — Aug 4-8 2022 sustained tightness
//   march-2024-wind-spike     — Mar 9-10 2024 negative-pricing weekend

import type {
  AtlasSnapshot,
  EventHighlight,
  NamedEvent,
} from '@/lib/types/timeTravel';

// ── EVENT 1 — Storm Elliott (Dec 23-26, 2022) ──────────────────────────
//
// 96-hour winter event. Arctic blast, gas curtailments, cascading
// generator outages, real-time LMP spikes to $2,000+/MWh in PSEG/JCPL,
// Maximum Generation Emergency declared. The platform's hero replay.

const STORM_ELLIOTT_START = '2022-12-23T00:00:00Z';
const STORM_ELLIOTT_END   = '2022-12-26T23:55:00Z';
const STORM_ELLIOTT_START_MS = Date.parse(STORM_ELLIOTT_START);

const STORM_ELLIOTT_HIGHLIGHTS: EventHighlight[] = [
  { timestamp: new Date(STORM_ELLIOTT_START_MS +  6 * 3_600_000).toISOString(), label: 'Cold front arrives — load ramps',           significance: 'context'  },
  { timestamp: new Date(STORM_ELLIOTT_START_MS +  8 * 3_600_000).toISOString(), zone: 'AEP',  label: 'Mountaineer Coal forced offline', significance: 'notable' },
  { timestamp: new Date(STORM_ELLIOTT_START_MS + 11 * 3_600_000).toISOString(), zone: 'PSEG', label: 'Salem 2 Gas trips on cold start', significance: 'notable' },
  { timestamp: new Date(STORM_ELLIOTT_START_MS + 14 * 3_600_000).toISOString(), label: 'Maximum Generation Emergency declared',         significance: 'critical' },
  { timestamp: new Date(STORM_ELLIOTT_START_MS + 18 * 3_600_000).toISOString(), zone: 'PSEG', label: 'PSEG LMP exceeds $2,000/MWh',   significance: 'critical' },
  { timestamp: new Date(STORM_ELLIOTT_START_MS + 22 * 3_600_000).toISOString(), zone: 'JCPL', label: 'JCPL LMP touches cap',           significance: 'critical' },
  { timestamp: new Date(STORM_ELLIOTT_START_MS + 30 * 3_600_000).toISOString(), label: 'Demand response fully deployed',               significance: 'notable' },
  { timestamp: new Date(STORM_ELLIOTT_START_MS + 48 * 3_600_000).toISOString(), label: 'Sustained scarcity holds through Christmas',   significance: 'context'  },
  { timestamp: new Date(STORM_ELLIOTT_START_MS + 72 * 3_600_000).toISOString(), label: 'Recovery begins as imports return',            significance: 'notable' },
];

// ── EVENT 2 — August 2022 PJM Heatwave (Aug 4-8, 2022) ─────────────────
//
// 96-hour summer event. Heat dome holds. Daily evening peaks ramp,
// reserve margins tighten, system holds without an outage cascade.

const AUGUST_HEATWAVE_START = '2022-08-04T04:00:00Z';
const AUGUST_HEATWAVE_END   = '2022-08-08T03:55:00Z';
const AUGUST_HEATWAVE_START_MS = Date.parse(AUGUST_HEATWAVE_START);

const AUGUST_HEATWAVE_HIGHLIGHTS: EventHighlight[] = [
  { timestamp: new Date(AUGUST_HEATWAVE_START_MS +  6 * 3_600_000).toISOString(), label: 'Load ramps into morning peak',                    significance: 'context'  },
  { timestamp: new Date(AUGUST_HEATWAVE_START_MS + 17 * 3_600_000).toISOString(), label: 'First day evening peak — reserves at 11%',         significance: 'notable'  },
  { timestamp: new Date(AUGUST_HEATWAVE_START_MS + 36 * 3_600_000).toISOString(), zone: 'PECO', label: 'Limerick 1 enters planned refueling outage', significance: 'context' },
  { timestamp: new Date(AUGUST_HEATWAVE_START_MS + 41 * 3_600_000).toISOString(), label: 'Day 2 evening peak — RT LMP exceeds $300/MWh',     significance: 'notable'  },
  { timestamp: new Date(AUGUST_HEATWAVE_START_MS + 56 * 3_600_000).toISOString(), zone: 'DOMINION', label: 'Possum Point trips during heat-related stress', significance: 'notable' },
  { timestamp: new Date(AUGUST_HEATWAVE_START_MS + 65 * 3_600_000).toISOString(), label: 'Day 3 — sustained heat dome, peak demand record',  significance: 'critical' },
  { timestamp: new Date(AUGUST_HEATWAVE_START_MS + 89 * 3_600_000).toISOString(), label: 'Heat dome breaks; LMP normalises overnight',       significance: 'context'  },
];

// ── EVENT 3 — March 2024 Wind Spike & Negative Pricing ─────────────────
//
// 48-hour event. COMED/AEP wind generation peaks, real-time prices go
// negative, system wind share reaches >40% briefly.

const WIND_SPIKE_START = '2024-03-09T00:00:00Z';
const WIND_SPIKE_END   = '2024-03-10T23:55:00Z';
const WIND_SPIKE_START_MS = Date.parse(WIND_SPIKE_START);

const WIND_SPIKE_HIGHLIGHTS: EventHighlight[] = [
  { timestamp: new Date(WIND_SPIKE_START_MS +  3 * 3_600_000).toISOString(), zone: 'COMED', label: 'COMED LMP turns negative — wind ramps past 18 GW',  significance: 'critical' },
  { timestamp: new Date(WIND_SPIKE_START_MS +  5 * 3_600_000).toISOString(), label: 'System wind share crosses 35%',                                     significance: 'notable'  },
  { timestamp: new Date(WIND_SPIKE_START_MS +  7 * 3_600_000).toISOString(), zone: 'AEP',   label: 'AEP also turns negative — exports to MISO bind',   significance: 'notable'  },
  { timestamp: new Date(WIND_SPIKE_START_MS + 12 * 3_600_000).toISOString(), label: 'Daytime wind fade; prices recover',                                significance: 'context'  },
  { timestamp: new Date(WIND_SPIKE_START_MS + 26 * 3_600_000).toISOString(), zone: 'COMED', label: 'Day 2 overnight ramp — deeper trough than Day 1',   significance: 'critical' },
  { timestamp: new Date(WIND_SPIKE_START_MS + 30 * 3_600_000).toISOString(), label: 'System wind share peaks at 42%',                                   significance: 'critical' },
  { timestamp: new Date(WIND_SPIKE_START_MS + 36 * 3_600_000).toISOString(), label: 'Storage discharge windows extracted near-record arbitrage spreads', significance: 'notable' },
];

// ── Public surface ──────────────────────────────────────────────────────

export const NAMED_EVENTS: NamedEvent[] = [
  {
    id: 'storm-elliott-2022',
    name: 'Storm Elliott',
    description: 'Dec 23-26, 2022 — Arctic blast triggers 24 GW of forced outages and Maximum Generation Emergency.',
    startTimestamp: STORM_ELLIOTT_START,
    endTimestamp:   STORM_ELLIOTT_END,
    highlights:     STORM_ELLIOTT_HIGHLIGHTS,
  },
  {
    id: 'august-heatwave-2022',
    name: 'August 2022 Heatwave',
    description: 'Aug 4-8, 2022 — Sustained heat dome drives PJM-wide load to record; reserves tighten but system holds.',
    startTimestamp: AUGUST_HEATWAVE_START,
    endTimestamp:   AUGUST_HEATWAVE_END,
    highlights:     AUGUST_HEATWAVE_HIGHLIGHTS,
  },
  {
    id: 'march-2024-wind-spike',
    name: 'March 2024 Wind Spike',
    description: 'Mar 9-10, 2024 — Cold-front winds push COMED/AEP LMPs negative; system wind share peaks at 42%.',
    startTimestamp: WIND_SPIKE_START,
    endTimestamp:   WIND_SPIKE_END,
    highlights:     WIND_SPIKE_HIGHLIGHTS,
  },
];

export function getEvent(id: string): NamedEvent | null {
  return NAMED_EVENTS.find((e) => e.id === id) ?? null;
}

// ── Snapshot lookup helpers ─────────────────────────────────────────────
//
// Wave 3 — these accept an explicit `snapshots` array (loaded into the
// time-travel store by `useAtlasHistorical`). The historicalSnapshots
// rolling 72h buffer uses the same shape via its own helpers.

/**
 * Returns the snapshot in `snapshots` whose timestamp is closest to the
 * requested one. Out-of-range timestamps clamp to the boundary frame.
 */
export function getEventSnapshot(snapshots: AtlasSnapshot[], timestamp: string): AtlasSnapshot | null {
  if (snapshots.length === 0) return null;
  const target = Date.parse(timestamp);
  if (Number.isNaN(target)) return snapshots[0];
  let best = snapshots[0];
  let bestDelta = Math.abs(Date.parse(best.timestamp) - target);
  for (let i = 1; i < snapshots.length; i++) {
    const s = snapshots[i];
    const d = Math.abs(Date.parse(s.timestamp) - target);
    if (d < bestDelta) { best = s; bestDelta = d; }
  }
  return best;
}

/**
 * Returns the bracketing pair + fraction for sub-frame interpolation.
 * Same contract as `historicalSnapshots.getBracketingSnapshots` but
 * scoped to an explicit array (the loaded event timeline).
 */
export function getEventBracketingSnapshots(snapshots: AtlasSnapshot[], timestamp: string): {
  before: AtlasSnapshot;
  after: AtlasSnapshot;
  fraction: number;
} | null {
  if (snapshots.length === 0) return null;
  const target = Date.parse(timestamp);
  const firstMs = Date.parse(snapshots[0].timestamp);
  const lastMs = Date.parse(snapshots[snapshots.length - 1].timestamp);
  if (Number.isNaN(target) || target <= firstMs) {
    return { before: snapshots[0], after: snapshots[0], fraction: 0 };
  }
  if (target >= lastMs) {
    const last = snapshots[snapshots.length - 1];
    return { before: last, after: last, fraction: 0 };
  }
  let lo = 0, hi = snapshots.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (Date.parse(snapshots[mid].timestamp) <= target) lo = mid + 1;
    else hi = mid;
  }
  const after = snapshots[lo];
  const before = snapshots[lo - 1];
  const aMs = Date.parse(before.timestamp);
  const bMs = Date.parse(after.timestamp);
  const fraction = bMs === aMs ? 0 : (target - aMs) / (bMs - aMs);
  return { before, after, fraction };
}

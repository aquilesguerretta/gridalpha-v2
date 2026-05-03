// ATLAS Wave 2 — Curated event library.
//
// Three hand-authored named events, each with hour-by-hour AtlasSnapshot
// frames that capture the narrative arc, plus EventHighlights marking the
// most significant moments.
//
// V1 these are static mocks. The shapes match the live AtlasSnapshot
// contract, so when the FastAPI backend ships a historical event endpoint
// we swap the source and the scrubber/highlights surface stays unchanged.
//
// Adding a new event: build a NamedEvent object below following the same
// pattern, then push it into NAMED_EVENTS. Highlights drive the scrubber
// markers — keep significance honest (critical = market-defining moment,
// notable = trade-actionable, context = scene-setter).

import type {
  AtlasSnapshot,
  EventHighlight,
  FuelMixSnapshot,
  NamedEvent,
  OutageSnapshot,
  TransmissionSnapshot,
  ZoneSnapshot,
} from '@/lib/types/timeTravel';

// ── Shared data ─────────────────────────────────────────────────────────

const ALL_ZONES = [
  'WEST_HUB','COMED','AEP','ATSI','DAY','DEOK','DUQ','DOMINION','DPL','EKPC',
  'PPL','PECO','PSEG','JCPL','PEPCO','BGE','METED','PENELEC','RECO','OVEC',
];

const ZONE_SCALE: Record<string, { lmp: number; loadMW: number }> = {
  WEST_HUB: { lmp: 35.9, loadMW: 9300 },
  COMED:    { lmp: 32.0, loadMW: 11800 },
  AEP:      { lmp: 33.4, loadMW: 12700 },
  ATSI:     { lmp: 33.2, loadMW:  8800 },
  DAY:      { lmp: 33.9, loadMW:  4600 },
  DEOK:     { lmp: 32.7, loadMW:  5100 },
  DUQ:      { lmp: 33.2, loadMW:  4700 },
  DOMINION: { lmp: 34.2, loadMW: 13100 },
  DPL:      { lmp: 35.3, loadMW:  4200 },
  EKPC:     { lmp: 32.5, loadMW:  3800 },
  PPL:      { lmp: 33.1, loadMW:  7200 },
  PECO:     { lmp: 34.1, loadMW:  8000 },
  PSEG:     { lmp: 34.9, loadMW:  8800 },
  JCPL:     { lmp: 34.7, loadMW:  5500 },
  PEPCO:    { lmp: 34.8, loadMW:  6800 },
  BGE:      { lmp: 34.5, loadMW:  7100 },
  METED:    { lmp: 34.1, loadMW:  3800 },
  PENELEC:  { lmp: 33.0, loadMW:  4600 },
  RECO:     { lmp: 36.6, loadMW:  2500 },
  OVEC:     { lmp: 32.6, loadMW:  3400 },
};

const PLANT_LOC: Record<string, { lon: number; lat: number; mw: number; fuel: OutageSnapshot['fuel'] }> = {
  'salem-1':           { lon: -75.54, lat: 39.46, mw: 1100, fuel: 'NUC'  },
  'salem-2-gas':       { lon: -75.54, lat: 39.47, mw:  900, fuel: 'NG'   },
  'fairless-hills':    { lon: -74.85, lat: 40.16, mw:  500, fuel: 'NG'   },
  'brunner-island':    { lon: -76.62, lat: 40.06, mw: 1490, fuel: 'NG'   },
  'mountaineer':       { lon: -82.06, lat: 38.94, mw: 1300, fuel: 'COAL' },
  'conemaugh':         { lon: -79.06, lat: 40.37, mw:  720, fuel: 'COAL' },
  'beaver-valley-2':   { lon: -80.43, lat: 40.62, mw:  900, fuel: 'NUC'  },
  'cook-2':            { lon: -86.57, lat: 41.98, mw: 1100, fuel: 'NUC'  },
  'possum-point':      { lon: -77.27, lat: 38.55, mw:  650, fuel: 'NG'   },
  'fairless-2':        { lon: -74.86, lat: 40.17, mw:  450, fuel: 'NG'   },
  'limerick-1':        { lon: -75.59, lat: 40.22, mw: 1130, fuel: 'NUC'  },
};

function makeOutage(
  id: string,
  name: string,
  zone: string,
  kind: OutageSnapshot['kind'] = 'forced',
): OutageSnapshot {
  const loc = PLANT_LOC[id];
  if (!loc) throw new Error(`Missing plant location for ${id}`);
  return { id, name, zone, lon: loc.lon, lat: loc.lat, mw: loc.mw, fuel: loc.fuel, kind };
}

function makeFuelMix(totalMW: number, opts: {
  windPct?: number;
  solarPct?: number;
  gasPct?: number;
  coalPct?: number;
  nuclearPct?: number;
} = {}): FuelMixSnapshot {
  const wind = opts.windPct ?? 0.10;
  const solar = opts.solarPct ?? 0.04;
  const nuke  = opts.nuclearPct ?? 0.32;
  const hydro = 0.04;
  const remaining = 1 - wind - solar - nuke - hydro;
  const gas = opts.gasPct ?? remaining * 0.66;
  const coal = opts.coalPct ?? remaining * 0.30;
  const other = Math.max(0, remaining - gas - coal);
  return {
    fuels: [
      { type: 'Nuclear', mw: Math.round(totalMW * nuke)   },
      { type: 'Gas',     mw: Math.round(totalMW * gas)    },
      { type: 'Coal',    mw: Math.round(totalMW * coal)   },
      { type: 'Wind',    mw: Math.round(totalMW * wind)   },
      { type: 'Solar',   mw: Math.round(totalMW * solar)  },
      { type: 'Hydro',   mw: Math.round(totalMW * hydro)  },
      { type: 'Other',   mw: Math.round(totalMW * other)  },
    ],
    totalMW: Math.round(totalMW),
  };
}

function makeTransmission(intensity: number): TransmissionSnapshot[] {
  // intensity 0..1 — drives loading + binding probability
  const entries: Array<[string, string, number]> = [
    ['artificial-island', 'Artificial Island Interface', 0.85],
    ['aep-dom',           'AEP-Dominion Interface',      0.55],
    ['comed-aep',         'COMED-AEP Interface',         0.40],
    ['ny-pjm',            'NY-PJM Interface',            0.70],
  ];
  return entries.map(([id, name, w]) => {
    const loadingPct = Math.min(99, 45 + intensity * 60 * w);
    const binding = loadingPct > 92;
    return {
      id, name,
      loadingPct: +loadingPct.toFixed(1),
      binding,
      shadowPrice: binding ? +(loadingPct - 90).toFixed(2) : 0,
    };
  });
}

/**
 * Build a snapshot by scaling each zone's base LMP/load by the supplied
 * per-zone multiplier (default 1). `lmpMult` and `loadMult` apply globally
 * unless overridden in `perZone`.
 */
function makeSnapshot(
  timestamp: string,
  args: {
    lmpMult?: number;
    loadMult?: number;
    perZone?: Record<string, { lmpMult?: number; loadMult?: number; congestion?: number }>;
    outages?: OutageSnapshot[];
    transmissionIntensity?: number;
    fuelMixOverrides?: Parameters<typeof makeFuelMix>[1];
  } = {},
): AtlasSnapshot {
  const lmpMult = args.lmpMult ?? 1.0;
  const loadMult = args.loadMult ?? 1.0;
  const zoneStates: Record<string, ZoneSnapshot> = {};
  let totalLoad = 0;

  for (const z of ALL_ZONES) {
    const base = ZONE_SCALE[z];
    const pz = args.perZone?.[z] ?? {};
    const lmp = base.lmp * lmpMult * (pz.lmpMult ?? 1.0);
    const loadMW = base.loadMW * loadMult * (pz.loadMult ?? 1.0);
    const congestion = pz.congestion ?? lmp * 0.04;
    zoneStates[z] = {
      lmp: +lmp.toFixed(2),
      loadMW: +loadMW.toFixed(0),
      congestionComponent: +congestion.toFixed(2),
      marginalUnit: lmpMult > 1.5 ? 'NG-PEAKER' : lmpMult > 1.05 ? 'NG-CC' : 'COAL-BASE',
    };
    totalLoad += loadMW;
  }

  return {
    timestamp,
    zoneStates,
    transmissionStates: makeTransmission(args.transmissionIntensity ?? Math.max(0, lmpMult - 0.8)),
    outages: args.outages ?? [],
    fuelMix: makeFuelMix(totalLoad, args.fuelMixOverrides),
  };
}

// ── EVENT 1 — Storm Elliott (Dec 23-26, 2022) ──────────────────────────
//
// 96-hour winter event. Arctic-air mass, gas curtailments, cascading
// generator outages, real-time LMP spikes to $2,000+/MWh in PSEG/JCPL,
// Maximum Generation Emergency declared. The platform's most dramatic
// replay — the canonical demo.

function buildStormElliott(): NamedEvent {
  const start = '2022-12-23T00:00:00Z';
  const snapshots: AtlasSnapshot[] = [];
  const startMs = Date.parse(start);

  // Outage roster grows as the cascade unfolds.
  const baseOutages: OutageSnapshot[] = [];
  const escalation: Array<{ atHour: number; outage: OutageSnapshot }> = [
    { atHour:  4, outage: makeOutage('possum-point',    'Possum Point Gas',     'DOMINION') },
    { atHour:  8, outage: makeOutage('mountaineer',     'Mountaineer Coal',     'AEP'     ) },
    { atHour: 11, outage: makeOutage('salem-2-gas',     'Salem 2 Gas',          'PSEG'    ) },
    { atHour: 14, outage: makeOutage('brunner-island',  'Brunner Island Gas',   'PPL'     ) },
    { atHour: 17, outage: makeOutage('fairless-hills',  'Fairless Hills',       'PSEG'    ) },
    { atHour: 20, outage: makeOutage('conemaugh',       'Conemaugh Coal',       'PENELEC' ) },
    { atHour: 24, outage: makeOutage('cook-2',          'Cook 2 Nuclear',       'COMED'   ) },
    { atHour: 30, outage: makeOutage('beaver-valley-2', 'Beaver Valley 2',      'DUQ'     ) },
  ];

  for (let h = 0; h < 96; h++) {
    const ts = new Date(startMs + h * 3_600_000).toISOString();

    // Active outages: every escalation step that has fired by hour h, and
    // hasn't yet "recovered" 18h later.
    const active: OutageSnapshot[] = [...baseOutages];
    for (const e of escalation) {
      if (h >= e.atHour && h < e.atHour + 36) active.push(e.outage);
    }

    // LMP profile — the hero of the story.
    //   h 0-6   : pre-storm calm, slight cold-snap premium
    //   h 6-12  : ramp into stress as outages accumulate
    //   h 12-30 : peak crisis — LMP at cap in PSEG/JCPL/RECO
    //   h 30-60 : sustained scarcity, gas curtailments persist
    //   h 60-96 : recovery
    let lmpMult: number;
    if (h < 6) lmpMult = 1.05 + 0.05 * h;
    else if (h < 12) lmpMult = 1.4 + 0.3 * (h - 6);
    else if (h < 30) lmpMult = 4.5 + 1.5 * Math.sin((h - 12) * 0.3);
    else if (h < 60) lmpMult = 2.4 + 0.6 * Math.sin((h - 30) * 0.18);
    else lmpMult = Math.max(1.05, 2.4 - 0.045 * (h - 60));

    const loadMult = 1.05 + Math.max(0, 0.18 - 0.001 * Math.abs(h - 36));
    const eastwardStress = h >= 12 && h < 60 ? 1.6 : 1.0;

    snapshots.push(makeSnapshot(ts, {
      lmpMult,
      loadMult,
      perZone: {
        PSEG:     { lmpMult: eastwardStress, congestion: lmpMult * 6  },
        JCPL:     { lmpMult: eastwardStress, congestion: lmpMult * 5  },
        RECO:     { lmpMult: eastwardStress, congestion: lmpMult * 8  },
        DOMINION: { lmpMult: eastwardStress * 0.95, congestion: lmpMult * 4 },
        PEPCO:    { lmpMult: eastwardStress * 0.92, congestion: lmpMult * 3 },
        BGE:      { lmpMult: eastwardStress * 0.92, congestion: lmpMult * 3 },
      },
      outages: active,
      transmissionIntensity: Math.min(1, (lmpMult - 0.8) * 0.4),
      fuelMixOverrides: {
        windPct: 0.05, solarPct: 0.01, gasPct: 0.45, coalPct: 0.25, nuclearPct: 0.18,
      },
    }));
  }

  const highlights: EventHighlight[] = [
    { timestamp: new Date(startMs +  6 * 3_600_000).toISOString(), label: 'Cold front arrives — load ramps',           significance: 'context'  },
    { timestamp: new Date(startMs +  8 * 3_600_000).toISOString(), zone: 'AEP',  label: 'Mountaineer Coal forced offline', significance: 'notable' },
    { timestamp: new Date(startMs + 11 * 3_600_000).toISOString(), zone: 'PSEG', label: 'Salem 2 Gas trips on cold start', significance: 'notable' },
    { timestamp: new Date(startMs + 14 * 3_600_000).toISOString(), label: 'Maximum Generation Emergency declared',         significance: 'critical' },
    { timestamp: new Date(startMs + 18 * 3_600_000).toISOString(), zone: 'PSEG', label: 'PSEG LMP exceeds $2,000/MWh',   significance: 'critical' },
    { timestamp: new Date(startMs + 22 * 3_600_000).toISOString(), zone: 'JCPL', label: 'JCPL LMP touches cap',           significance: 'critical' },
    { timestamp: new Date(startMs + 30 * 3_600_000).toISOString(), label: 'Demand response fully deployed',               significance: 'notable' },
    { timestamp: new Date(startMs + 48 * 3_600_000).toISOString(), label: 'Sustained scarcity holds through Christmas',   significance: 'context'  },
    { timestamp: new Date(startMs + 72 * 3_600_000).toISOString(), label: 'Recovery begins as imports return',            significance: 'notable' },
  ];

  return {
    id: 'storm-elliott-2022',
    name: 'Storm Elliott',
    description: 'Dec 23-26, 2022 — Arctic blast triggers 24 GW of forced outages and Maximum Generation Emergency.',
    startTimestamp: snapshots[0].timestamp,
    endTimestamp:   snapshots[snapshots.length - 1].timestamp,
    snapshots,
    highlights,
  };
}

// ── EVENT 2 — August 2022 PJM Heatwave (Aug 4-8, 2022) ─────────────────
//
// 96-hour summer event. Sustained high load, congestion patterns shift,
// reserve margins tighten — but the system holds. No outage cascade,
// just expensive energy across the footprint.

function buildAugustHeatwave(): NamedEvent {
  const start = '2022-08-04T04:00:00Z';
  const snapshots: AtlasSnapshot[] = [];
  const startMs = Date.parse(start);

  // Two minor outages mid-event for realism.
  const outageCalendar: Array<{ from: number; to: number; outage: OutageSnapshot }> = [
    { from: 36, to: 60, outage: makeOutage('limerick-1', 'Limerick 1 Nuclear', 'PECO', 'planned') },
    { from: 56, to: 80, outage: makeOutage('possum-point', 'Possum Point Gas',  'DOMINION') },
  ];

  for (let h = 0; h < 96; h++) {
    const ts = new Date(startMs + h * 3_600_000).toISOString();
    const hourOfDay = (h + 4) % 24; // start at 04:00 UTC ≈ 00:00 EDT
    const dailyPeak = Math.exp(-Math.pow((hourOfDay - 17) / 4.0, 2));
    const dayIdx = Math.floor(h / 24);
    const dayMult = 1.0 + 0.05 * dayIdx; // each day a bit hotter
    const lmpMult = 1.05 + 1.4 * dailyPeak * dayMult;
    const loadMult = 1.0 + 0.45 * dailyPeak * dayMult;

    const active: OutageSnapshot[] = outageCalendar
      .filter((o) => h >= o.from && h < o.to)
      .map((o) => o.outage);

    snapshots.push(makeSnapshot(ts, {
      lmpMult,
      loadMult,
      perZone: {
        PSEG:     { lmpMult: 1.10, congestion: lmpMult * 4 },
        PECO:     { lmpMult: 1.05, congestion: lmpMult * 3 },
        DOMINION: { lmpMult: 1.15, congestion: lmpMult * 3 },
        BGE:      { lmpMult: 1.08, congestion: lmpMult * 3 },
      },
      outages: active,
      transmissionIntensity: Math.min(1, dailyPeak * dayMult * 0.55),
      fuelMixOverrides: {
        windPct: 0.04, solarPct: 0.10 * dailyPeak, gasPct: 0.40, coalPct: 0.20, nuclearPct: 0.30,
      },
    }));
  }

  const highlights: EventHighlight[] = [
    { timestamp: new Date(startMs +  6 * 3_600_000).toISOString(), label: 'Load ramps into morning peak',                    significance: 'context'  },
    { timestamp: new Date(startMs + 17 * 3_600_000).toISOString(), label: 'First day evening peak — reserves at 11%',         significance: 'notable'  },
    { timestamp: new Date(startMs + 36 * 3_600_000).toISOString(), zone: 'PECO', label: 'Limerick 1 enters planned refueling outage', significance: 'context' },
    { timestamp: new Date(startMs + 41 * 3_600_000).toISOString(), label: 'Day 2 evening peak — RT LMP exceeds $300/MWh',     significance: 'notable'  },
    { timestamp: new Date(startMs + 56 * 3_600_000).toISOString(), zone: 'DOMINION', label: 'Possum Point trips during heat-related stress', significance: 'notable' },
    { timestamp: new Date(startMs + 65 * 3_600_000).toISOString(), label: 'Day 3 — sustained heat dome, peak demand record',  significance: 'critical' },
    { timestamp: new Date(startMs + 89 * 3_600_000).toISOString(), label: 'Heat dome breaks; LMP normalises overnight',       significance: 'context'  },
  ];

  return {
    id: 'august-heatwave-2022',
    name: 'August 2022 Heatwave',
    description: 'Aug 4-8, 2022 — Sustained heat dome drives PJM-wide load to record; reserves tighten but system holds.',
    startTimestamp: snapshots[0].timestamp,
    endTimestamp:   snapshots[snapshots.length - 1].timestamp,
    snapshots,
    highlights,
  };
}

// ── EVENT 3 — March 2024 Wind Spike & Negative Pricing ─────────────────
//
// 48-hour event. COMED/AEP wind generation peaks, real-time prices go
// negative for sustained intervals, generation mix reaches >40% wind for
// short windows. Storage operators feast.

function buildWindSpike(): NamedEvent {
  const start = '2024-03-09T00:00:00Z';
  const snapshots: AtlasSnapshot[] = [];
  const startMs = Date.parse(start);

  for (let h = 0; h < 48; h++) {
    const ts = new Date(startMs + h * 3_600_000).toISOString();
    const hourOfDay = h % 24;
    // Wind ramps overnight, peaks 02:00-06:00, fades by 14:00, returns 22:00.
    const windPhase = Math.sin((hourOfDay - 2) * 0.5 * Math.PI / 6) ;
    const windPower = Math.max(0, windPhase) * (h < 24 ? 0.85 : 1.05);
    const windPct = 0.10 + 0.35 * windPower;
    const lmpMult = Math.max(0.05, 0.85 - 1.0 * windPower);
    const loadMult = 0.85 + 0.10 * Math.exp(-Math.pow((hourOfDay - 7) / 3.0, 2));

    snapshots.push(makeSnapshot(ts, {
      lmpMult,
      loadMult,
      perZone: {
        COMED:    { lmpMult: 0.65, congestion: -lmpMult * 4 },
        AEP:      { lmpMult: 0.78, congestion: -lmpMult * 3 },
        ATSI:     { lmpMult: 0.82, congestion: -lmpMult * 2 },
        DUQ:      { lmpMult: 0.88, congestion: -lmpMult * 2 },
        PSEG:     { lmpMult: 1.05, congestion: lmpMult * 3 },
        PECO:     { lmpMult: 1.02 },
      },
      outages: [],
      transmissionIntensity: 0.45 + 0.20 * windPower,
      fuelMixOverrides: {
        windPct, solarPct: 0.04, gasPct: 0.20, coalPct: 0.10, nuclearPct: 0.36,
      },
    }));
  }

  const highlights: EventHighlight[] = [
    { timestamp: new Date(startMs +  3 * 3_600_000).toISOString(), zone: 'COMED', label: 'COMED LMP turns negative — wind ramps past 18 GW',  significance: 'critical' },
    { timestamp: new Date(startMs +  5 * 3_600_000).toISOString(), label: 'System wind share crosses 35%',                                     significance: 'notable'  },
    { timestamp: new Date(startMs +  7 * 3_600_000).toISOString(), zone: 'AEP',   label: 'AEP also turns negative — exports to MISO bind',   significance: 'notable'  },
    { timestamp: new Date(startMs + 12 * 3_600_000).toISOString(), label: 'Daytime wind fade; prices recover',                                significance: 'context'  },
    { timestamp: new Date(startMs + 26 * 3_600_000).toISOString(), zone: 'COMED', label: 'Day 2 overnight ramp — deeper trough than Day 1',   significance: 'critical' },
    { timestamp: new Date(startMs + 30 * 3_600_000).toISOString(), label: 'System wind share peaks at 42%',                                   significance: 'critical' },
    { timestamp: new Date(startMs + 36 * 3_600_000).toISOString(), label: 'Storage discharge windows extracted near-record arbitrage spreads', significance: 'notable' },
  ];

  return {
    id: 'march-2024-wind-spike',
    name: 'March 2024 Wind Spike',
    description: 'Mar 9-10, 2024 — Cold-front winds push COMED/AEP LMPs negative; system wind share peaks at 42%.',
    startTimestamp: snapshots[0].timestamp,
    endTimestamp:   snapshots[snapshots.length - 1].timestamp,
    snapshots,
    highlights,
  };
}

// ── Public surface ──────────────────────────────────────────────────────

export const NAMED_EVENTS: NamedEvent[] = [
  buildStormElliott(),
  buildAugustHeatwave(),
  buildWindSpike(),
];

export function getEvent(id: string): NamedEvent | null {
  return NAMED_EVENTS.find((e) => e.id === id) ?? null;
}

/**
 * Returns the snapshot in `event.snapshots` whose timestamp is closest to
 * the requested one. Out-of-range timestamps clamp to the boundary frame.
 */
export function getEventSnapshot(event: NamedEvent, timestamp: string): AtlasSnapshot {
  if (event.snapshots.length === 0) {
    throw new Error(`Event ${event.id} has no snapshots`);
  }
  const target = Date.parse(timestamp);
  if (Number.isNaN(target)) return event.snapshots[0];
  let best = event.snapshots[0];
  let bestDelta = Math.abs(Date.parse(best.timestamp) - target);
  for (let i = 1; i < event.snapshots.length; i++) {
    const s = event.snapshots[i];
    const d = Math.abs(Date.parse(s.timestamp) - target);
    if (d < bestDelta) { best = s; bestDelta = d; }
  }
  return best;
}

/**
 * Returns the bracketing pair + fraction for sub-frame interpolation in
 * an event timeline. Same contract as historicalSnapshots.getBracketingSnapshots.
 */
export function getEventBracketingSnapshots(event: NamedEvent, timestamp: string): {
  before: AtlasSnapshot;
  after: AtlasSnapshot;
  fraction: number;
} {
  const snaps = event.snapshots;
  if (snaps.length === 0) {
    throw new Error(`Event ${event.id} has no snapshots`);
  }
  const target = Date.parse(timestamp);
  const firstMs = Date.parse(snaps[0].timestamp);
  const lastMs = Date.parse(snaps[snaps.length - 1].timestamp);
  if (Number.isNaN(target) || target <= firstMs) {
    return { before: snaps[0], after: snaps[0], fraction: 0 };
  }
  if (target >= lastMs) {
    const last = snaps[snaps.length - 1];
    return { before: last, after: last, fraction: 0 };
  }
  let lo = 0, hi = snaps.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (Date.parse(snaps[mid].timestamp) <= target) lo = mid + 1;
    else hi = mid;
  }
  const after = snaps[lo];
  const before = snaps[lo - 1];
  const aMs = Date.parse(before.timestamp);
  const bMs = Date.parse(after.timestamp);
  const fraction = bMs === aMs ? 0 : (target - aMs) / (bMs - aMs);
  return { before, after, fraction };
}

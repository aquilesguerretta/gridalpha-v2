// ATLAS Wave 2 — Historical snapshot mock data.
//
// Generates a 72-hour rolling buffer of AtlasSnapshot, hour by hour,
// anchored to a stable "epoch" so the buffer is deterministic across
// re-mounts. Production swap: replace the generator in
// `src/lib/atlas/historicalSnapshots.ts` with the FastAPI historical
// endpoint — the snapshot shape is unchanged.
//
// Design notes:
//   • Diurnal LMP profile peaks around 7 a.m. and 6 p.m. local
//   • Per-zone variation = base LMP from `ZONE_LMP` × diurnal × noise
//   • Load follows the same diurnal curve, scaled by zone size proxy
//   • Reservoir trends slowly — only zones with hydro relevance get one
//   • Outages: a small set of recurring forced/planned events that fade
//     in/out over the 72h window so scrubbing always reveals movement
//   • Transmission: 4 named interfaces, binding-pattern shifts with
//     load level

import type {
  AtlasSnapshot,
  FuelMixSnapshot,
  OutageSnapshot,
  TransmissionSnapshot,
  ZoneSnapshot,
} from '@/lib/types/timeTravel';

// ── Constants ───────────────────────────────────────────────────────────

const HOURS_BACK = 72;

/**
 * The buffer is anchored to a stable hour boundary. We snap "now" to the
 * top of the current hour so consecutive renders inside the same hour see
 * the exact same buffer. The boundary advances on the next hour rollover.
 */
function bufferAnchorMs(): number {
  const ms = Date.now();
  return ms - (ms % 3_600_000);
}

// Approximate plant locations for outage markers. These are deliberate
// placeholders — real wire-up swaps to the GADS / EIA outage feed.
const OUTAGE_LOCATIONS: Record<string, { lon: number; lat: number; mw: number; fuel: OutageSnapshot['fuel'] }> = {
  'cook-2-nuclear':       { lon: -86.57, lat: 41.98, mw: 1100, fuel: 'NUC'  },
  'salem-1-gas':          { lon: -75.54, lat: 39.46, mw:  900, fuel: 'NG'   },
  'mountaineer-coal':     { lon: -82.06, lat: 38.94, mw: 1300, fuel: 'COAL' },
  'brunner-island-gas':   { lon: -76.62, lat: 40.06, mw: 1490, fuel: 'NG'   },
  'conemaugh-coal':       { lon: -79.06, lat: 40.37, mw:  720, fuel: 'COAL' },
  'beaver-valley-2':      { lon: -80.43, lat: 40.62, mw:  900, fuel: 'NUC'  },
  'fairless-hills-gas':   { lon: -74.85, lat: 40.16, mw:  500, fuel: 'NG'   },
  'possum-point-gas':     { lon: -77.27, lat: 38.55, mw:  650, fuel: 'NG'   },
};

// Transmission interfaces — name + zones it sits between.
const INTERFACES: Array<{ id: string; name: string; pressureZones: string[] }> = [
  { id: 'artificial-island', name: 'Artificial Island Interface',  pressureZones: ['PSEG', 'JCPL'] },
  { id: 'aep-dom',           name: 'AEP-Dominion Interface',       pressureZones: ['AEP', 'DOMINION'] },
  { id: 'comed-aep',         name: 'COMED-AEP Interface',          pressureZones: ['COMED', 'AEP'] },
  { id: 'ny-pjm',            name: 'NY-PJM Interface',             pressureZones: ['RECO', 'JCPL'] },
];

// All 20 zones, with a deterministic load-scale proxy
const ZONES: Array<{ id: string; baseLmp: number; loadScale: number }> = [
  { id: 'WEST_HUB', baseLmp: 35.9, loadScale: 1.10 },
  { id: 'COMED',    baseLmp: 32.0, loadScale: 1.40 },
  { id: 'AEP',      baseLmp: 33.4, loadScale: 1.50 },
  { id: 'ATSI',     baseLmp: 33.2, loadScale: 1.05 },
  { id: 'DAY',      baseLmp: 33.9, loadScale: 0.55 },
  { id: 'DEOK',     baseLmp: 32.7, loadScale: 0.60 },
  { id: 'DUQ',      baseLmp: 33.2, loadScale: 0.55 },
  { id: 'DOMINION', baseLmp: 34.2, loadScale: 1.55 },
  { id: 'DPL',      baseLmp: 35.3, loadScale: 0.50 },
  { id: 'EKPC',     baseLmp: 32.5, loadScale: 0.45 },
  { id: 'PPL',      baseLmp: 33.1, loadScale: 0.85 },
  { id: 'PECO',     baseLmp: 34.1, loadScale: 0.95 },
  { id: 'PSEG',     baseLmp: 34.9, loadScale: 1.05 },
  { id: 'JCPL',     baseLmp: 34.7, loadScale: 0.65 },
  { id: 'PEPCO',    baseLmp: 34.8, loadScale: 0.80 },
  { id: 'BGE',      baseLmp: 34.5, loadScale: 0.85 },
  { id: 'METED',    baseLmp: 34.1, loadScale: 0.45 },
  { id: 'PENELEC',  baseLmp: 33.0, loadScale: 0.55 },
  { id: 'RECO',     baseLmp: 36.6, loadScale: 0.30 },
  { id: 'OVEC',     baseLmp: 32.6, loadScale: 0.40 },
];

// Hydro-relevant zones get a reservoir reading
const HAS_RESERVOIR = new Set(['AEP', 'DUQ', 'DOMINION', 'PENELEC']);

// ── Generator helpers ───────────────────────────────────────────────────

function diurnalMultiplier(hourOfDay: number): number {
  const morning = Math.exp(-Math.pow((hourOfDay - 7) / 2.4, 2));
  const evening = Math.exp(-Math.pow((hourOfDay - 18) / 2.6, 2));
  return 0.78 + 0.55 * morning + 0.65 * evening;
}

function deterministicNoise(seed: number, idx: number): number {
  // Sin-based deterministic noise in [0.92, 1.08]
  return 0.92 + 0.16 * (Math.sin(seed * 0.37 + idx * 1.31) * 0.5 + 0.5);
}

function buildZoneSnapshot(
  zone: typeof ZONES[number],
  hourOfDay: number,
  frameIdx: number,
  zoneIdx: number,
): ZoneSnapshot {
  const diurnal = diurnalMultiplier(hourOfDay);
  const noise = deterministicNoise(frameIdx, zoneIdx);
  const lmp = zone.baseLmp * diurnal * noise;
  const loadMW = zone.loadScale * 8500 * (0.55 + 0.55 * (diurnal - 0.78) / 1.42);
  const congestionComponent =
    (zone.id === 'PSEG' || zone.id === 'RECO' || zone.id === 'DOMINION')
      ? lmp * 0.05 * (diurnal - 0.78)
      : lmp * 0.015 * (diurnal - 0.78);
  return {
    lmp: +lmp.toFixed(2),
    loadMW: +loadMW.toFixed(0),
    congestionComponent: +congestionComponent.toFixed(2),
    reservoir: HAS_RESERVOIR.has(zone.id)
      ? +(72 + 5 * Math.sin(frameIdx / 24)).toFixed(1)
      : undefined,
    marginalUnit:
      diurnal > 1.2 ? 'NG-PEAKER' :
      diurnal > 1.05 ? 'NG-CC' :
      'COAL-BASE',
  };
}

function buildTransmissionStates(
  zoneStates: Record<string, ZoneSnapshot>,
  hourOfDay: number,
): TransmissionSnapshot[] {
  return INTERFACES.map((iface) => {
    // Loading rises with load; binds when the underlying zones are stressed.
    const peak = (hourOfDay >= 14 && hourOfDay <= 20) ? 1.0 : 0.6;
    const stress = iface.pressureZones
      .map((z) => zoneStates[z]?.lmp ?? 30)
      .reduce((a, b) => a + b, 0) / iface.pressureZones.length;
    const loadingPct = Math.min(99, 45 + (stress - 30) * 3.5 * peak);
    const binding = loadingPct > 92;
    return {
      id: iface.id,
      name: iface.name,
      loadingPct: +loadingPct.toFixed(1),
      binding,
      shadowPrice: binding ? +(loadingPct - 90).toFixed(2) : 0,
    };
  });
}

function buildOutages(frameIdx: number): OutageSnapshot[] {
  // Each outage has a "window" within the 72h buffer where it's active.
  // Outside the window the outage is omitted from the snapshot, so it
  // appears/disappears as the scrubber moves.
  const windows: Array<{
    id: string;
    name: string;
    zone: string;
    startHour: number; // hours-back from latest frame (= frame at idx HOURS_BACK)
    durationH: number;
    kind: OutageSnapshot['kind'];
  }> = [
    { id: 'cook-2-nuclear',     name: 'Cook Unit 2',         zone: 'COMED',    startHour: 64, durationH: 22, kind: 'forced'  },
    { id: 'salem-1-gas',        name: 'Salem 1 Gas',         zone: 'PSEG',     startHour: 50, durationH: 14, kind: 'forced'  },
    { id: 'mountaineer-coal',   name: 'Mountaineer Coal',    zone: 'AEP',      startHour: 40, durationH: 36, kind: 'planned' },
    { id: 'brunner-island-gas', name: 'Brunner Island Gas',  zone: 'PPL',      startHour: 30, durationH: 12, kind: 'forced'  },
    { id: 'conemaugh-coal',     name: 'Conemaugh Coal Unit', zone: 'PENELEC',  startHour: 20, durationH: 18, kind: 'derate'  },
    { id: 'beaver-valley-2',    name: 'Beaver Valley 2',     zone: 'DUQ',      startHour: 12, durationH: 30, kind: 'planned' },
    { id: 'fairless-hills-gas', name: 'Fairless Hills',      zone: 'PSEG',     startHour:  6, durationH:  8, kind: 'forced'  },
    { id: 'possum-point-gas',   name: 'Possum Point Gas',    zone: 'DOMINION', startHour:  2, durationH: 10, kind: 'forced'  },
  ];

  const out: OutageSnapshot[] = [];
  for (const w of windows) {
    const startIdx = HOURS_BACK - w.startHour;
    if (frameIdx < startIdx || frameIdx > startIdx + w.durationH) continue;
    const loc = OUTAGE_LOCATIONS[w.id];
    if (!loc) continue;
    out.push({
      id:   w.id,
      name: w.name,
      zone: w.zone,
      lon:  loc.lon,
      lat:  loc.lat,
      mw:   loc.mw,
      fuel: loc.fuel,
      kind: w.kind,
    });
  }
  return out;
}

function buildFuelMix(zoneStates: Record<string, ZoneSnapshot>, hourOfDay: number): FuelMixSnapshot {
  // System-wide fuel mix proxy from total load + diurnal solar/wind shape.
  const totalLoad = Object.values(zoneStates).reduce((sum, z) => sum + z.loadMW, 0);
  const solarShare = Math.max(0, Math.exp(-Math.pow((hourOfDay - 12) / 4, 2)) * 0.16);
  const windShare = 0.08 + 0.04 * Math.sin((hourOfDay + 3) * 0.6);
  const nukeShare = 0.32;
  const hydroShare = 0.04;
  const remaining = 1 - solarShare - windShare - nukeShare - hydroShare;
  const gasShare = remaining * 0.66;
  const coalShare = remaining * 0.30;
  const otherShare = remaining * 0.04;

  return {
    fuels: [
      { type: 'Nuclear', mw: Math.round(totalLoad * nukeShare)   },
      { type: 'Gas',     mw: Math.round(totalLoad * gasShare)    },
      { type: 'Coal',    mw: Math.round(totalLoad * coalShare)   },
      { type: 'Wind',    mw: Math.round(totalLoad * windShare)   },
      { type: 'Solar',   mw: Math.round(totalLoad * solarShare)  },
      { type: 'Hydro',   mw: Math.round(totalLoad * hydroShare)  },
      { type: 'Other',   mw: Math.round(totalLoad * otherShare)  },
    ],
    totalMW: Math.round(totalLoad),
  };
}

// ── Buffer generation ───────────────────────────────────────────────────

interface CachedBuffer {
  anchorMs: number;
  snapshots: AtlasSnapshot[];
}

let cache: CachedBuffer | null = null;

/**
 * Returns the rolling 72h buffer. Result is cached per anchor hour — the
 * buffer rebuilds when the hour rolls over but stays stable inside it.
 * `snapshots[0]` is the oldest (-72h); `snapshots[length-1]` is "now".
 */
export function getHistoricalBuffer(): AtlasSnapshot[] {
  const anchor = bufferAnchorMs();
  if (cache && cache.anchorMs === anchor) return cache.snapshots;

  const out: AtlasSnapshot[] = [];
  for (let i = 0; i <= HOURS_BACK; i++) {
    const ts = anchor - (HOURS_BACK - i) * 3_600_000;
    const date = new Date(ts);
    const hourOfDay = date.getHours();

    const zoneStates: Record<string, ZoneSnapshot> = {};
    ZONES.forEach((z, zoneIdx) => {
      zoneStates[z.id] = buildZoneSnapshot(z, hourOfDay, i, zoneIdx);
    });

    out.push({
      timestamp:          date.toISOString(),
      zoneStates,
      transmissionStates: buildTransmissionStates(zoneStates, hourOfDay),
      outages:            buildOutages(i),
      fuelMix:            buildFuelMix(zoneStates, hourOfDay),
    });
  }

  cache = { anchorMs: anchor, snapshots: out };
  return out;
}

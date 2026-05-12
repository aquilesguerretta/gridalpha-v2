// ATLAS Wave 3 — MOCK_MODE event-snapshot fallback.
//
// When `MOCK_MODE` is true (offline dev, or VITE_MOCK_API=true), the
// useAtlasHistorical hook short-circuits past `fetchHistoricalWindow`
// and reads from this file instead. The historical buffer in
// `atlas-historical-mock.ts` stays in place as the canonical mock
// data source for `live` and `scrubbed` modes.
//
// V1 fallback strategy: for any named event, synthesize a snapshot
// timeline from the existing rolling 72h buffer's diurnal generator,
// but shifted to the event's window. This is intentionally simple —
// the goal is to keep the time-travel surface working offline, not
// to recreate every event's narrative arc in the dev environment.
//
// When you flip MOCK_MODE off, the real PJM history takes over and
// the narrative becomes authentic.

import type { AtlasSnapshot, OutageSnapshot } from '@/lib/types/timeTravel';
import { getEvent } from './eventLibrary';

// Reuse the buffer generator's per-zone scale + diurnal shape. We
// rebuild the snapshots inline rather than importing the buffer
// directly so the event window can be anchored anywhere in time
// (Storm Elliott is 2022; the rolling buffer is "the last 72h").

const ZONES = [
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
] as const;

// Per-event LMP shape — same regime each event used in Wave 2.
const EVENT_PROFILE: Record<string, {
  basePeakMult: number;
  eastwardStress: number;
  windOverlay: number;
}> = {
  'storm-elliott-2022':    { basePeakMult: 4.0, eastwardStress: 1.5, windOverlay: 0    },
  'august-heatwave-2022':  { basePeakMult: 2.0, eastwardStress: 1.1, windOverlay: 0    },
  'march-2024-wind-spike': { basePeakMult: 0.4, eastwardStress: 1.0, windOverlay: 1.2  },
};

function diurnal(hourOfDay: number): number {
  const m = Math.exp(-Math.pow((hourOfDay - 7) / 2.4, 2));
  const e = Math.exp(-Math.pow((hourOfDay - 18) / 2.6, 2));
  return 0.78 + 0.55 * m + 0.65 * e;
}

/**
 * Synthesize an AtlasSnapshot[] for the requested named event using
 * the same generator family as the rolling 72h buffer. Anchored to
 * the event's start/end timestamps.
 *
 * Returns an empty array if the event is unknown.
 */
export function loadMockEventSnapshots(eventId: string): AtlasSnapshot[] {
  const event = getEvent(eventId);
  if (!event) return [];

  const startMs = Date.parse(event.startTimestamp);
  const endMs   = Date.parse(event.endTimestamp);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return [];

  const stepMs = 3_600_000; // 1 hour
  const frames = Math.max(1, Math.floor((endMs - startMs) / stepMs) + 1);
  const profile = EVENT_PROFILE[eventId] ?? { basePeakMult: 1.0, eastwardStress: 1.0, windOverlay: 0 };

  const out: AtlasSnapshot[] = [];
  for (let i = 0; i < frames; i++) {
    const ts = new Date(startMs + i * stepMs).toISOString();
    const hourOfDay = new Date(ts).getUTCHours();
    const d = diurnal(hourOfDay);

    // Event shape: Storm Elliott ramps then crisis then recovery;
    // August heatwave climbs daily; wind spike inverts during overnight
    // ramps.
    let eventEnvelope: number;
    if (eventId === 'storm-elliott-2022') {
      if (i < 6) eventEnvelope = 1.0 + 0.05 * i;
      else if (i < 12) eventEnvelope = 1.4 + 0.3 * (i - 6);
      else if (i < 30) eventEnvelope = 4.5 + 1.5 * Math.sin((i - 12) * 0.3);
      else if (i < 60) eventEnvelope = 2.4 + 0.6 * Math.sin((i - 30) * 0.18);
      else eventEnvelope = Math.max(1.05, 2.4 - 0.045 * (i - 60));
    } else if (eventId === 'august-heatwave-2022') {
      const dayIdx = Math.floor(i / 24);
      eventEnvelope = 1.0 + 0.05 * dayIdx;
    } else if (eventId === 'march-2024-wind-spike') {
      const windPhase = Math.sin((hourOfDay - 2) * 0.5 * Math.PI / 6);
      const windPower = Math.max(0, windPhase) * (i < 24 ? 0.85 : 1.05);
      eventEnvelope = Math.max(0.05, 0.85 - 1.0 * windPower);
    } else {
      eventEnvelope = 1.0;
    }

    const lmpMult = Math.max(0.05, d * profile.basePeakMult * eventEnvelope / 1.6);

    const zoneStates: Record<string, AtlasSnapshot['zoneStates'][string]> = {};
    let totalLoad = 0;
    for (let zi = 0; zi < ZONES.length; zi++) {
      const z = ZONES[zi];
      const eastBoost = (z.id === 'PSEG' || z.id === 'JCPL' || z.id === 'RECO') ? profile.eastwardStress : 1.0;
      const westDip = (z.id === 'COMED' || z.id === 'AEP') ? 1 - profile.windOverlay * 0.6 : 1.0;
      const noise = 0.92 + 0.16 * (Math.sin(i * 0.37 + zi * 1.31) * 0.5 + 0.5);
      const lmp = z.baseLmp * lmpMult * eastBoost * westDip * noise;
      const loadMW = z.loadScale * 8500 * (0.55 + 0.55 * (d - 0.78) / 1.42);
      zoneStates[z.id] = {
        lmp: +lmp.toFixed(2),
        loadMW: +loadMW.toFixed(0),
        congestionComponent: +(lmp * 0.04 * eastBoost).toFixed(2),
        marginalUnit: lmpMult > 1.5 ? 'NG-PEAKER' : lmpMult > 1.05 ? 'NG-CC' : 'COAL-BASE',
      };
      totalLoad += loadMW;
    }

    // Simple Storm Elliott outage roster — match the Wave 2 timing so
    // offline dev still shows a recognizable cascade.
    const outages: OutageSnapshot[] = [];
    if (eventId === 'storm-elliott-2022') {
      const roster: Array<{ id: string; name: string; zone: string; from: number; lon: number; lat: number; mw: number; fuel: OutageSnapshot['fuel'] }> = [
        { id: 'mountaineer',   name: 'Mountaineer Coal',   zone: 'AEP',     from:  8, lon: -82.06, lat: 38.94, mw: 1300, fuel: 'COAL' },
        { id: 'salem-2-gas',   name: 'Salem 2 Gas',        zone: 'PSEG',    from: 11, lon: -75.54, lat: 39.47, mw:  900, fuel: 'NG'   },
        { id: 'brunner',       name: 'Brunner Island Gas', zone: 'PPL',     from: 14, lon: -76.62, lat: 40.06, mw: 1490, fuel: 'NG'   },
        { id: 'cook-2',        name: 'Cook 2 Nuclear',     zone: 'COMED',   from: 24, lon: -86.57, lat: 41.98, mw: 1100, fuel: 'NUC'  },
        { id: 'beaver-valley', name: 'Beaver Valley 2',    zone: 'DUQ',     from: 30, lon: -80.43, lat: 40.62, mw:  900, fuel: 'NUC'  },
      ];
      for (const r of roster) {
        if (i >= r.from && i < r.from + 36) {
          outages.push({ id: r.id, name: r.name, zone: r.zone, lon: r.lon, lat: r.lat, mw: r.mw, fuel: r.fuel, kind: 'forced' });
        }
      }
    }

    out.push({
      timestamp: ts,
      zoneStates,
      transmissionStates: [], // Snapshot builder fills these in real mode; mock keeps it simple.
      outages,
      fuelMix: {
        fuels: [
          { type: 'Nuclear', mw: Math.round(totalLoad * 0.30) },
          { type: 'Gas',     mw: Math.round(totalLoad * 0.40) },
          { type: 'Coal',    mw: Math.round(totalLoad * 0.16) },
          { type: 'Wind',    mw: Math.round(totalLoad * (0.06 + profile.windOverlay * 0.2)) },
          { type: 'Solar',   mw: Math.round(totalLoad * 0.04) },
          { type: 'Hydro',   mw: Math.round(totalLoad * 0.03) },
          { type: 'Other',   mw: Math.round(totalLoad * 0.01) },
        ],
        totalMW: Math.round(totalLoad),
      },
    });
  }

  return out;
}

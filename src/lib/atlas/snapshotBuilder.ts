// ATLAS Wave 3 — AtlasSnapshot builder from real PJM history.
//
// Takes a `MultiZoneHistorical` response from `/api/lmp/history` and
// assembles `AtlasSnapshot[]` matching Wave 2's shape so every
// downstream consumer (interpolation, scrubber, map render) stays
// agnostic to whether the data came from a mock or a real API.
//
// Wave 3 V1 scope:
//   - `zoneStates.lmp` is real PJM history. The other ZoneSnapshot
//     fields (`loadMW`, `congestionComponent`, `marginalUnit`,
//     `reservoir`) are approximations derived from the LMP shape —
//     the contract doesn't yet expose them at this cadence.
//   - `transmissionStates` is a heuristic: loading scales with the
//     stress of the underlying zones (same shape as Wave 2's
//     event mocks); a future endpoint will replace this.
//   - `outages` is empty — real outage timeline arrives in a future
//     sprint via /api/outages/history (TBD).
//   - `fuelMix` is a deterministic approximation pinned to the LMP
//     intensity at that timestamp.
//
// Documented as a known limitation in CLAUDE.md (Phase 10).

import type {
  AtlasSnapshot,
  FuelMixSnapshot,
  TransmissionSnapshot,
  ZoneSnapshot,
} from '@/lib/types/timeTravel';
import type { LMPHistoryPoint } from '@/lib/types/api';
import type { MultiZoneHistorical, PJMZone } from '@/services/api/atlasHistory';
import { ALL_PJM_ZONES } from '@/services/api/atlasHistory';

// ── Per-zone load proxies (same scale family as Wave 2 mocks) ──────────

const ZONE_LOAD_PROXY: Record<PJMZone, number> = {
  WEST_HUB: 9300,  COMED:    11800, AEP:      12700, ATSI:     8800,
  DAY:      4600,  DEOK:     5100,  DUQ:      4700,  DOMINION: 13100,
  DPL:      4200,  EKPC:     3800,  PPL:      7200,  PECO:     8000,
  PSEG:     8800,  JCPL:     5500,  PEPCO:    6800,  BGE:      7100,
  METED:    3800,  PENELEC:  4600,  RECO:     2500,  OVEC:     3400,
};

// Hydro-relevant zones get a reservoir trend.
const HAS_RESERVOIR: ReadonlySet<PJMZone> = new Set<PJMZone>([
  'AEP', 'DUQ', 'DOMINION', 'PENELEC',
]);

// Transmission interfaces (same set as Wave 2 mocks).
interface InterfaceDef {
  id: string;
  name: string;
  zones: PJMZone[];
  weight: number;
}
const INTERFACES: InterfaceDef[] = [
  { id: 'artificial-island', name: 'Artificial Island Interface',  zones: ['PSEG', 'JCPL'],   weight: 0.85 },
  { id: 'aep-dom',           name: 'AEP-Dominion Interface',       zones: ['AEP', 'DOMINION'], weight: 0.55 },
  { id: 'comed-aep',         name: 'COMED-AEP Interface',          zones: ['COMED', 'AEP'],    weight: 0.40 },
  { id: 'ny-pjm',            name: 'NY-PJM Interface',             zones: ['RECO', 'JCPL'],    weight: 0.70 },
];

// ── Helpers ────────────────────────────────────────────────────────────

/** Median of a number array. NaN when empty. */
function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Index the per-zone series by timestamp string for O(1) lookup. */
function indexByTimestamp(series: LMPHistoryPoint[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const p of series) m.set(p.timestamp, p.lmp_total);
  return m;
}

/**
 * Build the canonical timeline: the union of timestamps across every
 * zone that returned data, sorted ascending. Most zones will share the
 * 5-minute grid exactly, but we don't assume that — some zones may have
 * micro-gaps PJM filled differently.
 */
function buildTimeline(window: MultiZoneHistorical): string[] {
  const tsSet = new Set<string>();
  for (const zone of ALL_PJM_ZONES) {
    const zh = window.byZone[zone];
    if (!zh) continue;
    for (const p of zh.series) tsSet.add(p.timestamp);
  }
  return Array.from(tsSet).sort();
}

/**
 * Derive per-zone snapshot from a real LMP value. The non-LMP fields
 * are V1 approximations — see file header for the known-limitation list.
 */
function buildZoneSnapshot(zone: PJMZone, lmp: number): ZoneSnapshot {
  // Load proxy: scale with diurnal-shaped LMP intensity around a base of
  // 0.85× zone proxy. The relationship is monotone but not strict.
  const intensity = Math.max(0.3, Math.min(2.5, lmp / 35));
  const loadMW = +(ZONE_LOAD_PROXY[zone] * (0.55 + 0.35 * intensity)).toFixed(0);
  const congestion = +(lmp * 0.04).toFixed(2);
  return {
    lmp:                  +lmp.toFixed(2),
    loadMW,
    congestionComponent:  congestion,
    reservoir: HAS_RESERVOIR.has(zone) ? 70 + ((zone.charCodeAt(0) % 5) - 2) : undefined,
    marginalUnit:
      intensity > 1.5 ? 'NG-PEAKER' :
      intensity > 1.05 ? 'NG-CC' :
      'COAL-BASE',
  };
}

function buildTransmissionStates(zoneStates: Record<string, ZoneSnapshot>): TransmissionSnapshot[] {
  return INTERFACES.map((iface) => {
    const stress = iface.zones
      .map((z) => zoneStates[z]?.lmp ?? 30)
      .reduce((a, b) => a + b, 0) / iface.zones.length;
    const loadingPct = Math.min(99, 45 + (stress - 30) * 3.5 * iface.weight);
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

function buildFuelMix(zoneStates: Record<string, ZoneSnapshot>, hourOfDay: number): FuelMixSnapshot {
  const totalLoad = Object.values(zoneStates).reduce((sum, z) => sum + z.loadMW, 0);
  const solarShare = Math.max(0, Math.exp(-Math.pow((hourOfDay - 12) / 4, 2)) * 0.14);
  const windShare = 0.08 + 0.04 * Math.sin((hourOfDay + 3) * 0.6);
  const nukeShare = 0.30;
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

// ── Public surface ─────────────────────────────────────────────────────

/**
 * Assemble AtlasSnapshot[] from a multi-zone history window.
 *
 *   1. Union the timestamps across every returning zone.
 *   2. For each timestamp, pull each zone's LMP (zone-indexed by ts).
 *   3. Zones whose series didn't include this exact timestamp fall back
 *      to the median LMP across the zones that did report — keeps the
 *      heatmap visually consistent for gappy frames.
 *   4. Compose ZoneSnapshot (LMP real, other fields approximated),
 *      TransmissionSnapshot[] (heuristic), FuelMixSnapshot (heuristic),
 *      outages=[].
 */
export function buildSnapshotsFromWindow(window: MultiZoneHistorical): AtlasSnapshot[] {
  const timeline = buildTimeline(window);
  if (timeline.length === 0) return [];

  // Pre-index every zone's series by timestamp for O(1) lookups.
  const indexed: Partial<Record<PJMZone, Map<string, number>>> = {};
  for (const zone of ALL_PJM_ZONES) {
    const zh = window.byZone[zone];
    if (zh) indexed[zone] = indexByTimestamp(zh.series);
  }

  const snapshots: AtlasSnapshot[] = [];
  for (const ts of timeline) {
    // Per-frame median fallback — used when a single zone is missing
    // this timestamp.
    const sample: number[] = [];
    for (const zone of ALL_PJM_ZONES) {
      const v = indexed[zone]?.get(ts);
      if (typeof v === 'number') sample.push(v);
    }
    if (sample.length === 0) continue;
    const fallback = median(sample);

    const zoneStates: Record<string, ZoneSnapshot> = {};
    for (const zone of ALL_PJM_ZONES) {
      const lmp = indexed[zone]?.get(ts);
      zoneStates[zone] = buildZoneSnapshot(zone, typeof lmp === 'number' ? lmp : fallback);
    }

    const hourOfDay = new Date(ts).getUTCHours();
    snapshots.push({
      timestamp: ts,
      zoneStates,
      transmissionStates: buildTransmissionStates(zoneStates),
      outages: [],
      fuelMix: buildFuelMix(zoneStates, hourOfDay),
    });
  }

  return snapshots;
}

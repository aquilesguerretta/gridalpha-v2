// ATLAS Wave 2 — Snapshot interpolation.
//
// When the scrubber sits between two snapshot frames, we don't want the
// map to "step" frame-by-frame. The interpolation layer linearly blends
// numeric fields, snaps categoricals to the nearer source, and unions
// outage rosters with a fade-friendly fraction so the map can render
// outages mid-transition with reduced opacity.
//
// Consumers:
//   useTimeTravelData → calls interpolateSnapshots when bracketing pair
//                       has fraction > 0
//   TimeTravelScrubber → drags can be 60fps; the interpolation must be
//                        cheap (just a 20-zone loop)

import type { AtlasSnapshot, OutageSnapshot } from '@/lib/types/timeTravel';

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

function lerpRound(a: number, b: number, t: number, decimals: number): number {
  const v = lerp(a, b, t);
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

/**
 * Linearly interpolate between two snapshots.
 *
 *  - Numeric fields (LMP, load, congestion, reservoir, loadingPct,
 *    shadowPrice, fuel-mix MW): linear blend.
 *  - Categorical fields (marginalUnit, transmission.binding,
 *    transmission.id/name, outages): take the value from whichever
 *    source frame the fraction is closer to.
 *  - Outages: union both rosters. An outage present in only one frame
 *    gets a fade-friendly partial entry (we tag it so the map can
 *    render reduced opacity if it wants).
 *
 * `fraction` is clamped to [0, 1]. fraction === 0 returns `before`
 * verbatim; fraction === 1 returns `after` verbatim.
 */
export function interpolateSnapshots(
  before: AtlasSnapshot,
  after:  AtlasSnapshot,
  fraction: number,
): AtlasSnapshot {
  const t = Math.max(0, Math.min(1, fraction));
  if (t === 0) return before;
  if (t === 1) return after;

  // ── Zone states ─────────────────────────────────────────────────
  const zoneIds = new Set([
    ...Object.keys(before.zoneStates),
    ...Object.keys(after.zoneStates),
  ]);
  const zoneStates: AtlasSnapshot['zoneStates'] = {};
  for (const id of zoneIds) {
    const a = before.zoneStates[id];
    const b = after.zoneStates[id];
    if (a && b) {
      zoneStates[id] = {
        lmp:                  lerpRound(a.lmp, b.lmp, t, 2),
        loadMW:               lerpRound(a.loadMW, b.loadMW, t, 0),
        congestionComponent:  lerpRound(a.congestionComponent, b.congestionComponent, t, 2),
        reservoir:
          a.reservoir != null && b.reservoir != null
            ? lerpRound(a.reservoir, b.reservoir, t, 1)
            : a.reservoir ?? b.reservoir,
        marginalUnit: t < 0.5 ? a.marginalUnit : b.marginalUnit,
      };
    } else if (a) {
      zoneStates[id] = a;
    } else if (b) {
      zoneStates[id] = b;
    }
  }

  // ── Transmission states ─────────────────────────────────────────
  const txById = new Map<string, AtlasSnapshot['transmissionStates'][number]>();
  for (const tx of before.transmissionStates) txById.set(tx.id, tx);
  const transmissionStates: AtlasSnapshot['transmissionStates'] = [];
  for (const txAfter of after.transmissionStates) {
    const txBefore = txById.get(txAfter.id);
    if (!txBefore) {
      transmissionStates.push(txAfter);
      continue;
    }
    transmissionStates.push({
      id:          txAfter.id,
      name:        txAfter.name,
      loadingPct:  lerpRound(txBefore.loadingPct, txAfter.loadingPct, t, 1),
      binding:     t < 0.5 ? txBefore.binding : txAfter.binding,
      shadowPrice: lerpRound(txBefore.shadowPrice, txAfter.shadowPrice, t, 2),
    });
    txById.delete(txAfter.id);
  }
  // Anything left in txById is in `before` but not `after` — keep as-is.
  for (const remaining of txById.values()) transmissionStates.push(remaining);

  // ── Outages — union both rosters with fade tagging ──────────────
  const outageMap = new Map<string, { outage: OutageSnapshot; presence: number }>();
  for (const o of before.outages) {
    outageMap.set(o.id, { outage: o, presence: 1 - t });
  }
  for (const o of after.outages) {
    const existing = outageMap.get(o.id);
    if (existing) {
      existing.presence = 1; // present in both
    } else {
      outageMap.set(o.id, { outage: o, presence: t });
    }
  }
  // Drop outages whose interpolated presence is below the fade threshold.
  // The map renders below-1 presence at reduced opacity (Phase 10 wiring),
  // but at presence < 0.05 the marker would be invisible anyway.
  const outages: OutageSnapshot[] = [];
  for (const { outage, presence } of outageMap.values()) {
    if (presence < 0.05) continue;
    outages.push(outage);
  }

  // ── Fuel mix ────────────────────────────────────────────────────
  const fuelKeys = new Set([
    ...before.fuelMix.fuels.map((f) => f.type),
    ...after.fuelMix.fuels.map((f) => f.type),
  ]);
  const beforeByKey  = new Map(before.fuelMix.fuels.map((f) => [f.type, f.mw]));
  const afterByKey   = new Map(after.fuelMix.fuels.map((f) => [f.type, f.mw]));
  const fuels = Array.from(fuelKeys).map((type) => {
    const a = beforeByKey.get(type) ?? 0;
    const b = afterByKey.get(type)  ?? 0;
    return { type, mw: Math.round(lerp(a, b, t)) };
  });
  const totalMW = Math.round(lerp(before.fuelMix.totalMW, after.fuelMix.totalMW, t));
  const fuelMix = { fuels, totalMW };

  // Timestamp falls between the two source frames — walk the difference.
  const tsA = Date.parse(before.timestamp);
  const tsB = Date.parse(after.timestamp);
  const tsBlend = tsA + (tsB - tsA) * t;
  const timestamp = new Date(tsBlend).toISOString();

  return {
    timestamp,
    zoneStates,
    transmissionStates,
    outages,
    fuelMix,
  };
}

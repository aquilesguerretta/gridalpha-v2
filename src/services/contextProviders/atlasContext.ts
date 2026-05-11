// ORACLE Wave 2 / Wave 4 — Grid Atlas context provider.
//
// Wave 4 addition: reads ATLAS's `useTimeTravelStore` via getState() and
// surfaces `timeTravelMode` + (when in event-replay) `replayEvent` so
// the system prompt can pin the model to the right temporal frame. When
// the user replays Storm Elliott, the model says "during Storm Elliott
// (Dec 23-26 2022)" instead of "currently".

import type { ContextProvider, ReplayEventMeta } from '../aiContext';
import { makeFreshnessSource, summariseFreshness } from '../aiContext';
import { useTimeTravelStore } from '@/stores/timeTravelStore';
import { getEvent } from '@/lib/atlas/eventLibrary';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/**
 * Format a `[start, end]` window into a short human-readable string —
 * matches the brief's `replayEvent.window` shape, e.g. `Dec 23-26, 2022`.
 */
function formatWindow(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startIso} → ${endIso}`;
  }
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  if (sameMonth) {
    return `${MONTHS[start.getUTCMonth()]} ${start.getUTCDate()}-${end.getUTCDate()}, ${start.getUTCFullYear()}`;
  }
  if (sameYear) {
    return `${MONTHS[start.getUTCMonth()]} ${start.getUTCDate()} – ${MONTHS[end.getUTCMonth()]} ${end.getUTCDate()}, ${start.getUTCFullYear()}`;
  }
  return `${MONTHS[start.getUTCMonth()]} ${start.getUTCDate()} ${start.getUTCFullYear()} – ${MONTHS[end.getUTCMonth()]} ${end.getUTCDate()} ${end.getUTCFullYear()}`;
}

export const atlasContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? null;

  // Read the ATLAS store imperatively — providers are pure functions, not
  // React hooks, so we use getState() rather than useTimeTravelStore().
  const tt = useTimeTravelStore.getState();
  const mode = tt.mode;
  const activeEventId = tt.activeEventId;

  let replayEvent: ReplayEventMeta | undefined;
  if (mode === 'event-replay' && activeEventId) {
    const ev = getEvent(activeEventId);
    if (ev) {
      replayEvent = {
        id: ev.id,
        name: ev.name,
        window: formatWindow(ev.startTimestamp, ev.endTimestamp),
      };
    }
  }

  // Atlas-specific phrasing for each mode.
  const modeBlurb =
    mode === 'event-replay' && replayEvent
      ? `Time-travel REPLAY mode — replaying "${replayEvent.name}" (${replayEvent.window}). Data shown is HISTORICAL, not current.`
      : mode === 'scrubbed'
        ? `Time-travel SCRUB mode — viewing a historical snapshot, not the live grid. Reference the scrub timestamp, not "now".`
        : `Live mode — viewing the current PJM grid state.`;

  const description =
    `Grid Atlas. The user is looking at the geospatial Mapbox-native PJM ` +
    `grid view. Layers available: fuel-mix tiles, binding constraints, ` +
    `outages, substations, gas pipelines, earthquake/weather overlays. ` +
    `${zone ? `Camera/selection focused on ${zone}.` : 'No specific zone selected — full PJM footprint visible.'} ` +
    `${modeBlurb}`;

  // Freshness on the layers the Atlas renders. When in time-travel mode,
  // the data is "historical" rather than "stale" — we don't flag it as
  // stale (it's accurate for the replayed moment); the timeTravelMode
  // field handles that signalling instead.
  const freshness = summariseFreshness([
    makeFreshnessSource('Fuel mix layer', 0, false),
    makeFreshnessSource('Outage feed', 0, false),
    makeFreshnessSource('Zone LMP fill', 0, false),
  ]);

  return {
    surfaceLabel: 'Grid Atlas',
    selectedZone: zone,
    timeTravelMode: mode,
    replayEvent,
    visibleData: {
      description,
      metrics: {
        ...(zone ? { focusZone: zone } : {}),
        timeTravelMode: mode,
        ...(replayEvent ? { replayEvent: replayEvent.name } : {}),
      },
      freshness,
    },
  };
};

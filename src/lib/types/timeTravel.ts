// ATLAS Wave 2 — Time-travel type system.
//
// Drives the Grid Atlas time-machine surface:
//   • LIVE       → render current real-time state
//   • SCRUBBED   → render an interpolated snapshot at any timestamp in the
//                  rolling 72h historical buffer
//   • EVENT_REPLAY → render the curated hour-by-hour timeline of a named
//                    historical event (Storm Elliott, August 2022 heatwave,
//                    March 2024 wind spike, etc.)
//
// All snapshots flow through the same shape so the map's render pipeline
// (hub markers, outage layer, transmission loadings, fuel-mix readouts)
// can stay agnostic to the data source.

// ── Core snapshot ───────────────────────────────────────────────────────

/**
 * One frame of Atlas state. Paired with its ISO timestamp on the wrapping
 * AtlasSnapshot. All numeric fields are linearly interpolatable; categorical
 * fields snap to the nearer source frame.
 */
export interface ZoneSnapshot {
  /** Locational Marginal Price, $/MWh */
  lmp: number;
  /** Zonal load in MW */
  loadMW: number;
  /** Reservoir / storage state-of-charge percent (hydro-relevant zones only) */
  reservoir?: number;
  /** Congestion component of LMP, $/MWh (positive = export-constrained) */
  congestionComponent: number;
  /** Marginal-unit identifier — categorical, snaps to nearer frame */
  marginalUnit?: string;
}

/**
 * Transmission interface state at a given moment. The bind/loading values
 * drive future flow-line visualizations; for V1 the snapshot carries them
 * but the map only renders binding === true as a stylistic accent.
 */
export interface TransmissionSnapshot {
  /** Stable identifier, e.g. "Artificial Island Interface" */
  id: string;
  /** Display name */
  name: string;
  /** Loading as percent of thermal limit (0–100) */
  loadingPct: number;
  /** True when shadow price > 0 — drives the binding-constraint annotation */
  binding: boolean;
  /** Shadow price $/MWh when binding; 0 otherwise */
  shadowPrice: number;
}

/**
 * Generator outage at a given moment. Outages appear and disappear from the
 * map as the scrubber moves through their start/end window.
 */
export interface OutageSnapshot {
  /** Stable identifier — usually plant name + unit */
  id: string;
  /** Display name */
  name: string;
  /** Zone the outage is located in (matches PJM_ZONES.id) */
  zone: string;
  /** Approximate plant location for marker placement */
  lon: number;
  lat: number;
  /** Lost capacity in MW */
  mw: number;
  /** Fuel type for icon coloring (matches fuelColor map keys) */
  fuel: 'NG' | 'COAL' | 'NUC' | 'WIND' | 'SOLAR' | 'HYDRO' | 'BAT' | 'OIL' | 'OTHER';
  /** Outage classification — drives outline treatment */
  kind: 'forced' | 'planned' | 'derate';
}

/**
 * System-wide fuel mix at a given moment. Drives the Generation Mix readout
 * in the Intelligence panel; replaces the live `useFuelMix()` hook output
 * when mode !== 'live'.
 */
export interface FuelMixSnapshot {
  /** MW dispatched per fuel category */
  fuels: Array<{ type: string; mw: number }>;
  /** Total dispatched MW (sum of `fuels[].mw`) */
  totalMW: number;
}

/**
 * Complete Atlas state at a single moment. The map's render pipeline reads
 * exactly these fields — both for live and historical / event-replay modes.
 */
export interface AtlasSnapshot {
  /** ISO timestamp this snapshot is anchored to */
  timestamp: string;
  /** Per-zone snapshot keyed by zone_id (matches public/data/pjm-zones.geojson) */
  zoneStates: Record<string, ZoneSnapshot>;
  /** Transmission interface states */
  transmissionStates: TransmissionSnapshot[];
  /** Active outages at this moment */
  outages: OutageSnapshot[];
  /** System-wide fuel mix */
  fuelMix: FuelMixSnapshot;
}

// ── Named events ────────────────────────────────────────────────────────

/**
 * A notable moment within a NamedEvent timeline. Highlights render as
 * markers on the scrubber track and are clickable to jump to that timestamp.
 */
export interface EventHighlight {
  /** ISO timestamp the highlight pins to */
  timestamp: string;
  /** Optional zone the highlight applies to (renders a zone-coded chevron) */
  zone?: string;
  /** Short label shown in the scrubber tooltip */
  label: string;
  /** Visual significance — drives marker color */
  significance: 'critical' | 'notable' | 'context';
}

/**
 * A curated historical event with hand-authored hour-by-hour snapshots.
 * V1 ships with three: Storm Elliott (Dec 2022), August 2022 heatwave,
 * March 2024 wind spike. Add more via `eventLibrary.ts`.
 */
export interface NamedEvent {
  /** Stable identifier, e.g. 'storm-elliott-2022' */
  id: string;
  /** Display name, e.g. 'Storm Elliott' */
  name: string;
  /** One-sentence description shown in the EventReplayMenu */
  description: string;
  /** ISO timestamp of the first snapshot */
  startTimestamp: string;
  /** ISO timestamp of the last snapshot */
  endTimestamp: string;
  /** Hour-by-hour snapshots — first sorted by timestamp ascending */
  snapshots: AtlasSnapshot[];
  /** Notable moments to mark on the scrubber timeline */
  highlights: EventHighlight[];
}

// ── Mode + store contract ───────────────────────────────────────────────

/**
 * Which data source is currently driving the map.
 *
 *   live          → useTimeTravelData() returns the current snapshot from
 *                   historicalSnapshots.getCurrentSnapshot().
 *   scrubbed      → user dragged the slider into the rolling 72h buffer;
 *                   useTimeTravelData() returns an interpolated frame.
 *   event-replay  → user picked a named event; useTimeTravelData() returns
 *                   the matching frame from the event's snapshots[].
 */
export type TimeTravelMode = 'live' | 'scrubbed' | 'event-replay';

/**
 * Auto-advance speeds, in simulated hours per real-time second. The
 * scrubber UI only exposes 1×/2×/4×/8× — anything higher overshoots the
 * Mapbox paint-property transition durations and looks janky.
 */
export type PlaybackSpeed = 1 | 2 | 4 | 8;

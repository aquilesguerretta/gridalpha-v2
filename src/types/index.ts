/**
 * GridAlpha V2 — Core domain types.
 *
 * Every field carries a JSDoc comment so IDE hover-docs work out of the box.
 */

// ──────────────────────────────────────────────
// LiveDataFrame
// ──────────────────────────────────────────────

/** Real-time row delivered by the WebSocket or REST poller. */
export interface LiveDataFrame {
  /** ISO-8601 UTC timestamp of the observation. */
  timestamp_utc: string;

  /** ISO / grid-operator zone identifier (e.g. "NYISO-WEST"). */
  zone_id: string;

  /** Locational marginal price — total ($/MWh). */
  lmp_total: number;

  /** Congestion component of LMP ($/MWh). */
  congestion: number;

  /** Fuel-type → percentage generation mix at the timestamp. */
  gen_mix: Record<string, number>;

  /** Day-ahead load forecast in megawatts. */
  load_forecast_mw: number;

  /** Real-time actual load in megawatts. */
  actual_load_mw: number;

  /** Whether the value was linearly interpolated across a gap. */
  is_interpolated: boolean;

  /** Freshness indicator surfaced in the UI badge. */
  data_quality: "LIVE" | "STALE" | "RECONNECTING";

  /** Optional alert attached to this frame, or null when clear. */
  alert_payload: null | {
    /** Alert severity level. */
    severity: "warning" | "critical";
    /** Human-readable alert description. */
    message: string;
  };
}

// ──────────────────────────────────────────────
// SpatialConfig
// ──────────────────────────────────────────────

/** Per-zone configuration consumed by the 3-D spatial layer. */
export interface SpatialConfig {
  /** ISO / grid-operator zone identifier. */
  zone_id: string;

  /** Normalised capacity ratio mapped to bar height (0-1). */
  capacity_ratio_height: number;

  /** Thermal-load percentage used for heat-map colouring (0-100). */
  thermal_load_pct: number;

  /** [longitude, latitude] centroid of the zone. */
  coordinates: [number, number];

  /** Visual alert ring state; omitted when the zone is healthy. */
  alert_state?: "warning" | "critical";
}

// ──────────────────────────────────────────────
// ScoreCardProps
// ──────────────────────────────────────────────

/** Props for the KPI score-card component. */
export interface ScoreCardProps {
  /** Display label shown above the value. */
  label: string;

  /** Primary numeric value. */
  value: number;

  /** Unit string rendered beside the value (e.g. "$/MWh"). */
  unit: string;

  /** Spark-line data points (most-recent last). */
  trend: number[];

  /** Absolute change since the previous period. */
  delta: number;

  /** Direction of the delta arrow. */
  delta_direction: "up" | "down" | "neutral";

  /** Typography variant controlling font size / weight. */
  typography_variant: "headline" | "subhead" | "mono-data";
}

// ──────────────────────────────────────────────
// ApiEnvelope<T>
// ──────────────────────────────────────────────

/** Generic wrapper returned by every REST endpoint. */
export interface ApiEnvelope<T> {
  /** Response metadata. */
  meta: {
    /** Semantic version of the API (e.g. "2.0.0"). */
    api_version: string;
    /** True when the server is returning synthetic demo data. */
    is_demo: boolean;
    /** ISO-8601 UTC timestamp of the last upstream refresh. */
    last_updated_utc: string;
    /** Zone the response pertains to. */
    zone: string;
    /** Freshness quality tag. */
    data_quality: string;
    /** Unit label for the primary data series. */
    units: string;
  };

  /** Array of typed payload rows. */
  data: T[];

  /** Aggregated statistics (shape varies by endpoint). */
  summary: Record<string, unknown>;
}

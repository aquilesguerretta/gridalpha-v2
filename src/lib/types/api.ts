// FORGE Wave 4 — V2 backend response types.
// Mirrors `docs/v2-backend-contract.md` (Cursor Wave 5). Every endpoint
// returns the same canonical envelope `{ meta, data, summary }` with a
// shape-specific `meta` and `data`. New fields land here additively.

/** The 20 canonical PJM zone IDs the backend speaks. */
export type PjmZone =
  | 'WEST_HUB'
  | 'COMED'
  | 'AEP'
  | 'ATSI'
  | 'DAY'
  | 'DEOK'
  | 'DUQ'
  | 'DOMINION'
  | 'DPL'
  | 'EKPC'
  | 'PPL'
  | 'PECO'
  | 'PSEG'
  | 'JCPL'
  | 'PEPCO'
  | 'BGE'
  | 'METED'
  | 'PENELEC'
  | 'RECO'
  | 'OVEC';

export const PJM_ZONES: PjmZone[] = [
  'WEST_HUB',
  'COMED',
  'AEP',
  'ATSI',
  'DAY',
  'DEOK',
  'DUQ',
  'DOMINION',
  'DPL',
  'EKPC',
  'PPL',
  'PECO',
  'PSEG',
  'JCPL',
  'PEPCO',
  'BGE',
  'METED',
  'PENELEC',
  'RECO',
  'OVEC',
];

// ─── Canonical envelope ───────────────────────────────────────────

export interface ApiEnvelopeMeta {
  /** ISO-8601 UTC timestamp the response was generated. */
  timestamp: string;
  /** Seconds elapsed between source data and this response. */
  data_age_seconds?: number;
  /** Optional degraded-mode signal — partial / fallback data. */
  degraded_mode?: boolean;
  /** Free-form provenance label, e.g. 'pjm-rt', 'pjm-da', 'eia'. */
  source?: string;
  /** Any additional meta fields per endpoint. */
  [extra: string]: unknown;
}

export interface ApiEnvelope<TData> {
  meta: ApiEnvelopeMeta;
  data: TData;
  summary: string;
}

// ─── ENDPOINT 1: /api/lmp/current ─────────────────────────────────

export interface LMPCurrentData {
  lmp_total: number;
  lmp_energy: number;
  lmp_congestion: number;
  lmp_loss: number;
  /** Percent change vs the prior 5-minute interval. */
  delta_pct_5min: number;
}

// ─── ENDPOINT 2: /api/lmp/all-zones ───────────────────────────────

export interface LMPAllZonesEntry {
  lmp_total: number;
  delta_pct_5min: number;
}

export type LMPAllZonesData = Record<string, LMPAllZonesEntry>;

// ─── ENDPOINT 3: /api/lmp/24h ─────────────────────────────────────

export interface LMP24hPoint {
  /** ISO-8601 UTC timestamp at the start of the interval. */
  timestamp: string;
  lmp_total: number;
}

export type LMP24hData = LMP24hPoint[];

export interface LMP24hMeta extends ApiEnvelopeMeta {
  zone: string;
  interval_minutes: number;
  row_count: number;
}

// ─── ENDPOINT 4: /api/lmp/da-forecast (single zone) ───────────────

export interface DAForecastPoint {
  /** Hour-of-day, 0-23. */
  hour: number;
  lmp: number;
}

export type DAForecastData = DAForecastPoint[];

export interface DAForecastMeta extends ApiEnvelopeMeta {
  zone: string;
  market_date: string;
  interval?: 'hourly';
}

// ─── ENDPOINT 11: /api/lmp/da-forecast/all-zones ─────────────────

export type DAForecastAllZonesData = Record<string, DAForecastPoint[]>;

// ─── ENDPOINT 5: /api/lmp/history ─────────────────────────────────

export interface LMPHistoryPoint {
  timestamp: string;
  lmp_total: number;
}

export type LMPHistoryData = LMPHistoryPoint[];

export interface LMPHistoryMeta extends ApiEnvelopeMeta {
  zone: string;
  start: string;
  end: string;
  interval_minutes: number;
  row_count: number;
}

// ─── ENDPOINT 6: /api/spark-spread/current ───────────────────────

export type SparkSpreadRegime = 'BURNING' | 'NORMAL' | 'SUPPRESSED';

export interface SparkSpreadData {
  lmp_total: number;
  gas_equivalent_cost: number;
  spark_spread: number;
  regime: SparkSpreadRegime;
}

export interface SparkSpreadMeta extends ApiEnvelopeMeta {
  zone: string;
  heat_rate: number;
  gas_price_mmbtu: number;
}

// ─── ENDPOINT 7: /api/fuel-mix/current ───────────────────────────

export type FuelKind =
  | 'natural_gas'
  | 'nuclear'
  | 'coal'
  | 'wind'
  | 'solar'
  | 'hydro'
  | 'oil'
  | 'other'
  | 'battery';

export interface FuelMixRow {
  fuel: FuelKind;
  mw: number;
  pct: number;
  carbon_intensity_kg_per_mwh: number;
}

export interface FuelMixData {
  fuels: FuelMixRow[];
  total_mw: number;
  system_carbon_intensity_kg_per_mwh: number;
}

// ─── ENDPOINT 8: /api/reserve-margin/current ─────────────────────

export type ReserveRegime = 'TIGHT' | 'ADEQUATE' | 'COMFORTABLE';

export interface ReserveMarginData {
  load_actual_mw: number;
  load_forecast_mw: number;
  available_capacity_mw: number;
  reserve_margin_pct: number;
  regime: ReserveRegime;
}

// ─── ENDPOINT 9: /api/outages/current ────────────────────────────

export type OutageType = 'FORCED' | 'PLANNED' | 'MAINTENANCE' | 'UNKNOWN';

export interface OutageEntry {
  generator: string;
  zone: string;
  capacity_mw: number;
  outage_type: OutageType;
  /** ISO-8601 UTC timestamp the outage started. */
  start_timestamp: string;
  /** ISO-8601 UTC expected return, or null if indefinite. */
  expected_return: string | null;
  fuel_type?: FuelKind;
}

export type OutagesData = OutageEntry[];

export interface OutagesMeta extends ApiEnvelopeMeta {
  outage_count: number;
}

// ─── ENDPOINT 10: /api/ancillary/current ─────────────────────────

export interface AncillaryData {
  regulation_d_mcp: number;
  regulation_a_mcp: number;
  spinning_reserve_mcp: number;
  regulation_mileage_payment: number;
}

// ─── ENDPOINT 12: /api/stream (SSE) ──────────────────────────────

export interface LMPStreamUpdate {
  zone: string;
  lmp_total: number;
  timestamp: string;
  data_age_seconds: number;
}

export interface OutageStreamUpdate {
  generator: string;
  zone: string;
  capacity_mw: number;
  /** 'start' = outage begins; 'end' = generator returned. */
  event: 'start' | 'end';
  timestamp: string;
}

export interface HeartbeatStreamUpdate {
  timestamp: string;
}

export type SSEEventName = 'lmp-update' | 'outage' | 'heartbeat';

// ─── Stale thresholds (seconds) ──────────────────────────────────
// Centralised so every hook computes `isStale` against the same number.

export const STALE_THRESHOLDS = {
  lmpCurrent: 90,
  lmpAllZones: 90,
  lmp24h: 6 * 60,
  daForecast: 4 * 60 * 60,
  lmpHistory: 24 * 60 * 60, // historical data — practically never stale
  sparkSpread: 90,
  fuelMix: 8 * 60,
  reserveMargin: 8 * 60,
  outages: 8 * 60,
  ancillary: 8 * 60,
} as const;

export type StaleThresholdKey = keyof typeof STALE_THRESHOLDS;

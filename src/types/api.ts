// src/types/api.ts
// API contracts and data transfer objects.
// LiveDataFrame is the core runtime type consumed by all cards.

import type { DataQuality, AlertSeverity } from "./domain";

export interface LiveDataFrame {
  timestamp_utc:    string;
  zone_id:          string;
  lmp_total:        number;
  congestion:       number;
  gen_mix:          Record<string, number>;
  load_forecast_mw: number;
  actual_load_mw:   number;
  is_interpolated:  boolean;
  data_quality:     DataQuality;
  alert_payload:    null | {
    severity: AlertSeverity;
    message:  string;
  };
}

export interface SpatialConfig {
  zone_id:               string;
  capacity_ratio_height: number;
  thermal_load_pct:      number;
  coordinates:           [number, number];
  alert_state?:          AlertSeverity;
}

export interface ScoreCardProps {
  label:              string;
  value:              number;
  unit:               string;
  trend:              number[];
  delta:              number;
  delta_direction:    "up" | "down" | "neutral";
  typography_variant: "headline" | "subhead" | "mono-data";
}

export interface ApiEnvelope<T> {
  meta: {
    api_version:  string;
    is_demo:      boolean;
    data_quality: string;
    [key: string]: unknown;
  };
  data:    T[];
  summary: Record<string, unknown>;
}

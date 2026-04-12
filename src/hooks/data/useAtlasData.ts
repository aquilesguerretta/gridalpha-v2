// src/hooks/data/useAtlasData.ts
// Polling hooks for all Sprint 3B intelligence layers.
// Tries Railway backend first — falls back to mock data if unreachable.
// When backend goes live, hooks automatically switch to real data.

import { useState, useEffect, useCallback } from 'react';

const BACKEND =
  (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://gridalpha-v2-production.up.railway.app';

export interface FuelMix {
  timestamp:  string;
  fuels:      Array<{ type: string; mw: number }>;
}

export interface BindingConstraint {
  name:         string;
  shadow_price: number;
  contingency:  string;
}

export interface InterfaceFlow {
  name:       string;
  actual_mw:  number;
  max_mw:     number;
  pct_loading: number;
}

export interface PlantOutage {
  fuel_type: string;
  mw:        number;
  reason:    string;
  datetime:  string;
}

// ── Empty defaults (no fake PJM numbers when the API is down or slow) ─────

const EMPTY_FUEL_MIX: FuelMix = { timestamp: '', fuels: [] };

const EMPTY_CONSTRAINTS = { constraints: [] as BindingConstraint[] };

const EMPTY_FLOWS = { flows: [] as InterfaceFlow[] };

const EMPTY_OUTAGES = { outages: [] as PlantOutage[] };

// ── Generic polling hook (empty until live API succeeds) ──────────────────

const ATLAS_FETCH_MS = 25_000;

function usePolling<T>(
  endpoint: string,
  intervalMs: number,
  emptyData: T,
  fetchTimeoutMs: number = ATLAS_FETCH_MS,
): { data: T; loading: boolean; live: boolean } {
  const [data,    setData]    = useState<T>(emptyData);
  const [loading, setLoading] = useState(true);
  const [live,    setLive]    = useState(false);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}${endpoint}`, {
        signal: AbortSignal.timeout(fetchTimeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLive(true);
    } catch {
      setLive(false);
    } finally {
      setLoading(false);
    }
  }, [endpoint, fetchTimeoutMs]);

  useEffect(() => {
    void fetch_();
    const id = setInterval(() => void fetch_(), intervalMs);
    return () => clearInterval(id);
  }, [fetch_, intervalMs]);

  return { data, loading, live };
}

export const useFuelMix = () =>
  usePolling<FuelMix>('/api/atlas/generation-fuel', 5 * 60_000, EMPTY_FUEL_MIX);

export const useBindingConstraints = () =>
  usePolling<{ constraints: BindingConstraint[] }>(
    '/api/atlas/binding-constraints',
    5 * 60_000,
    EMPTY_CONSTRAINTS,
  );

export const useInterfaceFlows = () =>
  usePolling<{ flows: InterfaceFlow[] }>('/api/atlas/interface-flows', 5 * 60_000, EMPTY_FLOWS);

export const useOutages = () =>
  usePolling<{ outages: PlantOutage[] }>('/api/atlas/outages', 30 * 60_000, EMPTY_OUTAGES);

// ── Static GeoJSON hooks ──────────────────────────────────────────────────

export function useStaticGeoJSON(endpoint: string) {
  const [data,    setData]    = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND}${endpoint}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [endpoint]);

  return { data, loading };
}

export const useSubstations  = () => useStaticGeoJSON('/api/atlas/substations');
export const useGasPipelines = () => useStaticGeoJSON('/api/atlas/gas-pipelines');

export function useEarthquakes() {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    const fetchQuakes = () => {
      fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=36&maxlatitude=43&minlongitude=-90&maxlongitude=-73&minmagnitude=2.0&orderby=time&limit=50')
        .then(r => r.json())
        .then(setData)
        .catch(() => {});
    };
    fetchQuakes();
    const id = setInterval(fetchQuakes, 15 * 60_000);
    return () => clearInterval(id);
  }, []);

  return data;
}

// src/hooks/data/useAtlasData.ts
// Polling hooks for all Sprint 3B intelligence layers.
// All data fetches go to our Railway backend — never directly to external APIs.

import { useState, useEffect, useCallback } from 'react';

const BACKEND = 'https://gridalpha-production.up.railway.app';

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

// Generic polling hook
function usePolling<T>(
  endpoint: string,
  intervalMs: number,
  fallback: T,
): { data: T; loading: boolean; error: string | null } {
  const [data,    setData]    = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void fetch_();
    const id = setInterval(() => void fetch_(), intervalMs);
    return () => clearInterval(id);
  }, [fetch_, intervalMs]);

  return { data, loading, error };
}

export const useFuelMix = () =>
  usePolling<FuelMix>('/api/atlas/generation-fuel', 5 * 60_000, { timestamp: '', fuels: [] });

export const useBindingConstraints = () =>
  usePolling<{ constraints: BindingConstraint[] }>('/api/atlas/binding-constraints', 5 * 60_000, { constraints: [] });

export const useInterfaceFlows = () =>
  usePolling<{ flows: InterfaceFlow[] }>('/api/atlas/interface-flows', 5 * 60_000, { flows: [] });

export const useOutages = () =>
  usePolling<{ outages: PlantOutage[] }>('/api/atlas/outages', 30 * 60_000, { outages: [] });

export function useStaticGeoJSON(endpoint: string) {
  const [data,    setData]    = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND}${endpoint}`)
      .then(r => r.json())
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

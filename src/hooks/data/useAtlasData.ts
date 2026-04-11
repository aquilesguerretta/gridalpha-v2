// src/hooks/data/useAtlasData.ts
// Polling hooks for all Sprint 3B intelligence layers.
// Tries Railway backend first — falls back to mock data if unreachable.
// When backend goes live, hooks automatically switch to real data.

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

// ── Mock fallback data ────────────────────────────────────────────────────

const MOCK_FUEL_MIX: FuelMix = {
  timestamp: new Date().toISOString(),
  fuels: [
    { type: 'Gas',     mw: 38420 },
    { type: 'Nuclear', mw: 32100 },
    { type: 'Coal',    mw: 12800 },
    { type: 'Wind',    mw:  8340 },
    { type: 'Hydro',   mw:  2100 },
    { type: 'Solar',   mw:  1640 },
    { type: 'Other',   mw:   890 },
  ],
};

const MOCK_CONSTRAINTS = {
  constraints: [
    { name: 'PENELEC-PPL INTERFACE',  shadow_price: 12.40, contingency: 'LINE-345KV' },
    { name: 'AEP-DOM 500KV',          shadow_price:  8.75, contingency: 'N-1'        },
    { name: 'COMED-MISO BORDER',      shadow_price:  5.20, contingency: 'LINE-230KV' },
  ] as BindingConstraint[],
};

const MOCK_FLOWS = {
  flows: [
    { name: 'PJM-MISO',    actual_mw:  2340, max_mw: 4200, pct_loading: 0.56 },
    { name: 'PJM-NYISO',   actual_mw:  1890, max_mw: 2800, pct_loading: 0.68 },
    { name: 'PJM-SERC',    actual_mw: -540,  max_mw: 1500, pct_loading: 0.36 },
  ] as InterfaceFlow[],
};

const MOCK_OUTAGES = {
  outages: [
    { fuel_type: 'Nuclear', mw: 1268, reason: 'PLANNED MAINTENANCE', datetime: new Date().toISOString() },
    { fuel_type: 'Coal',    mw:  840, reason: 'FORCED OUTAGE',        datetime: new Date().toISOString() },
    { fuel_type: 'Gas',     mw:  575, reason: 'PLANNED MAINTENANCE',  datetime: new Date().toISOString() },
  ] as PlantOutage[],
};

// ── Generic polling hook with mock fallback ───────────────────────────────

function usePolling<T>(
  endpoint: string,
  intervalMs: number,
  mockData: T,
): { data: T; loading: boolean; live: boolean } {
  const [data,    setData]    = useState<T>(mockData);
  const [loading, setLoading] = useState(true);
  const [live,    setLive]    = useState(false);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}${endpoint}`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLive(true);
    } catch {
      // Backend not ready — keep mock data
      setLive(false);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void fetch_();
    const id = setInterval(() => void fetch_(), intervalMs);
    return () => clearInterval(id);
  }, [fetch_, intervalMs]);

  return { data, loading, live };
}

export const useFuelMix = () =>
  usePolling<FuelMix>('/api/atlas/generation-fuel', 5 * 60_000, MOCK_FUEL_MIX);

export const useBindingConstraints = () =>
  usePolling<{ constraints: BindingConstraint[] }>('/api/atlas/binding-constraints', 5 * 60_000, MOCK_CONSTRAINTS);

export const useInterfaceFlows = () =>
  usePolling<{ flows: InterfaceFlow[] }>('/api/atlas/interface-flows', 5 * 60_000, MOCK_FLOWS);

export const useOutages = () =>
  usePolling<{ outages: PlantOutage[] }>('/api/atlas/outages', 30 * 60_000, MOCK_OUTAGES);

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

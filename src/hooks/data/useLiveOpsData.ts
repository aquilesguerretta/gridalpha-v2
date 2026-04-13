import { useCallback, useEffect, useMemo, useState } from 'react';

type LmpRow = {
  zone_name: string;
  lmp_total: number;
  energy_component: number;
  congestion_component: number;
  loss_component: number;
  timestamp: string;
  timestamp_utc: string;
};

type WeatherRow = {
  temperature_f: number;
  load_forecast_mw: number;
  actual_load_mw: number;
  weather_alert: string;
};

type LmpResponse = { data?: LmpRow[] };
type WeatherResponse = { data?: WeatherRow[] };

const DEFAULT_V1 = 'https://gridalpha-production.up.railway.app';
const V1_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || DEFAULT_V1;

function toApiZone(zone: string | null): string {
  const z = (zone || 'WEST_HUB').toUpperCase();
  if (z === 'WEST_HUB' || z === 'SYSTEM') return 'PJM-RTO';
  if (z === 'DOMINION') return 'DOM';
  return z;
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((s, x) => s + x, 0) / values.length;
}

export interface LiveOpsData {
  live: boolean;
  apiZone: string;
  lmpPrice: number;
  lmpDelta: number;
  lmpEnergy: number;
  lmpCongestion: number;
  lmpLoss: number;
  zoneHistory: number[];
  rtoPrice: number;
  temperatureF: number;
  loadForecastMw: number;
  actualLoadMw: number;
  weatherAlert: string;
  avg24h: number;
}

export function useLiveOpsData(selectedZone: string | null): LiveOpsData {
  const [snapshotRows, setSnapshotRows] = useState<LmpRow[]>([]);
  const [historyRows, setHistoryRows] = useState<LmpRow[]>([]);
  const [weatherRows, setWeatherRows] = useState<WeatherRow[]>([]);
  const apiZone = useMemo(() => toApiZone(selectedZone), [selectedZone]);

  const fetchSnapshotAndWeather = useCallback(async () => {
    const [lmpRes, weatherRes] = await Promise.all([
      fetch(`${V1_BASE}/lmp?snapshot=true`, { signal: AbortSignal.timeout(8000) }),
      fetch(`${V1_BASE}/weather?zone=PJM-RTO&snapshot=true`, { signal: AbortSignal.timeout(8000) }),
    ]);
    if (!lmpRes.ok) throw new Error(`LMP HTTP ${lmpRes.status}`);
    if (!weatherRes.ok) throw new Error(`Weather HTTP ${weatherRes.status}`);
    const lmpJson = (await lmpRes.json()) as LmpResponse;
    const weatherJson = (await weatherRes.json()) as WeatherResponse;
    setSnapshotRows(Array.isArray(lmpJson.data) ? lmpJson.data : []);
    setWeatherRows(Array.isArray(weatherJson.data) ? weatherJson.data : []);
  }, []);

  const fetchZoneHistory = useCallback(async (zone: string) => {
    const res = await fetch(
      `${V1_BASE}/lmp?zone=${encodeURIComponent(zone)}&snapshot=false&hours=24`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) throw new Error(`Zone LMP HTTP ${res.status}`);
    const json = (await res.json()) as LmpResponse;
    setHistoryRows(Array.isArray(json.data) ? json.data : []);
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await fetchSnapshotAndWeather();
      } catch {
        if (mounted) {
          setSnapshotRows((p) => p);
          setWeatherRows((p) => p);
        }
      }
    };
    void run();
    const id = setInterval(() => void run(), 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [fetchSnapshotAndWeather]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await fetchZoneHistory(apiZone);
      } catch {
        if (mounted) setHistoryRows((p) => p);
      }
    };
    void run();
    const id = setInterval(() => void run(), 300_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [apiZone, fetchZoneHistory]);

  const zoneNow = snapshotRows.find((r) => r.zone_name === apiZone);
  const rtoNow = snapshotRows.find((r) => r.zone_name === 'PJM-RTO');
  const latestWeather = weatherRows.length ? weatherRows[weatherRows.length - 1] : undefined;
  const zoneHistory = historyRows.map((r) => Number(r.lmp_total || 0));
  const delta =
    zoneHistory.length >= 2
      ? zoneHistory[zoneHistory.length - 1] - zoneHistory[zoneHistory.length - 2]
      : 0;

  return {
    live: Boolean(zoneNow) && Boolean(latestWeather),
    apiZone,
    lmpPrice: Number(zoneNow?.lmp_total ?? 0),
    lmpDelta: Number(delta),
    lmpEnergy: Number(zoneNow?.energy_component ?? 0),
    lmpCongestion: Number(zoneNow?.congestion_component ?? 0),
    lmpLoss: Number(zoneNow?.loss_component ?? 0),
    zoneHistory,
    rtoPrice: Number(rtoNow?.lmp_total ?? 0),
    temperatureF: Number(latestWeather?.temperature_f ?? 0),
    loadForecastMw: Number(latestWeather?.load_forecast_mw ?? 0),
    actualLoadMw: Number(latestWeather?.actual_load_mw ?? 0),
    weatherAlert: String(latestWeather?.weather_alert ?? 'Unknown'),
    avg24h: avg(zoneHistory),
  };
}

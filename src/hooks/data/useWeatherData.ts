// src/hooks/data/useWeatherData.ts
// Tomorrow.io weather data for PJM grid points.
// Used to drive weather overlay on Grid Atlas and load forecasting.

import { useState, useEffect, useCallback } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL as string;

export interface WeatherPoint {
  lat:               number;
  lon:               number;
  label:             string;
  temperature_c:     number;
  wind_speed_ms:     number;
  wind_direction_deg: number;
  cloud_cover_pct:   number;
  precip_mm:         number;
}

export interface WeatherData {
  points:    WeatherPoint[];
  timestamp: string;
}

// Mock data — used while backend is not yet live
const MOCK_WEATHER: WeatherData = {
  timestamp: new Date().toISOString(),
  points: [
    { lat: 40.44, lon: -79.99, label: 'Pittsburgh',   temperature_c: 12, wind_speed_ms: 4.2, wind_direction_deg: 225, cloud_cover_pct: 60, precip_mm: 0   },
    { lat: 39.95, lon: -75.16, label: 'Philadelphia', temperature_c: 14, wind_speed_ms: 3.1, wind_direction_deg: 210, cloud_cover_pct: 45, precip_mm: 0   },
    { lat: 39.29, lon: -76.61, label: 'Baltimore',    temperature_c: 15, wind_speed_ms: 2.8, wind_direction_deg: 195, cloud_cover_pct: 40, precip_mm: 0   },
    { lat: 41.88, lon: -87.63, label: 'Chicago',      temperature_c:  9, wind_speed_ms: 7.3, wind_direction_deg: 270, cloud_cover_pct: 75, precip_mm: 1.2 },
    { lat: 41.50, lon: -81.69, label: 'Cleveland',    temperature_c: 10, wind_speed_ms: 5.8, wind_direction_deg: 250, cloud_cover_pct: 80, precip_mm: 0.4 },
    { lat: 39.96, lon: -82.99, label: 'Columbus',     temperature_c: 11, wind_speed_ms: 4.5, wind_direction_deg: 235, cloud_cover_pct: 55, precip_mm: 0   },
    { lat: 37.54, lon: -77.44, label: 'Richmond',     temperature_c: 17, wind_speed_ms: 2.1, wind_direction_deg: 180, cloud_cover_pct: 30, precip_mm: 0   },
    { lat: 38.35, lon: -81.63, label: 'Charleston',   temperature_c: 14, wind_speed_ms: 3.4, wind_direction_deg: 215, cloud_cover_pct: 50, precip_mm: 0   },
    { lat: 40.27, lon: -76.88, label: 'Harrisburg',   temperature_c: 13, wind_speed_ms: 3.8, wind_direction_deg: 220, cloud_cover_pct: 55, precip_mm: 0   },
  ],
};

export function useWeatherData() {
  const [data,    setData]    = useState<WeatherData>(MOCK_WEATHER);
  const [loading, setLoading] = useState(true);
  const [live,    setLive]    = useState(false);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/api/weather/current`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as WeatherData;
      setData(json);
      setLive(true);
    } catch {
      setLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch_();
    const id = setInterval(() => void fetch_(), 30 * 60_000);
    return () => clearInterval(id);
  }, [fetch_]);

  return { data, loading, live };
}

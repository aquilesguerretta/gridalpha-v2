// src/hooks/data/useEnergyPrices.ts
// EIA API v2 — Henry Hub natural gas spot price.
// Used to drive Spark Spread card with live gas prices.

import { useState, useEffect, useCallback } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL as string;

export interface HenryHubData {
  current_price_mmbtu: number;
  prices_30d:          Array<{ date: string; price: number }>;
  change_pct:          number;
  live:                boolean;
}

const MOCK_HENRY_HUB: HenryHubData = {
  current_price_mmbtu: 2.14,
  change_pct:          -1.8,
  live:                false,
  prices_30d: Array.from({ length: 30 }, (_, i) => ({
    date:  new Date(Date.now() - (29 - i) * 86_400_000).toISOString().split('T')[0],
    price: 2.0 + Math.sin(i / 4) * 0.3 + Math.random() * 0.1,
  })),
};

export function useHenryHub() {
  const [data,    setData]    = useState<HenryHubData>(MOCK_HENRY_HUB);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/api/energy/henry-hub`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as HenryHubData;
      setData({ ...json, live: true });
    } catch {
      setData(prev => ({ ...prev, live: false }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch_();
    const id = setInterval(() => void fetch_(), 60 * 60_000);
    return () => clearInterval(id);
  }, [fetch_]);

  return { data, loading };
}

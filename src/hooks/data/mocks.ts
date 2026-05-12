// FORGE Wave 4 — Mock envelope producers.
// One factory per endpoint. When `MOCK_MODE` is on (or any hook is
// running in offline mode), the hook calls these producers to get a
// shape-matched envelope without touching the network. Mock values are
// derived from the existing pjm/mock-data tables when possible so the
// app's mocked appearance stays consistent with the pre-Wave-4 build.

import type {
  AncillaryData,
  ApiEnvelope,
  DAForecastAllZonesData,
  DAForecastData,
  DAForecastMeta,
  FuelMixData,
  FuelMixRow,
  LMP24hData,
  LMP24hMeta,
  LMPAllZonesData,
  LMPCurrentData,
  LMPHistoryData,
  LMPHistoryMeta,
  OutagesData,
  OutagesMeta,
  ReserveMarginData,
  SparkSpreadData,
  SparkSpreadMeta,
} from '@/lib/types/api';
import {
  ZONE_24H_PRICES,
  ZONE_LMP,
} from '@/lib/pjm/mock-data';

const nowISO = (): string => new Date().toISOString();

// ─── ENDPOINT 1: LMP current ─────────────────────────────────────

export function mockLMPCurrent(zone: string): ApiEnvelope<LMPCurrentData> {
  const seed = ZONE_LMP[zone] ?? ZONE_LMP.DEFAULT ?? { price: 35.0, delta: 0.5 };
  const lmp_total = Number(seed.price.toFixed(2));
  const delta = Number((seed.delta ?? 0).toFixed(2));
  return {
    meta: {
      zone,
      timestamp: nowISO(),
      data_age_seconds: 12,
      source: 'mock-lmp',
    },
    data: {
      lmp_total,
      lmp_energy: Number((lmp_total * 0.87).toFixed(2)),
      lmp_congestion: Number((lmp_total * 0.10).toFixed(2)),
      lmp_loss: Number((lmp_total * 0.03).toFixed(2)),
      delta_pct_5min: delta,
    },
    summary: `${zone} LMP $${lmp_total.toFixed(2)}/MWh (mock).`,
  };
}

// ─── ENDPOINT 2: LMP all zones ───────────────────────────────────

export function mockLMPAllZones(): ApiEnvelope<LMPAllZonesData> {
  const data: LMPAllZonesData = {};
  for (const [zone, seed] of Object.entries(ZONE_LMP)) {
    if (zone === 'DEFAULT') continue;
    data[zone] = {
      lmp_total: Number(seed.price.toFixed(2)),
      delta_pct_5min: Number((seed.delta ?? 0).toFixed(2)),
    };
  }
  const total = Object.values(data).reduce((s, v) => s + v.lmp_total, 0);
  const avg = Object.keys(data).length
    ? Number((total / Object.keys(data).length).toFixed(2))
    : 0;
  return {
    meta: {
      timestamp: nowISO(),
      data_age_seconds: 18,
      zone_count: Object.keys(data).length,
    },
    data,
    summary: `${Object.keys(data).length} zones (mock), avg $${avg}.`,
  };
}

// ─── ENDPOINT 3: LMP 24h ─────────────────────────────────────────

export function mockLMP24h(
  zone: string,
): ApiEnvelope<LMP24hData> & { meta: LMP24hMeta } {
  const series = ZONE_24H_PRICES[zone] ?? ZONE_24H_PRICES.DEFAULT;
  const now = Date.now();
  const data: LMP24hData = series.map((v, i) => ({
    timestamp: new Date(now - (series.length - 1 - i) * 60 * 60 * 1000).toISOString(),
    lmp_total: Number(v.toFixed(2)),
  }));
  const min = Math.min(...series);
  const max = Math.max(...series);
  return {
    meta: {
      zone,
      timestamp: nowISO(),
      data_age_seconds: 90,
      interval_minutes: 60,
      row_count: data.length,
      source: 'mock-lmp-24h',
    },
    data,
    summary: `${zone} 24h range $${min.toFixed(2)}-$${max.toFixed(2)} (mock).`,
  };
}

// ─── ENDPOINT 4: DA forecast (single zone) ───────────────────────

function buildDACurve(seed: number[]): number[] {
  // DA forecast is hourly (24 values). The mock 24H series is already
  // 24 hourly values — perturb by ±3% per hour and return as forecast.
  return seed.map((v, i) => {
    const noise = ((i * 7919) % 11) - 5;
    return Number(Math.max(0, v * (1 + noise * 0.006)).toFixed(2));
  });
}

export function mockDAForecast(
  zone: string,
  date?: string,
): ApiEnvelope<DAForecastData> & { meta: DAForecastMeta } {
  const seed = ZONE_24H_PRICES[zone] ?? ZONE_24H_PRICES.DEFAULT;
  const curve = buildDACurve(seed);
  const market = date ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const data: DAForecastData = curve.map((lmp, hour) => ({ hour, lmp }));
  const peak = Math.max(...curve);
  const trough = Math.min(...curve);
  return {
    meta: {
      zone,
      timestamp: nowISO(),
      data_age_seconds: 30 * 60,
      market_date: market,
      interval: 'hourly',
      source: 'mock-da-forecast',
    },
    data,
    summary: `${zone} DA mock: peak $${peak}, trough $${trough}.`,
  };
}

// ─── ENDPOINT 11: DA forecast all zones ─────────────────────────

export function mockDAForecastAllZones(
  date?: string,
): ApiEnvelope<DAForecastAllZonesData> {
  const data: DAForecastAllZonesData = {};
  for (const zone of Object.keys(ZONE_24H_PRICES)) {
    if (zone === 'DEFAULT') continue;
    data[zone] = buildDACurve(ZONE_24H_PRICES[zone]).map((lmp, hour) => ({
      hour,
      lmp,
    }));
  }
  const market = date ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  return {
    meta: {
      timestamp: nowISO(),
      data_age_seconds: 30 * 60,
      market_date: market,
    },
    data,
    summary: `${Object.keys(data).length} zones DA forecast (mock).`,
  };
}

// ─── ENDPOINT 5: LMP history ─────────────────────────────────────

export function mockLMPHistory(
  zone: string,
  start: string,
  end: string,
  interval: '5min' | 'hourly' = '5min',
): ApiEnvelope<LMPHistoryData> & { meta: LMPHistoryMeta } {
  const seed = ZONE_24H_PRICES[zone] ?? ZONE_24H_PRICES.DEFAULT;
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  const stepMin = interval === '5min' ? 5 : 60;
  const stepMs = stepMin * 60 * 1000;
  const data: LMPHistoryData = [];
  for (let t = startMs; t <= endMs; t += stepMs) {
    const hour = new Date(t).getUTCHours();
    const lmp = seed[hour] ?? seed[seed.length - 1];
    data.push({
      timestamp: new Date(t).toISOString(),
      lmp_total: Number(lmp.toFixed(2)),
    });
  }
  return {
    meta: {
      zone,
      timestamp: nowISO(),
      data_age_seconds: 0,
      start,
      end,
      interval_minutes: stepMin,
      row_count: data.length,
      source: 'mock-history',
    },
    data,
    summary: `${zone} history mock: ${data.length} rows.`,
  };
}

// ─── ENDPOINT 6: Spark spread ────────────────────────────────────

export function mockSparkSpread(
  zone: string,
  heatRate: number = 7500,
): ApiEnvelope<SparkSpreadData> & { meta: SparkSpreadMeta } {
  const lmpSeed = ZONE_LMP[zone] ?? ZONE_LMP.DEFAULT ?? { price: 35.0, delta: 0 };
  const lmp_total = Number(lmpSeed.price.toFixed(2));
  const gasPrice = 3.42;
  const gas_equivalent_cost = Number(((gasPrice * heatRate) / 1000).toFixed(2));
  const spark_spread = Number((lmp_total - gas_equivalent_cost).toFixed(2));
  const regime: SparkSpreadData['regime'] =
    spark_spread > 5 ? 'BURNING' : spark_spread < 0 ? 'SUPPRESSED' : 'NORMAL';
  return {
    meta: {
      zone,
      timestamp: nowISO(),
      data_age_seconds: 18,
      heat_rate: heatRate,
      gas_price_mmbtu: gasPrice,
      source: 'mock-spark',
    },
    data: {
      lmp_total,
      gas_equivalent_cost,
      spark_spread,
      regime,
    },
    summary: `${zone} spark mock $${spark_spread}, ${regime}.`,
  };
}

// ─── ENDPOINT 7: Fuel mix ────────────────────────────────────────

export function mockFuelMix(): ApiEnvelope<FuelMixData> {
  const fuels: FuelMixRow[] = [
    { fuel: 'natural_gas', mw: 48200, pct: 38.4, carbon_intensity_kg_per_mwh: 412 },
    { fuel: 'nuclear',     mw: 32100, pct: 25.6, carbon_intensity_kg_per_mwh: 0 },
    { fuel: 'coal',        mw: 18400, pct: 14.7, carbon_intensity_kg_per_mwh: 920 },
    { fuel: 'wind',        mw: 12800, pct: 10.2, carbon_intensity_kg_per_mwh: 0 },
    { fuel: 'solar',       mw:  8200, pct:  6.5, carbon_intensity_kg_per_mwh: 0 },
    { fuel: 'hydro',       mw:  3100, pct:  2.5, carbon_intensity_kg_per_mwh: 0 },
    { fuel: 'oil',         mw:  1300, pct:  1.0, carbon_intensity_kg_per_mwh: 740 },
    { fuel: 'other',       mw:  1500, pct:  1.2, carbon_intensity_kg_per_mwh: 200 },
  ];
  const total_mw = fuels.reduce((s, f) => s + f.mw, 0);
  const systemCI =
    fuels.reduce((s, f) => s + f.mw * f.carbon_intensity_kg_per_mwh, 0) /
    Math.max(1, total_mw);
  return {
    meta: {
      timestamp: nowISO(),
      data_age_seconds: 4 * 60,
      footprint: 'PJM',
      source: 'mock-fuel-mix',
    },
    data: {
      fuels,
      total_mw,
      system_carbon_intensity_kg_per_mwh: Math.round(systemCI),
    },
    summary: 'PJM at 125.6 GW (mock). Gas-led at 38%, nuclear 26%.',
  };
}

// ─── ENDPOINT 8: Reserve margin ─────────────────────────────────

export function mockReserveMargin(): ApiEnvelope<ReserveMarginData> {
  const load_actual_mw = 112400;
  const load_forecast_mw = 113800;
  const available_capacity_mw = 138200;
  const reserve_margin_pct = Number(
    (((available_capacity_mw - load_actual_mw) / load_actual_mw) * 100).toFixed(2),
  );
  const regime: ReserveMarginData['regime'] =
    reserve_margin_pct < 12 ? 'TIGHT' : reserve_margin_pct > 25 ? 'COMFORTABLE' : 'ADEQUATE';
  return {
    meta: {
      timestamp: nowISO(),
      data_age_seconds: 60,
      scope: 'PJM',
      source: 'mock-reserve',
    },
    data: {
      load_actual_mw,
      load_forecast_mw,
      available_capacity_mw,
      reserve_margin_pct,
      regime,
    },
    summary: `PJM reserve mock ${reserve_margin_pct}%, ${regime}.`,
  };
}

// ─── ENDPOINT 9: Outages ─────────────────────────────────────────

export function mockOutages(): ApiEnvelope<OutagesData> & { meta: OutagesMeta } {
  const data: OutagesData = [
    {
      generator: 'Salem 2',
      zone: 'PSEG',
      capacity_mw: 1170,
      outage_type: 'FORCED',
      start_timestamp: new Date(Date.now() - 4 * 3600_000).toISOString(),
      expected_return: null,
      fuel_type: 'nuclear',
    },
    {
      generator: 'Homer City Unit 2',
      zone: 'WEST_HUB',
      capacity_mw: 884,
      outage_type: 'FORCED',
      start_timestamp: new Date(Date.now() - 32 * 60_000).toISOString(),
      expected_return: null,
      fuel_type: 'coal',
    },
    {
      generator: 'Limerick 1',
      zone: 'PSEG',
      capacity_mw: 1143,
      outage_type: 'PLANNED',
      start_timestamp: new Date(Date.now() - 18 * 3600_000).toISOString(),
      expected_return: new Date(Date.now() + 8 * 86400_000).toISOString(),
      fuel_type: 'nuclear',
    },
    {
      generator: 'Conemaugh Unit 1',
      zone: 'WEST_HUB',
      capacity_mw: 950,
      outage_type: 'MAINTENANCE',
      start_timestamp: new Date(Date.now() - 26 * 3600_000).toISOString(),
      expected_return: new Date(Date.now() + 36 * 3600_000).toISOString(),
      fuel_type: 'coal',
    },
  ];
  return {
    meta: {
      timestamp: nowISO(),
      data_age_seconds: 4 * 60,
      outage_count: data.length,
      source: 'mock-outages',
    },
    data,
    summary: `${data.length} mock outages totaling ${data.reduce((s, o) => s + o.capacity_mw, 0)} MW.`,
  };
}

// ─── ENDPOINT 10: Ancillary ──────────────────────────────────────

export function mockAncillary(): ApiEnvelope<AncillaryData> {
  return {
    meta: {
      timestamp: nowISO(),
      data_age_seconds: 60,
      market: 'PJM-ASM',
      source: 'mock-ancillary',
    },
    data: {
      regulation_d_mcp: 18.4,
      regulation_a_mcp: 11.2,
      spinning_reserve_mcp: 4.8,
      regulation_mileage_payment: 28.2,
    },
    summary: 'Reg-D $18.40, Reg-A $11.20, Spin $4.80 (mock).',
  };
}

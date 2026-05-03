// FORGE Wave 3 — Main optimization runner.
// Generates per-asset bid curves under three sensitivity scenarios
// (base / volatility-up / forecast-miss), aggregates fleet revenue,
// and computes the performance-vs-optimal benchmark for the dashboard.

import type {
  AssetResult,
  BatteryAsset,
  Fleet,
  FleetResult,
  MarketContext,
  ScenarioName,
  ScenarioResult,
} from '@/lib/types/storage';
import { generateBidCurve } from './optimizer';
import { stackAncillaryOnIdleHours } from './ancillary';
import { computeAttribution, fleetTotalCycles } from './attribution';

// ─── Scenario transforms ─────────────────────────────────────────

/** Volatility-up: peaks +50%, troughs −25% relative to the day's median. */
function applyVolatility(market: MarketContext, factor: number): MarketContext {
  const transformed: Record<string, number[]> = {};
  for (const [zone, series] of Object.entries(market.daHourlyLMPByZone)) {
    const sorted = [...series].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    transformed[zone] = series.map((v) => {
      const delta = v - median;
      return Number((median + delta * factor).toFixed(2));
    });
  }
  return { ...market, daHourlyLMPByZone: transformed };
}

/** Forecast-miss: rotate the LMP curve forward by N hours. */
function rotateLMP(market: MarketContext, hours: number): MarketContext {
  const transformed: Record<string, number[]> = {};
  for (const [zone, series] of Object.entries(market.daHourlyLMPByZone)) {
    const n = series.length;
    const k = ((hours % n) + n) % n;
    transformed[zone] = series.slice(k).concat(series.slice(0, k));
  }
  return { ...market, daHourlyLMPByZone: transformed };
}

// ─── Per-asset run ───────────────────────────────────────────────

function runAsset(
  asset: BatteryAsset,
  market: MarketContext,
): AssetResult {
  const lmpSeries =
    market.daHourlyLMPByZone[asset.zone] ??
    market.daHourlyLMPByZone.DEFAULT ??
    [];
  const ancillaryService = asset.ancillaryService ?? 'reg-d';
  const ancillaryCurve = market.ancillaryHourlyMCP[ancillaryService] ?? [];

  // Generate the heuristic bid curve.
  const opt = generateBidCurve(asset, lmpSeries, ancillaryCurve, {
    startSOCFraction: 0.5,
  });

  // Decorate idle hours with ancillary if enabled — mutates curve.
  const ancillary = stackAncillaryOnIdleHours(asset, opt.bidCurve, market);

  // Attribution + cycles.
  const attribution = computeAttribution({
    asset,
    bidCurve: opt.bidCurve,
    ancillary,
    cyclesUsed: opt.cyclesUsed,
  });

  return {
    asset,
    bidCurve: opt.bidCurve,
    socTrajectory: opt.socTrajectory,
    attribution,
    cyclesUsed: opt.cyclesUsed,
    constraintViolations: opt.violations,
  };
}

// ─── Per-scenario run ────────────────────────────────────────────

function runScenario(
  fleet: Fleet,
  market: MarketContext,
): {
  results: AssetResult[];
  scenario: ScenarioResult;
} {
  const results = fleet.assets.map((asset) => runAsset(asset, market));
  const perAssetRevenue: Record<string, number> = {};
  let total = 0;
  for (const r of results) {
    perAssetRevenue[r.asset.id] = r.attribution.netUSD;
    total += r.attribution.netUSD;
  }
  return {
    results,
    scenario: {
      fleetTotalRevenueUSD: total,
      perAssetRevenue,
    },
  };
}

// ─── Performance vs optimal ──────────────────────────────────────
// Theoretical perfect-foresight optimum: pretend each asset can perfectly
// arbitrage every $/MWh of spread at its rated power. We compute the sum
// of (sorted descending half − sorted ascending half) at each asset's
// duration as a loose upper bound. Real optimum would require an LP.

function theoreticalOptimum(fleet: Fleet, market: MarketContext): number {
  let total = 0;
  for (const asset of fleet.assets) {
    const series =
      market.daHourlyLMPByZone[asset.zone] ??
      market.daHourlyLMPByZone.DEFAULT ??
      [];
    const sorted = [...series].sort((a, b) => a - b);
    const n = Math.min(asset.durationHours, Math.floor(series.length / 2));
    const lows = sorted.slice(0, n);
    const highs = sorted.slice(-n);
    const lowAvg = average(lows);
    const highAvg = average(highs);
    const powerMW = asset.powerKW / 1000;
    // Spread × power × hours, less RTE loss on charging.
    total += (highAvg - lowAvg / asset.rte) * powerMW * n;
  }
  return Math.max(0, total);
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ─── Entry point ──────────────────────────────────────────────────

export function runOptimization(
  fleet: Fleet,
  market: MarketContext,
): FleetResult {
  const baseRun = runScenario(fleet, market);
  const volRun = runScenario(fleet, applyVolatility(market, 1.5));
  const missRun = runScenario(fleet, rotateLMP(market, 3));

  const ranked = [...baseRun.results].sort(
    (a, b) => b.attribution.netUSD - a.attribution.netUSD,
  );
  const cycles = fleetTotalCycles(baseRun.results);

  const optimum = theoreticalOptimum(fleet, market);
  const performanceVsOptimal =
    optimum > 0
      ? Math.max(0, Math.min(1, baseRun.scenario.fleetTotalRevenueUSD / optimum))
      : 0;

  return {
    fleet,
    scenarios: {
      base: baseRun.scenario,
      volatilityUp: volRun.scenario,
      forecastMiss: missRun.scenario,
    },
    perAssetRanking: ranked,
    fleetTotalCycles: cycles,
    performanceVsOptimal,
  };
}

// Re-export scenario name for callers.
export type { ScenarioName };

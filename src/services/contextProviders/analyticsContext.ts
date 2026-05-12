// ORACLE Wave 2 / Wave 4 — Analytics workbench context provider.
//
// Analytics is a multi-tab destination. The current tab lives as React-local
// state inside AnalyticsPage, so the AI provider has no direct read access
// until ARCHITECT ships viewStore (or AnalyticsPage exposes the tab via a
// store / search param). Until then, the provider describes the workbench
// generally and allows callers (e.g. InlineAITrigger) to inject the active
// tab via subContext.
//
// Wave 4 addition: tab-aware freshness summary. Each tab has its own
// hero chart and its own dominant data source — Price Intelligence
// reads RT LMP, Spark Spread reads LMP + gas, Battery Arbitrage reads
// DA forecast, Marginal Fuel reads fuel-mix, Convergence reads DA/RT
// reconciliation. Until FORGE Wave 4 hooks ship, all rows pass
// synthetic ageSeconds: 0.

import type { ContextProvider, FreshnessSource } from '../aiContext';
import { makeFreshnessSource, summariseFreshness } from '../aiContext';
import {
  PRICE_INTELLIGENCE_KPIS,
  SPARK_SPREAD_PLANTS,
  ZONE_RELIABILITY_SCORES,
  CONVERGENCE_OPPORTUNITIES,
} from '@/lib/mock/analytics-mock';

// Heuristic — recognise common deep-link / search-param hints. Most
// analytics consumers don't yet route the active tab into the URL, but
// when they do, the provider picks it up automatically.
function inferTab(input: { searchParams: Record<string, string> }): string | undefined {
  return input.searchParams.tab;
}

export const analyticsContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? null;
  const tab = inferTab(input);

  const tabLabels: Record<string, string> = {
    intelligence: 'Peregrine Intelligence',
    price:        'Price Intelligence',
    spread:       'Spark Spread',
    battery:      'Battery Arbitrage',
    marginal:     'Marginal Fuel',
    convergence:  'Convergence',
  };

  const description =
    `Analytics workbench. Six tabs: Peregrine Intelligence (live RSS), ` +
    `Price Intelligence (system avg LMP $${PRICE_INTELLIGENCE_KPIS.systemAvgLmp.toFixed(2)}/MWh, ` +
    `most-congested zone ${PRICE_INTELLIGENCE_KPIS.mostCongestedZone}), ` +
    `Spark Spread (${SPARK_SPREAD_PLANTS.length} plants ranked by margin), ` +
    `Battery Arbitrage (DA optimal schedule + sensitivity matrix), ` +
    `Marginal Fuel (24-hour Gantt + price-setter card), and ` +
    `Convergence (${CONVERGENCE_OPPORTUNITIES.length} DA-RT opportunities). ` +
    `Reliability rail covers ${ZONE_RELIABILITY_SCORES.length} zones. ` +
    (tab && tabLabels[tab]
      ? `Active tab: ${tabLabels[tab]}.`
      : `Active tab unknown to the AI provider — the user is on one of the six tabs above.`);

  // Per-tab freshness. When `tab` is known, surface the dominant
  // source for that tab as the hero source so the model can be
  // specific ("the RT LMP feeding Price Intelligence is ~12s old").
  // When `tab` is unknown, fall back to the system-wide set.
  const freshness = summariseFreshness(freshnessSourcesForTab(tab));

  return {
    surfaceLabel: 'Analytics',
    selectedZone: zone,
    selectedTab: tab,
    visibleData: {
      description,
      metrics: {
        systemAvgLmp: PRICE_INTELLIGENCE_KPIS.systemAvgLmp,
        maxLmp: PRICE_INTELLIGENCE_KPIS.maxLmp,
        minLmp: PRICE_INTELLIGENCE_KPIS.minLmp,
        mostCongestedZone: PRICE_INTELLIGENCE_KPIS.mostCongestedZone,
      },
      freshness,
    },
  };
};

function freshnessSourcesForTab(tab: string | undefined): FreshnessSource[] {
  switch (tab) {
    case 'price':
      return [
        makeFreshnessSource('Price overlay (RT LMP)', 0, false),
        makeFreshnessSource('Component breakdown', 0, false),
      ];
    case 'spread':
      return [
        makeFreshnessSource('Plant spark spreads', 0, false),
        makeFreshnessSource('Henry Hub gas', 0, false),
        makeFreshnessSource('Dispatch frontier', 0, false),
      ];
    case 'battery':
      return [
        makeFreshnessSource('DA forecast', 0, false),
        makeFreshnessSource('Optimal schedule', 0, false),
      ];
    case 'marginal':
      return [
        makeFreshnessSource('Marginal-fuel gantt', 0, false),
        makeFreshnessSource('Reserve margin', 0, false),
      ];
    case 'convergence':
      return [
        makeFreshnessSource('DA-RT reconciliation', 0, false),
        makeFreshnessSource('Opportunity feed', 0, false),
      ];
    case 'intelligence':
      return [
        makeFreshnessSource('Peregrine RSS', 0, false),
      ];
    default:
      // No tab known to the provider — surface a system-wide set.
      return [
        makeFreshnessSource('System LMP', 0, false),
        makeFreshnessSource('Reliability rail', 0, false),
      ];
  }
}

// ORACLE Wave 2 — Analytics workbench context provider.
//
// Analytics is a multi-tab destination. The current tab lives as React-local
// state inside AnalyticsPage, so the AI provider has no direct read access
// until ARCHITECT ships viewStore (or AnalyticsPage exposes the tab via a
// store / search param). Until then, the provider describes the workbench
// generally and allows callers (e.g. InlineAITrigger) to inject the active
// tab via subContext.

import type { ContextProvider } from '../aiContext';
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
    },
  };
};

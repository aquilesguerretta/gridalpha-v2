// ORACLE Wave 2 / Wave 4 — Trader Nest context provider.
//
// Reads the trader-facing mock data (LMP, spark spread, anomalies) and
// produces a SurfaceContext describing what's on the trader's screen.
//
// Wave 4 addition: aggregates `visibleData.freshness` across the six
// data sources rendered on the Trader Nest. Until FORGE Wave 4's hooks
// expose real `ageSeconds`/`isStale`, the rows pass synthetic
// `ageSeconds: 0` (mock data is immutable). When FORGE flips on, the
// rows carry real values without provider changes.

import type { ContextProvider } from '../aiContext';
import { makeFreshnessSource, summariseFreshness } from '../aiContext';

// The six data sources Trader Nest renders. Centralised so the system
// prompt can reference them by name and so FORGE Wave 4 can wire each
// one to its real hook one at a time.
const TRADER_NEST_SOURCES = [
  'Hero LMP',
  '24h LMP chart',
  'Spark spread tile',
  'BESS tile',
  'Fuel mix tile',
  'Anomaly feed',
] as const;

export const traderNestContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? 'WEST_HUB';

  // Synthetic freshness — every source treated as live until FORGE Wave 4
  // upgrades the providers to read real hook state. Mock data is
  // immutable, so claiming "live" is the correct default for now.
  const freshness = summariseFreshness(
    TRADER_NEST_SOURCES.map((label) => makeFreshnessSource(label, 0, false)),
  );

  const description =
    `Trader Nest. Selected zone: ${zone}. Hero LMP block shows the current ` +
    `real-time price for ${zone}; the 24-hour chart shows the day's range ` +
    `with brushable selection. Spark-spread tile shows current heat-rate ` +
    `economics for the zone. Anomaly feed lists active deviations across ` +
    `PJM. PeregrinePreview surfaces the latest market-moving headline.`;

  return {
    surfaceLabel: 'Trader Nest',
    selectedZone: zone,
    visibleData: {
      description,
      metrics: {
        zone,
        // The real numbers live in mock data the trader nest renders;
        // the AI panel doesn't need exact values to be useful — it needs
        // to know which zone is on screen and what's on the page.
      },
      alerts: [
        'Active anomaly feed — see panel for current alerts',
      ],
      freshness,
    },
  };
};

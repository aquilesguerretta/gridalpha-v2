// ORACLE Wave 2 — Trader Nest context provider.
//
// Reads the trader-facing mock data (LMP, spark spread, anomalies) and
// produces a SurfaceContext describing what's on the trader's screen.

import type { ContextProvider } from '../aiContext';

export const traderNestContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? 'WEST_HUB';

  // Hardcoded baseline numbers from the trader-facing mock (HeroLMPBlock,
  // LMP24HChart, etc.). When a real-data hook ships the provider can call
  // it instead — the public shape doesn't change.
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
    },
  };
};

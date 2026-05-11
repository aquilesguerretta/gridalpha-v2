// ORACLE Wave 2 / Wave 4 — Industrial Nest context provider.
//
// Wave 4 addition: freshness on the LMP input to the strategy
// simulator. The simulator's economics are tariff-driven, but the
// "Energy cost" line item pulls from current zonal LMP — that's the
// source whose age the AI needs to caveat when it gets stale.

import type { ContextProvider } from '../aiContext';
import { makeFreshnessSource, summariseFreshness } from '../aiContext';
import { FACILITY_PROFILE, STRATEGIES } from '@/lib/mock/industrial-mock';

export const industrialNestContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? null;

  const description =
    `Industrial Nest — facility: ${FACILITY_PROFILE.name} ` +
    `(${FACILITY_PROFILE.location}). Peak load ${FACILITY_PROFILE.peakLoadMw} MW, ` +
    `typical load ${FACILITY_PROFILE.typicalLoadMw} MW. Strategy simulator ` +
    `shows ${STRATEGIES.length} side-by-side scenarios (procurement, demand ` +
    `response, efficiency, on-site solar, BESS). Tariff-comparison rail ` +
    `shows current vs. alternative tariff structures. Demand-response ` +
    `opportunities and carbon-intensity tracker also visible.`;

  // Simulator inputs that go stale with the live market:
  //   - LMP feed for the facility's zone (drives the "energy cost" line)
  //   - Tariff library (refreshed daily — effectively static within a session)
  const freshness = summariseFreshness([
    makeFreshnessSource('Zone LMP (simulator input)', 0, false),
    makeFreshnessSource('Tariff library', 0, false),
  ]);

  return {
    surfaceLabel: 'Industrial Nest',
    selectedZone: zone,
    visibleData: {
      description,
      metrics: {
        facility: FACILITY_PROFILE.name,
        peakLoadMw: FACILITY_PROFILE.peakLoadMw,
        typicalLoadMw: FACILITY_PROFILE.typicalLoadMw,
        strategiesShown: STRATEGIES.length,
        currentTariff: FACILITY_PROFILE.currentTariff,
      },
      freshness,
    },
  };
};

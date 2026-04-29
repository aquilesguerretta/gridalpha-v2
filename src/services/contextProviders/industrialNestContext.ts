// ORACLE Wave 2 — Industrial Nest context provider.

import type { ContextProvider } from '../aiContext';
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
    },
  };
};

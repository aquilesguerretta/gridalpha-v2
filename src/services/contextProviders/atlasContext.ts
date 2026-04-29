// ORACLE Wave 2 — Grid Atlas context provider.

import type { ContextProvider } from '../aiContext';

export const atlasContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? null;

  const description =
    `Grid Atlas. The user is looking at the geospatial Mapbox-native PJM ` +
    `grid view. Layers available: fuel-mix tiles, binding constraints, ` +
    `outages, substations, gas pipelines, earthquake/weather overlays. ` +
    `${zone ? `Camera/selection focused on ${zone}.` : 'No specific zone selected — full PJM footprint visible.'} ` +
    `The user is exploring grid topology and where market events are physically happening.`;

  return {
    surfaceLabel: 'Grid Atlas',
    selectedZone: zone,
    visibleData: {
      description,
      metrics: zone ? { focusZone: zone } : undefined,
    },
  };
};

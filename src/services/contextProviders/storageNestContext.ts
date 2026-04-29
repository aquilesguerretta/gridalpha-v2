// ORACLE Wave 2 — Storage Nest context provider.

import type { ContextProvider } from '../aiContext';
import { BATTERY_ASSETS, CYCLING_TRACKER } from '@/lib/mock/storage-mock';

export const storageNestContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? null;
  const asset = BATTERY_ASSETS[0];

  const description =
    `Storage Nest. Portfolio strip across ${BATTERY_ASSETS.length} assets ` +
    `(currently focused on ${asset?.name ?? 'lead asset'}). 30-day revenue ` +
    `attribution chart, day-ahead bid recommendations, cycling tracker, ` +
    `ancillary signals, and asset health indicators. The user manages ` +
    `dispatch decisions and revenue optimisation across BESS assets.`;

  const portfolioMw = BATTERY_ASSETS.reduce(
    (sum, a) => sum + (a.mwCapacity ?? 0),
    0,
  );

  return {
    surfaceLabel: 'Storage Nest',
    selectedZone: zone,
    visibleData: {
      description,
      metrics: {
        portfolioAssets: BATTERY_ASSETS.length,
        portfolioMw: Math.round(portfolioMw),
        cyclesToday: CYCLING_TRACKER.todayCycles ?? 0,
      },
    },
  };
};

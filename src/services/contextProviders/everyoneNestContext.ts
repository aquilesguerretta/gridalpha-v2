// ORACLE Wave 2 — Everyone (fallback) Nest context provider.
// Used when the user has no profile selected, or when their profile is set
// to 'everyone'. The Everyone Nest is the legacy bento layout — KPI tiles
// across LMP, spread, battery, gen mix, etc.

import type { ContextProvider } from '../aiContext';

export const everyoneNestContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? 'WEST_HUB';

  const description =
    `The Nest (everyone view). Bento layout with KPI tiles for LMP, ` +
    `spark spread, battery arbitrage, generation mix, and resource gap. ` +
    `Selected zone: ${zone}. The user has not selected a specific profile, ` +
    `so the view is the generalist dashboard.`;

  return {
    surfaceLabel: 'The Nest',
    selectedZone: zone,
    visibleData: {
      description,
      metrics: { zone },
    },
  };
};

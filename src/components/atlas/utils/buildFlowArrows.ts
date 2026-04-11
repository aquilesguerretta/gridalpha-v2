// src/components/atlas/utils/buildFlowArrows.ts
// Converts PJM interface flow data into GeoJSON LineStrings
// with directional arrows at PJM border crossings.

import type { InterfaceFlow } from '../../../hooks/data/useAtlasData';

// Geographic midpoints of PJM interface crossings
const INTERFACE_COORDS: Record<string, {
  from: [number, number];
  to:   [number, number];
  label: string;
}> = {
  'PJM-MISO':    { from: [-87.5, 41.5], to: [-89.0, 41.5], label: 'PJM\u2194MISO' },
  'PJM-NYISO':   { from: [-74.5, 41.5], to: [-73.5, 41.5], label: 'PJM\u2194NYISO' },
  'PJM-SERC':    { from: [-79.0, 36.5], to: [-79.0, 35.5], label: 'PJM\u2194SERC' },
  'PJM-MECS':    { from: [-82.0, 38.5], to: [-83.5, 38.0], label: 'PJM\u2194MECS' },
  'PJM-NEPTUNE': { from: [-73.5, 40.5], to: [-72.5, 40.5], label: 'PJM\u2194Neptune' },
};

export function buildFlowArrows(
  flows: InterfaceFlow[],
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];

  flows.forEach(flow => {
    const key = Object.keys(INTERFACE_COORDS).find(k =>
      flow.name.toUpperCase().includes(k.replace('PJM-', ''))
    );
    if (!key) return;

    const { from, to, label } = INTERFACE_COORDS[key];
    const isExport = flow.actual_mw > 0;

    features.push({
      type: 'Feature',
      properties: {
        name:           label,
        actual_mw:      flow.actual_mw,
        max_mw:         flow.max_mw,
        pct_loading:    flow.pct_loading,
        direction:      isExport ? 'export' : 'import',
        flow_label:     `${Math.abs(flow.actual_mw).toFixed(0)} MW`,
        loading_color:  flow.pct_loading > 0.9 ? '#FF3B3B'
                      : flow.pct_loading > 0.75 ? '#FFB800'
                      : '#00E676',
      },
      geometry: {
        type:        'LineString',
        coordinates: isExport ? [from, to] : [to, from],
      },
    });
  });

  return { type: 'FeatureCollection', features };
}

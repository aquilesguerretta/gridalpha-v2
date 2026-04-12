// src/components/atlas/utils/buildFlowArrows.ts
// Converts PJM interface flow data into GeoJSON LineStrings
// with directional arrows at PJM border crossings.

import type { InterfaceFlow } from '../../../hooks/data/useAtlasData';

// Real PJM border crossing coordinates
// from = PJM side, to = neighbor side
const INTERFACES: Record<string, {
  from:    [number, number];
  to:      [number, number];
  label:   string;
  mock_mw: number;
}> = {
  'MISO':    { from: [-87.8, 41.6], to: [-89.2, 41.6], label: 'PJM→MISO',   mock_mw:  2340 },
  'NYISO':   { from: [-74.8, 41.2], to: [-73.6, 41.2], label: 'PJM→NYISO',  mock_mw:  1890 },
  'SERC':    { from: [-80.0, 36.6], to: [-80.0, 35.4], label: 'PJM→SERC',   mock_mw:  -540 },
  'NEPTUNE': { from: [-74.0, 40.6], to: [-72.8, 40.6], label: 'PJM→Neptune', mock_mw:   420 },
  'LINDEN':  { from: [-74.2, 40.6], to: [-74.2, 40.8], label: 'PJM→Linden', mock_mw:   280 },
};

export function buildFlowArrows(
  flows: InterfaceFlow[],
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];

  Object.entries(INTERFACES).forEach(([key, cfg]) => {
    // Try to match real flow data
    const match = flows.find(f =>
      f.name.toUpperCase().includes(key)
    );

    const mw      = match?.actual_mw ?? cfg.mock_mw;
    const maxMw   = match?.max_mw    ?? 4000;
    const loading = Math.abs(mw) / maxMw;
    const isExport = mw > 0;

    const color = loading > 0.85 ? '#FF3B3B'
                : loading > 0.65 ? '#FFB800'
                : '#00E676';

    features.push({
      type: 'Feature',
      properties: {
        name:          cfg.label,
        actual_mw:     mw,
        flow_label:    `${cfg.label} ${Math.abs(mw).toFixed(0)}MW`,
        loading_color: color,
        width:         2 + loading * 4,
      },
      geometry: {
        type:        'LineString',
        coordinates: isExport
          ? [cfg.from, cfg.to]
          : [cfg.to,   cfg.from],
      },
    });
  });

  return { type: 'FeatureCollection', features };
}

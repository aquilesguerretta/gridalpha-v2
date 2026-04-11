// src/components/atlas/layers/intelligenceLayers.ts
// Dynamic intelligence layers — earthquake alerts, interface flows.
// Built from live data, not static GeoJSON files.

import type { LayerProps } from 'react-map-gl';

// Earthquake alert circles
export const earthquakeLayer: LayerProps = {
  id:   'earthquakes',
  type: 'circle',
  paint: {
    'circle-radius': [
      'interpolate', ['linear'],
      ['get', 'mag'],
      2.0, 6,
      3.0, 10,
      4.0, 16,
      5.0, 24,
    ] as any,
    'circle-color':        'rgba(255,59,59,0)',
    'circle-stroke-color': '#FF3B3B',
    'circle-stroke-width': 2,
    'circle-opacity':      0.8,
  },
};

export const earthquakeLabelLayer: LayerProps = {
  id:     'earthquake-labels',
  type:   'symbol',
  layout: {
    'text-field':  ['concat', 'M', ['to-string', ['get', 'mag']]] as any,
    'text-size':   10,
    'text-font':   ['Open Sans Bold', 'Arial Unicode MS Bold'],
    'text-offset': [0, -1.5],
    'text-anchor': 'bottom',
  },
  paint: {
    'text-color':       '#FF3B3B',
    'text-halo-color':  'rgba(0,0,0,0.8)',
    'text-halo-width':  1,
  },
};

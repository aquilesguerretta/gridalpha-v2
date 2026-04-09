import { GeoJsonLayer } from '@deck.gl/layers';
import type { PickingInfo } from '@deck.gl/core';

export type ZoneFeatureProps = {
  zone_id:      string;
  display_name: string;
  peak_load_mw: number;
  lmp_total:    number;
  congestion:   number;
};

export type ZoneHoverInfo = {
  type: 'zone';
  data: ZoneFeatureProps;
  x:    number;
  y:    number;
};

// Congestion → fill alpha
function congestionAlpha(cong: number): number {
  const norm = Math.min(cong / 5, 1); // clamp 0–5 → 0–1
  return Math.round(10 + norm * 30);  // 10–40 alpha
}

export function createZoneBoundariesLayer(
  onHover: (info: ZoneHoverInfo | null) => void,
) {
  return new GeoJsonLayer({
    id:                 'zone-boundaries',
    data:               '/data/pjm-zones.geojson',
    filled:             true,
    stroked:            true,
    getFillColor:       (f: { properties: ZoneFeatureProps }) => [
      6, 182, 212, congestionAlpha(f.properties.congestion),
    ],
    getLineColor:       [6, 182, 212, 100] as [number, number, number, number],
    lineWidthMinPixels: 1,
    pickable:           true,
    autoHighlight:      true,
    highlightColor:     [6, 182, 212, 60] as [number, number, number, number],
    onHover: (info: PickingInfo) => {
      if (info.object) {
        onHover({
          type: 'zone',
          data: (info.object as { properties: ZoneFeatureProps }).properties,
          x:    info.x,
          y:    info.y,
        });
      } else {
        onHover(null);
      }
    },
  });
}

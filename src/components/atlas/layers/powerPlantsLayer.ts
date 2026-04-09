import { ScatterplotLayer } from '@deck.gl/layers';
import type { PickingInfo } from '@deck.gl/core';

export type PlantFeatureProps = {
  name:        string;
  fuel_type:   string;
  capacity_mw: number;
  state:       string;
  zone:        string;
};

type GeoJSONPoint = {
  type:       'Feature';
  geometry:   { type: 'Point'; coordinates: [number, number] };
  properties: PlantFeatureProps;
};

// Fuel type → RGBA
const FUEL_COLORS: Record<string, [number, number, number, number]> = {
  NG:  [249, 115,  22, 200], // orange  — natural gas
  NUC: [155,  89, 182, 200], // purple  — nuclear
  WND: [  0, 163, 255, 200], // cyan    — wind
  SUN: [241, 196,  15, 200], // yellow  — solar
  COL: [127, 140, 141, 200], // gray    — coal
  WAT: [ 59, 130, 246, 200], // blue    — hydro
  MWH: [  0, 230, 118, 200], // green   — battery/storage
};

const FALLBACK_COLOR: [number, number, number, number] = [150, 150, 150, 180];

export type PlantHoverInfo = {
  type: 'plant';
  data: PlantFeatureProps;
  x:   number;
  y:   number;
};

export function createPowerPlantsLayer(
  onHover: (info: PlantHoverInfo | null) => void,
) {
  return new ScatterplotLayer<GeoJSONPoint>({
    id:              'power-plants',
    data:            '/data/power-plants.geojson' as unknown as GeoJSONPoint[],
    getPosition:     (d) => d.geometry.coordinates,
    getFillColor:    (d) => FUEL_COLORS[d.properties.fuel_type] ?? FALLBACK_COLOR,
    getRadius:       (d) => Math.sqrt(d.properties.capacity_mw) * 70,
    radiusMinPixels: 3,
    radiusMaxPixels: 18,
    pickable:        true,
    stroked:         true,
    getLineColor:    [255, 255, 255, 40] as [number, number, number, number],
    lineWidthMinPixels: 1,
    onHover: (info: PickingInfo<GeoJSONPoint>) => {
      if (info.object) {
        onHover({ type: 'plant', data: info.object.properties, x: info.x, y: info.y });
      } else {
        onHover(null);
      }
    },
  });
}

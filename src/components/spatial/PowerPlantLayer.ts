import { ColumnLayer } from "@deck.gl/layers";

// ── fuel-type → color mapping ───────────────────────────────────

const FUEL_COLORS: Record<string, [number, number, number]> = {
  NG:  [249, 115,  22],
  NUC: [168,  85, 247],
  WND: [  0, 255, 240],
  SUN: [255, 184,   0],
  COL: [100, 116, 139],
  WAT: [ 59, 130, 246],
  MWH: [ 16, 185, 129],
};

const DEFAULT_COLOR: [number, number, number] = [156, 163, 175];

// ── layer factory ───────────────────────────────────────────────

export const createPowerPlantLayer = (
  data: GeoJSON.FeatureCollection
) => {
  return new ColumnLayer({
    id: "power-plants",
    data: data.features,
    getPosition: (d: GeoJSON.Feature) => {
      const coords = (d.geometry as GeoJSON.Point).coordinates;
      return [coords[0], coords[1]] as [number, number];
    },
    getElevation: (d: GeoJSON.Feature) => {
      const cap = (d.properties?.capacity_mw as number) || 0;
      return Math.sqrt(cap) * 80;
    },
    getFillColor: (d: GeoJSON.Feature) => {
      const fuel = (d.properties?.fuel_type as string) ?? "";
      return FUEL_COLORS[fuel] ?? DEFAULT_COLOR;
    },
    radius: 1500,
    diskResolution: 12,
    extruded: true,
    radiusMinPixels: 2,
    radiusMaxPixels: 20,
    pickable: true,
  });
};

/**
 * GridAlpha V2 — Mapbox GL configuration.
 *
 * "Obsidian Deep" visual DNA: dark-v11 base + custom overrides.
 * All values typed against mapbox-gl's own type definitions.
 */

import type { LngLatBoundsLike, LngLatLike } from "mapbox-gl";

/**
 * Obsidian Deep v1 custom style — intermittent 503s from Mapbox API
 * prevent the `load` event from firing, which blocks deck.gl overlay
 * attachment. Using dark-v11 as a reliable fallback until the custom
 * style is republished / stabilised on the Mapbox Studio side.
 */
// export const MAPBOX_STYLE_OBSIDIAN = "mapbox://styles/aquiles-guerretta/cmm1u47kn005a01s53hd80jbw" as const;
export const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v11" as const;

/**
 * Initial camera state centred on PJM Interconnection territory.
 *
 * pitch + bearing give the 3-D spatial layer its default perspective.
 */
export const MAPBOX_INITIAL_VIEW: {
  center: LngLatLike;
  zoom: number;
  pitch: number;
  bearing: number;
} = {
  center: [-79.5, 39.5] as [number, number],
  zoom: 7,
  pitch: 45,
  bearing: -10,
} as const;

/** Core background colour of the Obsidian Deep design language. */
export const OBSIDIAN_DEEP = "#0A0A0B" as const;

/**
 * Bounding box that constrains the map to the PJM footprint.
 * Southwest → Northeast corners.
 */
export const PJM_BOUNDS: LngLatBoundsLike = [
  [-83.5, 36.5] as [number, number], // southwest
  [-73.5, 45.5] as [number, number], // northeast
];

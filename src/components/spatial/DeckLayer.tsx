/**
 * GridAlpha V2 — DeckLayer
 *
 * Fetches the PJM zone GeoJSON and renders extruded deck.gl polygons
 * on top of the Mapbox base map via MapboxOverlay.
 * Manages hover and selection state for zone interactivity.
 *
 * NOTE: `overlay` is held in state (not a ref) so that the layer-update
 * effect re-runs once the overlay is attached — fixes race condition where
 * GeoJSON can resolve before the map `load` event fires.
 *
 * Uses interleaved: false so deck.gl creates its own WebGL canvas on top
 * of the Mapbox canvas — more reliable for 3-D extruded polygon rendering.
 */

import { useEffect, useState, useCallback } from "react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { createPjmZoneLayer } from "./PjmZoneLayer";
import type mapboxgl from "mapbox-gl";

export interface DeckLayerProps {
  map: mapboxgl.Map | null;
}

export default function DeckLayer({ map }: DeckLayerProps) {
  const [overlay, setOverlay] = useState<MapboxOverlay | null>(null);
  const [geoJson, setGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Fetch GeoJSON once
  useEffect(() => {
    fetch("/data/pjm-zones.geojson")
      .then((res) => res.json())
      .then((data: GeoJSON.FeatureCollection) => {
        setGeoJson(data);
        console.log(`[DeckLayer] Loaded ${data.features.length} PJM zones`);
      })
      .catch((err) => console.error("[DeckLayer] Failed to load GeoJSON:", err));
  }, []);

  // Attach MapboxOverlay control to the map once
  useEffect(() => {
    if (!map) return;

    const ov = new MapboxOverlay({
      interleaved: false,
      layers: [],
    });

    map.addControl(ov);
    setOverlay(ov);
    console.log("[DeckLayer] MapboxOverlay attached (interleaved=false)");

    return () => {
      map.removeControl(ov);
      setOverlay(null);
    };
  }, [map]);

  // Hover handler — uses functional update to avoid unnecessary state changes
  const onHover = useCallback((info: { object?: GeoJSON.Feature }) => {
    const zoneId = (info.object?.properties?.zone_id as string) ?? null;
    setHoveredZoneId((prev) => (prev === zoneId ? prev : zoneId));
  }, []);

  // Click handler
  const onClick = useCallback((info: { object?: GeoJSON.Feature }) => {
    const zoneId = (info.object?.properties?.zone_id as string) ?? null;
    if (zoneId) {
      setSelectedZoneId((prev) => (prev === zoneId ? null : zoneId));
      console.log(`[DeckLayer] Selected zone: ${zoneId}`);
    }
  }, []);

  // Update layers when data, overlay, or interaction state changes
  useEffect(() => {
    if (!overlay || !geoJson) return;

    const layer = createPjmZoneLayer(geoJson, hoveredZoneId, selectedZoneId);

    overlay.setProps({
      layers: [layer],
      onHover,
      onClick,
    });

    console.log("[DeckLayer] Layers updated — zones:", geoJson.features.length);
  }, [overlay, geoJson, hoveredZoneId, selectedZoneId, onHover, onClick]);

  // Pure side-effect component
  return null;
}

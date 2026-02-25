/**
 * GridAlpha V2 — DeckLayer
 *
 * Fetches the PJM zone GeoJSON and renders extruded deck.gl polygons
 * on top of the Mapbox base map via MapboxOverlay.
 * Manages hover and selection state for zone interactivity.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { createPjmZoneLayer } from "./PjmZoneLayer";
import type mapboxgl from "mapbox-gl";

export interface DeckLayerProps {
  map: mapboxgl.Map | null;
}

export default function DeckLayer({ map }: DeckLayerProps) {
  const overlayRef = useRef<MapboxOverlay | null>(null);
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
        console.log("DeckLayer mounted, zones:", data.features.length, data.features.map(f => f.properties?.zone_id));
      })
      .catch((err) => console.error("[DeckLayer] Failed to load GeoJSON:", err));
  }, []);

  // Attach MapboxOverlay control to the map once
  useEffect(() => {
    if (!map) return;

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: [],
    });

    map.addControl(overlay);
    overlayRef.current = overlay;

    return () => {
      map.removeControl(overlay);
      overlayRef.current = null;
    };
  }, [map]);

  // Hover handler
  const onHover = useCallback((info: { object?: GeoJSON.Feature }) => {
    const zoneId = (info.object?.properties?.zone_id as string) ?? null;
    setHoveredZoneId(zoneId);
  }, []);

  // Click handler
  const onClick = useCallback((info: { object?: GeoJSON.Feature }) => {
    const zoneId = (info.object?.properties?.zone_id as string) ?? null;
    if (zoneId) {
      setSelectedZoneId((prev) => (prev === zoneId ? null : zoneId));
      console.log(`[DeckLayer] Selected zone: ${zoneId}`);
    }
  }, []);

  // Update layers when data or interaction state changes
  useEffect(() => {
    if (!overlayRef.current || !geoJson) return;

    const layer = createPjmZoneLayer(geoJson, hoveredZoneId, selectedZoneId);

    overlayRef.current.setProps({
      layers: [layer],
      onHover,
      onClick,
    });
  }, [geoJson, hoveredZoneId, selectedZoneId, onHover, onClick]);

  // Pure side-effect component
  return null;
}

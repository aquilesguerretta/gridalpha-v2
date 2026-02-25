/**
 * GridAlpha V2 — GridMap
 *
 * DeckGL as the single view-state controller with react-map-gl Map as child.
 * This eliminates camera sync issues between deck.gl and Mapbox.
 */

import { useState, useCallback, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import Map from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { createPjmZoneLayer } from "./PjmZoneLayer";
import { createPowerPlantLayer } from "./PowerPlantLayer";
import type { LiveDataFrame } from "../../types/index";

// ── initial camera ──────────────────────────────────────────────

const INITIAL_VIEW_STATE = {
  longitude: -79.5,
  latitude: 39.5,
  zoom: 6,
  pitch: 45,
  bearing: 0,
};

// ── component ───────────────────────────────────────────────────

export interface GridMapProps {
  currentFrame?: LiveDataFrame | null;
}

export default function GridMap({ currentFrame: _currentFrame = null }: GridMapProps) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [zoneGeoJson, setZoneGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [plantGeoJson, setPlantGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Fetch GeoJSON data on mount
  useEffect(() => {
    fetch("/data/pjm-zones.geojson")
      .then((res) => res.json())
      .then((data: GeoJSON.FeatureCollection) => {
        setZoneGeoJson(data);
        console.log(`[GridMap] Loaded ${data.features.length} PJM zones`);
      })
      .catch((err) => console.error("[GridMap] Failed to load zones:", err));

    fetch("/data/power-plants.geojson")
      .then((res) => res.json())
      .then((data: GeoJSON.FeatureCollection) => {
        setPlantGeoJson(data);
        console.log(`[GridMap] Loaded ${data.features.length} power plants`);
      })
      .catch((err) => console.error("[GridMap] Failed to load power plants:", err));
  }, []);

  const onViewStateChange = useCallback(({ viewState }: { viewState: typeof INITIAL_VIEW_STATE }) => {
    setViewState(viewState);
  }, []);

  const onHover = useCallback((info: { object?: GeoJSON.Feature }) => {
    const zoneId = (info.object?.properties?.zone_id as string) ?? null;
    setHoveredZoneId((prev) => (prev === zoneId ? prev : zoneId));
  }, []);

  const onClick = useCallback((info: { object?: GeoJSON.Feature }) => {
    const zoneId = (info.object?.properties?.zone_id as string) ?? null;
    if (zoneId) {
      setSelectedZoneId((prev) => (prev === zoneId ? null : zoneId));
      console.log(`[GridMap] Selected zone: ${zoneId}`);
    }
  }, []);

  const getTooltip = useCallback(({ object }: { object?: GeoJSON.Feature }) => {
    if (!object?.properties) return null;
    const p = object.properties;
    if (p.capacity_mw != null) {
      return {
        html: `<b>${p.name}</b><br/>Fuel: ${p.fuel_type}<br/>Capacity: ${p.capacity_mw} MW`,
      };
    }
    return null;
  }, []);

  // Build layers
  const layers = [
    ...(zoneGeoJson
      ? [createPjmZoneLayer(zoneGeoJson, hoveredZoneId, selectedZoneId)]
      : []),
    ...(plantGeoJson ? [createPowerPlantLayer(plantGeoJson)] : []),
  ];

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={onViewStateChange}
      controller={true}
      layers={layers}
      onHover={onHover}
      onClick={onClick}
      getTooltip={getTooltip}
    >
      <Map
        reuseMaps
        mapStyle="mapbox://styles/aquiles-guerretta/cmm1u47kn005a01s53hd80jbw"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      />
    </DeckGL>
  );
}

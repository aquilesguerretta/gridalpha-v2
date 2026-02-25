/**
 * GridAlpha V2 — GridMap
 *
 * Mapbox GL JS base map locked to the PJM Interconnection footprint.
 * Initialises on mount, tears down on unmount.
 * Renders ZoneLayer markers on top of the map canvas.
 */

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  MAPBOX_STYLE,
  MAPBOX_INITIAL_VIEW,
  PJM_BOUNDS,
} from "../../services/mapbox.config";

import ZoneLayer from "./ZoneLayer";
import DeckLayer from "./DeckLayer";
import type { LiveDataFrame } from "../../types/index";

export interface GridMapProps {
  currentFrame?: LiveDataFrame | null;
}

export default function GridMap({ currentFrame = null }: GridMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent double-init in React 18 StrictMode
    if (mapInstanceRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE,
      center: MAPBOX_INITIAL_VIEW.center,
      zoom: MAPBOX_INITIAL_VIEW.zoom,
      pitch: MAPBOX_INITIAL_VIEW.pitch,
      bearing: MAPBOX_INITIAL_VIEW.bearing,
      maxBounds: PJM_BOUNDS,
      minZoom: 6,
      maxZoom: 14,
      scrollZoom: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Force 3-D perspective on startup
      map.setPitch(45);
      map.setBearing(-10);
      setMapReady(map);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(null);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    >
      <ZoneLayer map={mapReady} currentFrame={currentFrame ?? null} />
      <DeckLayer map={mapReady} />
    </div>
  );
}

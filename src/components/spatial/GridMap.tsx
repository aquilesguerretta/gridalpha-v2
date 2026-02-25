/**
 * GridAlpha V2 — GridMap
 *
 * Mapbox GL JS base map locked to the PJM Interconnection footprint.
 * Initialises on mount, tears down on unmount.
 * Renders ZoneLayer markers and deck.gl extrusions on top of the map canvas.
 */

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  MAPBOX_STYLE,
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
      center: [-79.5, 39.5],
      zoom: 5.8,
      pitch: 35,
      bearing: -10,
      maxBounds: PJM_BOUNDS,
      minZoom: 6,
      maxZoom: 14,
      scrollZoom: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.setPitch(35);
      map.setBearing(-10);
      console.log(
        `[GridMap] loaded — pitch=${map.getPitch()} bearing=${map.getBearing()} zoom=${map.getZoom()}`
      );
      setMapReady(map);
    });

    map.on("error", (e) => {
      console.error("[GridMap] Mapbox error:", e.error?.message ?? e);
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

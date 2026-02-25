/**
 * GridAlpha V2 — GridMap
 *
 * Mapbox GL JS base map locked to the PJM Interconnection footprint.
 * Initialises on mount, tears down on unmount.
 */

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  MAPBOX_STYLE,
  MAPBOX_INITIAL_VIEW,
  PJM_BOUNDS,
} from "../../services/mapbox.config";

export default function GridMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent double-init in React 18 StrictMode
    if (mapRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE,
      center: MAPBOX_INITIAL_VIEW.center,
      zoom: MAPBOX_INITIAL_VIEW.zoom,
      pitch: MAPBOX_INITIAL_VIEW.pitch,
      bearing: MAPBOX_INITIAL_VIEW.bearing,
      maxBounds: PJM_BOUNDS,
      minZoom: 4,
      maxZoom: 10,
      scrollZoom: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

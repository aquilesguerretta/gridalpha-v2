/**
 * GridAlpha V2 — ZoneLayer
 *
 * Placeholder circle markers on the Mapbox map for major PJM hubs.
 * Each marker is a DOM overlay sized by lmp_total from the current frame.
 * Full GeoJSON zone boundaries replace these in Phase 4.
 */

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { LiveDataFrame } from "../../types/index";

// ── hub definitions ─────────────────────────────────────────────

interface Hub {
  zone_id: string;
  label: string;
  coords: [number, number];
}

const HUBS: Hub[] = [
  { zone_id: "WESTERN_HUB", label: "Western Hub", coords: [-79.5, 40.5] },
  { zone_id: "EASTERN_HUB", label: "Eastern Hub", coords: [-75.2, 39.9] },
  { zone_id: "AEP", label: "AEP", coords: [-82.0, 38.5] },
];

// ── marker sizing ───────────────────────────────────────────────

const BASE_PX = 20;
const MAX_PX = 60;

function markerSize(lmpTotal: number): number {
  return Math.min(BASE_PX + lmpTotal / 5, MAX_PX);
}

// ── component ───────────────────────────────────────────────────

export interface ZoneLayerProps {
  map: mapboxgl.Map | null;
  currentFrame: LiveDataFrame | null;
}

export default function ZoneLayer({ map, currentFrame }: ZoneLayerProps) {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Create markers once the map is ready
  useEffect(() => {
    if (!map) return;

    // Clear any existing markers (StrictMode safety)
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const markers = HUBS.map((hub) => {
      const el = document.createElement("div");
      el.className = "zone-marker";
      el.dataset.zoneId = hub.zone_id;
      el.title = hub.label;

      // Base style
      Object.assign(el.style, {
        width: `${BASE_PX}px`,
        height: `${BASE_PX}px`,
        borderRadius: "50%",
        background: "rgba(0, 255, 255, 0.25)",
        border: "1px solid rgba(0, 255, 255, 0.6)",
        boxShadow: "0 0 12px rgba(0, 255, 255, 0.35)",
        cursor: "pointer",
        transition: "width 0.4s ease, height 0.4s ease",
      });

      el.addEventListener("click", () => {
        console.log(`[ZoneLayer] clicked zone_id=${hub.zone_id}`);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(hub.coords)
        .addTo(map);

      return marker;
    });

    markersRef.current = markers;

    return () => {
      markers.forEach((m) => m.remove());
      markersRef.current = [];
    };
  }, [map]);

  // Update marker sizes when frame data changes
  useEffect(() => {
    if (!currentFrame) return;

    const size = markerSize(currentFrame.lmp_total);
    const px = `${size}px`;

    markersRef.current.forEach((marker) => {
      const el = marker.getElement();
      el.style.width = px;
      el.style.height = px;
    });
  }, [currentFrame]);

  // Pure side-effect component — no DOM of its own
  return null;
}

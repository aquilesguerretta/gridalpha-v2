/**
 * GridAlpha V2 — App shell.
 *
 * Two-layer stacking context:
 *   z-index 0  → DeckGL spatial canvas (GridMap)
 *   z-index 10 → The Nest glassmorphism UI overlay
 */

import GridMap from "./components/spatial/GridMap";
import TheNest from "./components/ui/TheNest";

export default function App() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#0A0A0B",
      }}
    >
      {/* Layer 0 — DeckGL Map */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <GridMap />
      </div>

      {/* Layer 1 — The Nest UI Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <TheNest />
      </div>
    </div>
  );
}

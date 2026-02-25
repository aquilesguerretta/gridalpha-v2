/**
 * GridAlpha V2 — App shell.
 *
 * Wires the NestLayout Bento grid with placeholder slots.
 * FalconLogo in header, two mock ScoreCards in the strip.
 */

import NestLayout from "./components/dashboard/NestLayout";
import FalconLogo from "./components/spatial/FalconLogo";
import ScoreCard from "./components/dashboard/ScoreCard";

const placeholder = (name: string) => (
  <div style={{ color: "#444", padding: 8 }}>{name}</div>
);

export default function App() {
  return (
    <NestLayout
      headerSlot={
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px" }}>
          <FalconLogo state="idle" />
          <span style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.15em" }}>
            GRIDALPHA
          </span>
        </div>
      }
      mapSlot={placeholder("MAP")}
      scorecardLeftSlot={
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8 }}>
          <ScoreCard
            label="LMP Total"
            value={42.17}
            unit="$/MWh"
            trend={[38, 40, 41, 39, 42, 44, 42]}
            delta={2.3}
            delta_direction="up"
            typography_variant="headline"
          />
          <ScoreCard
            label="Congestion"
            value={3.81}
            unit="$/MWh"
            trend={[4.2, 3.9, 3.7, 3.8, 3.6, 3.8, 3.8]}
            delta={-1.1}
            delta_direction="down"
            typography_variant="subhead"
          />
        </div>
      }
      scorecardRightSlot={
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8 }}>
          <ScoreCard
            label="Load Forecast"
            value={28450}
            unit="MW"
            trend={[27000, 27800, 28200, 28100, 28450]}
            delta={0.4}
            delta_direction="up"
            typography_variant="mono-data"
          />
          <ScoreCard
            label="Actual Load"
            value={27930}
            unit="MW"
            trend={[26500, 27200, 27600, 27800, 27930]}
            delta={0.0}
            delta_direction="neutral"
            typography_variant="mono-data"
          />
        </div>
      }
      timelineSlot={placeholder("TIMELINE")}
      alertsSlot={placeholder("ALERTS")}
    />
  );
}

/**
 * GridAlpha V2 — App shell.
 *
 * Wires the NestLayout Bento grid to live data via useGridData.
 * FalconLogo in header, four ScoreCards driven by currentFrame.
 */

import NestLayout from "./components/dashboard/NestLayout";
import FalconLogo from "./components/spatial/FalconLogo";
import GridMap from "./components/spatial/GridMap";
import ScoreCard from "./components/dashboard/ScoreCard";
import TimeSlider from "./components/dashboard/TimeSlider";
import { useGridData } from "./hooks/useGridData";


// ── data-quality → colour mapping ───────────────────────────────

const QUALITY_DOT: Record<string, string> = {
  LIVE: "#00E676",
  STALE: "#FFB800",
  RECONNECTING: "#FF3B3B",
};

// ── placeholder for unbuilt slots ───────────────────────────────

const placeholder = (name: string) => (
  <div style={{ color: "#444", padding: 8 }}>{name}</div>
);

// ── app ─────────────────────────────────────────────────────────

export default function App() {
  const { currentFrame, frames } = useGridData();
  const currentIndex = frames.indexOf(currentFrame!);


  const lmpTotal = currentFrame?.lmp_total ?? 0;
  const congestion = currentFrame?.congestion ?? 0;
  const loadForecast = currentFrame?.load_forecast_mw ?? 0;
  const actualLoad = currentFrame?.actual_load_mw ?? 0;
  const quality = currentFrame?.data_quality ?? "RECONNECTING";

  return (
    <>
    <NestLayout
      headerSlot={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 16px",
            height: "100%",
          }}
        >
          <FalconLogo state="idle" />
          <span
            style={{
              color: "#fff",
              fontSize: "0.9rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
            }}
          >
            GRIDALPHA
          </span>

          {/* data-quality badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginLeft: 12,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: QUALITY_DOT[quality] ?? "#FF3B3B",
                display: "inline-block",
                boxShadow: `0 0 6px ${QUALITY_DOT[quality] ?? "#FF3B3B"}`,
              }}
            />
            <span
              style={{
                color: QUALITY_DOT[quality] ?? "#FF3B3B",
                fontSize: "0.6rem",
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {quality}
            </span>
          </div>
        </div>
      }
      mapSlot={<GridMap currentFrame={currentFrame} />}
      scorecardLeftSlot={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 8,
          }}
        >
          <ScoreCard
            label="LMP Total"
            value={lmpTotal}
            unit="$/MWh"
            trend={[]}
            delta={0}
            delta_direction="neutral"
            typography_variant="headline"
          />
          <ScoreCard
            label="Congestion"
            value={congestion}
            unit="$/MWh"
            trend={[]}
            delta={0}
            delta_direction="neutral"
            typography_variant="subhead"
          />
        </div>
      }
      scorecardRightSlot={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 8,
          }}
        >
          <ScoreCard
            label="Load Forecast"
            value={loadForecast}
            unit="MW"
            trend={[]}
            delta={0}
            delta_direction="neutral"
            typography_variant="mono-data"
          />
          <ScoreCard
            label="Actual Load"
            value={actualLoad}
            unit="MW"
            trend={[]}
            delta={0}
            delta_direction="neutral"
            typography_variant="mono-data"
          />
        </div>
      }
      timelineSlot={<TimeSlider />}
      alertsSlot={placeholder("ALERTS")}
    />

    {/* ── debug overlay (remove in Phase 5) ──────────────── */}
    <div
      style={{
        position: "fixed",
        bottom: 8,
        left: 8,
        background: "rgba(0,0,0,0.75)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 6,
        padding: "6px 10px",
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: "0.65rem",
        color: "#888",
        zIndex: 9999,
        lineHeight: 1.6,
        pointerEvents: "none",
      }}
    >
      <div>Frames in buffer: {frames.length}</div>
      <div>Current index: {currentIndex === -1 ? "—" : currentIndex}</div>
    </div>
    </>
  );
}

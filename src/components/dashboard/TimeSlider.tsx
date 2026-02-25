/**
 * GridAlpha V2 — TimeSlider
 *
 * Time-travel scrubber across the ring-buffer frames.
 * Shows oldest → current → newest timestamps, with a pulsing
 * LIVE indicator when the scrubber is pinned to the latest frame.
 */

import { useGridStore } from "../../stores/grid.store";
import type { LiveDataFrame } from "../../types/index";

// ── helpers ─────────────────────────────────────────────────────

/** Format an ISO timestamp to "HH:mm UTC". */
function fmtTime(frame: LiveDataFrame | undefined): string {
  if (!frame) return "--:--";
  try {
    const d = new Date(frame.timestamp_utc);
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm} UTC`;
  } catch {
    return "--:--";
  }
}

// ── component ───────────────────────────────────────────────────

export default function TimeSlider() {
  const frames = useGridStore((s) => s.frames);
  const currentIndex = useGridStore((s) => s.currentIndex);
  const isLive = useGridStore((s) => s.isLive);
  const setIndex = useGridStore((s) => s.setIndex);

  const maxIdx = Math.max(frames.length - 1, 0);
  const currentFrame = frames[currentIndex];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: "100%",
        padding: "0 12px",
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: "0.6rem",
        color: "#888",
        userSelect: "none",
      }}
    >
      {/* oldest timestamp */}
      <span style={{ whiteSpace: "nowrap", minWidth: 68 }}>
        {fmtTime(frames[0])}
      </span>

      {/* slider */}
      <input
        type="range"
        min={0}
        max={maxIdx}
        value={isLive ? maxIdx : currentIndex}
        onChange={(e) => setIndex(Number(e.target.value))}
        style={{
          flex: 1,
          accentColor: "#00FFFF",
          height: 4,
          cursor: "pointer",
        }}
      />

      {/* current selected time */}
      <span
        style={{
          whiteSpace: "nowrap",
          color: "#ccc",
          fontWeight: 600,
          minWidth: 68,
          textAlign: "center",
        }}
      >
        {fmtTime(currentFrame)}
      </span>

      {/* newest timestamp */}
      <span style={{ whiteSpace: "nowrap", minWidth: 68, textAlign: "right" }}>
        {fmtTime(frames[frames.length - 1])}
      </span>

      {/* LIVE indicator */}
      {isLive && (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginLeft: 6,
            color: "#00E676",
            fontWeight: 700,
            fontSize: "0.6rem",
            letterSpacing: "0.08em",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00E676",
              display: "inline-block",
              animation: "pulse-live 1.5s ease-in-out infinite",
            }}
          />
          LIVE
        </span>
      )}

      {/* keyframe for pulsing dot */}
      <style>{`
        @keyframes pulse-live {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px #00E676; }
          50%       { opacity: 0.4; box-shadow: 0 0 8px #00E676; }
        }
      `}</style>
    </div>
  );
}

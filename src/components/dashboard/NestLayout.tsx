/**
 * GridAlpha V2 — NestLayout
 *
 * Full-viewport Bento grid shell with six named areas.
 * Every slot is optional; an empty <div /> renders as fallback.
 */

import type { ReactNode } from "react";

export interface NestLayoutProps {
  headerSlot?: ReactNode;
  mapSlot?: ReactNode;
  scorecardLeftSlot?: ReactNode;
  scorecardRightSlot?: ReactNode;
  timelineSlot?: ReactNode;
  alertsSlot?: ReactNode;
}

const BORDER = "1px solid rgba(255,255,255,0.06)";
const GLASS_BG = "rgba(10, 10, 11, 0.85)";
const GLASS_FILTER = "blur(12px)";

export default function NestLayout({
  headerSlot,
  mapSlot,
  scorecardLeftSlot,
  scorecardRightSlot,
  timelineSlot,
  alertsSlot,
}: NestLayoutProps) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "transparent",
        display: "grid",
        gridTemplateColumns: "60% 20% 20%",
        gridTemplateRows: "48px 1fr 120px 48px",
        gridTemplateAreas: `
          "header       header           header"
          "map          scorecard-left   scorecard-right"
          "map          scorecard-left   scorecard-right"
          "timeline     alerts           alerts"
        `,
        overflow: "hidden",
      }}
    >
      {/* ── header ──────────────────────────── */}
      <div
        className="header"
        style={{ gridArea: "header", border: BORDER, minWidth: 0, minHeight: 0, background: GLASS_BG, backdropFilter: GLASS_FILTER }}
      >
        {headerSlot ?? <div />}
      </div>

      {/* ── map ─────────────────────────────── */}
      <div
        className="map"
        style={{ gridArea: "map", minWidth: 0, minHeight: 0, pointerEvents: "none" }}
      >
        {mapSlot ?? <div />}
      </div>

      {/* ── scorecard left ──────────────────── */}
      <div
        className="scorecard-left"
        style={{
          gridArea: "scorecard-left",
          border: BORDER,
          minWidth: 0,
          minHeight: 0,
          overflow: "auto",
          background: GLASS_BG,
          backdropFilter: GLASS_FILTER,
        }}
      >
        {scorecardLeftSlot ?? <div />}
      </div>

      {/* ── scorecard right ─────────────────── */}
      <div
        className="scorecard-right"
        style={{
          gridArea: "scorecard-right",
          border: BORDER,
          minWidth: 0,
          minHeight: 0,
          overflow: "auto",
          background: GLASS_BG,
          backdropFilter: GLASS_FILTER,
        }}
      >
        {scorecardRightSlot ?? <div />}
      </div>

      {/* ── timeline ────────────────────────── */}
      <div
        className="timeline"
        style={{ gridArea: "timeline", border: BORDER, minWidth: 0, minHeight: 0, background: GLASS_BG, backdropFilter: GLASS_FILTER }}
      >
        {timelineSlot ?? <div />}
      </div>

      {/* ── alerts ──────────────────────────── */}
      <div
        className="alerts"
        style={{ gridArea: "alerts", border: BORDER, minWidth: 0, minHeight: 0, background: GLASS_BG, backdropFilter: GLASS_FILTER }}
      >
        {alertsSlot ?? <div />}
      </div>
    </div>
  );
}

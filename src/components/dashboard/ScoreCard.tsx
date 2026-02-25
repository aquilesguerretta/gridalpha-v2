/**
 * GridAlpha V2 — ScoreCard
 *
 * KPI card for the scorecard strip. Displays label, value + unit,
 * and a delta badge. Sparkline placeholder added in Phase 3.
 */

import type { ScoreCardProps } from "../../types/index";

// ── typography variant → font-size mapping ──────────────────────

const FONT_SIZE: Record<ScoreCardProps["typography_variant"], string> = {
  headline: "2rem",
  subhead: "1.25rem",
  "mono-data": "1rem",
};

const FONT_FAMILY: Record<ScoreCardProps["typography_variant"], string> = {
  headline: "inherit",
  subhead: "inherit",
  "mono-data": "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
};

// ── delta direction → colour mapping ────────────────────────────

const DELTA_COLOR: Record<ScoreCardProps["delta_direction"], string> = {
  up: "#00E676",
  down: "#FF5252",
  neutral: "#888888",
};

const DELTA_PREFIX: Record<ScoreCardProps["delta_direction"], string> = {
  up: "+",
  down: "",
  neutral: "",
};

// ── component ───────────────────────────────────────────────────

export default function ScoreCard({
  label,
  value,
  unit,
  delta,
  delta_direction,
  typography_variant,
}: ScoreCardProps) {
  const fontSize = FONT_SIZE[typography_variant];
  const fontFamily = FONT_FAMILY[typography_variant];
  const deltaColor = DELTA_COLOR[delta_direction];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {/* label */}
      <span
        style={{
          fontSize: "0.65rem",
          fontVariant: "all-small-caps",
          letterSpacing: "0.1em",
          color: "#888",
        }}
      >
        {label}
      </span>

      {/* value + unit */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontSize,
            fontFamily,
            fontWeight: 600,
            color: "#FFFFFF",
            lineHeight: 1.1,
          }}
        >
          {value.toLocaleString()}
        </span>
        <span style={{ fontSize: "0.75rem", color: "#666" }}>{unit}</span>
      </div>

      {/* delta badge */}
      <span
        style={{
          fontSize: "0.7rem",
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          color: deltaColor,
          background: `${deltaColor}18`,
          padding: "2px 6px",
          borderRadius: 4,
          alignSelf: "flex-start",
        }}
      >
        {DELTA_PREFIX[delta_direction]}
        {delta.toFixed(1)}%
      </span>
    </div>
  );
}

/**
 * GridAlpha V2 — TheNest
 *
 * 12×8 glassmorphism bento grid overlay for the DeckGL spatial canvas.
 * LMP wired from Zustand SSE store; all other data is mock.
 */

import type { CSSProperties } from "react";
import { useGridData } from "../../hooks/useGridData";

// ── shared styles ───────────────────────────────────────────────

const MONO = "'SF Mono', 'Fira Code', 'Cascadia Code', monospace";
const CYAN = "#00A3FF";

const CARD: CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(0,163,255,0.15)",
  backdropFilter: "blur(8px)",
  borderRadius: 8,
  pointerEvents: "auto",
  padding: 16,
  overflow: "hidden",
};

const LABEL: CSSProperties = {
  color: CYAN,
  fontSize: "0.6rem",
  fontFamily: MONO,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: 8,
};

// ── mock data ───────────────────────────────────────────────────

const PEREGRINE_EVENTS = [
  { time: "06:32:07", msg: "Congestion spike — West Hub", color: "#FF3B3B" },
  { time: "06:31:42", msg: "CAISO price alert triggered", color: "#00A3FF" },
  { time: "06:30:18", msg: "Wind ramp detected — ERCOT", color: "#00E676" },
  { time: "06:29:55", msg: "Battery dispatch signal active", color: "#FFB800" },
  { time: "06:28:33", msg: "Transmission constraint — Path 15", color: "#FF3B3B" },
];

const SPARK_BARS = [0.6, 0.8, 0.5, 0.9, 0.7];

const GEN_MIX = [
  { fuel: "Gas", mw: 42000, color: "#F97316" },
  { fuel: "Nuclear", mw: 36000, color: "#F9A825" },
  { fuel: "Wind", mw: 18100, color: "#A855F7" },
  { fuel: "Solar", mw: 9600, color: "#00FFE0" },
  { fuel: "Coal", mw: 8400, color: "#FFB800" },
  { fuel: "Hydro", mw: 3600, color: "#64748B" },
  { fuel: "Other", mw: 2400, color: "#3B82F6" },
];
const GEN_TOTAL = GEN_MIX.reduce((s, g) => s + g.mw, 0);

const SPARKLINE = [42.1, 44.5, 43.2, 45.8, 47.1, 46.3, 48.9, 47.5, 48.32];
const SPARK_MIN = Math.min(...SPARKLINE);
const SPARK_MAX = Math.max(...SPARKLINE);

const CAP = [85, 82, 80, 78, 82, 86, 90, 88, 85, 83, 80, 78];
const LOAD = [62, 65, 68, 72, 75, 73, 70, 68, 65, 63, 60, 58];

// ── helpers ─────────────────────────────────────────────────────

const sparkPoints = SPARKLINE.map((v, i) => {
  const x = (i / (SPARKLINE.length - 1)) * 200;
  const y = 38 - ((v - SPARK_MIN) / (SPARK_MAX - SPARK_MIN)) * 36;
  return `${x},${y}`;
}).join(" ");

const areaPoints = (data: number[]) => [
  ...data.map((v, i) => `${(i / (data.length - 1)) * 240},${100 - v}`),
  "240,100",
  "0,100",
].join(" ");

const BATTERY_PCT = 71;
const R = 34;
const CIRC = 2 * Math.PI * R;

// ── quality colours ─────────────────────────────────────────────

const Q_COLOR: Record<string, string> = {
  LIVE: "#00E676",
  STALE: "#FFB800",
  RECONNECTING: "#FF3B3B",
};

// ── component ───────────────────────────────────────────────────

export default function TheNest() {
  const { currentFrame } = useGridData();

  const lmpTotal = currentFrame?.lmp_total ?? 48.32;
  const quality = currentFrame?.data_quality ?? "STALE";
  const qColor = Q_COLOR[quality] ?? "#FF3B3B";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gridTemplateRows: "48px repeat(7, 1fr)",
        gap: 8,
        padding: 8,
        boxSizing: "border-box",
      }}
    >
      {/* ── Header bar ─────────────────────────────────────── */}
      <div
        style={{
          gridColumn: "1 / -1",
          gridRow: "1 / 2",
          ...CARD,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 16,
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: "0.9rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
          }}
        >
          GRIDALPHA
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: qColor,
              display: "inline-block",
              boxShadow: `0 0 6px ${qColor}`,
            }}
          />
          <span
            style={{
              color: qColor,
              fontSize: "0.6rem",
              fontFamily: MONO,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {quality}
          </span>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "baseline",
            gap: 6,
          }}
        >
          <span style={{ color: "#00FFE0", fontSize: "0.7rem", fontFamily: MONO }}>
            LMP
          </span>
          <span
            style={{
              color: "#fff",
              fontSize: "1rem",
              fontWeight: 700,
              fontFamily: MONO,
            }}
          >
            {lmpTotal.toFixed(2)}
          </span>
          <span style={{ color: "#666", fontSize: "0.6rem", fontFamily: MONO }}>
            $/MWh
          </span>
        </div>
      </div>

      {/* ── Market Pulse (map window) ──────────────────────── */}
      <div
        style={{
          gridColumn: "1 / 9",
          gridRow: "2 / 5",
          ...CARD,
          background: "rgba(255,255,255,0.01)",
          border: "1px solid rgba(0,163,255,0.08)",
          display: "flex",
          flexDirection: "column",
          pointerEvents: "none",
        }}
      >
        <div style={LABEL}>MARKET PULSE</div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.12)",
            fontSize: "0.7rem",
            fontFamily: MONO,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          SPATIAL LAYER ACTIVE
        </div>
      </div>

      {/* ── Peregrine Feed ─────────────────────────────────── */}
      <div
        style={{
          gridColumn: "9 / 13",
          gridRow: "2 / 5",
          ...CARD,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={LABEL}>PEREGRINE FEED</div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            overflow: "auto",
          }}
        >
          {PEREGRINE_EVENTS.map((e, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 3,
                  minHeight: 16,
                  borderRadius: 2,
                  background: e.color,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <div>
                <span
                  style={{
                    color: "#666",
                    fontSize: "0.55rem",
                    fontFamily: MONO,
                  }}
                >
                  {e.time}
                </span>
                <span
                  style={{
                    color: "#aaa",
                    fontSize: "0.6rem",
                    fontFamily: MONO,
                    marginLeft: 8,
                  }}
                >
                  {e.msg}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LMP Scorecard ──────────────────────────────────── */}
      <div
        style={{
          gridColumn: "1 / 5",
          gridRow: "5 / 7",
          ...CARD,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={LABEL}>LMP / MWh</div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: "2.8rem",
              fontWeight: 300,
              fontFamily: MONO,
              letterSpacing: "-0.02em",
            }}
          >
            {lmpTotal.toFixed(2)}
          </span>
          <span
            style={{
              color: "#00E676",
              fontSize: "0.7rem",
              fontFamily: MONO,
              marginTop: 4,
            }}
          >
            +2.4%
          </span>
          <svg
            width="100%"
            height={40}
            viewBox="0 0 200 40"
            preserveAspectRatio="none"
            style={{ marginTop: 12 }}
          >
            <polyline
              fill="none"
              stroke="#00A3FF"
              strokeWidth={2}
              points={sparkPoints}
            />
          </svg>
        </div>
      </div>

      {/* ── Spark Spread ───────────────────────────────────── */}
      <div
        style={{
          gridColumn: "5 / 9",
          gridRow: "5 / 7",
          ...CARD,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={LABEL}>SPARK SPREAD</div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>
            <span
              style={{
                color: "#fff",
                fontSize: "2rem",
                fontWeight: 300,
                fontFamily: MONO,
              }}
            >
              12.7
            </span>
            <span
              style={{
                color: "#666",
                fontSize: "0.8rem",
                fontFamily: MONO,
                marginLeft: 6,
              }}
            >
              $/MWh
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "flex-end",
              marginTop: 16,
              height: 40,
            }}
          >
            {SPARK_BARS.map((v, i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  height: `${v * 100}%`,
                  background: "linear-gradient(to top, #00A3FF, #00FFE0)",
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Battery ARB ────────────────────────────────────── */}
      <div
        style={{
          gridColumn: "9 / 13",
          gridRow: "5 / 7",
          ...CARD,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={LABEL}>BATTERY ARB</div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={80} height={80} viewBox="0 0 80 80">
            <circle
              cx={40}
              cy={40}
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={4}
            />
            <circle
              cx={40}
              cy={40}
              r={R}
              fill="none"
              stroke="#00FFE0"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${(BATTERY_PCT / 100) * CIRC} ${CIRC}`}
              transform="rotate(-90 40 40)"
            />
            <text
              x={40}
              y={44}
              textAnchor="middle"
              fill="#fff"
              fontSize={22}
              fontFamily={MONO}
              fontWeight={300}
            >
              {BATTERY_PCT}
            </text>
          </svg>
          <div
            style={{
              color: "#666",
              fontSize: "0.5rem",
              fontFamily: MONO,
              textAlign: "center",
              marginTop: 8,
              lineHeight: 1.6,
            }}
          >
            CHARGE 02:00–06:00
            <br />
            <span style={{ color: "#FF3B3B" }}>DISCHARGE 16:00–20:00</span>
          </div>
        </div>
      </div>

      {/* ── Generation Mix ─────────────────────────────────── */}
      <div
        style={{
          gridColumn: "1 / 7",
          gridRow: "7 / 9",
          ...CARD,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={LABEL}>GENERATION MIX</div>
        <div
          style={{
            display: "flex",
            height: 24,
            borderRadius: 4,
            overflow: "hidden",
            marginTop: 8,
          }}
        >
          {GEN_MIX.map((g) => (
            <div
              key={g.fuel}
              style={{
                flex: g.mw / GEN_TOTAL,
                background: g.color,
                minWidth: 2,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 12px",
            marginTop: 8,
          }}
        >
          {GEN_MIX.map((g) => (
            <div
              key={g.fuel}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: g.color,
                  display: "inline-block",
                }}
              />
              <span
                style={{ color: "#888", fontSize: "0.5rem", fontFamily: MONO }}
              >
                {g.fuel}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            color: "#555",
            fontSize: "0.45rem",
            fontFamily: MONO,
            marginTop: 6,
            lineHeight: 1.8,
          }}
        >
          {GEN_MIX.map(
            (g) => `${g.fuel} ${(g.mw / 1000).toFixed(0)}k MW`
          ).join(" \u00b7 ")}
        </div>
      </div>

      {/* ── Resource Gap ───────────────────────────────────── */}
      <div
        style={{
          gridColumn: "7 / 13",
          gridRow: "7 / 9",
          ...CARD,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={LABEL}>RESOURCE GAP</div>
        <div style={{ flex: 1, position: "relative" }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 240 100"
            preserveAspectRatio="none"
          >
            <polygon
              fill="rgba(0,163,255,0.15)"
              stroke="#00A3FF"
              strokeWidth={1.5}
              points={areaPoints(CAP)}
            />
            <polygon
              fill="rgba(255,255,255,0.05)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={1.5}
              points={areaPoints(LOAD)}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 8,
              color: CYAN,
              fontSize: "0.6rem",
              fontFamily: MONO,
            }}
          >
            Capacity
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 4,
              right: 8,
              color: "#888",
              fontSize: "0.6rem",
              fontFamily: MONO,
            }}
          >
            Load
          </div>
        </div>
      </div>
    </div>
  );
}

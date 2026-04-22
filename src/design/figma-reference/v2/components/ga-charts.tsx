import React from "react";
import { GA, mono, serif } from "./ga-primitives";

// Helper to build a smooth path
function smoothPath(points: [number, number][]) {
  if (points.length === 0) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    const [px, py] = points[i - 1];
    const cx = (px + x) / 2;
    d += ` C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }
  return d;
}

export function SparkLine({ width = 140, height = 40 }: { width?: number; height?: number }) {
  const data = [52, 50, 53, 48, 51, 49, 52, 50, 54, 51, 53, 52, 54];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts: [number, number][] = data.map((v, i) => [
    (i / (data.length - 1)) * (width - 12) + 6,
    height - 6 - ((v - min) / (max - min)) * (height - 12),
  ]);
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={smoothPath(pts)} fill="none" stroke={GA.blue} strokeWidth={2} />
      <circle cx={pts[data.indexOf(min)][0]} cy={pts[data.indexOf(min)][1]} r={2} fill={GA.blue} />
      <circle cx={pts[data.indexOf(max)][0]} cy={pts[data.indexOf(max)][1]} r={2} fill={GA.blue} />
      <text x={4} y={height - 2} style={{ ...mono }} fontSize={9} fill={GA.textDim}>
        L 48
      </text>
      <text x={width - 28} y={9} style={{ ...mono }} fontSize={9} fill={GA.textDim}>
        H 54
      </text>
    </svg>
  );
}

export function HeroSparkLine({ width = 400, height = 80 }: { width?: number; height?: number }) {
  const data = [28, 30, 29, 32, 31, 33, 30, 34, 32, 35, 33, 34, 33.5];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts: [number, number][] = data.map((v, i) => [
    (i / (data.length - 1)) * (width - 8) + 4,
    height - 4 - ((v - min) / (max - min)) * (height - 8),
  ]);
  return (
    <svg width={width} height={height}>
      <path d={smoothPath(pts)} fill="none" stroke={GA.blue} strokeWidth={2} />
    </svg>
  );
}

export function SmoothLineChart({ width = 680, height = 280 }: { width?: number; height?: number }) {
  const data = [50, 51, 49, 48.2, 50, 51.5, 52, 51, 53, 52, 54.8, 53.5, 52.2, 52.18];
  const min = 47;
  const max = 55;
  const padL = 40;
  const padR = 120;
  const padT = 20;
  const padB = 30;
  const pts: [number, number][] = data.map((v, i) => [
    padL + (i / (data.length - 1)) * (width - padL - padR),
    padT + (1 - (v - min) / (max - min)) * (height - padT - padB),
  ]);
  const midX = padL + (width - padL - padR) / 2;
  const minIdx = data.indexOf(Math.min(...data));
  const maxIdx = data.indexOf(Math.max(...data));

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {/* Regime tint left third (BURNING) */}
      <rect x={padL} y={padT} width={(width - padL - padR) / 3} height={height - padT - padB} fill={GA.gold} opacity={0.04} />
      {/* Grid lines */}
      {[0, 1, 2, 3].map((i) => {
        const y = padT + (i / 3) * (height - padT - padB);
        return <line key={i} x1={padL} y1={y} x2={width - padR} y2={y} stroke={GA.grid} strokeWidth={1} />;
      })}
      {/* Session boundary dashed */}
      <line x1={midX} y1={padT} x2={midX} y2={height - padB} stroke={GA.gold} strokeOpacity={0.3} strokeDasharray="3 3" />
      <text x={midX + 6} y={padT + 12} style={{ ...mono }} fontSize={10} fill={GA.gold} opacity={0.9}>
        MARKET OPEN 09:30 ET
      </text>
      {/* Line */}
      <path d={smoothPath(pts)} fill="none" stroke={GA.blue} strokeWidth={2} />
      {/* Min/max markers */}
      <circle cx={pts[minIdx][0]} cy={pts[minIdx][1]} r={3} fill={GA.blue} />
      <text x={pts[minIdx][0] + 6} y={pts[minIdx][1] + 12} style={{ ...mono }} fontSize={10} fill={GA.textDim}>
        LOW 48.20
      </text>
      <circle cx={pts[maxIdx][0]} cy={pts[maxIdx][1]} r={3} fill={GA.blue} />
      <text x={pts[maxIdx][0] + 6} y={pts[maxIdx][1] - 6} style={{ ...mono }} fontSize={10} fill={GA.textDim}>
        HIGH 54.80
      </text>
      {/* Crosshair */}
      <line x1={pts[9][0]} y1={padT} x2={pts[9][0]} y2={height - padB} stroke="rgba(255,255,255,0.15)" strokeDasharray="2 3" />
      <line x1={padL} y1={pts[9][1]} x2={width - padR} y2={pts[9][1]} stroke="rgba(255,255,255,0.15)" strokeDasharray="2 3" />
      {/* Readout */}
      <text x={width - padR + 8} y={padT + 14} style={{ ...mono, fontVariantNumeric: "tabular-nums" }} fontSize={11} fill={GA.white}>
        14:22 · $52.18
      </text>
      <text x={width - padR + 8} y={padT + 30} style={{ ...mono }} fontSize={11} fill={GA.green}>
        +2.14
      </text>
      {/* X axis */}
      {["-24H", "-18", "-12", "-6", "NOW"].map((l, i) => (
        <text
          key={l}
          x={padL + (i / 4) * (width - padL - padR)}
          y={height - 10}
          style={{ ...mono }}
          fontSize={10}
          fill={GA.textDim}
          textAnchor="middle"
        >
          {l}
        </text>
      ))}
      {/* Y axis */}
      {[50, 52, 54].map((v) => {
        const y = padT + (1 - (v - min) / (max - min)) * (height - padT - padB);
        return (
          <text key={v} x={padL - 8} y={y + 4} style={{ ...mono }} fontSize={10} fill={GA.textDim} textAnchor="end">
            {v}
          </text>
        );
      })}
    </svg>
  );
}

export function FilledAreaChart({ width = 680, height = 280 }: { width?: number; height?: number }) {
  const data = [48, 49, 50, 51, 52, 53, 54, 55, 54, 56, 58, 57, 59, 60];
  const min = 45;
  const max = 62;
  const padL = 40;
  const padR = 60;
  const padT = 20;
  const padB = 30;
  const pts: [number, number][] = data.map((v, i) => [
    padL + (i / (data.length - 1)) * (width - padL - padR),
    padT + (1 - (v - min) / (max - min)) * (height - padT - padB),
  ]);
  const areaPath = smoothPath(pts) + ` L ${pts[pts.length - 1][0]} ${height - padB} L ${pts[0][0]} ${height - padB} Z`;
  const forecastStart = padL + (2 / 3) * (width - padL - padR);
  const gid = "ga-area-grad";
  const hid = "ga-hatch";
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={GA.blue} stopOpacity={0.2} />
          <stop offset="100%" stopColor={GA.blue} stopOpacity={0} />
        </linearGradient>
        <pattern id={hid} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={6} stroke={GA.textDim} strokeWidth={0.5} />
        </pattern>
      </defs>
      {/* Grid */}
      {[0, 1, 2, 3].map((i) => {
        const y = padT + (i / 3) * (height - padT - padB);
        return <line key={i} x1={padL} y1={y} x2={width - padR} y2={y} stroke={GA.grid} />;
      })}
      {/* Forecast hatch */}
      <rect x={forecastStart} y={padT} width={width - padR - forecastStart} height={height - padT - padB} fill={`url(#${hid})`} opacity={0.5} />
      <text x={forecastStart + 8} y={padT + 14} style={{ ...mono }} fontSize={10} fill={GA.textDim}>
        PROJECTED
      </text>
      {/* Area */}
      <path d={areaPath} fill={`url(#${gid})`} />
      <path d={smoothPath(pts)} fill="none" stroke={GA.blue} strokeWidth={2} />
      {/* X axis */}
      {["-12", "-6", "NOW", "+6"].map((l, i) => (
        <text
          key={l}
          x={padL + (i / 3) * (width - padL - padR)}
          y={height - 10}
          style={{ ...mono }}
          fontSize={10}
          fill={GA.textDim}
          textAnchor="middle"
        >
          {l}
        </text>
      ))}
    </svg>
  );
}

export function StackedBarChart({ width = 320, height = 200 }: { width?: number; height?: number }) {
  const segments = [
    { label: "GAS", pct: 38, color: "#F97316" },
    { label: "NUCLEAR", pct: 22, color: "#FBBF24" },
    { label: "WIND", pct: 18, color: "#38BDF8" },
    { label: "SOLAR", pct: 12, color: "#FDE047" },
    { label: "COAL", pct: 10, color: "#6B7280" },
  ];
  const barY = 70;
  const barH = 28;
  const padX = 16;
  let xCursor = padX;
  const totalW = width - padX * 2;
  return (
    <svg width={width} height={height}>
      {segments.map((s) => {
        const w = (s.pct / 100) * totalW;
        const el = (
          <g key={s.label}>
            <rect x={xCursor} y={barY} width={w - 1} height={barH} fill={s.color} />
            <text
              x={xCursor + w / 2}
              y={barY - 8}
              style={{ ...mono }}
              fontSize={10}
              fill={GA.white}
              textAnchor="middle"
            >
              {s.pct}%
            </text>
          </g>
        );
        xCursor += w;
        return el;
      })}
      {/* Legend */}
      {segments.map((s, i) => (
        <g key={s.label} transform={`translate(${padX + (i % 3) * 100}, ${120 + Math.floor(i / 3) * 22})`}>
          <rect width={10} height={10} fill={s.color} />
          <text x={16} y={9} style={{ ...mono }} fontSize={10} fill={GA.textDim}>
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function GaugeChart({ width = 320, height = 200 }: { width?: number; height?: number }) {
  const cx = width / 2;
  const cy = height / 2 + 30;
  const r = 70;
  const value = 0.74;
  // 180° arc from left to right
  const startAngle = Math.PI;
  const endAngle = 0;
  const arc = (from: number, to: number) => {
    const x1 = cx + r * Math.cos(from);
    const y1 = cy + r * Math.sin(from);
    const x2 = cx + r * Math.cos(to);
    const y2 = cy + r * Math.sin(to);
    const largeArc = Math.abs(to - from) > Math.PI ? 1 : 0;
    const sweep = to > from ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
  };
  const activeEnd = startAngle - value * Math.PI;
  return (
    <svg width={width} height={height}>
      <path d={arc(startAngle, endAngle)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      <path d={arc(startAngle, activeEnd)} fill="none" stroke={GA.blue} strokeWidth={2} />
      <text x={cx} y={cy - 4} style={{ ...serif }} fontSize={48} fill={GA.white} textAnchor="middle">
        74%
      </text>
      <text x={cx} y={cy + 20} style={{ ...mono }} fontSize={11} fill={GA.textDim} textAnchor="middle" letterSpacing="0.12em">
        SOC
      </text>
    </svg>
  );
}

export function WaterfallChart({ width = 320, height = 200 }: { width?: number; height?: number }) {
  const items = [
    { label: "+4.2", val: 4.2, color: GA.green, type: "add" },
    { label: "+2.1", val: 2.1, color: GA.green, type: "add" },
    { label: "-1.5", val: -1.5, color: GA.red, type: "sub" },
    { label: "-1.0", val: -1.0, color: GA.red, type: "sub" },
    { label: "+1.6", val: 1.6, color: GA.green, type: "add" },
    { label: "5.4", val: 5.4, color: GA.blue, type: "net" },
  ];
  const padX = 20;
  const padY = 30;
  const barW = 28;
  const gap = (width - padX * 2 - barW * items.length) / (items.length - 1);
  const zero = height - 40;
  const scale = 14;
  let cum = 0;
  const tops: number[] = [];
  return (
    <svg width={width} height={height}>
      {items.map((it, i) => {
        const x = padX + i * (barW + gap);
        let y: number, h: number;
        if (it.type === "net") {
          y = zero - Math.abs(cum) * scale;
          h = Math.abs(cum) * scale;
          tops.push(y);
        } else {
          if (it.val >= 0) {
            y = zero - (cum + it.val) * scale;
            h = it.val * scale;
          } else {
            y = zero - cum * scale;
            h = -it.val * scale;
          }
          tops.push(y);
          cum += it.val;
        }
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} fill={it.color} opacity={0.9} />
            <text x={x + barW / 2} y={y - 4} style={{ ...mono }} fontSize={9} fill={GA.textDim} textAnchor="middle">
              {it.label}
            </text>
          </g>
        );
      })}
      {/* connecting dotted lines */}
      {tops.slice(0, -1).map((t, i) => {
        const x1 = padX + i * (barW + gap) + barW;
        const x2 = padX + (i + 1) * (barW + gap);
        return <line key={i} x1={x1} y1={t} x2={x2} y2={tops[i + 1]} stroke={GA.textFaint} strokeDasharray="2 2" />;
      })}
    </svg>
  );
}

export function HeatmapChart({ width = 320, height = 200 }: { width?: number; height?: number }) {
  const zones = ["WEST", "NORTH", "SOUTH", "EAST", "AEP", "DOM"];
  const hours = 8;
  const padL = 42;
  const padT = 10;
  const padB = 22;
  const cellW = (width - padL - 10) / hours;
  const cellH = (height - padT - padB) / zones.length;
  const colorFor = (v: number) => {
    // v in 0..1
    if (v < 0.5) {
      const t = v / 0.5;
      return `rgba(59,130,246,${0.2 + t * 0.5})`;
    } else {
      const t = (v - 0.5) / 0.5;
      return `rgba(245,158,11,${0.2 + t * 0.7})`;
    }
  };
  const seeded = (i: number, j: number) => {
    const s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };
  return (
    <svg width={width} height={height}>
      {zones.map((z, j) => (
        <g key={z}>
          <text x={padL - 8} y={padT + j * cellH + cellH / 2 + 3} style={{ ...mono }} fontSize={10} fill={GA.textDim} textAnchor="end">
            {z}
          </text>
          {Array.from({ length: hours }).map((_, i) => (
            <rect
              key={i}
              x={padL + i * cellW}
              y={padT + j * cellH}
              width={cellW - 2}
              height={cellH - 2}
              fill={colorFor(seeded(i, j))}
            />
          ))}
        </g>
      ))}
      {Array.from({ length: hours }).map((_, i) => (
        <text
          key={i}
          x={padL + i * cellW + cellW / 2}
          y={height - 6}
          style={{ ...mono }}
          fontSize={10}
          fill={GA.textDim}
          textAnchor="middle"
        >
          {i * 3}:00
        </text>
      ))}
    </svg>
  );
}

import { C, F, R, S } from '@/design/tokens';
import { ZONE_24H_PRICES } from '../../../lib/pjm/mock-data';

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

export function LMP24HChart() {
  const series = ZONE_24H_PRICES['WEST_HUB'] ?? ZONE_24H_PRICES['DEFAULT'];

  // Pad min/max for visual breathing room then snap to 5 grid steps
  const rawMin = Math.min(...series);
  const rawMax = Math.max(...series);
  const pad = (rawMax - rawMin) * 0.1;
  const yMin = Math.floor((rawMin - pad) / 5) * 5;
  const yMax = Math.ceil((rawMax + pad) / 5) * 5;
  const yRange = yMax - yMin || 1;

  // SVG layout
  const W = 1000;
  const H = 280;
  const padLeft = 44;
  const padRight = 12;
  const padTop = 12;
  const padBottom = 24;
  const innerW = W - padLeft - padRight;
  const innerH = H - padTop - padBottom;

  const stepX = innerW / (series.length - 1);
  const points = series.map((v, i) => ({
    x: padLeft + i * stepX,
    y: padTop + innerH - ((v - yMin) / yRange) * innerH,
  }));
  const d = smoothPath(points);

  // 5 horizontal grid lines (and matching y-tick labels)
  const gridCount = 5;
  const gridYs = Array.from({ length: gridCount }, (_, i) => {
    const t = i / (gridCount - 1);
    return {
      y: padTop + innerH * t,
      value: yMax - (yMax - yMin) * t,
    };
  });

  const xLabels: { x: number; label: string }[] = [
    { x: padLeft, label: '-24H' },
    { x: padLeft + innerW * 0.25, label: '-18' },
    { x: padLeft + innerW * 0.5, label: '-12' },
    { x: padLeft + innerW * 0.75, label: '-6' },
    { x: padLeft + innerW, label: 'NOW' },
  ];

  return (
    <div
      style={{
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: R.lg,
        padding: S.lg,
        minHeight: '360px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: S.md,
        }}
      >
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: C.textMuted,
          }}
        >
          PJM WEST · LMP · 24H
        </span>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '11px',
            color: C.textMuted,
            letterSpacing: '0.08em',
          }}
        >
          $/MWh
        </span>
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '280px', display: 'block' }}
      >
        {/* Grid lines */}
        {gridYs.map((g, i) => (
          <line
            key={i}
            x1={padLeft}
            x2={W - padRight}
            y1={g.y}
            y2={g.y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
            strokeDasharray="2 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Y-tick labels (left edge of chart) */}
        {gridYs.map((g, i) => (
          <text
            key={i}
            x={padLeft - 6}
            y={g.y + 3}
            fill={C.textMuted}
            textAnchor="end"
            style={{ fontFamily: F.mono, fontSize: '10px' }}
          >
            {g.value.toFixed(0)}
          </text>
        ))}

        {/* Series */}
        <path
          d={d}
          fill="none"
          stroke={C.electricBlue}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />

        {/* X-axis labels */}
        {xLabels.map((m, i) => (
          <text
            key={i}
            x={m.x}
            y={H - 6}
            fill={C.textMuted}
            textAnchor={i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'}
            style={{ fontFamily: F.mono, fontSize: '10px' }}
          >
            {m.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

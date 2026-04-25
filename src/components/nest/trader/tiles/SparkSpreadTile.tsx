import { C, F, R, S } from '@/design/tokens';

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

// Hardcoded 24h spark spread series — gentle upward trend
const SPARK_SERIES = [
  12.4, 12.2, 12.6, 13.1, 13.0, 13.4, 13.9, 14.2, 14.0, 14.6,
  14.9, 15.2, 15.6, 16.0, 16.3, 16.8, 17.1, 17.4, 17.6, 17.9,
  18.0, 18.2, 18.3, 18.4,
];

export function SparkSpreadTile() {
  const W = 1000;
  const H = 80;
  const padX = 4;
  const padY = 8;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const min = Math.min(...SPARK_SERIES);
  const max = Math.max(...SPARK_SERIES);
  const range = max - min || 1;
  const stepX = innerW / (SPARK_SERIES.length - 1);

  const points = SPARK_SERIES.map((v, i) => ({
    x: padX + i * stepX,
    y: padY + innerH - ((v - min) / range) * innerH,
  }));
  const d = smoothPath(points);

  return (
    <div
      style={{
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: R.lg,
        padding: S.lg,
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          PJM WEST · SPARK SPREAD
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: F.mono,
            fontSize: '11px',
            letterSpacing: '0.18em',
            color: C.falconGold,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: C.falconGold,
              display: 'inline-block',
            }}
          />
          BURNING
        </span>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '36px',
            fontWeight: 600,
            color: C.textPrimary,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          +18.42
        </span>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '11px',
            color: C.textMuted,
            letterSpacing: '0.06em',
          }}
        >
          $/MWh · HR 7,500 · GAS $3.82
        </span>
      </div>

      {/* Sparkline */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '40px', display: 'block' }}
      >
        <path
          d={d}
          fill="none"
          stroke={C.falconGold}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: S.sm,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: F.mono,
          fontSize: '11px',
          color: C.textMuted,
        }}
      >
        <span>GAS COST $28.65</span>
        <span>POWER $47.07</span>
      </div>
    </div>
  );
}

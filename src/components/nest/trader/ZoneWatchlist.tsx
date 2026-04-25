import { C, F, S } from '@/design/tokens';

type Regime = 'normal' | 'burning';

type WatchRow = {
  zone: string;
  lmp: number;
  delta: number;
  regime: Regime;
  sparkData: number[];
};

// 24-point hardcoded series per zone — shape mirrors regime/delta direction.
const MOCK_WATCHLIST: WatchRow[] = [
  {
    zone: 'WEST HUB',
    lmp: 35.90,
    delta: 1.20,
    regime: 'normal',
    sparkData: [
      33.6, 33.8, 34.0, 34.2, 34.1, 34.3, 34.5, 34.4, 34.6, 34.8,
      35.0, 35.1, 35.0, 35.2, 35.3, 35.4, 35.5, 35.6, 35.5, 35.7,
      35.8, 35.85, 35.88, 35.90,
    ],
  },
  {
    zone: 'AEP',
    lmp: 31.22,
    delta: 1.08,
    regime: 'normal',
    sparkData: [
      30.1, 30.2, 30.3, 30.2, 30.4, 30.5, 30.6, 30.5, 30.7, 30.8,
      30.9, 30.85, 30.95, 31.00, 31.05, 31.05, 31.10, 31.12, 31.15, 31.18,
      31.18, 31.20, 31.21, 31.22,
    ],
  },
  {
    zone: 'COMED',
    lmp: 48.14,
    delta: 5.08,
    regime: 'burning',
    sparkData: [
      42.8, 42.9, 43.0, 43.2, 43.5, 43.8, 44.0, 44.4, 44.7, 45.1,
      45.5, 45.9, 46.2, 46.5, 46.8, 47.0, 47.2, 47.4, 47.6, 47.8,
      47.95, 48.05, 48.10, 48.14,
    ],
  },
  {
    zone: 'PSEG',
    lmp: 36.90,
    delta: -0.48,
    regime: 'normal',
    sparkData: [
      37.6, 37.5, 37.55, 37.45, 37.4, 37.35, 37.4, 37.3, 37.25, 37.2,
      37.18, 37.15, 37.1, 37.08, 37.05, 37.02, 37.0, 36.98, 36.95, 36.95,
      36.93, 36.92, 36.91, 36.90,
    ],
  },
  {
    zone: 'RECO',
    lmp: 52.18,
    delta: 8.42,
    regime: 'burning',
    sparkData: [
      43.6, 43.9, 44.3, 44.8, 45.3, 45.9, 46.4, 47.0, 47.6, 48.2,
      48.8, 49.3, 49.8, 50.2, 50.6, 50.9, 51.2, 51.4, 51.6, 51.8,
      51.95, 52.05, 52.12, 52.18,
    ],
  },
];

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

function deltaColor(delta: number): string {
  return delta >= 0 ? C.falconGold : C.electricBlue;
}

function RowSpark({ data, color }: { data: number[]; color: string }) {
  const W = 60;
  const H = 20;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = W / (data.length - 1);
  const points = data.map((v, i) => ({
    x: i * stepX,
    y: H - ((v - min) / range) * H,
  }));
  const d = smoothPath(points);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: '60px', height: '20px', display: 'block' }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function ZoneWatchlist() {
  const burningCount = MOCK_WATCHLIST.filter((r) => r.regime === 'burning').length;

  return (
    <div style={{ borderTop: `1px solid ${C.borderDefault}`, paddingTop: S.md }}>
      {/* Eyebrow */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: S.sm,
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
          WATCHLIST · {MOCK_WATCHLIST.length} ZONES
        </span>
        {burningCount > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: F.mono,
              fontSize: '10px',
              color: C.falconGold,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: C.falconGold,
                display: 'inline-block',
              }}
            />
            {burningCount} BURNING
          </span>
        )}
      </div>

      {/* Column header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '30% 25% 20% 25%',
          alignItems: 'center',
          height: '32px',
          padding: '0 4px',
          fontFamily: F.mono,
          fontSize: '10px',
          color: C.textMuted,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        <span>ZONE</span>
        <span style={{ textAlign: 'right' }}>LMP</span>
        <span style={{ textAlign: 'right' }}>Δ</span>
        <span style={{ textAlign: 'right' }}>TREND</span>
      </div>

      {/* Rows */}
      <div>
        {MOCK_WATCHLIST.map((row, i) => {
          const isLast = i === MOCK_WATCHLIST.length - 1;
          const dColor = deltaColor(row.delta);
          return (
            <div
              key={row.zone}
              style={{
                display: 'grid',
                gridTemplateColumns: '30% 25% 20% 25%',
                alignItems: 'center',
                height: '32px',
                padding: '0 4px',
                borderBottom: isLast ? 'none' : `1px solid ${C.borderDefault}`,
              }}
            >
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: '12px',
                  color: C.textPrimary,
                }}
              >
                {row.zone}
              </span>
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: '13px',
                  color: C.textPrimary,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {row.lmp.toFixed(2)}
              </span>
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: '11px',
                  color: dColor,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {row.delta >= 0 ? '+' : ''}
                {row.delta.toFixed(2)}
              </span>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                <RowSpark data={row.sparkData} color={dColor} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

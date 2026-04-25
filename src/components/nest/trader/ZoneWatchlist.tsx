import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { C, F, S } from '@/design/tokens';

type Regime = 'normal' | 'burning';

type WatchRow = {
  zone: string;
  lmp: number;
  delta: number;
  regime: Regime;
  sparkData: number[];
};

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

function deltaColor(delta: number): string {
  return delta >= 0 ? C.falconGold : C.electricBlue;
}

function RowSpark({ data, color }: { data: number[]; color: string }) {
  const points = data.map((value, i) => ({ i, value }));
  return (
    <div style={{ width: 60, height: 20 }}>
      <ResponsiveContainer width={60} height={20}>
        <LineChart
          data={points}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
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
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: C.electricBlue,
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
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
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
          fontWeight: 400,
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
                  fontWeight: 500,
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
                  fontWeight: 600,
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
                  fontWeight: 600,
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

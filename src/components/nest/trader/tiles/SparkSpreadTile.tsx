import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { C, F, R, S } from '@/design/tokens';
import { useHoverState } from '../../../terminal/useHoverState';
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';

const SPARK_SERIES = [
  12.4, 12.2, 12.6, 13.1, 13.0, 13.4, 13.9, 14.2, 14.0, 14.6,
  14.9, 15.2, 15.6, 16.0, 16.3, 16.8, 17.1, 17.4, 17.6, 17.9,
  18.0, 18.2, 18.3, 18.4,
].map((value, i) => ({ i, value }));

export function SparkSpreadTile() {
  const hover = useHoverState();
  const cardStyle: React.CSSProperties = {
    background: C.bgElevated,
    border: `1px solid ${C.borderDefault}`,
    borderTop: `1px solid ${
      hover.hovered ? 'rgba(59,130,246,0.40)' : 'rgba(59,130,246,0.20)'
    }`,
    borderRadius: R.lg,
    padding: S.lg,
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'border-top-color 200ms cubic-bezier(0.4,0,0.2,1)',
  };

  return (
    <div style={cardStyle} {...hover.bind}>
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
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: C.electricBlue,
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
            fontWeight: 600,
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
            fontWeight: 400,
          }}
        >
          $/MWh · HR 7,500 · GAS $3.82
        </span>
      </div>

      {/* Sparkline (Recharts) */}
      <div style={{ width: '100%', height: 40 }}>
        {/* hideToolbar — the 40px sparkline doesn't have room for the
            toolbar chrome. Existing annotation dots still render
            read-only; users add notes from the full LMP24H chart. */}
        <AnnotatableChart chartId="trader:spark-spread:WEST_HUB" hideToolbar>
        <ResponsiveContainer width="100%" height={40}>
          <LineChart
            data={SPARK_SERIES}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <Line
              type="monotone"
              dataKey="value"
              stroke={C.falconGold}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        </AnnotatableChart>
      </div>

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
          fontWeight: 400,
        }}
      >
        <span>GAS COST $28.65</span>
        <span>POWER $47.07</span>
      </div>
    </div>
  );
}

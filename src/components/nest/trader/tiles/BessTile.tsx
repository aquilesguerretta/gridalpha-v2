import { C, F, R, S } from '@/design/tokens';
import { useHoverState } from '../../../terminal/useHoverState';

const SOC_PCT = 74;

export function BessTile() {
  const size = 100;
  const stroke = 2;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (SOC_PCT / 100) * circumference;
  const dashArray = `${filled} ${circumference - filled}`;

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
      <div>
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
          BESS · ARBITRAGE
        </span>
      </div>

      {/* Gauge */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: S.sm,
        }}
      >
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={stroke}
            />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={C.electricBlue}
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2px' }}>
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: '28px',
                  color: C.textPrimary,
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 600,
                }}
              >
                {SOC_PCT}
              </span>
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: '14px',
                  color: C.textMuted,
                  lineHeight: 1,
                  fontWeight: 500,
                }}
              >
                %
              </span>
            </div>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: '9px',
                letterSpacing: '0.18em',
                color: C.textMuted,
                textTransform: 'uppercase',
                fontWeight: 400,
              }}
            >
              SOC
            </span>
          </div>
        </div>

        {/* Charge / discharge windows */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: S.md,
            width: '100%',
            fontFamily: F.mono,
            fontSize: '10px',
            letterSpacing: '0.06em',
            fontWeight: 500,
          }}
        >
          <span style={{ color: C.electricBlue }}>CHARGE 02:00–06:00</span>
          <span style={{ color: C.falconGold }}>DISCHARGE 17:00–21:00</span>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: S.sm,
          display: 'flex',
          justifyContent: 'flex-end',
          fontFamily: F.mono,
          fontSize: '11px',
          color: C.falconGold,
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 600,
        }}
      >
        EST. DAILY $2,840
      </div>
    </div>
  );
}

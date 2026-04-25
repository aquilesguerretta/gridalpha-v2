import { C, F, R, S } from '@/design/tokens';

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
      <div>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: C.textMuted,
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
            {/* Track */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={stroke}
            />
            {/* Filled arc — start at -90° (top) */}
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
          {/* Center text overlay */}
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
        }}
      >
        EST. DAILY $2,840
      </div>
    </div>
  );
}

import { C, F, R, S } from '@/design/tokens';
import { useHoverState } from '../../../terminal/useHoverState';

const FUEL_MIX: { label: string; pct: number; color: string }[] = [
  { label: 'GAS',   pct: 38, color: C.fuelGas },
  { label: 'NUC',   pct: 22, color: C.fuelNuclear },
  { label: 'WIND',  pct: 18, color: C.fuelWind },
  { label: 'COAL',  pct: 14, color: C.fuelCoal },
  { label: 'SOLAR', pct: 5,  color: C.fuelSolar },
  { label: 'OTHER', pct: 3,  color: C.fuelOther },
];

export function FuelMixTile() {
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
          PJM · FUEL MIX · NOW
        </span>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '11px',
            color: 'rgba(245,158,11,0.65)',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600,
          }}
        >
          38.2 GW
        </span>
      </div>

      {/* Stacked bar */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '12px',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        {FUEL_MIX.map((f) => (
          <div
            key={f.label}
            style={{ width: `${f.pct}%`, background: f.color }}
          />
        ))}
      </div>

      {/* Legend — 3 per row, 2 rows */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: S.sm,
        }}
      >
        {FUEL_MIX.map((f) => (
          <div
            key={f.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                background: f.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: F.mono,
                fontSize: '10px',
                color: C.textMuted,
                letterSpacing: '0.08em',
                fontWeight: 400,
              }}
            >
              {f.label}
            </span>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: '10px',
                color: C.textPrimary,
                marginLeft: 'auto',
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 600,
              }}
            >
              {f.pct}%
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: S.sm,
          fontFamily: F.mono,
          fontSize: '11px',
          color: C.textMuted,
          letterSpacing: '0.06em',
          fontWeight: 400,
        }}
      >
        CARBON INTENSITY 412 kg/MWh
      </div>
    </div>
  );
}

// FORGE Wave 4 — FuelMixTile wired to useFuelMix.
// Renders the top fuels (top 6 by MW) as a stacked bar + legend grid.
// The "now" capacity figure and the system carbon intensity come
// straight from the live envelope.

import { C, F, R, S } from '@/design/tokens';
import { useHoverState } from '../../../terminal/useHoverState';
import { useFuelMix } from '@/hooks/data/useFuelMix';
import type { FuelKind } from '@/lib/types/api';

const FUEL_LABEL: Record<FuelKind, string> = {
  natural_gas: 'GAS',
  nuclear: 'NUC',
  coal: 'COAL',
  wind: 'WIND',
  solar: 'SOLAR',
  hydro: 'HYDRO',
  oil: 'OIL',
  other: 'OTHER',
  battery: 'BESS',
};

const FUEL_COLOR: Record<FuelKind, string> = {
  natural_gas: C.fuelGas,
  nuclear: C.fuelNuclear,
  coal: C.fuelCoal,
  wind: C.fuelWind,
  solar: C.fuelSolar,
  hydro: C.fuelHydro,
  oil: C.fuelOther,
  other: C.fuelOther,
  battery: C.fuelBattery,
};

export function FuelMixTile() {
  const mixQuery = useFuelMix();
  const hover = useHoverState();

  const fuels = mixQuery.data?.fuels ?? [];
  const top = fuels.slice(0, 6);
  const totalMW = mixQuery.data?.total_mw ?? 0;
  const carbon = mixQuery.data?.system_carbon_intensity_kg_per_mwh ?? 0;
  const isStale = mixQuery.isStale;

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
          {isStale && (
            <span style={{ color: C.alertWarning, marginLeft: 6 }}> · STALE</span>
          )}
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
          {(totalMW / 1000).toFixed(1)} GW
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
        {top.map((f) => (
          <div
            key={f.fuel}
            style={{
              width: `${f.pct}%`,
              background: FUEL_COLOR[f.fuel] ?? C.fuelOther,
            }}
          />
        ))}
      </div>

      {/* Legend — 3 per row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: S.sm,
        }}
      >
        {top.map((f) => (
          <div
            key={f.fuel}
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
                background: FUEL_COLOR[f.fuel] ?? C.fuelOther,
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
              {FUEL_LABEL[f.fuel] ?? f.fuel.toUpperCase()}
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
              {f.pct.toFixed(0)}%
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
        CARBON INTENSITY {carbon} kg/MWh
      </div>
    </div>
  );
}

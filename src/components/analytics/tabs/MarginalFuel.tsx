// ATLAS — Analytics: MARGINAL FUEL
// Self-contained tab. 24h price-setter Gantt + merit-order stack + price-setter card.

import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { HeroNumber } from '@/components/terminal/HeroNumber';
import { PageAtmosphere } from '@/components/terminal/PageAtmosphere';
import { MARGINAL_FUEL_GANTT_24H } from '@/lib/mock/analytics-mock';

const FUEL_DISPLAY: Record<string, { color: string; full: string }> = {
  NG:    { color: C.fuelGas,     full: 'Natural Gas' },
  COAL:  { color: C.fuelCoal,    full: 'Coal'        },
  NUC:   { color: C.fuelNuclear, full: 'Nuclear'     },
  WIND:  { color: C.fuelWind,    full: 'Wind'        },
  SOLAR: { color: C.fuelSolar,   full: 'Solar'       },
  HYDRO: { color: C.fuelHydro,   full: 'Hydro'       },
  BATT:  { color: C.fuelBattery, full: 'Battery'     },
  OTHER: { color: C.fuelOther,   full: 'Other'       },
};

// ── Merit order (cheapest → most expensive) ──────────────────────────────
// Numbers approximate PJM dispatch share at the time of snapshot.

const MERIT_STACK: Array<{ key: string; sharePct: number; cost: string }> = [
  { key: 'NUC',   sharePct: 28, cost: '$8/MWh'  },
  { key: 'HYDRO', sharePct:  3, cost: '$11/MWh' },
  { key: 'WIND',  sharePct:  9, cost: '$0/MWh'  },
  { key: 'SOLAR', sharePct:  4, cost: '$0/MWh'  },
  { key: 'NG',    sharePct: 36, cost: '$32/MWh' },
  { key: 'COAL',  sharePct: 14, cost: '$38/MWh' },
  { key: 'BATT',  sharePct:  3, cost: '$44/MWh' },
  { key: 'OTHER', sharePct:  3, cost: '$60/MWh' },
];

function HourGantt() {
  return (
    <div>
      <div
        style={{
          display:      'flex',
          height:       80,
          borderRadius: R.md,
          overflow:     'hidden',
          border:       `1px solid ${C.borderDefault}`,
        }}
      >
        {MARGINAL_FUEL_GANTT_24H.map((seg) => {
          const cfg = FUEL_DISPLAY[seg.fuel];
          return (
            <div
              key={seg.hour}
              title={`Hour ${seg.hour} · ${cfg?.full ?? seg.fuel}`}
              style={{
                flex:           1,
                background:     cfg?.color ?? seg.color,
                opacity:        0.85,
                display:        'flex',
                alignItems:     'flex-end',
                justifyContent: 'center',
                padding:        '4px 0',
                borderRight:    `1px solid ${C.bgBase}`,
              }}
            >
              <span
                style={{
                  fontFamily:    F.mono,
                  fontSize:      9,
                  color:         'rgba(0,0,0,0.7)',
                  fontWeight:    700,
                  letterSpacing: '0.06em',
                }}
              >
                {seg.fuel}
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          display:        'flex',
          marginTop:      S.xs,
          fontFamily:     F.mono,
          fontSize:       9,
          color:          C.textMuted,
          letterSpacing:  '0.08em',
        }}
      >
        {MARGINAL_FUEL_GANTT_24H.map((s) => (
          <div
            key={`label-${s.hour}`}
            style={{ flex: 1, textAlign: 'center' }}
          >
            {s.hour.toString().padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  );
}

function MeritOrderStack() {
  return (
    <div>
      <div
        style={{
          display:      'flex',
          height:       48,
          borderRadius: R.md,
          overflow:     'hidden',
          border:       `1px solid ${C.borderDefault}`,
        }}
      >
        {MERIT_STACK.map((seg) => {
          const cfg = FUEL_DISPLAY[seg.key];
          return (
            <div
              key={seg.key}
              title={`${cfg.full} · ${seg.sharePct}%`}
              style={{
                width:          `${seg.sharePct}%`,
                background:     cfg.color,
                opacity:        0.9,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
              }}
            >
              {seg.sharePct >= 6 && (
                <span style={{
                  fontFamily:    F.mono,
                  fontSize:      10,
                  color:         'rgba(0,0,0,0.75)',
                  fontWeight:    700,
                  letterSpacing: '0.06em',
                }}>
                  {seg.key} {seg.sharePct}%
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap:                 S.sm,
          marginTop:           S.md,
        }}
      >
        {MERIT_STACK.map((seg) => {
          const cfg = FUEL_DISPLAY[seg.key];
          return (
            <div
              key={`legend-${seg.key}`}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        S.sm,
              }}
            >
              <span style={{
                width:        10,
                height:       10,
                borderRadius: 2,
                background:   cfg.color,
              }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontFamily:    F.mono,
                  fontSize:      11,
                  fontWeight:    600,
                  color:         C.textPrimary,
                  letterSpacing: '0.06em',
                }}>
                  {cfg.full}
                </span>
                <span style={{
                  fontFamily:         F.mono,
                  fontSize:           10,
                  color:              C.textMuted,
                  letterSpacing:      '0.06em',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {seg.cost}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriceSetterCard() {
  // Determine the most-recent marginal fuel from the gantt
  const latest = MARGINAL_FUEL_GANTT_24H[MARGINAL_FUEL_GANTT_24H.length - 1];
  const cfg = FUEL_DISPLAY[latest.fuel];
  // Capacity factor — for the snapshot we use a deterministic share approximating dispatch share
  const capacityFactor = MERIT_STACK.find((s) => s.key === latest.fuel)?.sharePct ?? 36;
  return (
    <div
      style={{
        display:             'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap:                 S.lg,
        alignItems:          'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
        <span style={{
          fontFamily:    F.mono,
          fontSize:      10,
          color:         C.textMuted,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
        }}>
          Current Marginal Fuel
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: S.sm }}>
          <span style={{
            width:        12,
            height:       12,
            borderRadius: 3,
            background:   cfg.color,
          }} />
          <HeroNumber value={cfg.full} size={36} />
        </div>
        <span style={{
          fontFamily:    F.mono,
          fontSize:      11,
          color:         C.textMuted,
          letterSpacing: '0.06em',
        }}>
          Hour {latest.hour.toString().padStart(2, '0')} · {latest.fuel}-fired peaker
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
        <span style={{
          fontFamily:    F.mono,
          fontSize:      10,
          color:         C.textMuted,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
        }}>
          Dispatch Capacity Factor
        </span>
        <HeroNumber value={`${capacityFactor}%`} size={48} />
        <span style={{
          fontFamily:    F.mono,
          fontSize:      11,
          color:         C.textMuted,
          letterSpacing: '0.06em',
        }}>
          Share of total PJM generation right now
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
        <span style={{
          fontFamily:    F.mono,
          fontSize:      10,
          color:         C.textMuted,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
        }}>
          Hours On Margin · 24h
        </span>
        <HeroNumber
          value={String(MARGINAL_FUEL_GANTT_24H.filter((s) => s.fuel === latest.fuel).length)}
          unit="/ 24"
          size={48}
        />
        <span style={{
          fontFamily:    F.mono,
          fontSize:      11,
          color:         C.textMuted,
          letterSpacing: '0.06em',
        }}>
          {cfg.full} set price most often this period
        </span>
      </div>
    </div>
  );
}

export default function MarginalFuel() {
  return (
    <PageAtmosphere>
      <div style={{ padding: S.xl }}>
        {/* Page identity */}
        <div style={{ marginBottom: S.xl }}>
          <div
            style={{
              fontFamily:    F.mono,
              fontSize:      11,
              fontWeight:    600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         C.electricBlue,
              marginBottom:  S.xs,
            }}
          >
            PRICE-SETTER
          </div>
          <EditorialIdentity size="hero">Who sets the price.</EditorialIdentity>
        </div>

        {/* Gantt timeline — hero element, owns the page */}
        <ContainedCard style={{ marginBottom: S.xl }}>
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              marginBottom:   S.md,
            }}
          >
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                fontWeight:    600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         C.electricBlue,
              }}
            >
              MARGINAL FUEL · 24H GANTT
            </span>
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                color:         'rgba(245,158,11,0.65)',
                letterSpacing: '0.08em',
              }}
            >
              HOUR-ENDING
            </span>
          </div>
          <HourGantt />
        </ContainedCard>

        {/* Merit order stack */}
        <ContainedCard style={{ marginBottom: S.lg }}>
          <div
            style={{
              fontFamily:    F.mono,
              fontSize:      11,
              fontWeight:    600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         C.electricBlue,
              marginBottom:  S.md,
            }}
          >
            MERIT ORDER · DISPATCH STACK
          </div>
          <MeritOrderStack />
        </ContainedCard>

        {/* Price-setter analysis */}
        <ContainedCard>
          <div
            style={{
              fontFamily:    F.mono,
              fontSize:      11,
              fontWeight:    600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         C.electricBlue,
              marginBottom:  S.md,
            }}
          >
            REAL-TIME PRICE-SETTER ANALYSIS
          </div>
          <PriceSetterCard />
        </ContainedCard>
      </div>
    </PageAtmosphere>
  );
}

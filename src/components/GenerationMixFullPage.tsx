// src/components/GenerationMixFullPage.tsx
// Full-screen Generation Mix view — fuel breakdown list (left) +
// stacked bar, stats tiles, and 24h trend placeholder (right).
// Live data wiring in Sprint 2C.

import { C, F, R, S } from '@/design/tokens';

interface GenerationMixFullPageProps {
  onBack: () => void;
}

interface FuelRow {
  fuel:  string;
  pct:   number;
  mw:    number;
  color: string;
}

const FUEL_ROWS: FuelRow[] = [
  { fuel: 'Gas',     pct: 41, mw: 30480, color: C.fuelGas     },
  { fuel: 'Nuclear', pct: 31, mw: 23064, color: C.fuelNuclear },
  { fuel: 'Coal',    pct: 17, mw: 12648, color: C.fuelCoal    },
  { fuel: 'Wind',    pct:  5, mw:  3720, color: C.fuelWind    },
  { fuel: 'Hydro',   pct:  4, mw:  2976, color: C.fuelHydro   },
  { fuel: 'Solar',   pct:  1, mw:   744, color: C.fuelSolar   },
  { fuel: 'Other',   pct:  1, mw:   744, color: C.fuelOther   },
];

const TOTAL_STATS: Array<{ label: string; value: string; unit: string }> = [
  { label: 'TOTAL OUTPUT', value: '74,376', unit: 'MW'  },
  { label: 'RENEWABLES',   value: '10%',    unit: ''    },
  { label: 'CARBON-FREE',  value: '41%',    unit: ''    },
  { label: 'SYSTEM LOAD',  value: '79.3',   unit: 'GW'  },
  { label: 'UPDATED',      value: '4S AGO', unit: ''    },
];

export default function GenerationMixFullPage({ onBack }: GenerationMixFullPageProps) {
  return (
    <div style={{
      height:        '100vh',
      background:    C.bgBase,
      display:       'flex',
      flexDirection: 'column',
      overflow:      'hidden',
    }}>
      {/* ── Header ───────────────────────────────────────── */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        padding:      `0 ${S.xl}`,
        height:       56,
        flexShrink:   0,
        borderBottom: `1px solid ${C.borderDefault}`,
        background:   C.bgElevated,
      }}>
        <button
          onClick={onBack}
          style={{
            background:    'transparent',
            border:        'none',
            color:         C.textMuted,
            fontFamily:    F.mono,
            fontSize:      '11px',
            cursor:        'pointer',
            letterSpacing: '0.08em',
            marginRight:   S.xl,
            padding:       0,
          }}
        >
          ← THE NEST
        </button>
        <div style={{
          fontFamily:    F.mono,
          fontSize:      '13px',
          fontWeight:    '600',
          color:         C.textPrimary,
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
        }}>
          GENERATION MIX
        </div>
        <div style={{
          fontFamily: F.mono,
          fontSize:   '10px',
          color:      C.textMuted,
          marginLeft: S.lg,
          letterSpacing: '0.10em',
        }}>
          PJM REAL-TIME FUEL DISPATCH
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: S.sm }}>
          <span
            aria-hidden
            style={{
              width:        6,
              height:       6,
              borderRadius: '50%',
              background:   C.alertNormal,
              boxShadow:    `0 0 6px ${C.alertNormal}`,
            }}
          />
          <span style={{
            fontFamily:    F.mono,
            fontSize:      '10px',
            fontWeight:    '600',
            color:         C.alertNormal,
            letterSpacing: '0.10em',
          }}>
            LIVE
          </span>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div style={{
        flex:      1,
        display:   'flex',
        minHeight: 0,
        overflow:  'hidden',
      }}>

        {/* Left: fuel breakdown list */}
        <div style={{
          width:       280,
          flexShrink:  0,
          borderRight: `1px solid ${C.borderDefault}`,
          overflowY:   'auto',
          padding:     S.xl,
          background:  C.bgElevated,
        }}>
          <div style={{
            fontFamily:    F.mono,
            fontSize:      '9px',
            color:         C.textMuted,
            letterSpacing: '0.14em',
            marginBottom:  S.lg,
            textTransform: 'uppercase' as const,
          }}>
            FUEL BREAKDOWN
          </div>

          {FUEL_ROWS.map(row => (
            <div key={row.fuel} style={{
              display:      'flex',
              alignItems:   'flex-start',
              gap:          S.md,
              marginBottom: S.lg,
            }}>
              <div style={{
                width:        10,
                height:       10,
                borderRadius: '2px',
                background:   row.color,
                flexShrink:   0,
                marginTop:    4,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display:        'flex',
                  justifyContent: 'space-between',
                  marginBottom:   4,
                }}>
                  <span style={{
                    fontFamily: F.sans,
                    fontSize:   '13px',
                    color:      C.textPrimary,
                  }}>
                    {row.fuel}
                  </span>
                  <span style={{
                    fontFamily:         F.mono,
                    fontSize:           '13px',
                    color:              C.textPrimary,
                    fontWeight:         '600',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {row.pct}%
                  </span>
                </div>
                <div style={{
                  height:       4,
                  background:   C.bgSurface,
                  borderRadius: '2px',
                  overflow:     'hidden',
                }}>
                  <div style={{
                    width:        `${row.pct}%`,
                    height:       '100%',
                    background:   row.color,
                    borderRadius: '2px',
                    transition:   'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
                <div style={{
                  fontFamily:         F.mono,
                  fontSize:           '10px',
                  color:              C.textMuted,
                  marginTop:          3,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {row.mw.toLocaleString()} MW
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: stacked bar + stats + trend placeholder */}
        <div style={{
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          padding:       S.xl,
          minWidth:      0,
          gap:           S.xl,
        }}>

          {/* Stacked dispatch bar */}
          <div>
            <div style={{
              fontFamily:    F.mono,
              fontSize:      '9px',
              color:         C.textMuted,
              letterSpacing: '0.14em',
              marginBottom:  S.md,
              textTransform: 'uppercase' as const,
            }}>
              CURRENT DISPATCH MIX
            </div>
            <div style={{
              height:       48,
              display:      'flex',
              borderRadius: R.md,
              overflow:     'hidden',
              width:        '100%',
              border:       `1px solid ${C.borderDefault}`,
            }}>
              {FUEL_ROWS.map(seg => (
                <div
                  key={seg.fuel}
                  title={`${seg.fuel}: ${seg.pct}% (${seg.mw.toLocaleString()} MW)`}
                  style={{
                    width:      `${seg.pct}%`,
                    background: seg.color,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Totals */}
          <div style={{
            display:      'flex',
            gap:          S.xxl,
            padding:      `${S.lg} ${S.xl}`,
            background:   C.bgSurface,
            borderRadius: R.lg,
            border:       `1px solid ${C.borderDefault}`,
            borderTop:    `1px solid ${C.borderAccent}`,
            flexWrap:     'wrap' as const,
          }}>
            {TOTAL_STATS.map(stat => (
              <div key={stat.label}>
                <div style={{
                  fontFamily:    F.mono,
                  fontSize:      '9px',
                  color:         C.textMuted,
                  letterSpacing: '0.12em',
                  marginBottom:  S.xs,
                  textTransform: 'uppercase' as const,
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontFamily:         F.mono,
                  fontSize:           '18px',
                  fontWeight:         '700',
                  color:              C.textPrimary,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {stat.value}
                  {stat.unit && (
                    <span style={{
                      fontSize:   '11px',
                      color:      C.textMuted,
                      marginLeft: 3,
                      fontWeight: '400',
                    }}>
                      {stat.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 24h trend placeholder */}
          <div style={{
            flex:           1,
            background:     C.bgSurface,
            borderRadius:   R.lg,
            border:         `1px solid ${C.borderDefault}`,
            borderTop:      `1px solid ${C.borderAccent}`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            minHeight:      0,
          }}>
            <div style={{
              fontFamily:    F.mono,
              fontSize:      '11px',
              color:         C.textMuted,
              letterSpacing: '0.10em',
              textTransform: 'uppercase' as const,
            }}>
              24H GENERATION TREND — LIVE DATA IN SPRINT 2C
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

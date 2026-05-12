// ATLAS — Analytics: SPARK SPREAD
// Self-contained tab. Dispatch Frontier 3D illustration + plant table + heat-rate matrix.

import { Fragment, type ReactNode } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { DataTable, type ColumnDef } from '@/components/terminal/DataTable';
import { PageAtmosphere } from '@/components/terminal/PageAtmosphere';
import {
  DISPATCH_FRONTIER_MARKER,
  SPARK_SPREAD_PLANTS,
} from '@/lib/mock/analytics-mock';

// ── Dispatch Frontier — static 3D-perspective SVG ─────────────────────────
//
// The illustration projects three axes in skewed 2D:
//   • X (gas price, $/MMBtu) — runs along the bottom edge
//   • Y (LMP, $/MWh)         — runs up the right side
//   • Z (heat rate, MMBtu/MWh)— recedes toward the upper-left vanishing point
// A frontier surface is drawn as a translucent quadrilateral with subtle
// grid lines. The marker dot sits on the surface at the data coordinates
// from DISPATCH_FRONTIER_MARKER.

function DispatchFrontier() {
  // Canvas: 1100w × 480h. Origin at lower-right.
  const W = 1100;
  const H = 480;

  // Anchors
  const ox = 720; // origin x (right side)
  const oy = 420; // origin y (bottom)
  const xAxisLen = 600; // along the bottom (x runs leftward in display)
  const yAxisLen = 320; // up the right side
  const zAxisLen = 360; // diagonal upper-left (perspective depth)
  const zDx = -0.78;    // unit vector for z axis
  const zDy = -0.62;

  // Frontier corners
  const c0 = { x: ox,                          y: oy                          }; // origin
  const c1 = { x: ox - xAxisLen,               y: oy                          }; // far x
  const c2 = { x: ox - xAxisLen + zAxisLen * zDx, y: oy + zAxisLen * zDy     }; // far x + far z
  const c3 = { x: ox + zAxisLen * zDx,         y: oy + zAxisLen * zDy        }; // far z

  // Marker — gasPrice 3.20, lmp 34.93, heatRate 10240 (~10.24 MMBtu/MWh)
  // Map to canvas: gasPrice 2..6 maps along x; heatRate 7..12 along z; lmp 0..80 up y.
  const gp = DISPATCH_FRONTIER_MARKER.gasPrice;        // 3.20
  const lmp = DISPATCH_FRONTIER_MARKER.lmp;            // 34.93
  const hr = DISPATCH_FRONTIER_MARKER.heatRate / 1000; // 10.24 MMBtu/MWh

  const xT = (gp - 2) / 4;           // 0..1
  const zT = (hr - 7) / 5;           // 0..1
  const yT = lmp / 80;               // 0..1

  const baseX = ox - xT * xAxisLen + zT * zAxisLen * zDx;
  const baseY = oy + zT * zAxisLen * zDy;
  const markerX = baseX;
  const markerY = baseY - yT * yAxisLen;

  // Grid lines on the frontier surface
  const xLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    xLines.push({
      x1: ox - t * xAxisLen,
      y1: oy,
      x2: ox - t * xAxisLen + zAxisLen * zDx,
      y2: oy + zAxisLen * zDy,
    });
  }
  const zLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    zLines.push({
      x1: ox + t * zAxisLen * zDx,
      y1: oy + t * zAxisLen * zDy,
      x2: ox - xAxisLen + t * zAxisLen * zDx,
      y2: oy + t * zAxisLen * zDy,
    });
  }

  // Y-axis vertical helpers
  const yTicks = [0.25, 0.5, 0.75, 1].map((t) => ({
    yPx:   oy - t * yAxisLen,
    label: `$${Math.round(t * 80)}`,
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      {/* Frontier surface fill */}
      <polygon
        points={`${c0.x},${c0.y} ${c1.x},${c1.y} ${c2.x},${c2.y} ${c3.x},${c3.y}`}
        fill="rgba(59,130,246,0.06)"
        stroke="rgba(59,130,246,0.30)"
        strokeWidth={1}
      />

      {/* Grid lines */}
      {xLines.map((l, i) => (
        <line
          key={`xl-${i}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}
      {zLines.map((l, i) => (
        <line
          key={`zl-${i}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      ))}

      {/* Axes */}
      {/* X axis (bottom) */}
      <line x1={ox} y1={oy} x2={ox - xAxisLen} y2={oy} stroke={C.textMuted} strokeWidth={1} />
      {/* Y axis (right side, going up) */}
      <line x1={ox} y1={oy} x2={ox} y2={oy - yAxisLen} stroke={C.textMuted} strokeWidth={1} />
      {/* Z axis (depth, upper-left) */}
      <line
        x1={ox}
        y1={oy}
        x2={ox + zAxisLen * zDx}
        y2={oy + zAxisLen * zDy}
        stroke={C.textMuted}
        strokeWidth={1}
      />

      {/* Y-axis ticks */}
      {yTicks.map((t, i) => (
        <g key={`ytick-${i}`}>
          <line x1={ox} y1={t.yPx} x2={ox + 6} y2={t.yPx} stroke={C.textMuted} strokeWidth={1} />
          <text
            x={ox + 12}
            y={t.yPx + 4}
            fill={C.textMuted}
            fontFamily="'Geist Mono', 'Fira Code', monospace"
            fontSize={10}
          >
            {t.label}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text
        x={ox - xAxisLen / 2}
        y={oy + 28}
        fill={C.textMuted}
        fontFamily="'Geist Mono', 'Fira Code', monospace"
        fontSize={11}
        letterSpacing="0.12em"
        textAnchor="middle"
      >
        GAS PRICE ($/MMBtu)
      </text>
      <text
        x={ox + 50}
        y={oy - yAxisLen - 12}
        fill={C.textMuted}
        fontFamily="'Geist Mono', 'Fira Code', monospace"
        fontSize={11}
        letterSpacing="0.12em"
        textAnchor="end"
      >
        LMP ($/MWh)
      </text>
      <text
        x={ox + zAxisLen * zDx - 12}
        y={oy + zAxisLen * zDy - 8}
        fill={C.textMuted}
        fontFamily="'Geist Mono', 'Fira Code', monospace"
        fontSize={11}
        letterSpacing="0.12em"
        textAnchor="end"
      >
        HEAT RATE (MMBtu/MWh)
      </text>

      {/* Drop line from marker down to frontier surface */}
      <line
        x1={markerX}
        y1={markerY}
        x2={baseX}
        y2={baseY}
        stroke={C.falconGold}
        strokeWidth={1}
        strokeDasharray="2 3"
        opacity={0.8}
      />

      {/* Marker */}
      <circle cx={markerX} cy={markerY} r={9} fill={C.falconGold} opacity={0.25} />
      <circle cx={markerX} cy={markerY} r={5} fill={C.falconGold} stroke={C.bgBase} strokeWidth={1.5} />

      {/* Marker label */}
      <g>
        <line
          x1={markerX}
          y1={markerY}
          x2={markerX - 56}
          y2={markerY - 38}
          stroke={C.falconGold}
          strokeWidth={1}
          opacity={0.6}
        />
        <text
          x={markerX - 60}
          y={markerY - 44}
          fill={C.falconGold}
          fontFamily="'Geist Mono', 'Fira Code', monospace"
          fontSize={11}
          fontWeight={600}
          letterSpacing="0.12em"
          textAnchor="end"
        >
          {DISPATCH_FRONTIER_MARKER.label}
        </text>
        <text
          x={markerX - 60}
          y={markerY - 28}
          fill={C.textMuted}
          fontFamily="'Geist Mono', 'Fira Code', monospace"
          fontSize={10}
          textAnchor="end"
        >
          ${gp.toFixed(2)} GAS · ${lmp.toFixed(2)} LMP · {DISPATCH_FRONTIER_MARKER.heatRate.toLocaleString()} HR
        </text>
      </g>
    </svg>
  );
}

// ── Plant profitability table ─────────────────────────────────────────────

function StatusCell(value: string): ReactNode {
  const map: Record<string, { color: string; label: string }> = {
    profitable:   { color: C.alertNormal,   label: 'PROFITABLE'   },
    breakeven:    { color: C.falconGold,    label: 'BREAKEVEN'    },
    unprofitable: { color: C.alertCritical, label: 'UNPROFITABLE' },
  };
  const cfg = map[value] ?? { color: C.textMuted, label: value };
  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            6,
        fontFamily:     F.mono,
        fontSize:       11,
        fontWeight:     600,
        letterSpacing:  '0.10em',
        textTransform:  'uppercase',
        color:          cfg.color,
      }}
    >
      <span
        style={{
          width:        6,
          height:       6,
          borderRadius: '50%',
          background:   cfg.color,
        }}
      />
      {cfg.label}
    </span>
  );
}

const PLANT_COLUMNS: ColumnDef[] = [
  { key: 'name',        label: 'Plant',         align: 'left'  },
  { key: 'zone',        label: 'Zone',          align: 'left'  },
  { key: 'fuel',        label: 'Fuel',          align: 'left'  },
  { key: 'heatRate',    label: 'Heat Rate',     align: 'right',
    render: (v) => (typeof v === 'number' ? v.toLocaleString() : v) },
  { key: 'capacity',    label: 'MW',            align: 'right',
    render: (v) => (typeof v === 'number' ? v.toLocaleString() : v) },
  { key: 'sparkSpread', label: 'Spark $/MWh',   align: 'right',
    render: (v) => {
      const n = v as number;
      const color = n > 5 ? C.alertNormal : n > 0 ? C.falconGold : C.alertCritical;
      const sign = n > 0 ? '+' : '';
      return (
        <span style={{ color, fontWeight: 600 }}>{sign}{n.toFixed(2)}</span>
      );
    },
  },
  { key: 'status',      label: 'Status',        align: 'left',
    render: (v) => StatusCell(v as string) },
];

// ── 5x5 heat-rate × gas-price sensitivity ─────────────────────────────────

const HR_AXIS  = [7.5, 8.5, 9.5, 10.5, 11.5];   // MMBtu/MWh
const GP_AXIS  = [2.5, 3.0, 3.5, 4.0, 4.5];     // $/MMBtu
const REF_LMP  = 34.21;                          // PSEG hub avg

// spread = LMP − heatRate * gasPrice
function spreadCell(hr: number, gp: number): number {
  return REF_LMP - hr * gp;
}

function cellColor(spread: number): string {
  if (spread >= 8)  return 'rgba(16,185,129,0.55)';  // green
  if (spread >= 4)  return 'rgba(16,185,129,0.32)';
  if (spread >= 0)  return 'rgba(245,158,11,0.32)';  // gold
  if (spread >= -4) return 'rgba(239,68,68,0.32)';   // red
  return 'rgba(239,68,68,0.55)';
}

function HeatRateMatrix() {
  return (
    <div>
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: `64px repeat(${GP_AXIS.length}, 1fr)`,
          gap:                 4,
        }}
      >
        {/* Top-left blank */}
        <div />
        {/* Column header — gas price */}
        {GP_AXIS.map((gp) => (
          <div
            key={`gp-${gp}`}
            style={{
              fontFamily:    F.mono,
              fontSize:      10,
              color:         C.textMuted,
              textAlign:     'center',
              letterSpacing: '0.08em',
              padding:       '4px 0',
            }}
          >
            ${gp.toFixed(1)}
          </div>
        ))}
        {/* Rows */}
        {HR_AXIS.map((hr) => (
          <Fragment key={`row-${hr}`}>
            <div
              style={{
                fontFamily:    F.mono,
                fontSize:      10,
                color:         C.textMuted,
                letterSpacing: '0.08em',
                padding:       '4px 8px 4px 0',
                textAlign:     'right',
              }}
            >
              {hr.toFixed(1)}
            </div>
            {GP_AXIS.map((gp) => {
              const v = spreadCell(hr, gp);
              return (
                <div
                  key={`cell-${hr}-${gp}`}
                  style={{
                    background:    cellColor(v),
                    border:        `1px solid ${C.borderDefault}`,
                    borderRadius:  R.sm,
                    padding:       '8px 4px',
                    fontFamily:    F.mono,
                    fontSize:      12,
                    fontWeight:    600,
                    color:         C.textPrimary,
                    textAlign:     'center',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {v >= 0 ? '+' : ''}{v.toFixed(1)}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
      <div
        style={{
          marginTop:    S.sm,
          display:      'flex',
          gap:          S.lg,
          fontFamily:   F.mono,
          fontSize:     10,
          color:        C.textMuted,
          letterSpacing:'0.08em',
        }}
      >
        <span>ROWS · HEAT RATE (MMBtu/MWh)</span>
        <span>COLS · GAS PRICE ($/MMBtu)</span>
        <span>CELLS · SPARK SPREAD ($/MWh) AT LMP ${REF_LMP.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function SparkSpread() {
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
            WHEN GAS EARNS
          </div>
          <EditorialIdentity size="hero">When gas earns.</EditorialIdentity>
        </div>

        {/* Hero — Dispatch Frontier */}
        <ContainedCard style={{ marginBottom: S.xl, height: 480, display: 'flex', flexDirection: 'column' }}>
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
              DISPATCH FRONTIER · GAS × HEAT RATE × LMP
            </span>
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                color:         'rgba(245,158,11,0.65)',
                letterSpacing: '0.08em',
              }}
            >
              SNAPSHOT
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <DispatchFrontier />
          </div>
        </ContainedCard>

        {/* Plant profitability */}
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
            PLANT-LEVEL PROFITABILITY · 10 ASSETS
          </div>
          <DataTable columns={PLANT_COLUMNS} rows={SPARK_SPREAD_PLANTS} />
        </ContainedCard>

        {/* Heat-rate sensitivity matrix */}
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
            SENSITIVITY · HEAT RATE × GAS PRICE
          </div>
          <HeatRateMatrix />
        </ContainedCard>
      </div>
    </PageAtmosphere>
  );
}

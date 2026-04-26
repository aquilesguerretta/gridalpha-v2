// ATLAS — Analytics: BATTERY ARBITRAGE
// Self-contained tab. Schedule chart + value calculator + sensitivity matrix + VPP.

import { Fragment, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { HeroNumber } from '@/components/terminal/HeroNumber';
import {
  BATTERY_OPTIMAL_SCHEDULE,
  BATTERY_SENSITIVITY_COLS,
  BATTERY_SENSITIVITY_MATRIX,
  BATTERY_SENSITIVITY_ROWS,
} from '@/lib/mock/analytics-mock';

const TICK_INDICES = [0, 6, 12, 18, 23];

function formatHour(idx: number): string {
  if (idx === 23) return 'NOW';
  return `-${24 - idx}`;
}

function pageVignette() {
  return {
    position: 'absolute' as const,
    inset: 0,
    background:
      'radial-gradient(ellipse at top, rgba(167,139,250,0.04) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(59,130,246,0.04) 0%, transparent 60%)',
    pointerEvents: 'none' as const,
    zIndex: 0,
  };
}

interface ScheduleTooltipPayload {
  value: number;
  dataKey: string;
  color: string;
  payload: {
    hour: number;
    chargeMw: number;
    dischargeMw: number;
    expectedPrice: number;
  };
}

function ScheduleTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ScheduleTooltipPayload[];
  label?: number | string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const hourIdx = typeof label === 'number' ? label : Number(label);
  const row = payload[0].payload;
  return (
    <div
      style={{
        background:   C.bgElevated,
        border:       `1px solid ${C.borderDefault}`,
        borderRadius: R.md,
        padding:      S.md,
        minWidth:     180,
      }}
    >
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      9,
          letterSpacing: '0.18em',
          color:         C.textMuted,
          textTransform: 'uppercase',
          marginBottom:  6,
          fontWeight:    600,
        }}
      >
        HOUR {Number.isFinite(hourIdx) ? formatHour(hourIdx) : String(label)}
      </div>
      <Row label="CHARGE"    value={`${row.chargeMw} MW`}     color={C.electricBlue} />
      <Row label="DISCHARGE" value={`${row.dischargeMw} MW`}  color={C.falconGold}  />
      <Row label="LMP"       value={`$${row.expectedPrice.toFixed(2)}`} color={C.textPrimary} />
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        gap:            S.md,
        fontFamily:     F.mono,
        fontSize:       12,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span style={{ color, letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ color: C.textPrimary, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

// ── Daily value calculator ──────────────────────────────────────────────

function ValueCalculator() {
  const [capacity, setCapacity] = useState(200);
  const [duration, setDuration] = useState(4);
  const [efficiency, setEfficiency] = useState(0.88);

  // Naive daily revenue model: average charge price ~ $27, average discharge ~ $44
  const chargePx = 27.0;
  const dischargePx = 44.0;
  const cycleEnergy = capacity * duration; // MWh per cycle
  const grossRev = cycleEnergy * (dischargePx - chargePx / efficiency);
  const dailyRev = Math.max(0, grossRev);

  return (
    <div
      style={{
        display:             'grid',
        gridTemplateColumns: '320px 1fr',
        gap:                 S.lg,
        alignItems:          'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.md }}>
        <CalcInput
          label="CAPACITY (MW)"
          value={String(capacity)}
          onChange={(v) => setCapacity(Number(v) || 0)}
        />
        <CalcInput
          label="DURATION (HRS)"
          value={String(duration)}
          onChange={(v) => setDuration(Number(v) || 0)}
        />
        <CalcInput
          label="ROUND-TRIP EFFICIENCY"
          value={efficiency.toFixed(2)}
          onChange={(v) => setEfficiency(Number(v) || 0.85)}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
        <div
          style={{
            fontFamily:    F.mono,
            fontSize:      10,
            color:         C.textMuted,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
          }}
        >
          Forecast Daily Revenue
        </div>
        <HeroNumber value={`$${(dailyRev / 1000).toFixed(1)}K`} unit="/day" size={64} />
        <div
          style={{
            fontFamily:    F.mono,
            fontSize:      11,
            color:         C.textMuted,
            letterSpacing: '0.06em',
          }}
        >
          {cycleEnergy.toLocaleString()} MWh per cycle · spread ${(dischargePx - chargePx / efficiency).toFixed(2)}/MWh
        </div>
      </div>
    </div>
  );
}

function CalcInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily:    F.mono,
          fontSize:      10,
          color:         C.textMuted,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height:       40,
          background:   C.bgSurface,
          border:       `1px solid ${C.borderDefault}`,
          borderRadius: R.md,
          padding:      `0 ${S.md}`,
          color:        C.textPrimary,
          fontFamily:   F.mono,
          fontSize:     13,
          fontVariantNumeric: 'tabular-nums',
          outline:      'none',
          width:        '100%',
          boxSizing:    'border-box',
        }}
      />
    </label>
  );
}

// ── 3x3 sensitivity matrix ──────────────────────────────────────────────

function sensColor(value: number): string {
  if (value >= 165) return 'rgba(16,185,129,0.55)';
  if (value >= 145) return 'rgba(16,185,129,0.32)';
  if (value >= 125) return 'rgba(245,158,11,0.30)';
  return 'rgba(239,68,68,0.32)';
}

function SensitivityMatrix() {
  return (
    <div>
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: `120px repeat(${BATTERY_SENSITIVITY_COLS.length}, 1fr)`,
          gap:                 4,
        }}
      >
        <div />
        {BATTERY_SENSITIVITY_COLS.map((c) => (
          <div
            key={`col-${c}`}
            style={{
              fontFamily:    F.mono,
              fontSize:      10,
              color:         C.textMuted,
              letterSpacing: '0.08em',
              textAlign:     'center',
              padding:       '4px 0',
            }}
          >
            ${c}/MWh-cyc
          </div>
        ))}
        {BATTERY_SENSITIVITY_ROWS.map((eff, rowIdx) => (
          <Fragment key={`eff-${eff}`}>
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
              η = {eff.toFixed(2)}
            </div>
            {BATTERY_SENSITIVITY_COLS.map((_, colIdx) => {
              const v = BATTERY_SENSITIVITY_MATRIX[rowIdx][colIdx];
              return (
                <div
                  key={`cell-${rowIdx}-${colIdx}`}
                  style={{
                    background:    sensColor(v),
                    border:        `1px solid ${C.borderDefault}`,
                    borderRadius:  R.sm,
                    padding:       '12px 4px',
                    fontFamily:    F.mono,
                    fontSize:      14,
                    fontWeight:    600,
                    color:         C.textPrimary,
                    textAlign:     'center',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  ${v.toFixed(1)}
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
        <span>ROWS · ROUND-TRIP EFFICIENCY</span>
        <span>COLS · CYCLING COST</span>
        <span>CELLS · ANNUAL REV ($/kW-YR) · 4HR · PSEG</span>
      </div>
    </div>
  );
}

// ── VPP simulator ──────────────────────────────────────────────────────

const VPP_ASSETS = [
  { name: 'PSEG GRID-SCALE A',  capacity: 200, duration: 4, status: 'discharging' },
  { name: 'COMED RESI FLEET',   capacity: 84,  duration: 2, status: 'idle'        },
  { name: 'WEST_HUB COMM C&I',  capacity: 120, duration: 3, status: 'charging'    },
];

function VPPSimulator() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
      {VPP_ASSETS.map((a) => {
        const statusColor =
          a.status === 'discharging' ? C.falconGold :
          a.status === 'charging'    ? C.electricBlue :
          C.textMuted;
        return (
          <div
            key={a.name}
            style={{
              display:             'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              alignItems:          'center',
              gap:                 S.md,
              padding:             `${S.sm} ${S.md}`,
              background:          C.bgSurface,
              border:              `1px solid ${C.borderDefault}`,
              borderRadius:        R.md,
            }}
          >
            <div style={{
              fontFamily:    F.mono,
              fontSize:      12,
              fontWeight:    600,
              color:         C.textPrimary,
              letterSpacing: '0.06em',
            }}>
              {a.name}
            </div>
            <div style={{
              fontFamily:         F.mono,
              fontSize:           11,
              color:              C.textMuted,
              fontVariantNumeric: 'tabular-nums',
              textAlign:          'right',
            }}>
              {a.capacity} MW
            </div>
            <div style={{
              fontFamily:         F.mono,
              fontSize:           11,
              color:              C.textMuted,
              fontVariantNumeric: 'tabular-nums',
              textAlign:          'right',
            }}>
              {a.duration} hr
            </div>
            <div style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            6,
              fontFamily:     F.mono,
              fontSize:       10,
              fontWeight:     600,
              letterSpacing:  '0.10em',
              textTransform:  'uppercase',
              color:          statusColor,
              justifyContent: 'flex-end',
            }}>
              <span style={{
                width:        6,
                height:       6,
                borderRadius: '50%',
                background:   statusColor,
              }} />
              {a.status}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BatteryArb() {
  const data = BATTERY_OPTIMAL_SCHEDULE.map((h) => ({
    hour:        h.hour,
    chargeMw:    -h.chargeMw,    // negative for visual stacking below axis
    dischargeMw: h.dischargeMw,
    expectedPrice: h.expectedPrice,
  }));

  return (
    <div
      style={{
        height:     '100%',
        background: C.bgBase,
        overflow:   'auto',
        position:   'relative',
      }}
    >
      <div style={pageVignette()} />

      <div style={{ position: 'relative', zIndex: 1, padding: S.xl }}>
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
            STORAGE ECONOMICS
          </div>
          <EditorialIdentity size="hero">Storage economics.</EditorialIdentity>
        </div>

        {/* Optimal schedule chart */}
        <ContainedCard style={{ marginBottom: S.lg, height: 320, display: 'flex', flexDirection: 'column' }}>
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
              OPTIMAL CHARGE / DISCHARGE · 24H · PSEG
            </span>
            <div style={{ display: 'flex', gap: S.md, alignItems: 'center' }}>
              <LegendChip color={C.electricBlue} label="CHARGE"    />
              <LegendChip color={C.falconGold}   label="DISCHARGE" />
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 16, bottom: 24, left: 32 }} stackOffset="sign">
                <CartesianGrid horizontal vertical={false} strokeDasharray="2 4" stroke={C.borderDefault} />
                <XAxis
                  dataKey="hour"
                  type="number"
                  domain={[0, 23]}
                  ticks={TICK_INDICES}
                  tickFormatter={(v) => formatHour(v as number)}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: C.textMuted, fontFamily: F.mono, fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tick={{ fill: C.textMuted, fontFamily: F.mono, fontSize: 10 }}
                  tickFormatter={(v) => `${Math.abs(v as number)}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={<ScheduleTooltip />}
                />
                <Bar dataKey="chargeMw"    fill={C.electricBlue} stackId="bat" isAnimationActive={false} />
                <Bar dataKey="dischargeMw" fill={C.falconGold}   stackId="bat" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ContainedCard>

        {/* Two-column row: Calculator + Sensitivity */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:                 S.lg,
            marginBottom:        S.lg,
          }}
        >
          <ContainedCard style={{ height: 200 }}>
            <div
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                fontWeight:    600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         C.electricBlue,
                marginBottom:  S.sm,
              }}
            >
              DAILY VALUE CALCULATOR
            </div>
            <ValueCalculator />
          </ContainedCard>

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
              SENSITIVITY · η × CYCLING COST
            </div>
            <SensitivityMatrix />
          </ContainedCard>
        </div>

        {/* VPP simulator */}
        <ContainedCard>
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
              VPP SIMULATOR · 3 ASSETS COMBINED
            </span>
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                color:         'rgba(245,158,11,0.65)',
                letterSpacing: '0.08em',
              }}
            >
              404 MW AGGREGATE
            </span>
          </div>
          <VPPSimulator />
        </ContainedCard>
      </div>
    </div>
  );
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            6,
        fontFamily:     F.mono,
        fontSize:       10,
        fontWeight:     600,
        letterSpacing:  '0.10em',
        textTransform:  'uppercase',
        color:          C.textMuted,
      }}
    >
      <span
        style={{
          display:      'inline-block',
          width:        8,
          height:       8,
          borderRadius: 2,
          background:   color,
        }}
      />
      {label}
    </span>
  );
}

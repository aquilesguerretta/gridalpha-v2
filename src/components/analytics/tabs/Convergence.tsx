// ATLAS — Analytics: CONVERGENCE
// Self-contained tab. DA vs RT overlay + spread bars + 3 opportunity cards + tracker.

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { HeroNumber } from '@/components/terminal/HeroNumber';
import { PageAtmosphere } from '@/components/terminal/PageAtmosphere';
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';
import {
  CONVERGENCE_24H,
  CONVERGENCE_OPPORTUNITIES,
} from '@/lib/mock/analytics-mock';

const TICK_INDICES = [0, 6, 12, 18, 23];

function formatHour(idx: number): string {
  if (idx === 23) return 'NOW';
  return `-${24 - idx}`;
}

interface OverlayPayload {
  value: number;
  dataKey: string;
  color: string;
}

function OverlayTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: OverlayPayload[];
  label?: number | string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const hourIdx = typeof label === 'number' ? label : Number(label);
  return (
    <div
      style={{
        background:   C.bgElevated,
        border:       `1px solid ${C.borderDefault}`,
        borderRadius: R.md,
        padding:      S.md,
        minWidth:     160,
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
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            gap:            S.md,
            fontFamily:     F.mono,
            fontSize:       12,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span style={{ color: p.color, letterSpacing: '0.06em' }}>{p.dataKey}</span>
          <span style={{ color: C.textPrimary, fontWeight: 600 }}>${p.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

interface SpreadPayload {
  value: number;
}

function SpreadTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: SpreadPayload[];
  label?: number | string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const hourIdx = typeof label === 'number' ? label : Number(label);
  const v = payload[0].value;
  const color = v >= 0 ? C.alertNormal : C.alertCritical;
  return (
    <div
      style={{
        background:   C.bgElevated,
        border:       `1px solid ${C.borderDefault}`,
        borderRadius: R.md,
        padding:      S.md,
        minWidth:     140,
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
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        gap:            S.md,
        fontFamily:     F.mono,
        fontSize:       12,
        fontVariantNumeric: 'tabular-nums',
      }}>
        <span style={{ color: C.textMuted, letterSpacing: '0.06em' }}>RT − DA</span>
        <span style={{ color, fontWeight: 700 }}>{v >= 0 ? '+' : ''}${v.toFixed(2)}</span>
      </div>
    </div>
  );
}

function OpportunityCard({
  zone,
  expectedSpread,
  confidence,
}: {
  zone: string;
  expectedSpread: number;
  confidence: number;
}) {
  const positive = expectedSpread >= 0;
  const direction = positive ? 'BUY DA · SELL RT' : 'SELL DA · BUY RT';
  const color = positive ? C.alertNormal : C.alertCritical;
  return (
    <ContainedCard style={{ height: 220 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm, height: '100%' }}>
        <div
          style={{
            fontFamily:    F.mono,
            fontSize:      10,
            fontWeight:    600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         C.electricBlue,
          }}
        >
          {zone}
        </div>
        <HeroNumber
          value={`${positive ? '+' : ''}$${expectedSpread.toFixed(2)}`}
          unit="/MWh"
          size={48}
        />
        <div style={{ flex: 1 }} />
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          gap:            S.sm,
        }}>
          <span style={{
            fontFamily:    F.mono,
            fontSize:      11,
            color:         C.textMuted,
            letterSpacing: '0.06em',
          }}>
            CONFIDENCE
          </span>
          <span style={{
            fontFamily:         F.mono,
            fontSize:           13,
            color:              C.textPrimary,
            fontWeight:         600,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.round(confidence * 100)}%
          </span>
        </div>
        <div style={{
          height:       4,
          background:   C.bgSurface,
          borderRadius: 2,
          overflow:     'hidden',
        }}>
          <div style={{
            width:      `${Math.round(confidence * 100)}%`,
            height:     '100%',
            background: C.electricBlue,
          }} />
        </div>
        <div style={{
          marginTop:     S.sm,
          fontFamily:    F.mono,
          fontSize:      10,
          fontWeight:    600,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color,
        }}>
          {direction}
        </div>
      </div>
    </ContainedCard>
  );
}

export default function Convergence() {
  const overlayData = CONVERGENCE_24H.map((p) => ({
    hour: p.hour,
    DA:   p.daPrice,
    RT:   p.rtPrice,
  }));

  const spreadData = CONVERGENCE_24H.map((p) => ({
    hour:   p.hour,
    spread: p.spread,
  }));

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
            VIRTUAL ALPHA
          </div>
          <EditorialIdentity size="hero">Virtual alpha.</EditorialIdentity>
        </div>

        {/* DA vs RT overlay */}
        <ContainedCard style={{ marginBottom: S.xl, height: 380, display: 'flex', flexDirection: 'column' }}>
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
              DA vs RT · 24H · PSEG
            </span>
            <div style={{ display: 'flex', gap: S.md, alignItems: 'center' }}>
              <LegendChip color={C.electricBlue} label="DA" />
              <LegendChip color={C.falconGold}   label="RT" />
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <AnnotatableChart chartId="analytics:convergence-overlay">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overlayData} margin={{ top: 8, right: 16, bottom: 24, left: 32 }}>
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
                  width={36}
                  tick={{ fill: C.textMuted, fontFamily: F.mono, fontSize: 10 }}
                  tickFormatter={(v) => (v as number).toFixed(0)}
                />
                <Tooltip
                  cursor={{ stroke: C.borderDefault, strokeDasharray: '2 4' }}
                  content={<OverlayTooltip />}
                />
                <Line type="monotone" dataKey="DA" stroke={C.electricBlue} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="RT" stroke={C.falconGold}   strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
            </AnnotatableChart>
          </div>
        </ContainedCard>

        {/* RT-DA spread bar */}
        <ContainedCard style={{ marginBottom: S.lg, height: 280, display: 'flex', flexDirection: 'column' }}>
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
              RT − DA SPREAD · 24H
            </span>
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                color:         'rgba(245,158,11,0.65)',
                letterSpacing: '0.08em',
              }}
            >
              $/MWh
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <AnnotatableChart chartId="analytics:convergence-spread">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spreadData} margin={{ top: 8, right: 16, bottom: 24, left: 32 }}>
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
                  tickFormatter={(v) => (v as number).toFixed(1)}
                />
                <ReferenceLine y={0} stroke={C.borderStrong} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<SpreadTooltip />} />
                <Bar dataKey="spread" isAnimationActive={false}>
                  {spreadData.map((d) => (
                    <Cell
                      key={`cell-${d.hour}`}
                      fill={d.spread >= 0 ? C.alertNormal : C.alertCritical}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </AnnotatableChart>
          </div>
        </ContainedCard>

        {/* Opportunity cards */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap:                 S.lg,
            marginBottom:        S.lg,
          }}
        >
          {CONVERGENCE_OPPORTUNITIES.map((op) => (
            <OpportunityCard
              key={op.id}
              zone={op.zone}
              expectedSpread={op.expectedSpread}
              confidence={op.confidence}
            />
          ))}
        </div>

        {/* Historical performance tracker */}
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
              HISTORICAL PERFORMANCE TRACKER
            </span>
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                color:         C.textMuted,
                letterSpacing: '0.08em',
              }}
            >
              30-DAY ROLLING
            </span>
          </div>
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap:                 S.lg,
            }}
          >
            <Stat label="WIN RATE"       value="62%"      sub="vs 50% baseline"     accent={C.alertNormal} />
            <Stat label="AVG ALPHA"      value="$1.84"    sub="per cleared MWh"     accent={C.electricBlue} />
            <Stat label="MAX DRAWDOWN"   value="−$4.20"   sub="worst day · 04-09"   accent={C.alertCritical} />
            <Stat label="SHARPE (30D)"   value="1.74"     sub="vs PJM benchmark"    accent={C.falconGold} />
          </div>
        </ContainedCard>
      </div>
    </PageAtmosphere>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontFamily:    F.mono,
        fontSize:      10,
        color:         C.textMuted,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily:         F.mono,
        fontSize:           24,
        fontWeight:         700,
        color:              accent,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </span>
      <span style={{
        fontFamily:    F.mono,
        fontSize:      10,
        color:         C.textMuted,
        letterSpacing: '0.06em',
      }}>
        {sub}
      </span>
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

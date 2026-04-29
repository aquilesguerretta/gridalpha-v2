import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { C, F, S } from '@/design/tokens';
import type { CSSProperties } from 'react';
import { ZONE_LMP_DETAIL, ZONE_24H_PRICES } from '../../../lib/pjm/mock-data';
import { HeroNumber } from '../../terminal/HeroNumber';
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';

const ZONE_OPTIONS: { key: string; label: string }[] = [
  { key: 'WEST_HUB', label: 'WEST HUB' },
  { key: 'AEP',      label: 'AEP' },
  { key: 'PSEG',     label: 'PSEG' },
  { key: 'COMED',    label: 'COMED' },
  { key: 'RECO',     label: 'RECO' },
];

function regimeFor(price: number): { label: string; color: string } {
  if (price >= 45) return { label: 'SCARCITY',   color: C.alertCritical };
  if (price <= 30) return { label: 'SURPLUS',    color: C.electricBlue };
  if (price >= 40) return { label: 'TRANSITION', color: C.alertWarning };
  return { label: 'NORMAL', color: C.alertNormal };
}

// Editorial identity line — GridAlpha voice on the hero block.
const IDENTITY_LINE_HERO: CSSProperties = {
  fontFamily: F.display,
  fontSize: 26,
  fontStyle: 'italic',
  color: 'rgba(255,255,255,0.45)',
  fontWeight: 400,
  letterSpacing: '-0.01em',
  lineHeight: 1.2,
  marginTop: S.md,
  marginBottom: S.lg,
};

function stdDev(values: number[]): number {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  return Math.sqrt(variance);
}

function formatHourLabel(idx: number): string {
  return `${String(idx).padStart(2, '0')}:00`;
}

function formatTickHour(idx: number): string {
  if (idx === 23) return 'NOW';
  return `-${24 - idx}`;
}

const TICK_INDICES = [0, 6, 12, 18, 23];

type TooltipContentProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: number | string;
  avg24h: number;
};

function HeroTooltip({
  active,
  payload,
  label,
  avg24h,
}: TooltipContentProps) {
  if (!active || !payload || payload.length === 0 || label === undefined) {
    return null;
  }
  const price = payload[0].value;
  const diff = price - avg24h;
  const diffColor = diff >= 0 ? C.falconGold : C.electricBlue;
  const hourIdx = typeof label === 'number' ? label : Number(label);
  const hourText = Number.isFinite(hourIdx) ? formatTickHour(hourIdx) : String(label);

  return (
    <div
      style={{
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: '6px',
        padding: S.md,
        minWidth: 130,
      }}
    >
      <div
        style={{
          fontFamily: F.mono,
          fontSize: '9px',
          letterSpacing: '0.18em',
          color: C.textMuted,
          textTransform: 'uppercase',
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        HOUR {hourText}
      </div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: '14px',
          fontWeight: 600,
          color: C.textPrimary,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        ${price.toFixed(2)}/MWh
      </div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: '10px',
          color: diffColor,
          marginTop: 2,
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 600,
        }}
      >
        vs 24H AVG {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
      </div>
    </div>
  );
}

export function HeroLMPBlock() {
  const zoneKey = 'WEST_HUB';
  const zoneLabel = 'WEST HUB';
  const data = ZONE_LMP_DETAIL[zoneKey] ?? ZONE_LMP_DETAIL['DEFAULT'];
  const series = ZONE_24H_PRICES[zoneKey] ?? ZONE_24H_PRICES['DEFAULT'];

  const deltaColor = data.delta >= 0 ? C.falconGold : C.electricBlue;
  const daPrice = data.avg24h;
  const daRtSpread = data.price - daPrice;
  const regime = regimeFor(data.price);

  const maxIdx = series.indexOf(Math.max(...series));
  const minIdx = series.indexOf(Math.min(...series));
  const dayHigh = series[maxIdx];
  const dayLow = series[minIdx];
  const meanPrice = series.reduce((a, b) => a + b, 0) / series.length;
  const volatilityPct = (stdDev(series) / meanPrice) * 100;

  const chartData = series.map((price, hour) => ({ hour, price }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.lg }}>
      {/* Section A — Eyebrow row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: S.md,
          fontFamily: F.mono,
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        <span style={{ color: C.electricBlue }}>{zoneLabel}</span>
        <span style={{ color: C.textMuted, fontWeight: 400 }}>·</span>
        <span style={{ color: C.textMuted, fontWeight: 400 }}>14:22 ET</span>
        <span style={{ color: C.textMuted, fontWeight: 400 }}>·</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: C.alertNormal,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: C.alertNormal,
              display: 'inline-block',
            }}
          />
          LIVE
        </span>
      </div>

      {/* Section B — Hero number (unit superscript falls back to Falcon Gold @ 0.65) */}
      <HeroNumber value={data.price.toFixed(2)} unit="$/MWh" size={160} />

      {/* Section B′ — editorial identity line (GridAlpha voice) */}
      <div style={IDENTITY_LINE_HERO}>The settle.</div>

      {/* Section C — Context strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          gap: S.xl,
          fontFamily: F.mono,
          fontSize: '12px',
        }}
      >
        <ContextPair
          label="Δ vs −1H"
          value={`${data.delta >= 0 ? '+' : ''}${data.delta.toFixed(2)}`}
          valueColor={deltaColor}
        />
        <ContextPair label="24H AVG" value={data.avg24h.toFixed(2)} />
        <ContextPair label="DA" value={daPrice.toFixed(2)} />
        <ContextPair
          label="DA/RT SPREAD"
          value={`${daRtSpread >= 0 ? '+' : ''}${daRtSpread.toFixed(2)}`}
          valueColor={daRtSpread >= 0 ? C.falconGold : C.electricBlue}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: C.textMuted,
              textTransform: 'uppercase',
              fontWeight: 400,
            }}
          >
            REGIME
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: regime.color,
              padding: '2px 8px',
              borderRadius: '4px',
              border: `1px solid ${regime.color}`,
              textTransform: 'uppercase',
            }}
          >
            {regime.label}
          </span>
        </div>
      </div>

      {/* Section D — divider */}
      <div style={{ borderTop: `1px solid ${C.borderDefault}` }} />

      {/* Section E — Recharts sparkline */}
      <div style={{ width: '100%', height: 140 }}>
        <AnnotatableChart chartId="trader:hero-lmp:WEST_HUB">
        <ResponsiveContainer width="100%" height={140}>
          <LineChart
            data={chartData}
            margin={{ top: 16, right: 16, bottom: 24, left: 16 }}
          >
            <CartesianGrid
              horizontal
              vertical={false}
              strokeDasharray="2 4"
              stroke={C.borderDefault}
              opacity={0.2}
            />
            <XAxis
              dataKey="hour"
              type="number"
              domain={[0, 23]}
              ticks={TICK_INDICES}
              tickFormatter={(v) => formatTickHour(v as number)}
              axisLine={false}
              tickLine={false}
              tick={{ fill: C.textMuted, fontFamily: F.mono, fontSize: 9 }}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              cursor={{ stroke: C.borderDefault, strokeDasharray: '2 4' }}
              content={<HeroTooltip avg24h={data.avg24h} />}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={C.electricBlue}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 5,
                fill: C.falconGold,
                stroke: C.bgBase,
                strokeWidth: 2,
              }}
              isAnimationActive
              animationDuration={600}
            />
            <ReferenceDot
              x={maxIdx}
              y={dayHigh}
              r={4}
              fill={C.falconGold}
              stroke={C.bgBase}
              strokeWidth={1}
              ifOverflow="visible"
              label={{
                value: `H ${dayHigh.toFixed(2)} ${formatHourLabel(maxIdx)}`,
                position: 'top',
                fill: C.textMuted,
                fontFamily: F.mono,
                fontSize: 9,
                offset: 6,
              }}
            />
            <ReferenceDot
              x={minIdx}
              y={dayLow}
              r={4}
              fill={C.electricBlue}
              stroke={C.bgBase}
              strokeWidth={1}
              ifOverflow="visible"
              label={{
                value: `L ${dayLow.toFixed(2)} ${formatHourLabel(minIdx)}`,
                position: 'bottom',
                fill: C.textMuted,
                fontFamily: F.mono,
                fontSize: 9,
                offset: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
        </AnnotatableChart>
      </div>

      {/* Section F — day stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: S.lg,
        }}
      >
        <DayStat label="DAY HIGH" value={dayHigh.toFixed(2)} sub={formatHourLabel(maxIdx)} />
        <DayStat label="DAY LOW" value={dayLow.toFixed(2)} sub={formatHourLabel(minIdx)} />
        <DayStat label="VOLATILITY" value={`${volatilityPct.toFixed(1)}%`} sub="24H σ" />
      </div>

      {/* Section G — inline zone selector */}
      <div>
        <ZoneSelectorInline value={zoneKey} options={ZONE_OPTIONS} />
      </div>
    </div>
  );
}

function ContextPair({
  label,
  value,
  valueColor = C.textPrimary,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <span
        style={{
          fontSize: '10px',
          letterSpacing: '0.12em',
          color: C.textMuted,
          textTransform: 'uppercase',
          fontWeight: 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: valueColor,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function DayStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span
        style={{
          fontFamily: F.mono,
          fontSize: '10px',
          letterSpacing: '0.12em',
          color: C.textMuted,
          textTransform: 'uppercase',
          fontWeight: 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: F.mono,
          fontSize: '14px',
          color: C.textPrimary,
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 600,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: F.mono,
          fontSize: '10px',
          color: C.textMuted,
          fontWeight: 400,
        }}
      >
        {sub}
      </span>
    </div>
  );
}

function ZoneSelectorInline({
  value,
  options,
}: {
  value: string;
  options: { key: string; label: string }[];
}) {
  const current = options.find((o) => o.key === value)?.label ?? value;
  return (
    <button
      type="button"
      data-zone-selector
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
        fontFamily: F.mono,
        fontSize: '11px',
        letterSpacing: '0.08em',
        color: C.textMuted,
        fontWeight: 500,
        transition: 'color 150ms cubic-bezier(0.4,0,0.2,1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = C.falconGold;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = C.textMuted;
      }}
    >
      {current}
      <span aria-hidden style={{ fontSize: '8px', lineHeight: 1 }}>▾</span>
    </button>
  );
}

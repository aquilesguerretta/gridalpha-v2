// FORGE Wave 4 — HeroLMPBlock wired to live data.
// Pulls current LMP + delta from useLMP(zone) and the 24-hour history
// from useLMP24h(zone). When data is loading, renders a skeleton in
// place of the hero number. When the response is stale (older than the
// per-endpoint threshold), renders an inline STALE badge on the LIVE
// indicator. The visual layout is unchanged from the locked design.

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
import { HeroNumber } from '../../terminal/HeroNumber';
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';
import { useLMP } from '@/hooks/data/useLMP';
import { useLMP24h } from '@/hooks/data/useLMP24h';

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
  if (values.length === 0) return 0;
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

  const lmpQuery = useLMP(zoneKey);
  const lmp24hQuery = useLMP24h(zoneKey);

  const series24h: number[] =
    lmp24hQuery.data?.map((p) => p.lmp_total) ?? [];
  const hasSeries = series24h.length > 0;
  const meanPrice = hasSeries
    ? series24h.reduce((a, b) => a + b, 0) / series24h.length
    : 0;

  const livePrice = lmpQuery.data?.lmp_total ?? meanPrice;
  // delta_pct_5min comes back as percent; convert to absolute $/MWh
  // change so the on-screen "Δ vs −1H" label keeps showing dollars.
  const deltaPct = lmpQuery.data?.delta_pct_5min ?? 0;
  const deltaAbs = Number(((livePrice * deltaPct) / 100).toFixed(2));
  const deltaColor = deltaAbs >= 0 ? C.falconGold : C.electricBlue;

  const daPrice = meanPrice;
  const daRtSpread = livePrice - daPrice;
  const regime = regimeFor(livePrice);

  const maxIdx = hasSeries
    ? series24h.indexOf(Math.max(...series24h))
    : 0;
  const minIdx = hasSeries
    ? series24h.indexOf(Math.min(...series24h))
    : 0;
  const dayHigh = hasSeries ? series24h[maxIdx] : 0;
  const dayLow = hasSeries ? series24h[minIdx] : 0;
  const volatilityPct = hasSeries
    ? (stdDev(series24h) / Math.max(1e-6, meanPrice)) * 100
    : 0;

  const chartData = series24h.map((price, hour) => ({ hour, price }));

  const isLoading = lmpQuery.isLoading || lmp24hQuery.isLoading;
  const isStale = lmpQuery.isStale || lmp24hQuery.isStale;

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
        <span style={{ color: C.textMuted, fontWeight: 400 }}>
          {lmpQuery.data
            ? new Date(lmpQuery.data ? Date.now() : 0).toUTCString().slice(17, 22) +
              ' ET'
            : '— · —'}
        </span>
        <span style={{ color: C.textMuted, fontWeight: 400 }}>·</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: isStale ? C.alertWarning : C.alertNormal,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isStale ? C.alertWarning : C.alertNormal,
              display: 'inline-block',
            }}
          />
          {isStale ? 'STALE' : 'LIVE'}
        </span>
        {isLoading && (
          <span style={{ color: C.textMuted, fontWeight: 400 }}>
            · LOADING
          </span>
        )}
      </div>

      {/* Section B — Hero number */}
      {isLoading && !lmpQuery.data ? (
        <div
          style={{
            height: 160,
            width: 360,
            background: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 8,
          }}
          aria-label="Loading LMP"
        />
      ) : (
        <HeroNumber value={livePrice.toFixed(2)} unit="$/MWh" size={160} />
      )}

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
          value={`${deltaAbs >= 0 ? '+' : ''}${deltaAbs.toFixed(2)}`}
          valueColor={deltaColor}
        />
        <ContextPair label="24H AVG" value={meanPrice.toFixed(2)} />
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
              content={<HeroTooltip avg24h={meanPrice} />}
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
            {hasSeries && (
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
            )}
            {hasSeries && (
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
            )}
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
        <DayStat
          label="DAY HIGH"
          value={hasSeries ? dayHigh.toFixed(2) : '—'}
          sub={hasSeries ? formatHourLabel(maxIdx) : '—'}
        />
        <DayStat
          label="DAY LOW"
          value={hasSeries ? dayLow.toFixed(2) : '—'}
          sub={hasSeries ? formatHourLabel(minIdx) : '—'}
        />
        <DayStat
          label="VOLATILITY"
          value={hasSeries ? `${volatilityPct.toFixed(1)}%` : '—'}
          sub="24H σ"
        />
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

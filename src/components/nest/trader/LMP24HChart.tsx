import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { C, F, R, S } from '@/design/tokens';
import { useHoverState } from '../../terminal/useHoverState';
import { Skeleton } from '../../terminal/Skeleton';
import { StaleBadge } from '../../terminal/StaleBadge';
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';
import { useLMP24h } from '@/hooks/data/useLMP24h';

// Hour labels: -24H, -23H, ..., -1H, NOW (24-point series)
function formatHour(idx: number): string {
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

function ChartTooltip({
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
  const hourText = Number.isFinite(hourIdx) ? formatHour(hourIdx) : String(label);

  return (
    <div
      style={{
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: R.md,
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

export function LMP24HChart() {
  const zone = 'WEST_HUB';
  const lmp24h = useLMP24h(zone);
  const series: number[] = lmp24h.data?.map((p) => p.lmp_total) ?? [];
  // Re-index by hour-ordinal so the chart keeps its -24/-18/-12/-6/NOW
  // X-axis labels. The 24-element response is already in chronological
  // order (oldest → newest), so the ordinal IS the hour-position label.
  const data = series.map((price, hour) => ({ hour, price }));
  const avg24h =
    series.length > 0
      ? series.reduce((a, b) => a + b, 0) / series.length
      : 0;

  const hover = useHoverState();
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    background: C.bgElevated,
    border: `1px solid ${C.borderDefault}`,
    borderTop: `1px solid ${
      hover.hovered ? 'rgba(59,130,246,0.40)' : 'rgba(59,130,246,0.20)'
    }`,
    borderRadius: R.lg,
    padding: S.lg,
    minHeight: '360px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'border-top-color 200ms cubic-bezier(0.4,0,0.2,1)',
  };

  // CHROMA Wave 4 — first-fetch skeleton, top-right stale badge.
  const showSkeleton = lmp24h.isLoading && !lmp24h.data;

  return (
    <div style={cardStyle} {...hover.bind}>
      {lmp24h.isStale && !showSkeleton && (
        <StaleBadge ageSeconds={lmp24h.ageSeconds} />
      )}
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: S.md,
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
          PJM WEST · LMP · 24H
        </span>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '11px',
            color: 'rgba(245,158,11,0.65)',
            letterSpacing: '0.08em',
            fontWeight: 500,
          }}
        >
          $/MWh
        </span>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 280 }}>
        {showSkeleton ? (
          <Skeleton.Chart height={280} label="Loading 24h LMP" />
        ) : (
        <AnnotatableChart chartId="trader:lmp-24h:WEST_HUB">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, bottom: 24, left: 32 }}
          >
            <CartesianGrid
              horizontal
              vertical={false}
              strokeDasharray="2 4"
              stroke={C.borderDefault}
              opacity={0.4}
            />
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
              width={32}
              tick={{ fill: C.textMuted, fontFamily: F.mono, fontSize: 10 }}
              tickFormatter={(v) => (v as number).toFixed(0)}
            />
            <Tooltip
              cursor={{ stroke: C.borderDefault, strokeDasharray: '2 4' }}
              content={<ChartTooltip avg24h={avg24h} />}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={C.electricBlue}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: C.electricBlue,
                stroke: C.bgBase,
                strokeWidth: 2,
              }}
              isAnimationActive
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
        </AnnotatableChart>
        )}
      </div>
    </div>
  );
}

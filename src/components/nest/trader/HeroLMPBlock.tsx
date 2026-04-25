import { C, F, S } from '@/design/tokens';
import { ZONE_LMP_DETAIL, ZONE_24H_PRICES } from '../../../lib/pjm/mock-data';
import { HeroNumber } from '../../terminal/HeroNumber';

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

// Catmull-Rom → cubic Bézier path for visual smoothing.
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

function stdDev(values: number[]): number {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  return Math.sqrt(variance);
}

function formatHour(idx: number): string {
  return `${String(idx).padStart(2, '0')}:00`;
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

  // Day stats from the real series
  const maxIdx = series.indexOf(Math.max(...series));
  const minIdx = series.indexOf(Math.min(...series));
  const dayHigh = series[maxIdx];
  const dayLow = series[minIdx];
  const meanPrice = series.reduce((a, b) => a + b, 0) / series.length;
  const volatilityPct = (stdDev(series) / meanPrice) * 100;

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
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: C.electricBlue }}>{zoneLabel}</span>
        <span style={{ color: C.textMuted }}>·</span>
        <span style={{ color: C.textMuted }}>14:22 ET</span>
        <span style={{ color: C.textMuted }}>·</span>
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

      {/* Section B — Hero number */}
      <HeroNumber value={data.price.toFixed(2)} unit="$/MWh" size={120} />

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
            }}
          >
            REGIME
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.14em',
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
      <div
        style={{
          borderTop: `1px solid ${C.borderDefault}`,
          marginTop: 0,
        }}
      />

      {/* Section E — inline 24H sparkline */}
      <HeroSparkline
        series={series}
        maxIdx={maxIdx}
        minIdx={minIdx}
        dayHigh={dayHigh}
        dayLow={dayLow}
      />

      {/* Section F — day stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: S.lg,
        }}
      >
        <DayStat label="DAY HIGH" value={dayHigh.toFixed(2)} sub={formatHour(maxIdx)} />
        <DayStat label="DAY LOW" value={dayLow.toFixed(2)} sub={formatHour(minIdx)} />
        <DayStat label="VOLATILITY" value={`${volatilityPct.toFixed(1)}%`} sub="24H σ" />
      </div>

      {/* Section G — inline zone selector (Bloomberg style) */}
      <div>
        <ZoneSelectorInline
          value={zoneKey}
          options={ZONE_OPTIONS}
        />
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
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: F.mono,
          fontSize: '10px',
          color: C.textMuted,
        }}
      >
        {sub}
      </span>
    </div>
  );
}

function HeroSparkline({
  series,
  maxIdx,
  minIdx,
  dayHigh,
  dayLow,
}: {
  series: number[];
  maxIdx: number;
  minIdx: number;
  dayHigh: number;
  dayLow: number;
}) {
  const W = 1000; // viewBox width — scaled by preserveAspectRatio
  const H = 140;
  const padX = 8;
  const padTop = 16;
  const padBottom = 22;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stepX = innerW / (series.length - 1);

  const points = series.map((v, i) => ({
    x: padX + i * stepX,
    y: padTop + innerH - ((v - min) / range) * innerH,
  }));

  const d = smoothPath(points);

  const gridYs = [padTop, padTop + innerH / 2, padTop + innerH];

  // X-axis labels: -24H, -18, -12, -6, NOW (5 markers across 24 hours of data)
  const xLabels: { x: number; label: string }[] = [
    { x: padX, label: '-24H' },
    { x: padX + innerW * 0.25, label: '-18' },
    { x: padX + innerW * 0.5, label: '-12' },
    { x: padX + innerW * 0.75, label: '-6' },
    { x: padX + innerW, label: 'NOW' },
  ];

  const maxPoint = points[maxIdx];
  const minPoint = points[minIdx];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: '140px', display: 'block' }}
    >
      {/* Grid */}
      {gridYs.map((y, i) => (
        <line
          key={i}
          x1={padX}
          x2={W - padX}
          y1={y}
          y2={y}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
          strokeDasharray="2 4"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Path */}
      <path
        d={d}
        fill="none"
        stroke={C.electricBlue}
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />

      {/* Min/max dots */}
      <circle cx={maxPoint.x} cy={maxPoint.y} r={4} fill={C.electricBlue} stroke={C.bgBase} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <circle cx={minPoint.x} cy={minPoint.y} r={4} fill={C.electricBlue} stroke={C.bgBase} strokeWidth={1} vectorEffect="non-scaling-stroke" />

      {/* Inline extrema labels — placed inside the SVG so they scale with viewBox */}
      <text
        x={maxPoint.x + 8}
        y={maxPoint.y - 6}
        fill={C.textMuted}
        style={{ fontFamily: F.mono, fontSize: '10px' }}
      >
        H {dayHigh.toFixed(2)} {formatHour(maxIdx)}
      </text>
      <text
        x={minPoint.x + 8}
        y={minPoint.y + 14}
        fill={C.textMuted}
        style={{ fontFamily: F.mono, fontSize: '10px' }}
      >
        L {dayLow.toFixed(2)} {formatHour(minIdx)}
      </text>

      {/* X-axis labels */}
      {xLabels.map((m, i) => (
        <text
          key={i}
          x={m.x}
          y={H - 4}
          fill={C.textMuted}
          textAnchor={i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'}
          style={{ fontFamily: F.mono, fontSize: '10px' }}
        >
          {m.label}
        </text>
      ))}
    </svg>
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
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = C.textPrimary;
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

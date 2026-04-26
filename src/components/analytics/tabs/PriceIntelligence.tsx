// ATLAS — Analytics: PRICE INTELLIGENCE
// Self-contained tab. Reads from analytics-mock.ts.

import {
  AreaChart,
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { MetricTile } from '@/components/terminal/MetricTile';
import { DataTable, type ColumnDef } from '@/components/terminal/DataTable';
import {
  PRICE_COMPONENTS_BREAKDOWN,
  PRICE_INTELLIGENCE_KPIS,
  PRICE_INTELLIGENCE_OVERLAY,
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
      'radial-gradient(ellipse at top, rgba(59,130,246,0.05) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(245,158,11,0.03) 0%, transparent 60%)',
    pointerEvents: 'none' as const,
    zIndex: 0,
  };
}

interface OverlayTooltipPayload {
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
  payload?: OverlayTooltipPayload[];
  label?: number | string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const hourIdx = typeof label === 'number' ? label : Number(label);
  return (
    <div
      style={{
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: R.md,
        padding: S.md,
        minWidth: 160,
      }}
    >
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 9,
          letterSpacing: '0.18em',
          color: C.textMuted,
          textTransform: 'uppercase',
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        HOUR {Number.isFinite(hourIdx) ? formatHour(hourIdx) : String(label)}
      </div>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: S.md,
            fontFamily: F.mono,
            fontSize: 12,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span style={{ color: p.color, letterSpacing: '0.06em' }}>{p.dataKey}</span>
          <span style={{ color: C.textPrimary, fontWeight: 600 }}>
            ${p.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface ComponentsTooltipPayload {
  value: number;
  dataKey: string;
  color: string;
}

function ComponentsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ComponentsTooltipPayload[];
  label?: number | string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const hourIdx = typeof label === 'number' ? label : Number(label);
  const total = payload.reduce((sum, p) => sum + p.value, 0);
  return (
    <div
      style={{
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: R.md,
        padding: S.md,
        minWidth: 180,
      }}
    >
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 9,
          letterSpacing: '0.18em',
          color: C.textMuted,
          textTransform: 'uppercase',
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        HOUR {Number.isFinite(hourIdx) ? formatHour(hourIdx) : String(label)}
      </div>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: S.md,
            fontFamily: F.mono,
            fontSize: 12,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span style={{ color: p.color, letterSpacing: '0.04em' }}>
            {p.dataKey.toUpperCase()}
          </span>
          <span style={{ color: C.textPrimary, fontWeight: 600 }}>
            ${p.value.toFixed(2)}
          </span>
        </div>
      ))}
      <div
        style={{
          marginTop: 6,
          paddingTop: 6,
          borderTop: `1px solid ${C.borderDefault}`,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: F.mono,
          fontSize: 12,
          fontVariantNumeric: 'tabular-nums',
          color: C.falconGold,
          fontWeight: 700,
        }}
      >
        <span style={{ letterSpacing: '0.04em' }}>LMP</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

function avg(arr: number[]): number {
  return arr.reduce((s, n) => s + n, 0) / arr.length;
}

function stddev(arr: number[]): number {
  const m = avg(arr);
  const v = avg(arr.map((n) => (n - m) ** 2));
  return Math.sqrt(v);
}

interface ZoneRow {
  zone: string;
  avg: string;
  max: string;
  min: string;
  vol: string;
  congestion: string;
}

function buildZoneRows(): ZoneRow[] {
  const a = PRICE_INTELLIGENCE_OVERLAY.zoneA;
  const b = PRICE_INTELLIGENCE_OVERLAY.zoneB;

  // Two real series + four derived zones (deterministic offsets) to fill the table.
  const synthOffsets: Array<{ key: string; o: number; cong: number }> = [
    { key: 'COMED',     o: -3.4, cong: 0.4  },
    { key: 'AEP',       o: -1.8, cong: 0.9  },
    { key: 'DOMINION',  o:  2.1, cong: 1.6  },
    { key: 'BGE',       o:  0.8, cong: 1.2  },
  ];

  const baseRows: ZoneRow[] = [a, b].map((s) => ({
    zone:       s.label,
    avg:        avg(s.prices24h).toFixed(2),
    max:        Math.max(...s.prices24h).toFixed(2),
    min:        Math.min(...s.prices24h).toFixed(2),
    vol:        stddev(s.prices24h).toFixed(2),
    congestion: (s.label === 'PSEG' ? 1.8 : 1.1).toFixed(2),
  }));

  const synthRows: ZoneRow[] = synthOffsets.map(({ key, o, cong }) => {
    const prices = a.prices24h.map((p) => p + o);
    return {
      zone:       key,
      avg:        avg(prices).toFixed(2),
      max:        Math.max(...prices).toFixed(2),
      min:        Math.min(...prices).toFixed(2),
      vol:        stddev(prices).toFixed(2),
      congestion: cong.toFixed(2),
    };
  });

  return [...baseRows, ...synthRows];
}

const ZONE_COLUMNS: ColumnDef[] = [
  { key: 'zone',       label: 'Zone',       align: 'left'  },
  { key: 'avg',        label: 'Avg LMP',    align: 'right' },
  { key: 'max',        label: 'Max LMP',    align: 'right' },
  { key: 'min',        label: 'Min LMP',    align: 'right' },
  { key: 'vol',        label: 'Volatility', align: 'right' },
  { key: 'congestion', label: 'Congestion', align: 'right' },
];

export default function PriceIntelligence() {
  const overlayData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    PSEG:     PRICE_INTELLIGENCE_OVERLAY.zoneA.prices24h[hour],
    WEST_HUB: PRICE_INTELLIGENCE_OVERLAY.zoneB.prices24h[hour],
  }));

  const componentsData = PRICE_COMPONENTS_BREAKDOWN.map((p) => ({
    hour:       p.hour,
    energy:     p.energy,
    congestion: p.congestion,
    loss:       p.loss,
  }));

  const zoneRows = buildZoneRows();

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
            PRICE DISCOVERY
          </div>
          <EditorialIdentity size="hero">Price discovery.</EditorialIdentity>
        </div>

        {/* KPI strip */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap:                 S.md,
            marginBottom:        S.xl,
          }}
        >
          <MetricTile
            label="System Avg LMP"
            value={`$${PRICE_INTELLIGENCE_KPIS.systemAvgLmp.toFixed(2)}`}
            unit="$/MWh"
            sub="Across all PJM zones"
          />
          <MetricTile
            label="Max LMP"
            value={`$${PRICE_INTELLIGENCE_KPIS.maxLmp.toFixed(2)}`}
            unit="$/MWh"
            sub="Peak hour"
            regime="burning"
          />
          <MetricTile
            label="Min LMP"
            value={`$${PRICE_INTELLIGENCE_KPIS.minLmp.toFixed(2)}`}
            unit="$/MWh"
            sub="Overnight trough"
          />
          <MetricTile
            label="Most Congested"
            value={PRICE_INTELLIGENCE_KPIS.mostCongestedZone}
            sub="Highest basis vs hub"
            regime="scarcity"
          />
        </div>

        {/* Multi-zone overlay */}
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
              ZONAL LMP · 24H · PSEG vs WEST_HUB
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overlayData} margin={{ top: 8, right: 16, bottom: 24, left: 32 }}>
                <CartesianGrid
                  horizontal
                  vertical={false}
                  strokeDasharray="2 4"
                  stroke={C.borderDefault}
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
                  width={36}
                  tick={{ fill: C.textMuted, fontFamily: F.mono, fontSize: 10 }}
                  tickFormatter={(v) => (v as number).toFixed(0)}
                />
                <Tooltip
                  cursor={{ stroke: C.borderDefault, strokeDasharray: '2 4' }}
                  content={<OverlayTooltip />}
                />
                <Line
                  type="monotone"
                  dataKey="PSEG"
                  stroke={C.electricBlue}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="WEST_HUB"
                  stroke={C.falconGold}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ContainedCard>

        {/* Components breakdown */}
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
              LMP COMPONENTS · ENERGY · CONGESTION · LOSS
            </span>
            <div style={{ display: 'flex', gap: S.md, alignItems: 'center' }}>
              <LegendChip color={C.electricBlue} label="ENERGY" />
              <LegendChip color={C.falconGold}   label="CONGESTION" />
              <LegendChip color={C.alertNormal}  label="LOSS" />
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={componentsData} margin={{ top: 8, right: 16, bottom: 24, left: 32 }}>
                <CartesianGrid
                  horizontal
                  vertical={false}
                  strokeDasharray="2 4"
                  stroke={C.borderDefault}
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
                  width={36}
                  tick={{ fill: C.textMuted, fontFamily: F.mono, fontSize: 10 }}
                  tickFormatter={(v) => (v as number).toFixed(0)}
                />
                <Tooltip
                  cursor={{ stroke: C.borderDefault, strokeDasharray: '2 4' }}
                  content={<ComponentsTooltip />}
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  stackId="lmp"
                  stroke={C.electricBlue}
                  fill={C.electricBlue}
                  fillOpacity={0.32}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="congestion"
                  stackId="lmp"
                  stroke={C.falconGold}
                  fill={C.falconGold}
                  fillOpacity={0.32}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="loss"
                  stackId="lmp"
                  stroke={C.alertNormal}
                  fill={C.alertNormal}
                  fillOpacity={0.32}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ContainedCard>

        {/* Zone-by-zone table */}
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
            ZONE-BY-ZONE · 24H STATISTICS
          </div>
          <DataTable columns={ZONE_COLUMNS} rows={zoneRows} />
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

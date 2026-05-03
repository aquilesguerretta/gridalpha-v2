// FORGE Wave 3 — 24-hour bid curve chart.
// Bars colored by action (charge / discharge / ancillary / idle).
// LMP overlay line. Wrapped in AnnotatableChart so operators can
// pin notes to specific hours of the bid plan.

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';
import type { AssetResult, BidAction } from '@/lib/types/storage';

interface Props {
  assetResult: AssetResult;
}

// CHROMA Wave 3 — bid actions mapped onto the platform's accent system.
// charge    → electricBlueLight (energy flowing in)
// discharge → falconGold (the profit moment, matches "$ revenue" everywhere)
// ancillary → alertNormal (extra-revenue grid service, reads as "good")
// idle      → very low alpha white (recedes)
const ACTION_COLOR: Record<BidAction, string> = {
  charge: C.electricBlueLight,
  discharge: C.falconGold,
  ancillary: C.alertNormal,
  idle: 'rgba(255,255,255,0.05)',
};

const ACTION_LABEL: Record<BidAction, string> = {
  charge: 'CHARGE',
  discharge: 'DISCHARGE',
  ancillary: 'ANCILLARY',
  idle: 'IDLE',
};

export function BidCurveChart({ assetResult }: Props) {
  const data = assetResult.bidCurve.map((b) => ({
    hour: `${String(b.hour).padStart(2, '0')}`,
    mw: Number(b.mwBid.toFixed(2)),
    lmp: Number(b.lmp.toFixed(2)),
    action: b.action,
    revenue: Number(b.expectedRevenueUSD.toFixed(0)),
  }));

  return (
    <ContainedCard padding={S.lg}>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: C.electricBlueLight,
          marginBottom: S.md,
        }}
      >
        BID CURVE · 24 HOURS · {assetResult.asset.name}
      </div>

      <AnnotatableChart
        chartId={`storage-bid-curve-${assetResult.asset.id}`}
      >
        <div style={{ height: 260 }}>
          <ResponsiveContainer>
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
            >
              <CartesianGrid stroke={C.borderDefault} vertical={false} />
              <XAxis
                dataKey="hour"
                stroke={C.textMuted}
                tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
                tickMargin={6}
                interval={2}
              />
              <YAxis
                yAxisId="mw"
                stroke={C.textMuted}
                tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
                tickFormatter={(v: number) => `${v.toFixed(0)}`}
                width={40}
              />
              <YAxis
                yAxisId="lmp"
                orientation="right"
                stroke={C.textMuted}
                tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
                tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                width={50}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{
                  background: C.bgElevated,
                  border: `1px solid ${C.borderStrong}`,
                  borderRadius: R.md,
                  fontFamily: F.mono,
                  fontSize: 12,
                  color: C.textPrimary,
                }}
                labelStyle={{ color: C.textMuted }}
                formatter={(value, name) => {
                  const n = typeof value === 'number' ? value : Number(value);
                  if (name === 'mw') return [`${n.toFixed(2)} MW`, 'Bid'];
                  if (name === 'lmp') return [`$${n.toFixed(2)}/MWh`, 'LMP'];
                  return [String(n), String(name)];
                }}
              />
              <Bar yAxisId="mw" dataKey="mw" radius={[2, 2, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={ACTION_COLOR[d.action]} />
                ))}
              </Bar>
              <Line
                yAxisId="lmp"
                type="monotone"
                dataKey="lmp"
                stroke={C.electricBlue}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </AnnotatableChart>

      {/* Legend */}
      <div
        style={{
          marginTop: S.sm,
          display: 'flex',
          gap: S.lg,
          flexWrap: 'wrap',
        }}
      >
        {(Object.keys(ACTION_COLOR) as BidAction[]).map((a) => (
          <span
            key={a}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: F.mono,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: C.textSecondary,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                background: ACTION_COLOR[a],
                borderRadius: 2,
              }}
            />
            {ACTION_LABEL[a]}
          </span>
        ))}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: F.mono,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: C.textSecondary,
            marginLeft: 'auto',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 16,
              height: 2,
              background: C.electricBlue,
            }}
          />
          LMP $/MWh
        </span>
      </div>
    </ContainedCard>
  );
}

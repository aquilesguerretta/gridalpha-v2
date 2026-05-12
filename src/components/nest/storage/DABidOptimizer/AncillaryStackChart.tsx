// FORGE Wave 3 — Ancillary stack timeline.
// Bar chart of MW reserved per hour with the ancillary clearing-price
// line overlaid. Idle hours (no reservation) appear as zero-height bars.
// Wrapped in AnnotatableChart.

import {
  Bar,
  CartesianGrid,
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
import type { AssetResult } from '@/lib/types/storage';

interface Props {
  assetResult: AssetResult;
}

export function AncillaryStackChart({ assetResult }: Props) {
  const { asset, bidCurve } = assetResult;

  if (!asset.ancillaryEnabled) {
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
          ANCILLARY STACK
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 13,
            color: C.textMuted,
          }}
        >
          Ancillary services not enabled for this asset. Enable in the
          Asset Registration form to stack reg-D / reg-A / synchronized
          reserve revenue on top of energy arbitrage.
        </div>
      </ContainedCard>
    );
  }

  const data = bidCurve.map((b) => ({
    hour: `${String(b.hour).padStart(2, '0')}`,
    reservedMW: b.action === 'ancillary' ? Number(b.mwBid.toFixed(2)) : 0,
    mcp: Number(b.ancillaryMCP.toFixed(2)),
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
        ANCILLARY STACK · {asset.ancillaryService?.toUpperCase()}
      </div>

      <AnnotatableChart
        chartId={`storage-ancillary-${assetResult.asset.id}`}
      >
        <div style={{ height: 200 }}>
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
                yAxisId="mcp"
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
                  if (name === 'reservedMW')
                    return [`${n.toFixed(2)} MW`, 'Reserved'];
                  if (name === 'mcp')
                    return [`$${n.toFixed(2)}/MW`, 'MCP'];
                  return [String(n), String(name)];
                }}
              />
              <Bar
                yAxisId="mw"
                dataKey="reservedMW"
                fill={C.alertNormal}
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="mcp"
                type="monotone"
                dataKey="mcp"
                stroke={C.falconGold}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </AnnotatableChart>
    </ContainedCard>
  );
}

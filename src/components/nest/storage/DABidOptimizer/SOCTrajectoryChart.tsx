// FORGE Wave 3 — State-of-charge trajectory chart.
// Line chart of SOC fraction over the 24-hour plan, with reference
// lines for the asset's socMin and socMax. Wrapped in AnnotatableChart.

import {
  CartesianGrid,
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
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';
import type { AssetResult } from '@/lib/types/storage';

interface Props {
  assetResult: AssetResult;
}

export function SOCTrajectoryChart({ assetResult }: Props) {
  const { asset, socTrajectory } = assetResult;
  const data = socTrajectory.map((soc, hour) => ({
    hour,
    socPct: Number((soc * 100).toFixed(1)),
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
        STATE OF CHARGE · 24 HOURS
      </div>

      <AnnotatableChart chartId={`storage-soc-${assetResult.asset.id}`}>
        <div style={{ height: 220 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <CartesianGrid stroke={C.borderDefault} vertical={false} />
              <XAxis
                dataKey="hour"
                stroke={C.textMuted}
                tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
                tickFormatter={(v: number) =>
                  `${String(v).padStart(2, '0')}`
                }
                interval={2}
              />
              <YAxis
                stroke={C.textMuted}
                tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                domain={[0, 100]}
                width={45}
              />
              <ReferenceLine
                y={asset.socMin * 100}
                stroke={C.alertCritical}
                strokeDasharray="4 4"
                label={{
                  value: 'MIN',
                  position: 'insideBottomRight',
                  fill: C.alertCritical,
                  fontFamily: F.mono,
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={asset.socMax * 100}
                stroke={C.alertNormal}
                strokeDasharray="4 4"
                label={{
                  value: 'MAX',
                  position: 'insideTopRight',
                  fill: C.alertNormal,
                  fontFamily: F.mono,
                  fontSize: 10,
                }}
              />
              <Tooltip
                contentStyle={{
                  background: C.bgElevated,
                  border: `1px solid ${C.borderStrong}`,
                  borderRadius: R.md,
                  fontFamily: F.mono,
                  fontSize: 12,
                  color: C.textPrimary,
                }}
                labelStyle={{ color: C.textMuted }}
                formatter={(value) => {
                  const n = typeof value === 'number' ? value : Number(value);
                  return [`${n.toFixed(1)}%`, 'SOC'];
                }}
              />
              <Line
                type="monotone"
                dataKey="socPct"
                stroke={C.electricBlue}
                strokeWidth={2}
                dot={{ r: 3, fill: C.electricBlue }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </AnnotatableChart>
    </ContainedCard>
  );
}

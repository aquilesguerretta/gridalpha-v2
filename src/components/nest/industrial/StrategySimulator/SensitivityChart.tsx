// FORGE Wave 2 — Sensitivity bar chart.
// Shows base / optimistic / pessimistic NPV side-by-side. Wraps in
// AnnotatableChart so the user can drop dots on individual bars during
// strategy review.

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';
import type { StrategyResult } from '@/lib/types/simulator';

interface Props {
  result: StrategyResult;
}

function formatUSDLong(v: number): string {
  const sign = v < 0 ? '−' : '';
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function SensitivityChart({ result }: Props) {
  const data = [
    {
      name: 'Pessimistic',
      npv: Math.round(result.scenarios.pessimistic.npvUSD),
      color: C.alertCritical,
    },
    {
      name: 'Base',
      npv: Math.round(result.scenarios.base.npvUSD),
      color: C.electricBlue,
    },
    {
      name: 'Optimistic',
      npv: Math.round(result.scenarios.optimistic.npvUSD),
      color: C.alertNormal,
    },
  ];

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
        SENSITIVITY · 10-YR NPV RANGE
      </div>

      <AnnotatableChart
        chartId={`industrial-sim-sensitivity-${result.strategy.id}`}
      >
        <div style={{ height: 220 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <CartesianGrid stroke={C.borderDefault} vertical={false} />
              <XAxis
                dataKey="name"
                stroke={C.textMuted}
                tick={{ fontFamily: F.mono, fontSize: 11, fill: C.textMuted }}
                tickMargin={6}
              />
              <YAxis
                stroke={C.textMuted}
                tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
                tickFormatter={(v: number) => formatUSDLong(v)}
                width={60}
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
                formatter={(value) => {
                  const n = typeof value === 'number' ? value : Number(value);
                  return [formatUSDLong(n), 'NPV'];
                }}
              />
              <Bar dataKey="npv" radius={[3, 3, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnnotatableChart>
    </ContainedCard>
  );
}

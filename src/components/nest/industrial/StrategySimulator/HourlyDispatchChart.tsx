// FORGE Wave 2 — Hourly dispatch stacked area chart.
// Shows the representative day's load served from each source: solar,
// battery, diesel, grid. Wrapped in AnnotatableChart so users can mark
// the moments where battery comes online or diesel kicks in.

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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

export function HourlyDispatchChart({ result }: Props) {
  const data = result.hourlyDispatch.map((h) => ({
    hour: `${String(h.hour).padStart(2, '0')}:00`,
    Solar: Number(h.solarMW.toFixed(2)),
    Battery: Number(h.batteryDispatchMW.toFixed(2)),
    Grid: Number(h.gridDispatchMW.toFixed(2)),
    Diesel: Number(h.dieselDispatchMW.toFixed(2)),
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
        HOURLY DISPATCH · REPRESENTATIVE SUMMER DAY
      </div>

      <AnnotatableChart
        chartId={`industrial-sim-dispatch-${result.strategy.id}`}
      >
        <div style={{ height: 260 }}>
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
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
                stroke={C.textMuted}
                tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
                tickFormatter={(v: number) => `${v.toFixed(0)}`}
                width={40}
                label={{
                  value: 'MW',
                  position: 'insideTopLeft',
                  fill: C.textMuted,
                  fontFamily: F.mono,
                  fontSize: 10,
                  offset: 0,
                }}
              />
              <Tooltip
                cursor={{ stroke: C.borderStrong, strokeWidth: 1 }}
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
                  return [`${n.toFixed(2)} MW`, String(name)];
                }}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: F.mono,
                  fontSize: 11,
                  color: C.textSecondary,
                }}
              />
              <Area
                type="monotone"
                dataKey="Solar"
                stackId="1"
                stroke={C.fuelSolar}
                fill={C.fuelSolar}
                fillOpacity={0.35}
              />
              <Area
                type="monotone"
                dataKey="Battery"
                stackId="1"
                stroke={C.fuelBattery}
                fill={C.fuelBattery}
                fillOpacity={0.35}
              />
              <Area
                type="monotone"
                dataKey="Grid"
                stackId="1"
                stroke={C.electricBlue}
                fill={C.electricBlue}
                fillOpacity={0.35}
              />
              <Area
                type="monotone"
                dataKey="Diesel"
                stackId="1"
                stroke={C.fuelGas}
                fill={C.fuelGas}
                fillOpacity={0.35}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </AnnotatableChart>
    </ContainedCard>
  );
}

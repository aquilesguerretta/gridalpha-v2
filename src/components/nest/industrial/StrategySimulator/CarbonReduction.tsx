// FORGE Wave 2 — Carbon reduction display.
// Hero number for total tons CO₂ avoided over 10 years vs baseline,
// equivalence sub-line, plus a small cumulative-reduction line chart
// (linear approximation since annual reduction is constant in V1).

import {
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
import { HeroNumber } from '@/components/terminal/HeroNumber';
import type { StrategyResult } from '@/lib/types/simulator';

interface Props {
  result: StrategyResult;
}

/**
 * EPA-style equivalences for context.
 * - 1 metric ton CO₂ ≈ 0.217 cars off the road for a year (avg passenger car ~4.6 t CO₂/yr)
 * - 1 metric ton CO₂ ≈ 16.5 mature trees absorbing for a year (~60 kg/tree/yr)
 */
function carEquivalent(tons: number): number {
  return tons / 4.6;
}

function treeEquivalent(tons: number): number {
  return (tons * 1000) / 60;
}

function formatTons(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toFixed(0);
}

export function CarbonReduction({ result }: Props) {
  const total = result.carbonReductionTons10Yr;
  const annual = total / 10;
  const data = Array.from({ length: 11 }, (_, i) => ({
    year: i,
    cumulative: Number((annual * i).toFixed(1)),
  }));

  const positive = total > 0;
  const heroColor = positive
    ? C.alertNormal
    : total < 0
      ? C.alertCritical
      : C.textPrimary;

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
        CARBON REDUCTION · 10-YR vs BASELINE
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: S.lg,
          alignItems: 'start',
        }}
      >
        <div>
          <HeroNumber
            value={formatTons(Math.abs(total))}
            unit="t CO₂"
            size={56}
            color={heroColor}
          />
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textMuted,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              marginTop: S.sm,
            }}
          >
            {positive
              ? '↓ avoided over 10 years'
              : total < 0
                ? '↑ added over 10 years'
                : 'no change'}
          </div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 12,
              color: C.textSecondary,
              marginTop: S.lg,
            }}
          >
            ≈ {Math.round(carEquivalent(Math.abs(annual))).toLocaleString()}{' '}
            cars off the road
          </div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 12,
              color: C.textSecondary,
              marginTop: 4,
            }}
          >
            ≈ {Math.round(treeEquivalent(Math.abs(annual))).toLocaleString()}{' '}
            trees·yr equivalents
          </div>
        </div>

        <div style={{ height: 180 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <CartesianGrid stroke={C.borderDefault} vertical={false} />
              <XAxis
                dataKey="year"
                stroke={C.textMuted}
                tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
                tickFormatter={(v: number) => `Y${v}`}
              />
              <YAxis
                stroke={C.textMuted}
                tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
                tickFormatter={(v: number) => formatTons(v)}
                width={50}
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
                  return [`${formatTons(n)} t`, 'Cumulative'];
                }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke={positive ? C.alertNormal : C.alertCritical}
                strokeWidth={2}
                dot={{ r: 3, fill: positive ? C.alertNormal : C.alertCritical }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ContainedCard>
  );
}

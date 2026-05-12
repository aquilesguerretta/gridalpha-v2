// FORGE — P&L over time chart for the Trade Journal.
// Pulls live entries from the journal store, computes cumulative P&L,
// and renders a Recharts line chart with KPIs above. Empty-state is
// shown when no scored entries exist.

import { useMemo } from 'react';
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
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { HeroNumber } from '@/components/terminal/HeroNumber';
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';
import { useJournalStore } from '@/stores/journalStore';

interface ChartPoint {
  tradingDate: string;
  cumulative: number;
  daily: number;
}

export function JournalPnLChart() {
  const entries = useJournalStore((s) => s.entries);

  const { chartData, totalPnl, winRate, avgPnl, scoredCount } = useMemo(() => {
    const scored = entries
      .filter((e) => e.pnl != null)
      .slice()
      .sort((a, b) => a.tradingDate.localeCompare(b.tradingDate));

    let running = 0;
    const data: ChartPoint[] = scored.map((e) => {
      running += e.pnl!;
      return {
        tradingDate: e.tradingDate,
        cumulative: Number(running.toFixed(2)),
        daily: Number((e.pnl ?? 0).toFixed(2)),
      };
    });

    const total = data.length ? data[data.length - 1].cumulative : 0;
    const wins = scored.filter((e) => (e.pnl ?? 0) > 0).length;
    const winR = scored.length ? (wins / scored.length) * 100 : 0;
    const avg = scored.length ? total / scored.length : 0;

    return {
      chartData: data,
      totalPnl: total,
      winRate: winR,
      avgPnl: avg,
      scoredCount: scored.length,
    };
  }, [entries]);

  const totalColor =
    totalPnl > 0 ? C.falconGold : totalPnl < 0 ? C.alertCritical : C.textPrimary;

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
          marginBottom: 4,
        }}
      >
        P&amp;L OVER TIME
      </div>
      <EditorialIdentity size="section" marginBottom={S.lg}>
        Your record.
      </EditorialIdentity>

      {/* KPI row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: S.lg,
          marginBottom: S.lg,
          paddingBottom: S.lg,
          borderBottom: `1px solid ${C.borderDefault}`,
        }}
      >
        <div>
          <div style={kpiLabelStyle()}>TOTAL P&amp;L</div>
          <HeroNumber
            value={formatPnlShort(totalPnl)}
            unit="USD"
            size={56}
            color={totalColor}
          />
        </div>
        <div>
          <div style={kpiLabelStyle()}>WIN RATE</div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 28,
              fontWeight: 600,
              color: C.textPrimary,
              fontVariantNumeric: 'tabular-nums',
              marginTop: 4,
            }}
          >
            {scoredCount > 0 ? `${winRate.toFixed(0)}%` : '—'}
          </div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textMuted,
              marginTop: 4,
            }}
          >
            {scoredCount} scored {scoredCount === 1 ? 'entry' : 'entries'}
          </div>
        </div>
        <div>
          <div style={kpiLabelStyle()}>AVG P&amp;L / ENTRY</div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 28,
              fontWeight: 600,
              color:
                avgPnl > 0
                  ? C.falconGold
                  : avgPnl < 0
                    ? C.alertCritical
                    : C.textPrimary,
              fontVariantNumeric: 'tabular-nums',
              marginTop: 4,
            }}
          >
            {scoredCount > 0
              ? `${avgPnl >= 0 ? '+' : '−'}$${Math.abs(avgPnl).toFixed(0)}`
              : '—'}
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div
          style={{
            height: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: F.sans,
            fontSize: 14,
            color: C.textMuted,
          }}
        >
          Add your first entry with a P&amp;L value to start tracking.
        </div>
      ) : (
        <div style={{ height: 320 }}>
          <AnnotatableChart chartId="journal:pnl">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
            >
              <CartesianGrid stroke={C.borderDefault} vertical={false} />
              <XAxis
                dataKey="tradingDate"
                stroke={C.textMuted}
                tick={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  fill: C.textMuted,
                }}
                tickMargin={8}
              />
              <YAxis
                stroke={C.textMuted}
                tick={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  fill: C.textMuted,
                }}
                tickFormatter={(v: number) => formatPnlShort(v)}
                width={60}
              />
              <ReferenceLine
                y={0}
                stroke={C.borderStrong}
                strokeDasharray="4 4"
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
                formatter={(value, name) => {
                  const v = typeof value === 'number' ? value : Number(value);
                  const label =
                    typeof name === 'string' && name === 'cumulative'
                      ? 'Cumulative'
                      : 'Daily';
                  return [
                    `${v >= 0 ? '+' : '−'}$${Math.abs(v).toLocaleString()}`,
                    label,
                  ];
                }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke={C.electricBlue}
                strokeWidth={2}
                dot={{ fill: C.electricBlue, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </AnnotatableChart>
        </div>
      )}
    </ContainedCard>
  );
}

function kpiLabelStyle(): React.CSSProperties {
  return {
    fontFamily: F.mono,
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: C.textMuted,
    marginBottom: 4,
  };
}

function formatPnlShort(v: number): string {
  const sign = v >= 0 ? '+' : '−';
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

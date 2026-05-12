// FORGE Wave 4 — SparkSpreadTile wired to useSparkSpread.
// Hero value is the live spark spread for WEST_HUB at heat-rate 7500.
// The 40px sparkline keeps a rolling 24-tick buffer locally so the
// visual is informative even on the first frame.

import { useEffect, useRef, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { C, F, R, S } from '@/design/tokens';
import { useHoverState } from '../../../terminal/useHoverState';
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';
import { useSparkSpread } from '@/hooks/data/useSparkSpread';
import type { SparkSpreadRegime } from '@/lib/types/api';

const SPARK_BUFFER_LEN = 24;
const HEAT_RATE = 7500;
const ZONE = 'WEST_HUB';

const REGIME_LABEL: Record<SparkSpreadRegime, string> = {
  BURNING: 'BURNING',
  NORMAL: 'NORMAL',
  SUPPRESSED: 'SUPPRESSED',
};

const REGIME_COLOR: Record<SparkSpreadRegime, string> = {
  BURNING: C.falconGold,
  NORMAL: C.alertNormal,
  SUPPRESSED: C.alertCritical,
};

export function SparkSpreadTile() {
  const spark = useSparkSpread(ZONE, HEAT_RATE);
  const hover = useHoverState();

  // Rolling 24-tick buffer for the sparkline.
  const bufferRef = useRef<number[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!spark.data) return;
    bufferRef.current = [...bufferRef.current, spark.data.spark_spread].slice(
      -SPARK_BUFFER_LEN,
    );
    setTick((t) => t + 1);
  }, [spark.data]);

  const data = (
    bufferRef.current.length > 1
      ? bufferRef.current
      : [spark.data?.spark_spread ?? 0]
  ).map((value, i) => ({ i, value }));
  void tick; // force re-render on each ingestion

  const regime: SparkSpreadRegime = spark.data?.regime ?? 'NORMAL';
  const regimeColor = REGIME_COLOR[regime];
  const value = spark.data?.spark_spread ?? 0;
  const gasPrice = spark.data ? spark.data.gas_equivalent_cost : 0;
  const lmp = spark.data?.lmp_total ?? 0;

  // Read gas $/MMBtu from the meta block when present.
  const gasMMBtu =
    (spark as { data: unknown }).data && spark.summary
      ? // Pull from envelope meta — exposed in `summary` is fine to parse.
        // `useSparkSpread` doesn't surface meta; we rely on the gas-equivalent
        // cost / heat-rate to back-derive: gas $/MMBtu = gas-cost × 1000 / HR.
        (spark.data ? (spark.data.gas_equivalent_cost * 1000) / HEAT_RATE : 0)
      : 0;

  const cardStyle: React.CSSProperties = {
    background: C.bgElevated,
    border: `1px solid ${C.borderDefault}`,
    borderTop: `1px solid ${
      hover.hovered ? 'rgba(59,130,246,0.40)' : 'rgba(59,130,246,0.20)'
    }`,
    borderRadius: R.lg,
    padding: S.lg,
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'border-top-color 200ms cubic-bezier(0.4,0,0.2,1)',
  };

  return (
    <div style={cardStyle} {...hover.bind}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
          PJM WEST · SPARK SPREAD
          {spark.isStale && (
            <span style={{ color: C.alertWarning, marginLeft: 6 }}> · STALE</span>
          )}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: F.mono,
            fontSize: '11px',
            letterSpacing: '0.18em',
            color: regimeColor,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: regimeColor,
              display: 'inline-block',
            }}
          />
          {REGIME_LABEL[regime]}
        </span>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '36px',
            fontWeight: 600,
            color: C.textPrimary,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {value >= 0 ? '+' : ''}
          {value.toFixed(2)}
        </span>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '11px',
            color: C.textMuted,
            letterSpacing: '0.06em',
            fontWeight: 400,
          }}
        >
          $/MWh · HR {HEAT_RATE.toLocaleString()} · GAS $
          {gasMMBtu.toFixed(2)}
        </span>
      </div>

      {/* Sparkline */}
      <div style={{ width: '100%', height: 40 }}>
        <AnnotatableChart
          chartId="trader:spark-spread:WEST_HUB"
          hideToolbar
        >
          <ResponsiveContainer width="100%" height={40}>
            <LineChart
              data={data}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <Line
                type="monotone"
                dataKey="value"
                stroke={regimeColor}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </AnnotatableChart>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: S.sm,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: F.mono,
          fontSize: '11px',
          color: C.textMuted,
          fontWeight: 400,
        }}
      >
        <span>GAS COST ${gasPrice.toFixed(2)}</span>
        <span>POWER ${lmp.toFixed(2)}</span>
      </div>
    </div>
  );
}

// FORGE Wave 4 — ZoneWatchlist wired to useLMPAllZones + SSE.
// Reads all 20 zones from the live endpoint, derives spark-line trend
// from the previous fetch's snapshot, and subscribes to the SSE stream
// for sub-fetch tick updates. When a `lmp-update` event arrives for a
// watched zone, the row's LMP / delta / spark trail update in place
// without a full re-fetch.

import { useEffect, useMemo, useRef, useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { C, F, S } from '@/design/tokens';
import { useLMPAllZones } from '@/hooks/data/useLMPAllZones';
import { useLMPStream } from '@/hooks/data/useLMPStream';

type Regime = 'normal' | 'burning';

interface WatchRow {
  zone: string;
  /** Display label — typically zone with underscore replaced by space. */
  label: string;
  lmp: number;
  delta: number;
  regime: Regime;
  sparkData: number[];
}

const WATCHED_ZONES = ['WEST_HUB', 'AEP', 'COMED', 'PSEG', 'RECO'];
const SPARK_LENGTH = 24;

function zoneLabel(zone: string): string {
  if (zone === 'WEST_HUB') return 'WEST HUB';
  return zone;
}

function regimeFor(delta: number): Regime {
  return delta > 3 ? 'burning' : 'normal';
}

function deltaColor(delta: number): string {
  return delta >= 0 ? C.falconGold : C.electricBlue;
}

function RowSpark({ data, color }: { data: number[]; color: string }) {
  if (data.length === 0) {
    return <div style={{ width: 60, height: 20 }} />;
  }
  const points = data.map((value, i) => ({ i, value }));
  return (
    <div style={{ width: 60, height: 20 }}>
      <ResponsiveContainer width={60} height={20}>
        <LineChart
          data={points}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ZoneWatchlist() {
  const allZones = useLMPAllZones();
  const stream = useLMPStream();

  // Per-zone rolling spark buffer. Survives polls because we update it
  // in-place when the fetch returns or when SSE delivers a tick.
  const sparkBuffer = useRef<Record<string, number[]>>({});
  // Per-zone live LMP override that SSE updates can set faster than
  // the next poll. Resets when the next poll arrives.
  const [liveOverrides, setLiveOverrides] = useState<Record<string, number>>(
    {},
  );

  // When a fresh all-zones fetch lands, append to the spark buffer and
  // clear any stale SSE overrides so the poll's value wins.
  useEffect(() => {
    if (!allZones.data) return;
    for (const zone of WATCHED_ZONES) {
      const entry = allZones.data[zone];
      if (!entry) continue;
      const prev = sparkBuffer.current[zone] ?? [];
      const next = [...prev, entry.lmp_total].slice(-SPARK_LENGTH);
      sparkBuffer.current[zone] = next;
    }
    setLiveOverrides({});
  }, [allZones.data]);

  // Subscribe to SSE for each watched zone.
  useEffect(() => {
    const unsubs: Array<() => void> = [];
    for (const zone of WATCHED_ZONES) {
      const off = stream.subscribe(zone, (update) => {
        setLiveOverrides((prev) => ({ ...prev, [zone]: update.lmp_total }));
        const prevBuf = sparkBuffer.current[zone] ?? [];
        sparkBuffer.current[zone] = [...prevBuf, update.lmp_total].slice(
          -SPARK_LENGTH,
        );
      });
      unsubs.push(off);
    }
    return () => {
      for (const off of unsubs) off();
    };
    // stream.subscribe identity is stable across renders by useCallback.
  }, [stream]);

  const rows: WatchRow[] = useMemo(() => {
    const data = allZones.data;
    return WATCHED_ZONES.map((zone): WatchRow => {
      const entry = data?.[zone];
      const liveLMP = liveOverrides[zone] ?? entry?.lmp_total ?? 0;
      const delta = entry?.delta_pct_5min ?? 0;
      const spark = sparkBuffer.current[zone] ?? (entry ? [entry.lmp_total] : []);
      return {
        zone,
        label: zoneLabel(zone),
        lmp: liveLMP,
        delta,
        regime: regimeFor(delta),
        sparkData: spark,
      };
    });
  }, [allZones.data, liveOverrides]);

  const burningCount = rows.filter((r) => r.regime === 'burning').length;
  const isLoading = allZones.isLoading;
  const isStale = allZones.isStale;
  const isLive = stream.connectionStatus === 'connected';

  return (
    <div style={{ borderTop: `1px solid ${C.borderDefault}`, paddingTop: S.md }}>
      {/* Eyebrow */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: S.sm,
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
          WATCHLIST · {rows.length} ZONES{' '}
          {isLive && <span style={{ color: C.alertNormal }}> · LIVE</span>}
          {isStale && <span style={{ color: C.alertWarning }}> · STALE</span>}
        </span>
        {burningCount > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: F.mono,
              fontSize: '10px',
              color: C.falconGold,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: C.falconGold,
                display: 'inline-block',
              }}
            />
            {burningCount} BURNING
          </span>
        )}
      </div>

      {/* Editorial identity line */}
      <div
        style={{
          fontFamily: F.display,
          fontSize: 18,
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.45)',
          fontWeight: 400,
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          marginTop: S.xs,
          marginBottom: S.md,
        }}
      >
        Your watch.
      </div>

      {/* Column header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '30% 25% 20% 25%',
          alignItems: 'center',
          height: '32px',
          padding: '0 4px',
          fontFamily: F.mono,
          fontSize: '10px',
          color: C.textMuted,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 400,
        }}
      >
        <span>ZONE</span>
        <span style={{ textAlign: 'right' }}>LMP</span>
        <span style={{ textAlign: 'right' }}>Δ%</span>
        <span style={{ textAlign: 'right' }}>TREND</span>
      </div>

      {/* Rows */}
      <div>
        {isLoading && !allZones.data
          ? Array.from({ length: WATCHED_ZONES.length }).map((_, i) => (
              <div
                key={`skel-${i}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '30% 25% 20% 25%',
                  alignItems: 'center',
                  height: '32px',
                  padding: '0 4px',
                  borderBottom: `1px solid ${C.borderDefault}`,
                  opacity: 0.4,
                }}
              >
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: '12px',
                    color: C.textMuted,
                  }}
                >
                  {WATCHED_ZONES[i]}
                </span>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: '13px',
                    color: C.textMuted,
                    textAlign: 'right',
                  }}
                >
                  —
                </span>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: '11px',
                    color: C.textMuted,
                    textAlign: 'right',
                  }}
                >
                  —
                </span>
                <div />
              </div>
            ))
          : rows.map((row, i) => {
              const isLast = i === rows.length - 1;
              const dColor = deltaColor(row.delta);
              return (
                <div
                  key={row.zone}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '30% 25% 20% 25%',
                    alignItems: 'center',
                    height: '32px',
                    padding: '0 4px',
                    borderBottom: isLast
                      ? 'none'
                      : `1px solid ${C.borderDefault}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontSize: '12px',
                      color: C.textPrimary,
                      fontWeight: 500,
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontSize: '13px',
                      color: C.textPrimary,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 600,
                    }}
                  >
                    {row.lmp.toFixed(2)}
                  </span>
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontSize: '11px',
                      color: dColor,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 600,
                    }}
                  >
                    {row.delta >= 0 ? '+' : ''}
                    {row.delta.toFixed(2)}%
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <RowSpark data={row.sparkData} color={dColor} />
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}

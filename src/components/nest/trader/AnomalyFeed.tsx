// FORGE Wave 4 — AnomalyFeed wired to live data.
// Composes real outages (useOutages), reserve-margin regime
// (useReserveMargin), and spark-spread regime (useSparkSpread) into
// the trader's anomaly stream. Each data source contributes one or
// more anomalies; the result is sorted by severity then recency.
//
// Visual structure is unchanged from the locked design.

import { C, F, S } from '@/design/tokens';
import { useOutages } from '@/hooks/data/useOutages';
import { useReserveMargin } from '@/hooks/data/useReserveMargin';
import { useSparkSpread } from '@/hooks/data/useSparkSpread';
import type { OutageEntry } from '@/lib/types/api';

type Severity = 'critical' | 'warning';

type Anomaly = {
  id: string;
  severity: Severity;
  icon: string;
  label: string;
  detail?: string;
  zone?: string;
  market: string;
  sigma: string;
  time: string;
  /** Sort key: lower = newer / higher severity. */
  rank: number;
};

function severityColor(severity: Severity): string {
  return severity === 'critical' ? C.alertCritical : C.falconGold;
}

function formatHHMM(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(
      d.getUTCMinutes(),
    ).padStart(2, '0')}`;
  } catch {
    return '—';
  }
}

function outageToAnomaly(o: OutageEntry, idx: number): Anomaly {
  const severity: Severity = o.outage_type === 'FORCED' ? 'critical' : 'warning';
  return {
    id: `outage:${o.generator}:${o.start_timestamp}`,
    severity,
    icon: severity === 'critical' ? '⚠' : '◆',
    label: `OUTAGE · ${o.generator}`,
    detail: `${o.capacity_mw.toLocaleString()} MW ${o.outage_type.toLowerCase()} — ${o.fuel_type ?? 'unknown fuel'}`,
    zone: o.zone,
    market: o.zone,
    sigma: `${o.capacity_mw.toLocaleString()} MW`,
    time: formatHHMM(o.start_timestamp),
    rank: idx + (severity === 'critical' ? 0 : 100),
  };
}

export function AnomalyFeed() {
  const outagesQuery = useOutages();
  const reserveQuery = useReserveMargin('all');
  const sparkQuery = useSparkSpread('WEST_HUB');

  const anomalies: Anomaly[] = [];

  // Outages — top of the feed.
  const outages = outagesQuery.data ?? [];
  outages.slice(0, 6).forEach((o, idx) => {
    anomalies.push(outageToAnomaly(o, idx));
  });

  // Reserve margin regime — surface only when not COMFORTABLE.
  const reserve = reserveQuery.data;
  if (reserve && reserve.regime !== 'COMFORTABLE') {
    const severity: Severity =
      reserve.regime === 'TIGHT' ? 'critical' : 'warning';
    anomalies.push({
      id: 'reserve',
      severity,
      icon: severity === 'critical' ? '⚠' : '◆',
      label: `RESERVE MARGIN · ${reserve.regime}`,
      detail: `${reserve.reserve_margin_pct.toFixed(1)}% reserve · load ${(
        reserve.load_actual_mw / 1000
      ).toFixed(1)} GW vs forecast ${(reserve.load_forecast_mw / 1000).toFixed(
        1,
      )} GW`,
      market: 'PJM',
      sigma: `${reserve.reserve_margin_pct.toFixed(1)}%`,
      time: formatHHMM(new Date().toISOString()),
      rank: severity === 'critical' ? 1 : 50,
    });
  }

  // Spark spread regime — surface only when SUPPRESSED (negative spreads).
  const spark = sparkQuery.data;
  if (spark && spark.regime === 'SUPPRESSED') {
    anomalies.push({
      id: 'spark',
      severity: 'warning',
      icon: '◆',
      label: 'SPARK SPREAD · SUPPRESSED',
      detail: `Gas units uneconomic at $${spark.gas_equivalent_cost.toFixed(
        2,
      )}/MWh dispatch cost vs LMP $${spark.lmp_total.toFixed(2)}/MWh.`,
      zone: 'WEST_HUB',
      market: 'WEST_HUB',
      sigma: `$${spark.spark_spread.toFixed(2)}`,
      time: formatHHMM(new Date().toISOString()),
      rank: 60,
    });
  }

  anomalies.sort((a, b) => a.rank - b.rank);

  const isLoading =
    outagesQuery.isLoading || reserveQuery.isLoading || sparkQuery.isLoading;
  const isStale =
    outagesQuery.isStale || reserveQuery.isStale || sparkQuery.isStale;

  return (
    <div
      style={{
        borderTop: `1px solid ${C.borderDefault}`,
        paddingTop: S.md,
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: S.sm,
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
          ANOMALY FEED · PJM ·{' '}
          {isStale ? (
            <span style={{ color: C.alertWarning }}>STALE</span>
          ) : (
            'LIVE'
          )}
        </span>
        {isLoading && (
          <span
            style={{
              fontFamily: F.mono,
              fontSize: '10px',
              color: C.textMuted,
              letterSpacing: '0.12em',
            }}
          >
            LOADING
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
        Anomalies.
      </div>

      {/* Rows */}
      <div>
        {anomalies.length === 0 && !isLoading && (
          <div
            style={{
              fontFamily: F.sans,
              fontSize: '13px',
              color: C.textMuted,
              padding: `${S.md} ${S.lg}`,
            }}
          >
            All quiet. No outages, reserve adequate, spark spread normal.
          </div>
        )}
        {anomalies.map((a, i) => {
          const accent = severityColor(a.severity);
          const isLast = i === anomalies.length - 1;
          return (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: S.md,
                padding: `${S.md} ${S.lg}`,
                borderLeft: `3px solid ${accent}`,
                borderBottom: isLast ? 'none' : `1px solid ${C.borderDefault}`,
              }}
            >
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: '13px',
                  color: accent,
                  width: '14px',
                  display: 'inline-flex',
                  justifyContent: 'center',
                }}
              >
                {a.icon}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: S.sm,
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      color: C.textPrimary,
                      textTransform: 'uppercase',
                    }}
                  >
                    {a.label}
                  </span>
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontSize: '11px',
                      fontWeight: 600,
                      color: accent,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {a.sigma}
                  </span>
                </div>
                {a.detail && (
                  <div
                    style={{
                      fontFamily: F.sans,
                      fontSize: '12px',
                      color: C.textSecondary,
                      marginTop: '2px',
                      fontWeight: 400,
                    }}
                  >
                    {a.detail}
                  </div>
                )}
              </div>

              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: '10px',
                  color: C.textMuted,
                  textAlign: 'right',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                  fontWeight: 400,
                }}
              >
                <div>{a.zone ?? a.market}</div>
                <div style={{ marginTop: '2px' }}>{a.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

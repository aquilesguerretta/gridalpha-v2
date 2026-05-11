// FORGE Wave 4 — BessTile wired to live LMP + ancillary signals.
// Charge / discharge windows are derived from the 24-hour LMP curve
// (4 cheapest hours → charge, 4 most expensive → discharge). The
// est-daily-revenue figure is a notional 50 MW × 4 hr arbitrage at
// 88% round-trip efficiency against the live LMP series.
// SOC% remains a deterministic representation since there's no
// canonical backend endpoint for a single hypothetical battery's
// state-of-charge.

import { useMemo } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { useHoverState } from '../../../terminal/useHoverState';
import { useLMP24h } from '@/hooks/data/useLMP24h';
import { useAncillary } from '@/hooks/data/useAncillary';

const SOC_PCT = 74;
const ZONE = 'WEST_HUB';
// Notional demo battery sizing.
const POWER_MW = 50;
const DURATION_HR = 4;
const RTE = 0.88;

function formatHourRange(hours: number[]): string {
  if (hours.length === 0) return '—';
  const sorted = [...hours].sort((a, b) => a - b);
  // Find the longest contiguous run.
  let bestStart = sorted[0];
  let bestEnd = sorted[0];
  let curStart = sorted[0];
  let curPrev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === curPrev + 1) {
      curPrev = sorted[i];
    } else {
      if (curPrev - curStart > bestEnd - bestStart) {
        bestStart = curStart;
        bestEnd = curPrev;
      }
      curStart = sorted[i];
      curPrev = sorted[i];
    }
  }
  if (curPrev - curStart > bestEnd - bestStart) {
    bestStart = curStart;
    bestEnd = curPrev;
  }
  return `${String(bestStart).padStart(2, '0')}:00–${String(
    (bestEnd + 1) % 24,
  ).padStart(2, '0')}:00`;
}

export function BessTile() {
  const lmp24h = useLMP24h(ZONE);
  const ancillary = useAncillary('all');

  const { chargeRange, dischargeRange, estDaily } = useMemo(() => {
    const series = lmp24h.data?.map((p) => p.lmp_total) ?? [];
    if (series.length < DURATION_HR * 2) {
      return { chargeRange: '—', dischargeRange: '—', estDaily: 0 };
    }
    const indexed = series.map((v, h) => ({ h, v }));
    const ascending = [...indexed].sort((a, b) => a.v - b.v);
    const descending = [...indexed].sort((a, b) => b.v - a.v);
    const chargeHours = ascending.slice(0, DURATION_HR).map((x) => x.h);
    const dischargeHours = descending.slice(0, DURATION_HR).map((x) => x.h);
    const chargeAvg =
      chargeHours.reduce((s, h) => s + series[h], 0) / chargeHours.length;
    const dischargeAvg =
      dischargeHours.reduce((s, h) => s + series[h], 0) / dischargeHours.length;
    // Daily arbitrage revenue across `DURATION_HR` discharge hours.
    const daily = (dischargeAvg - chargeAvg / RTE) * POWER_MW * DURATION_HR;
    return {
      chargeRange: formatHourRange(chargeHours),
      dischargeRange: formatHourRange(dischargeHours),
      estDaily: Math.max(0, daily),
    };
  }, [lmp24h.data]);

  const ancillaryUSDPerMWPerDay = ancillary.data
    ? (ancillary.data.regulation_d_mcp * 24 +
        ancillary.data.regulation_mileage_payment * 24 * 0.08) // V1 reg-D utilization
    : 0;
  const ancillaryFleetUSD = ancillaryUSDPerMWPerDay * POWER_MW;
  const estDailyTotal = estDaily + ancillaryFleetUSD;

  const isStale = lmp24h.isStale || ancillary.isStale;

  const size = 100;
  const stroke = 2;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (SOC_PCT / 100) * circumference;
  const dashArray = `${filled} ${circumference - filled}`;

  const hover = useHoverState();
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
      <div>
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
          BESS · ARBITRAGE
          {isStale && (
            <span style={{ color: C.alertWarning, marginLeft: 6 }}> · STALE</span>
          )}
        </span>
      </div>

      {/* Gauge */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: S.sm,
        }}
      >
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={stroke}
            />
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={C.electricBlue}
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2px' }}>
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: '28px',
                  color: C.textPrimary,
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 600,
                }}
              >
                {SOC_PCT}
              </span>
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: '14px',
                  color: C.textMuted,
                  lineHeight: 1,
                  fontWeight: 500,
                }}
              >
                %
              </span>
            </div>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: '9px',
                letterSpacing: '0.18em',
                color: C.textMuted,
                textTransform: 'uppercase',
                fontWeight: 400,
              }}
            >
              SOC
            </span>
          </div>
        </div>

        {/* Charge / discharge windows */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: S.md,
            width: '100%',
            fontFamily: F.mono,
            fontSize: '10px',
            letterSpacing: '0.06em',
            fontWeight: 500,
          }}
        >
          <span style={{ color: C.electricBlue }}>CHARGE {chargeRange}</span>
          <span style={{ color: C.falconGold }}>
            DISCHARGE {dischargeRange}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: S.sm,
          display: 'flex',
          justifyContent: 'flex-end',
          fontFamily: F.mono,
          fontSize: '11px',
          color: C.falconGold,
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 600,
        }}
      >
        EST. DAILY ${estDailyTotal.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}
      </div>
    </div>
  );
}

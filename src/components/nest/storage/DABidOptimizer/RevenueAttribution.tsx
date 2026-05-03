// FORGE Wave 3 — Revenue attribution stack.
// Stacked bar split into energy / ancillary / degradation cost,
// with a hero net number alongside.

import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { HeroNumber } from '@/components/terminal/HeroNumber';
import type { AssetResult } from '@/lib/types/storage';

interface Props {
  assetResult: AssetResult;
}

function formatUSD(v: number): string {
  const sign = v < 0 ? '−' : '';
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function RevenueAttribution({ assetResult }: Props) {
  const { attribution } = assetResult;
  const totalPositive = Math.max(
    0,
    attribution.energyUSD + attribution.ancillaryUSD,
  );
  const energyPct =
    totalPositive > 0
      ? Math.max(0, attribution.energyUSD) / totalPositive
      : 0;
  const ancillaryPct =
    totalPositive > 0 ? attribution.ancillaryUSD / totalPositive : 0;
  const degradationRatio =
    totalPositive > 0
      ? Math.min(1, attribution.degradationCostUSD / totalPositive)
      : 0;

  const netColor =
    attribution.netUSD > 0
      ? C.falconGold
      : attribution.netUSD < 0
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
        REVENUE ATTRIBUTION · DAY
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: S.lg,
          alignItems: 'start',
        }}
      >
        {/* Hero net + breakdown */}
        <div>
          <div style={{ ...labelStyle(), marginBottom: 4 }}>NET REVENUE</div>
          <HeroNumber
            value={formatUSD(Math.abs(attribution.netUSD))}
            unit="USD"
            size={48}
            color={netColor}
          />
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: S.lg }}
          >
            <Row
              label="ENERGY"
              value={attribution.energyUSD}
              color={C.falconGold}
            />
            <Row
              label="ANCILLARY"
              value={attribution.ancillaryUSD}
              color={C.alertNormal}
            />
            <Row
              label="DEGRADATION"
              value={-attribution.degradationCostUSD}
              color={C.alertCritical}
            />
          </div>
        </div>

        {/* Stacked bar */}
        <div>
          <div style={{ ...labelStyle(), marginBottom: S.sm }}>
            REVENUE STACK
          </div>
          <div
            style={{
              display: 'flex',
              height: 32,
              borderRadius: R.sm,
              overflow: 'hidden',
              border: `1px solid ${C.borderDefault}`,
            }}
          >
            <div
              style={{
                width: `${energyPct * 100}%`,
                background: C.falconGold,
              }}
              title={`Energy ${formatUSD(attribution.energyUSD)}`}
            />
            <div
              style={{
                width: `${ancillaryPct * 100}%`,
                background: C.alertNormal,
              }}
              title={`Ancillary ${formatUSD(attribution.ancillaryUSD)}`}
            />
          </div>

          <div style={{ ...labelStyle(), marginTop: S.md, marginBottom: S.sm }}>
            DEGRADATION DEDUCTION
          </div>
          <div
            style={{
              display: 'flex',
              height: 12,
              borderRadius: R.sm,
              overflow: 'hidden',
              border: `1px solid ${C.borderDefault}`,
              background: C.bgSurface,
            }}
          >
            <div
              style={{
                width: `${degradationRatio * 100}%`,
                background: C.alertCritical,
                opacity: 0.8,
              }}
            />
          </div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textMuted,
              marginTop: 4,
              letterSpacing: '0.10em',
            }}
          >
            {assetResult.cyclesUsed.toFixed(2)} equiv. cycles ·{' '}
            {(degradationRatio * 100).toFixed(0)}% of gross
          </div>
        </div>
      </div>
    </ContainedCard>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: F.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textMuted,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: color,
          }}
        />
        {label}
      </span>
      <span
        style={{
          fontFamily: F.mono,
          fontSize: 13,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          color: value < 0 ? C.alertCritical : C.textPrimary,
        }}
      >
        {formatUSD(value)}
      </span>
    </div>
  );
}

function labelStyle(): React.CSSProperties {
  return {
    fontFamily: F.mono,
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: C.textMuted,
  };
}

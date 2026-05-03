// FORGE Wave 3 — Asset detail panel.
// Composes the five chart/card components for a single asset selected
// from FleetOverview. Header shows the asset's identity and headline
// metrics; the chart trio + attribution + ancillary stack + performance
// gauge sit below in a single column. ExportBidPackButton lives at the
// bottom for a one-click PDF.

import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { HeroNumber } from '@/components/terminal/HeroNumber';
import type { AssetResult, FleetResult } from '@/lib/types/storage';
import { BidCurveChart } from './BidCurveChart';
import { SOCTrajectoryChart } from './SOCTrajectoryChart';
import { RevenueAttribution } from './RevenueAttribution';
import { AncillaryStackChart } from './AncillaryStackChart';
import { PerformanceVsOptimal } from './PerformanceVsOptimal';
import { ExportBidPackButton } from './ExportBidPackButton';

interface Props {
  assetResult: AssetResult;
  fleetResult: FleetResult;
}

function formatUSD(v: number): string {
  const sign = v < 0 ? '−' : '';
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function AssetDetail({ assetResult, fleetResult }: Props) {
  const { asset, attribution } = assetResult;
  const netColor =
    attribution.netUSD > 0
      ? C.falconGold
      : attribution.netUSD < 0
        ? C.alertCritical
        : C.textPrimary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.lg }}>
      {/* Header */}
      <ContainedCard padding={S.xl}>
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
          ASSET · {asset.zone}
        </div>
        <EditorialIdentity size="hero" marginBottom={S.md}>
          {asset.name + '.'}
        </EditorialIdentity>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: S.lg,
            paddingTop: S.lg,
            borderTop: `1px solid ${C.borderDefault}`,
          }}
        >
          <KpiCell label="NET (DAY)">
            <HeroNumber
              value={formatUSD(attribution.netUSD)}
              size={42}
              color={netColor}
            />
          </KpiCell>
          <KpiCell label="POWER × DURATION">
            <span style={kpiNumberStyle()}>
              {(asset.powerKW / 1000).toFixed(0)} MW · {asset.durationHours} hr
            </span>
          </KpiCell>
          <KpiCell label="RTE">
            <span style={kpiNumberStyle()}>
              {(asset.rte * 100).toFixed(0)}%
            </span>
          </KpiCell>
          <KpiCell label="CYCLES (DAY)">
            <span style={kpiNumberStyle()}>
              {assetResult.cyclesUsed.toFixed(2)}
            </span>
          </KpiCell>
        </div>

        {assetResult.constraintViolations.length > 0 && (
          <div
            style={{
              marginTop: S.md,
              padding: S.sm,
              background: 'rgba(239,68,68,0.10)',
              border: `1px solid ${C.alertCritical}`,
              borderRadius: R.md,
              fontFamily: F.mono,
              fontSize: 11,
              color: C.alertCritical,
            }}
          >
            {assetResult.constraintViolations.map((v, i) => (
              <div key={i}>⚠ {v}</div>
            ))}
          </div>
        )}
      </ContainedCard>

      <BidCurveChart assetResult={assetResult} />
      <SOCTrajectoryChart assetResult={assetResult} />
      <RevenueAttribution assetResult={assetResult} />
      <AncillaryStackChart assetResult={assetResult} />
      <PerformanceVsOptimal
        assetResult={assetResult}
        fleetResult={fleetResult}
      />

      {/* Export */}
      <ContainedCard padding={S.lg}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: S.lg,
          }}
        >
          <div style={{ flex: 1 }}>
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
              BID PACK
            </div>
            <div
              style={{
                fontFamily: F.sans,
                fontSize: 13,
                color: C.textSecondary,
              }}
            >
              Export the full fleet bid pack as a board-ready PDF — every
              asset's hourly schedule, SOC trajectory, attribution, and
              sensitivity strip. Review before submitting to PJM.
            </div>
          </div>
          <ExportBidPackButton fleet={fleetResult.fleet} result={fleetResult} />
        </div>
      </ContainedCard>
    </div>
  );
}

function KpiCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function kpiNumberStyle(): React.CSSProperties {
  return {
    fontFamily: F.mono,
    fontSize: 20,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: C.textPrimary,
  };
}

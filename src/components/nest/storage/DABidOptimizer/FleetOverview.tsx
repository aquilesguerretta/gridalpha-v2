// FORGE Wave 3 — Fleet overview / asset ranking.
// Top-row: fleet identity + summary stats.
// Per-asset table sorted by base-scenario net revenue. Click row to
// drill into AssetDetail. Below the table: scenario revenue strip
// (base / volatility-up / forecast-miss) + performance-vs-optimal gauge.

import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import type { Fleet, FleetResult } from '@/lib/types/storage';

interface Props {
  fleet: Fleet;
  result: FleetResult;
  selectedAssetId: string | null;
  onSelectAsset: (id: string) => void;
}

function formatUSD(v: number): string {
  const sign = v < 0 ? '−' : '';
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function FleetOverview({
  fleet,
  result,
  selectedAssetId,
  onSelectAsset,
}: Props) {
  const totalPowerKW = fleet.assets.reduce((s, a) => s + a.powerKW, 0);
  const totalEnergyKWh = fleet.assets.reduce((s, a) => s + a.capacityKWh, 0);
  const ancillaryAssets = fleet.assets.filter((a) => a.ancillaryEnabled).length;

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
        FLEET · {fleet.assets.length}{' '}
        {fleet.assets.length === 1 ? 'ASSET' : 'ASSETS'}
      </div>
      <EditorialIdentity size="section" marginBottom={S.lg}>
        {fleet.operatorName + '.'}
      </EditorialIdentity>

      {/* Summary stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: S.md,
          paddingBottom: S.lg,
          borderBottom: `1px solid ${C.borderDefault}`,
          marginBottom: S.md,
        }}
      >
        <Stat label="POWER" value={`${(totalPowerKW / 1000).toFixed(0)} MW`} />
        <Stat
          label="ENERGY"
          value={`${(totalEnergyKWh / 1000).toFixed(0)} MWh`}
        />
        <Stat
          label="ANCILLARY"
          value={`${ancillaryAssets}/${fleet.assets.length}`}
        />
        <Stat
          label="CYCLES (DAY)"
          value={result.fleetTotalCycles.toFixed(2)}
        />
      </div>

      {/* Asset ranking table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 60px 50px 90px',
          gap: S.sm,
          padding: `${S.xs} ${S.sm}`,
          fontFamily: F.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textMuted,
          borderBottom: `1px solid ${C.borderDefault}`,
        }}
      >
        <span>#</span>
        <span>ASSET · ZONE</span>
        <span style={{ textAlign: 'right' }}>MW</span>
        <span style={{ textAlign: 'right' }}>HR</span>
        <span style={{ textAlign: 'right' }}>NET (DAY)</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {result.perAssetRanking.map((r, i) => {
          const isSelected = selectedAssetId === r.asset.id;
          const isTop = i === 0;
          const net = r.attribution.netUSD;
          return (
            <button
              key={r.asset.id}
              type="button"
              onClick={() => onSelectAsset(r.asset.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 60px 50px 90px',
                gap: S.sm,
                alignItems: 'center',
                background: isSelected ? C.electricBlueWash : 'transparent',
                border: 'none',
                borderBottom: `1px solid ${C.borderDefault}`,
                borderLeft: isSelected
                  ? `2px solid ${C.electricBlue}`
                  : '2px solid transparent',
                padding: S.sm,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isTop ? C.falconGold : C.textMuted,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span
                  style={{
                    fontFamily: F.sans,
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.textPrimary,
                  }}
                >
                  {r.asset.name}
                </span>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 10,
                    color: C.textMuted,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                  }}
                >
                  {r.asset.zone}
                  {r.asset.ancillaryEnabled
                    ? ` · ${r.asset.ancillaryService?.toUpperCase()}`
                    : ''}
                </span>
              </span>
              <span style={cellStyle()}>{(r.asset.powerKW / 1000).toFixed(0)}</span>
              <span style={cellStyle()}>{r.asset.durationHours}</span>
              <span
                style={{
                  ...cellStyle(),
                  color:
                    net > 0 ? C.falconGold : net < 0 ? C.alertCritical : C.textPrimary,
                  fontWeight: 600,
                }}
              >
                {formatUSD(net)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scenario strip */}
      <div
        style={{
          marginTop: S.lg,
          paddingTop: S.lg,
          borderTop: `1px solid ${C.borderDefault}`,
        }}
      >
        <div style={{ ...labelStyle(), marginBottom: S.sm }}>
          FLEET REVENUE · SCENARIOS
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: S.sm,
          }}
        >
          <ScenarioBox
            label="BASE"
            value={result.scenarios.base.fleetTotalRevenueUSD}
            color={C.electricBlue}
          />
          <ScenarioBox
            label="VOL UP"
            value={result.scenarios.volatilityUp.fleetTotalRevenueUSD}
            color={C.alertNormal}
          />
          <ScenarioBox
            label="MISS"
            value={result.scenarios.forecastMiss.fleetTotalRevenueUSD}
            color={C.alertCritical}
          />
        </div>
      </div>

      {/* Performance vs optimal */}
      <div
        style={{
          marginTop: S.lg,
          paddingTop: S.md,
          borderTop: `1px solid ${C.borderDefault}`,
          display: 'flex',
          alignItems: 'center',
          gap: S.md,
        }}
      >
        <span style={labelStyle()}>VS OPTIMAL</span>
        <div
          style={{
            flex: 1,
            height: 6,
            background: C.bgSurface,
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.round(result.performanceVsOptimal * 100)}%`,
              height: '100%',
              background: C.falconGold,
              transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: 13,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: C.falconGold,
            width: 56,
            textAlign: 'right',
          }}
        >
          {(result.performanceVsOptimal * 100).toFixed(0)}%
        </span>
      </div>
    </ContainedCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ ...labelStyle(), marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 18,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          color: C.textPrimary,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ScenarioBox({
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
        background: C.bgSurface,
        border: `1px solid ${C.borderDefault}`,
        borderTop: `1px solid ${color}33`,
        borderRadius: R.md,
        padding: S.sm,
      }}
    >
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: color,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 16,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          color: C.textPrimary,
        }}
      >
        {formatUSD(value)}
      </div>
    </div>
  );
}

function cellStyle(): React.CSSProperties {
  return {
    fontFamily: F.mono,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    color: C.textSecondary,
    textAlign: 'right',
  };
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

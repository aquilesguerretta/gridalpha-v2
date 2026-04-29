// FORGE Wave 2 — Single-strategy detail panel.
// Hero header + scenario toggle + sensitivity / dispatch / carbon visuals
// + components breakdown + ExportMemoButton. Driven by a StrategyResult
// passed in from the parent.

import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { HeroNumber } from '@/components/terminal/HeroNumber';
import type {
  FacilityProfile,
  ScenarioName,
  StrategyComponent,
  StrategyResult,
} from '@/lib/types/simulator';
import { SensitivityChart } from './SensitivityChart';
import { HourlyDispatchChart } from './HourlyDispatchChart';
import { CarbonReduction } from './CarbonReduction';
import { ExportMemoButton } from './ExportMemoButton';

interface Props {
  result: StrategyResult;
  profile: FacilityProfile;
  scenario: ScenarioName;
  onScenarioChange: (s: ScenarioName) => void;
}

const SCENARIO_LABELS: Record<ScenarioName, string> = {
  base: 'BASE',
  optimistic: 'OPTIMISTIC',
  pessimistic: 'PESSIMISTIC',
};

const SCENARIO_COLOR: Record<ScenarioName, string> = {
  base: C.electricBlue,
  optimistic: C.alertNormal,
  pessimistic: C.alertCritical,
};

function formatUSDLong(v: number): string {
  const sign = v < 0 ? '−' : '';
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatPayback(years: number | null): string {
  if (years == null) return 'Never recovers';
  if (years > 100) return '> 100 years';
  return `${years.toFixed(1)} years`;
}

function describeComponent(c: StrategyComponent): string {
  switch (c.kind) {
    case 'solar-add':
      return `+${c.capacityKW.toLocaleString()} kW solar PV`;
    case 'battery-add':
      return `+${c.powerKW.toLocaleString()} kW / ${c.capacityKWh.toLocaleString()} kWh battery (${(c.rte * 100).toFixed(0)}% RTE)`;
    case 'diesel-add':
      return `+${c.capacityKW.toLocaleString()} kW diesel @ $${c.fuelCostPerGallon}/gal`;
    case 'demand-response':
      return `Demand response: shed up to ${(c.targetReductionPct * 100).toFixed(0)}% at peak`;
    case 'tariff-switch':
      return `Switch tariff to ${c.newTariff.type}`;
  }
}

export function StrategyDetail({
  result,
  profile,
  scenario,
  onScenarioChange,
}: Props) {
  const active = result.scenarios[scenario];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.lg }}>
      {/* Header card */}
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
          STRATEGY · {result.strategy.id.toUpperCase()}
        </div>
        <EditorialIdentity size="hero" marginBottom={S.md}>
          {result.strategy.name + '.'}
        </EditorialIdentity>
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 14,
            lineHeight: 1.6,
            color: C.textSecondary,
            marginBottom: S.lg,
          }}
        >
          {result.strategy.description}
        </div>

        {/* Scenario toggle */}
        <div
          style={{
            display: 'flex',
            gap: S.sm,
            marginBottom: S.lg,
          }}
        >
          {(Object.keys(SCENARIO_LABELS) as ScenarioName[]).map((s) => {
            const active = s === scenario;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onScenarioChange(s)}
                style={{
                  background: active
                    ? `${SCENARIO_COLOR[s]}22`
                    : 'transparent',
                  border: `1px solid ${active ? SCENARIO_COLOR[s] : C.borderDefault}`,
                  borderRadius: R.sm,
                  padding: '6px 12px',
                  fontFamily: F.mono,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: active ? SCENARIO_COLOR[s] : C.textSecondary,
                  cursor: 'pointer',
                  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {SCENARIO_LABELS[s]}
              </button>
            );
          })}
        </div>

        {/* KPI strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: S.lg,
            paddingTop: S.lg,
            borderTop: `1px solid ${C.borderDefault}`,
          }}
        >
          <KpiCell label={`${SCENARIO_LABELS[scenario]} 10Y NPV`}>
            <HeroNumber
              value={formatUSDLong(active.npvUSD)}
              size={48}
              color={
                active.npvUSD > 0
                  ? C.falconGold
                  : active.npvUSD < 0
                    ? C.alertCritical
                    : C.textPrimary
              }
            />
          </KpiCell>
          <KpiCell label="CAPEX">
            <span style={kpiNumberStyle()}>
              {formatUSDLong(active.capExUSD)}
            </span>
          </KpiCell>
          <KpiCell label="PAYBACK">
            <span style={kpiNumberStyle()}>
              {formatPayback(result.paybackYears)}
            </span>
          </KpiCell>
          <KpiCell label="DISCOUNTED 10Y SAVINGS">
            <span style={kpiNumberStyle()}>
              {formatUSDLong(active.totalSavings10YrUSD)}
            </span>
          </KpiCell>
        </div>
      </ContainedCard>

      {/* Visual trio */}
      <SensitivityChart result={result} />
      <HourlyDispatchChart result={result} />
      <CarbonReduction result={result} />

      {/* Components breakdown */}
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
          COMPONENTS · {result.strategy.components.length}{' '}
          {result.strategy.components.length === 1 ? 'COMPONENT' : 'COMPONENTS'}
        </div>
        {result.strategy.components.length === 0 ? (
          <div
            style={{
              fontFamily: F.sans,
              fontSize: 13,
              color: C.textMuted,
            }}
          >
            No new investment — baseline operation.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
            {result.strategy.components.map((c, i) => (
              <div
                key={`${c.kind}-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: S.md,
                  padding: S.sm,
                  background: C.bgSurface,
                  borderRadius: R.md,
                  border: `1px solid ${C.borderDefault}`,
                }}
              >
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: C.electricBlueLight,
                    minWidth: 80,
                  }}
                >
                  {c.kind}
                </span>
                <span
                  style={{
                    fontFamily: F.sans,
                    fontSize: 13,
                    color: C.textPrimary,
                    flex: 1,
                  }}
                >
                  {describeComponent(c)}
                </span>
              </div>
            ))}
          </div>
        )}
      </ContainedCard>

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
              BOARD MEMO
            </div>
            <div
              style={{
                fontFamily: F.sans,
                fontSize: 13,
                color: C.textSecondary,
              }}
            >
              Generate a single-page PDF summarizing this strategy for
              stakeholder review.
            </div>
          </div>
          <ExportMemoButton result={result} profile={profile} />
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
    fontSize: 22,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: C.textPrimary,
  };
}

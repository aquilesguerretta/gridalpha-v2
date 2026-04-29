// FORGE Wave 2 — Strategy ranking list.
// Sorted base-NPV descending. Top row gets a falcon-gold "RECOMMENDED"
// badge. Click a row to select that strategy in the parent view.

import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import type { RiskRanking, StrategyResult } from '@/lib/types/simulator';

interface Props {
  results: StrategyResult[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const RISK_COLOR: Record<RiskRanking, string> = {
  low: C.alertNormal,
  moderate: C.alertWarning,
  high: C.alertCritical,
};

const RISK_LABEL: Record<RiskRanking, string> = {
  low: 'LOW',
  moderate: 'MOD',
  high: 'HIGH',
};

function formatUSD(v: number): string {
  const sign = v < 0 ? '−' : '';
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatPayback(years: number | null): string {
  if (years == null) return '—';
  if (years > 100) return '>100y';
  return `${years.toFixed(1)}y`;
}

export function StrategyRanking({ results, selectedId, onSelect }: Props) {
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
        STRATEGY RANKING · 10-YR NPV
      </div>
      <EditorialIdentity size="section" marginBottom={S.lg}>
        Ranked by base-case NPV.
      </EditorialIdentity>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 80px 70px 60px',
          gap: S.sm,
          padding: `${S.xs} ${S.sm}`,
          borderBottom: `1px solid ${C.borderDefault}`,
          fontFamily: F.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textMuted,
        }}
      >
        <span>#</span>
        <span>STRATEGY</span>
        <span style={{ textAlign: 'right' }}>NPV</span>
        <span style={{ textAlign: 'right' }}>PAYBACK</span>
        <span style={{ textAlign: 'right' }}>RISK</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {results.map((r, i) => {
          const isSelected = selectedId === r.strategy.id;
          const isTop = i === 0;
          return (
            <button
              key={r.strategy.id}
              type="button"
              onClick={() => onSelect(r.strategy.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 80px 70px 60px',
                gap: S.sm,
                alignItems: 'center',
                background: isSelected
                  ? C.electricBlueWash
                  : 'transparent',
                border: 'none',
                borderBottom: `1px solid ${C.borderDefault}`,
                borderLeft: isSelected
                  ? `2px solid ${C.electricBlue}`
                  : '2px solid transparent',
                padding: `${S.sm}`,
                cursor: 'pointer',
                textAlign: 'left',
                color: 'inherit',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                transition:
                  'background 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms',
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
                    fontSize: 14,
                    fontWeight: 500,
                    color: C.textPrimary,
                  }}
                >
                  {r.strategy.name}
                </span>
                {isTop && (
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: C.falconGold,
                    }}
                  >
                    ★ RECOMMENDED
                  </span>
                )}
              </span>

              <span
                style={{
                  textAlign: 'right',
                  fontFamily: F.mono,
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  color:
                    r.scenarios.base.npvUSD > 0
                      ? C.falconGold
                      : r.scenarios.base.npvUSD < 0
                        ? C.alertCritical
                        : C.textSecondary,
                }}
              >
                {formatUSD(r.scenarios.base.npvUSD)}
              </span>

              <span
                style={{
                  textAlign: 'right',
                  fontFamily: F.mono,
                  fontSize: 12,
                  fontVariantNumeric: 'tabular-nums',
                  color: C.textSecondary,
                }}
              >
                {formatPayback(r.paybackYears)}
              </span>

              <span
                style={{
                  textAlign: 'right',
                  fontFamily: F.mono,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: RISK_COLOR[r.riskRanking],
                  background: 'rgba(255,255,255,0.04)',
                  padding: '2px 6px',
                  borderRadius: R.sm,
                  justifySelf: 'end',
                }}
              >
                {RISK_LABEL[r.riskRanking]}
              </span>
            </button>
          );
        })}
      </div>
    </ContainedCard>
  );
}

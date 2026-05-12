// FORGE Wave 3 — Performance-vs-optimal gauge.
// Single-metric card showing the asset's net revenue as a fraction of
// the theoretical perfect-foresight optimum spread × power × duration.
// Useful as a "how well did the heuristic do?" sanity check.

import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { HeroNumber } from '@/components/terminal/HeroNumber';
import type { AssetResult, FleetResult } from '@/lib/types/storage';

interface Props {
  assetResult: AssetResult;
  fleetResult: FleetResult;
}

export function PerformanceVsOptimal({ assetResult, fleetResult }: Props) {
  // Use fleet-level performance as the asset proxy in V1 — the per-asset
  // optimum is the same calculation scaled. A future revision computes
  // it independently per asset.
  const fleetPct = fleetResult.performanceVsOptimal;

  const color =
    fleetPct >= 0.85
      ? C.alertNormal
      : fleetPct >= 0.65
        ? C.falconGold
        : C.alertCritical;

  const verdict =
    fleetPct >= 0.85
      ? 'Strong capture.'
      : fleetPct >= 0.65
        ? 'Room to improve.'
        : 'Below benchmark.';

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
        PERFORMANCE vs OPTIMAL
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: S.lg,
          alignItems: 'center',
        }}
      >
        <div>
          <HeroNumber
            value={`${(fleetPct * 100).toFixed(0)}`}
            unit="%"
            size={56}
            color={color}
          />
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textMuted,
              marginTop: S.sm,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
            }}
          >
            of theoretical perfect-foresight optimum
          </div>
        </div>

        <div>
          {/* Gauge */}
          <div
            style={{
              position: 'relative',
              height: 12,
              background: C.bgSurface,
              borderRadius: R.sm,
              overflow: 'hidden',
              border: `1px solid ${C.borderDefault}`,
            }}
          >
            <div
              style={{
                width: `${Math.min(100, fleetPct * 100)}%`,
                height: '100%',
                background: color,
                transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            {/* Markers at 65 / 85 */}
            <div
              style={{
                position: 'absolute',
                left: '65%',
                top: 0,
                bottom: 0,
                width: 1,
                background: 'rgba(255,255,255,0.15)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '85%',
                top: 0,
                bottom: 0,
                width: 1,
                background: 'rgba(255,255,255,0.15)',
              }}
            />
          </div>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 10,
              color: C.textMuted,
              letterSpacing: '0.10em',
              marginTop: S.sm,
            }}
          >
            {verdict.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: F.sans,
              fontSize: 13,
              color: C.textSecondary,
              marginTop: S.sm,
              lineHeight: 1.5,
            }}
          >
            V1 heuristic captures the {assetResult.bidCurve.filter((b) => b.action === 'discharge').length}-hour
            spread between the lowest-LMP charge and highest-LMP discharge
            windows. A future MILP optimizer can extract more value from
            mid-merit hours.
          </div>
        </div>
      </div>
    </ContainedCard>
  );
}

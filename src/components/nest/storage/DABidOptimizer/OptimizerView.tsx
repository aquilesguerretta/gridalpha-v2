// FORGE Wave 3 — DA Bid Optimizer main view.
// State machine:
//  - no fleet → render AssetRegistrationForm (initial setup)
//  - fleet + no results + not editing → CTA (READY TO RUN)
//  - editing → AssetRegistrationForm pre-filled
//  - isRunning → loading panel
//  - results + not editing → FleetOverview + AssetDetail in a grid

import { useMemo, useState } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { useStorageOptimizer } from '@/hooks/useStorageOptimizer';
import { AssetRegistrationForm } from './AssetRegistrationForm';
import { FleetOverview } from './FleetOverview';
import { AssetDetail } from './AssetDetail';
import type { Fleet } from '@/lib/types/storage';

export function OptimizerView() {
  const {
    fleet,
    results,
    isRunning,
    selectedAssetId,
    run,
    setFleet,
    selectAsset,
    clear,
  } = useStorageOptimizer();

  const [editing, setEditing] = useState(false);

  function handleFleetSubmit(f: Fleet) {
    setFleet(f);
    setEditing(false);
    setTimeout(() => run(), 0);
  }

  const selectedResult = useMemo(() => {
    if (!results || results.perAssetRanking.length === 0) return null;
    if (selectedAssetId) {
      return (
        results.perAssetRanking.find((r) => r.asset.id === selectedAssetId) ??
        results.perAssetRanking[0]
      );
    }
    return results.perAssetRanking[0];
  }, [results, selectedAssetId]);

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        padding: S.xl,
        display: 'flex',
        flexDirection: 'column',
        gap: S.lg,
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: C.electricBlue,
            marginBottom: S.xs,
          }}
        >
          03 · STORAGE OPERATOR · DA BID OPTIMIZER
        </div>
        <EditorialIdentity size="hero">
          What's tomorrow's optimal bid for your fleet?
        </EditorialIdentity>
      </div>

      {/* No fleet — registration form */}
      {!fleet && <AssetRegistrationForm onSubmit={handleFleetSubmit} />}

      {/* Editing — pre-filled form */}
      {fleet && editing && (
        <AssetRegistrationForm
          existing={fleet}
          onSubmit={handleFleetSubmit}
        />
      )}

      {/* Fleet set, no results, not editing — CTA */}
      {fleet && !results && !isRunning && !editing && (
        <ContainedCard padding={S.xl}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: S.md,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: C.electricBlueLight,
              }}
            >
              READY TO RUN
            </div>
            <EditorialIdentity size="section">
              {fleet.operatorName + '.'}
            </EditorialIdentity>
            <div
              style={{
                fontFamily: F.sans,
                fontSize: 14,
                color: C.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {fleet.assets.length}{' '}
              {fleet.assets.length === 1 ? 'asset' : 'assets'} ·{' '}
              {(
                fleet.assets.reduce((s, a) => s + a.powerKW, 0) / 1000
              ).toFixed(0)}{' '}
              MW total
            </div>
            <button
              type="button"
              onClick={run}
              style={{
                background: C.electricBlue,
                border: 'none',
                borderRadius: R.md,
                padding: `0 ${S.xl}`,
                height: 44,
                fontFamily: F.mono,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              RUN OPTIMIZATION →
            </button>
          </div>
        </ContainedCard>
      )}

      {/* Running */}
      {isRunning && (
        <ContainedCard padding={S.xl}>
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 13,
              color: C.electricBlueLight,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
            }}
          >
            Generating bid curves across {fleet?.assets.length ?? 0} assets ×
            3 scenarios…
          </div>
        </ContainedCard>
      )}

      {/* Results */}
      {fleet && results && !isRunning && (
        <>
          {/* Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: S.md,
            }}
          >
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.textSecondary,
              }}
            >
              {fleet.operatorName}
            </span>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                color: C.textMuted,
                letterSpacing: '0.10em',
              }}
            >
              · {results.perAssetRanking.length}{' '}
              {results.perAssetRanking.length === 1 ? 'ASSET' : 'ASSETS'}{' '}
              OPTIMIZED
            </span>

            <span style={{ marginLeft: 'auto', display: 'flex', gap: S.sm }}>
              <button
                type="button"
                onClick={() => setEditing(true)}
                style={toolbarBtnStyle()}
              >
                EDIT FLEET
              </button>
              <button
                type="button"
                onClick={run}
                style={toolbarBtnStyle()}
              >
                RE-RUN
              </button>
              <button
                type="button"
                onClick={clear}
                style={toolbarBtnStyle(C.alertCritical)}
              >
                CLEAR
              </button>
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: S.lg,
              alignItems: 'start',
            }}
          >
            <FleetOverview
              fleet={fleet}
              result={results}
              selectedAssetId={selectedAssetId}
              onSelectAsset={selectAsset}
            />
            {selectedResult && (
              <AssetDetail
                assetResult={selectedResult}
                fleetResult={results}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function toolbarBtnStyle(color?: string): React.CSSProperties {
  return {
    background: 'transparent',
    border: `1px solid ${color ?? C.borderDefault}`,
    borderRadius: R.sm,
    padding: '6px 10px',
    fontFamily: F.mono,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: color ?? C.textSecondary,
    cursor: 'pointer',
  };
}

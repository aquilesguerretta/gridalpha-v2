// src/components/AnalyticsPage.tsx
// Analytics home — Peregrine Intelligence is the default tab.
// Remaining tabs are placeholders for Sprint 4 modules.

import { useState } from 'react';
import { C, F, S } from '@/design/tokens';
import PeregrineFullPage from './peregrine/PeregrineFullPage';
import { PeregrineFeedMarketAlerts } from './GlobalShell';

type AnalyticsTabId =
  | 'intelligence'
  | 'price'
  | 'spread'
  | 'battery'
  | 'marginal'
  | 'convergence';

const ANALYTICS_TABS: Array<{ id: AnalyticsTabId; label: string }> = [
  { id: 'intelligence', label: 'PEREGRINE INTELLIGENCE' },
  { id: 'price',        label: 'PRICE INTELLIGENCE'    },
  { id: 'spread',       label: 'SPARK SPREAD'          },
  { id: 'battery',      label: 'BATTERY ARBITRAGE'     },
  { id: 'marginal',     label: 'MARGINAL FUEL'         },
  { id: 'convergence',  label: 'CONVERGENCE'           },
];

function AnalyticsPlaceholder({ label }: { label: string }) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      height:         '100%',
      gap:            S.lg,
    }}>
      <div style={{
        fontFamily:    F.mono,
        fontSize:      '13px',
        color:         C.textMuted,
        letterSpacing: '0.12em',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: F.sans,
        fontSize:   '13px',
        color:      C.textMuted,
      }}>
        Coming in Sprint 4
      </div>
    </div>
  );
}

interface AnalyticsPageProps {
  selectedZone: string | null;
  onZoneClick:  (zoneId: string) => void;
}

export default function AnalyticsPage({ selectedZone, onZoneClick }: AnalyticsPageProps) {
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTabId>('intelligence');

  return (
    <div style={{
      height:        'calc(100vh - 64px)',
      display:       'flex',
      flexDirection: 'column',
      overflow:      'hidden',
      background:    C.bgBase,
    }}>
      {/* Page header */}
      <div style={{
        padding:      `${S.lg} ${S.xl}`,
        borderBottom: `1px solid ${C.borderDefault}`,
        background:   C.bgElevated,
        flexShrink:   0,
      }}>
        <div style={{
          fontFamily:    F.mono,
          fontSize:      '10px',
          color:         C.electricBlue,
          letterSpacing: '0.16em',
          marginBottom:  S.xs,
          textTransform: 'uppercase' as const,
        }}>
          PJM MARKET INTELLIGENCE
        </div>
        <div style={{
          fontFamily:    F.mono,
          fontSize:      '22px',
          fontWeight:    '700',
          color:         C.textPrimary,
          letterSpacing: '0.04em',
          textTransform: 'uppercase' as const,
        }}>
          ANALYTICS
        </div>
        <div style={{
          fontFamily: F.sans,
          fontSize:   '13px',
          color:      C.textMuted,
          marginTop:  S.xs,
        }}>
          Market intelligence · Live news · AI analysis
        </div>
      </div>

      {/* Tab strip */}
      <div style={{
        display:      'flex',
        flexShrink:   0,
        borderBottom: `1px solid ${C.borderDefault}`,
        background:   C.bgElevated,
        paddingLeft:  S.xl,
        overflowX:    'auto',
      }}>
        {ANALYTICS_TABS.map(tab => {
          const active = analyticsTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAnalyticsTab(tab.id)}
              style={{
                padding:       '14px 20px',
                background:    'transparent',
                border:        'none',
                borderBottom:  active
                  ? `2px solid ${C.electricBlue}`
                  : '2px solid transparent',
                color:         active ? C.textPrimary : C.textMuted,
                fontFamily:    F.mono,
                fontSize:      '10px',
                fontWeight:    active ? '600' : '400',
                letterSpacing: '0.10em',
                cursor:        'pointer',
                transition:    'border-bottom-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace:    'nowrap' as const,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {analyticsTab === 'intelligence' && (
          <PeregrineFullPage
            selectedZone={selectedZone}
            onZoneClick={onZoneClick}
            marketAlerts={<PeregrineFeedMarketAlerts onZoneClick={onZoneClick} />}
          />
        )}
        {analyticsTab === 'price'       && <AnalyticsPlaceholder label="PRICE INTELLIGENCE" />}
        {analyticsTab === 'spread'      && <AnalyticsPlaceholder label="SPARK SPREAD ANALYSIS" />}
        {analyticsTab === 'battery'     && <AnalyticsPlaceholder label="BATTERY ARBITRAGE" />}
        {analyticsTab === 'marginal'    && <AnalyticsPlaceholder label="MARGINAL FUEL" />}
        {analyticsTab === 'convergence' && <AnalyticsPlaceholder label="CONVERGENCE" />}
      </div>
    </div>
  );
}

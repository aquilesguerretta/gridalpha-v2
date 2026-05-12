import { useState } from 'react';
import { C, F, S } from '@/design/tokens';
import { HeroLMPBlock } from './HeroLMPBlock';
import { AnomalyFeed } from './AnomalyFeed';
import { PeregrinePreview } from './PeregrinePreview';
import { LMP24HChart } from './LMP24HChart';
import { SparkSpreadTile } from './tiles/SparkSpreadTile';
import { BessTile } from './tiles/BessTile';
import { FuelMixTile } from './tiles/FuelMixTile';
import { ZoneWatchlist } from './ZoneWatchlist';
import { JournalTab } from './JournalTab';

type Tab = 'nest' | 'journal';

export function TraderNest() {
  const [tab, setTab] = useState<Tab>('nest');

  return (
    <div
      style={{
        height: '100%',
        background: C.bgBase,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      {/* Atmospheric vignette — corners darker, hero region center-top
          subtly illuminated. Defines the page as a space, not a flat plane. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background:
            'radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.025) 0%, transparent 70%)',
        }}
      />

      {/* Tab strip — surgical addition above the existing layout */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          gap: S.lg,
          padding: `${S.md} ${S.xl} 0`,
          borderBottom: `1px solid ${C.borderDefault}`,
        }}
      >
        <TabButton active={tab === 'nest'} onClick={() => setTab('nest')}>
          NEST
        </TabButton>
        <TabButton active={tab === 'journal'} onClick={() => setTab('journal')}>
          JOURNAL
        </TabButton>
      </div>

      {tab === 'nest' && (
        /* Content grid — unchanged from the locked layout */
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: S.sm,
            padding: S.xl,
          }}
        >
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.xl }}>
            <HeroLMPBlock />
            <LMP24HChart />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: S.sm,
              }}
            >
              <SparkSpreadTile />
              <BessTile />
              <FuelMixTile />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.xl }}>
            <AnomalyFeed />
            <PeregrinePreview />
            <ZoneWatchlist />
          </div>
        </div>
      )}

      {tab === 'journal' && <JournalTab />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: F.mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: active ? C.electricBlue : C.textMuted,
        padding: `${S.sm} 0`,
        borderBottom: active
          ? `2px solid ${C.electricBlue}`
          : '2px solid transparent',
        marginBottom: -1,
        transition: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </button>
  );
}

import { C, S } from '@/design/tokens';
import { HeroLMPBlock } from './HeroLMPBlock';
import { AnomalyFeed } from './AnomalyFeed';
import { PeregrinePreview } from './PeregrinePreview';
import { LMP24HChart } from './LMP24HChart';
import { SparkSpreadTile } from './tiles/SparkSpreadTile';
import { BessTile } from './tiles/BessTile';
import { FuelMixTile } from './tiles/FuelMixTile';
import { ZoneWatchlist } from './ZoneWatchlist';

export function TraderNest() {
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

      {/* Content grid */}
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
    </div>
  );
}

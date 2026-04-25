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
      {/* Layer 1 — drifting dotted grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.012) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          animation: 'gridDrift 60s linear infinite',
        }}
      />

      {/* Layer 2 — hero radial glow (electric blue, top-left) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '60%',
          height: '50%',
          pointerEvents: 'none',
          zIndex: 0,
          background:
            'radial-gradient(ellipse at top left, rgba(59,130,246,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Layer 3 — right column halo (Falcon Gold wash) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '35%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.015) 100%)',
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

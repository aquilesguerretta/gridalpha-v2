import { C, S } from '@/design/tokens';
import { HeroLMPBlock } from './HeroLMPBlock';
import { AnomalyFeed } from './AnomalyFeed';
import { PeregrinePreview } from './PeregrinePreview';
import { ChartPlaceholder } from './placeholders/ChartPlaceholder';
import { TilePlaceholder } from './placeholders/TilePlaceholder';
import { ListPlaceholder } from './placeholders/ListPlaceholder';

export function TraderNest() {
  return (
    <div
      style={{
        height: '100%',
        background: C.bgBase,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: S.sm,
          padding: S.xl,
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.xl }}>
          <HeroLMPBlock />
          <ChartPlaceholder />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: S.sm,
            }}
          >
            <TilePlaceholder label="SPARK SPREAD · Phase 2" />
            <TilePlaceholder label="BESS · Phase 2" />
            <TilePlaceholder label="FUEL MIX · Phase 2" />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.xl }}>
          <AnomalyFeed />
          <PeregrinePreview />
          <ListPlaceholder />
        </div>
      </div>
    </div>
  );
}

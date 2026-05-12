import { C, F, S } from '@/design/tokens';
import type { Regime } from '@/lib/types/market';
import { ContainedCard } from './ContainedCard';
import { HeroNumber } from './HeroNumber';
import { RegimeBadge } from './RegimeBadge';

// FOUNDRY primitive — small data tile.
// Eyebrow label + HeroNumber value (size=56) + optional sub line + optional
// regime badge. Wraps ContainedCard for the canonical chrome.

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  regime?: Regime;
}

export function MetricTile({ label, value, unit, sub, regime }: Props) {
  const stringValue = typeof value === 'number' ? String(value) : value;
  return (
    <ContainedCard padding={S.lg}>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: C.textMuted,
          marginBottom: S.sm,
        }}
      >
        {label}
      </div>
      <div style={{ marginBottom: sub || regime ? S.sm : 0 }}>
        <HeroNumber value={stringValue} unit={unit} size={56} />
      </div>
      {(sub || regime) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: S.sm,
          }}
        >
          {sub && (
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 11,
                color: C.textMuted,
                letterSpacing: '0.04em',
              }}
            >
              {sub}
            </span>
          )}
          {regime && <RegimeBadge regime={regime} />}
        </div>
      )}
    </ContainedCard>
  );
}

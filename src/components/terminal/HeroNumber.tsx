import { C, F } from '@/design/tokens';

type HeroNumberProps = {
  value: string;
  unit?: string;
  size?: number;
  color?: string;
  /**
   * Optional override for the unit suffix color. Defaults to Falcon Gold at
   * 65% opacity per the One Product Two Surfaces palette — gold marks live
   * data unit suffixes throughout the terminal.
   */
  unitColor?: string;
};

// Canonical numeric hero. F.display permitted here per the
// One Product Two Surfaces philosophy. See CLAUDE.md.
export function HeroNumber({
  value,
  unit,
  size = 120,
  color = C.textPrimary,
  unitColor = 'rgba(245,158,11,0.65)',
}: HeroNumberProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
      <span
        style={{
          fontFamily: F.display,
          fontStyle: 'normal',
          fontSize: `${size}px`,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      {unit && (
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '14px',
            color: unitColor,
            alignSelf: 'flex-start',
            letterSpacing: '0.06em',
            fontWeight: 500,
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
}

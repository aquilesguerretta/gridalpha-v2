import { C, F } from '@/design/tokens';

type HeroNumberProps = {
  value: string;
  unit?: string;
  size?: number;
  color?: string;
};

// Sole authorized user of F.display in the terminal layer.
// Scoped strictly to numeric display. See CLAUDE.md.
export function HeroNumber({
  value,
  unit,
  size = 120,
  color = C.textPrimary,
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
            color: C.textMuted,
            alignSelf: 'flex-start',
            letterSpacing: '0.06em',
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
}

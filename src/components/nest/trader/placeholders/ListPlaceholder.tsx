import { C, F, R, S } from '@/design/tokens';

export function ListPlaceholder() {
  return (
    <div
      style={{
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: R.lg,
        minHeight: '240px',
        padding: S.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontFamily: F.mono,
          fontSize: '11px',
          color: C.textMuted,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        WATCHLIST · 5 ZONES · Phase 3
      </span>
    </div>
  );
}

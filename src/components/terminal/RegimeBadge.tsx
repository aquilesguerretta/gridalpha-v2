import { C, F } from '@/design/tokens';
import type { Regime } from '@/lib/types/market';

// FOUNDRY primitive — typography-led regime indicator.
// 6×6 colored dot + 11px F.mono uppercase label in the regime's color.
// No pill background — typography and dot carry the signal.

interface Props {
  regime: Regime;
}

const REGIME_COLOR: Record<Regime, string> = {
  normal:      C.alertNormal,
  burning:     C.falconGold,
  suppressed:  C.electricBlue,
  scarcity:    C.alertCritical,
  transition:  C.alertWarning,
  discharging: C.falconGold,
  charging:    C.electricBlue,
  idle:        C.textMuted,
};

const REGIME_LABEL: Record<Regime, string> = {
  normal:      'NORMAL',
  burning:     'BURNING',
  suppressed:  'SUPPRESSED',
  scarcity:    'SCARCITY',
  transition:  'TRANSITION',
  discharging: 'DISCHARGING',
  charging:    'CHARGING',
  idle:        'IDLE',
};

export function RegimeBadge({ regime }: Props) {
  const color = REGIME_COLOR[regime];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: F.mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
        }}
      />
      {REGIME_LABEL[regime]}
    </span>
  );
}

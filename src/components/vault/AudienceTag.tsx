// SCRIBE — audience archetype tag rendered next to L1 examples.
// Per the playbook these are visual anchors only in V1; V2 personalisation
// will use them to surface examples matching the reader's archetype.

import { C, F, R } from '@/design/tokens';
import type { AudienceArchetype } from '@/lib/types/audience';

interface Props {
  archetype: AudienceArchetype;
}

const COLOR: Record<AudienceArchetype, string> = {
  Newcomer:   C.textMuted,
  Trader:     C.electricBlue,
  Engineer:   C.alertNormal,
  Industrial: C.falconGold,
  Policy:     C.alertDiagnostic,
};

export function AudienceTag({ archetype }: Props) {
  const color = COLOR[archetype];
  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            4,
        fontFamily:     F.mono,
        fontSize:       11,
        fontWeight:     600,
        letterSpacing:  '0.10em',
        textTransform:  'uppercase',
        color,
        border:         `1px solid ${color}`,
        borderRadius:   R.sm,
        padding:        '2px 6px',
        lineHeight:     1,
      }}
    >
      <span
        aria-hidden
        style={{
          width:        4,
          height:       4,
          borderRadius: '50%',
          background:   color,
          display:      'inline-block',
        }}
      />
      {archetype}
    </span>
  );
}

export default AudienceTag;

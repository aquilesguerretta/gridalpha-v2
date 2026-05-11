// CHROMA Wave 4 — StaleBadge primitive.
//
// Small amber pill that surfaces when a data point's age crosses a
// freshness threshold. The threshold is owned by the consuming hook
// (per CLAUDE.md's freshness contract — `meta.data_age_seconds`); the
// badge just visualizes the age that the hook decided is stale.
//
// Visual:
//   - 4px border-radius pill
//   - bgSurface background, 1px borderDefault
//   - F.mono 10px caps text
//   - Amber dot (4px) on left
//   - "STALE 4m" (< 600s), "STALE 12m" (< 3600s), "STALE 1h+" (larger)
//   - Typically absolute-positioned top-right of the data container

import type { CSSProperties } from 'react';
import { C, F, R, S } from '@/design/tokens';

interface Props {
  /** Age of the data in seconds. */
  ageSeconds: number;
  /**
   * If provided, the badge is positioned absolute top-right of the
   * nearest positioned parent. Otherwise renders inline.
   */
  position?: 'absolute' | 'inline';
  /** Extra style overrides — used for fine-tuning placement. */
  style?: CSSProperties;
}

function formatAge(ageSeconds: number): string {
  if (ageSeconds < 60) {
    // Sub-minute staleness is still rendered as 1m so the badge
    // always reads as STALE — sub-minute would normally not cross
    // the threshold to render the badge at all.
    return 'STALE 1m';
  }
  if (ageSeconds < 600) {
    return `STALE ${Math.floor(ageSeconds / 60)}m`;
  }
  if (ageSeconds < 3600) {
    return `STALE ${Math.floor(ageSeconds / 60)}m`;
  }
  return 'STALE 1h+';
}

export function StaleBadge({
  ageSeconds,
  position = 'absolute',
  style,
}: Props) {
  const label = formatAge(ageSeconds);
  const baseStyle: CSSProperties =
    position === 'absolute'
      ? {
          position: 'absolute',
          top:      S.sm,
          right:    S.sm,
          zIndex:   2,
        }
      : {
          display: 'inline-flex',
        };

  return (
    <span
      role="status"
      aria-label={`Stale: ${label.toLowerCase()}`}
      style={{
        ...baseStyle,
        display:       'inline-flex',
        alignItems:    'center',
        gap:           4,
        padding:       '2px 6px',
        background:    C.bgSurface,
        border:        `1px solid ${C.borderDefault}`,
        borderRadius:  R.sm,
        fontFamily:    F.mono,
        fontSize:      10,
        fontWeight:    600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color:         C.alertWarning,
        whiteSpace:    'nowrap',
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          width:        4,
          height:       4,
          borderRadius: '50%',
          background:   C.alertWarning,
        }}
      />
      {label}
    </span>
  );
}

export default StaleBadge;

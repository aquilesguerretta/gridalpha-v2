// SCRIBE — clickable prerequisite breadcrumb.
// Renders at the top of every entry beyond #001. Each chip links to the
// referenced entry's L1.

import { Link } from 'react-router-dom';
import { C, F, R, S } from '@/design/tokens';
import { getEntry } from '@/lib/curriculum/entriesIndex';

interface Props {
  prerequisites: string[];
}

export function PrerequisiteChain({ prerequisites }: Props) {
  if (!prerequisites || prerequisites.length === 0) return null;

  return (
    <div
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        S.sm,
        flexWrap:   'wrap',
        marginBottom: S.lg,
      }}
    >
      <span
        style={{
          fontFamily:    F.mono,
          fontSize:      10,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         C.textMuted,
        }}
      >
        Requires:
      </span>
      {prerequisites.map((id) => {
        const entry = getEntry(id);
        const label = entry?.title ?? id;
        return (
          <Link
            key={id}
            to={`/vault/alexandria/entry/${id}?layer=L1`}
            style={{
              fontFamily:     F.mono,
              fontSize:       10,
              fontWeight:     600,
              letterSpacing:  '0.10em',
              textTransform:  'uppercase',
              color:          C.electricBlue,
              textDecoration: 'none',
              border:         `1px solid ${C.borderActive}`,
              borderRadius:   R.sm,
              padding:        '3px 8px',
              background:     C.electricBlueWash,
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export default PrerequisiteChain;

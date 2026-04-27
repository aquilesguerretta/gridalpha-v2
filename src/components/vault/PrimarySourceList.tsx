// SCRIBE — L3 citations list.
// Each source: italic-serif citation on the left, type chip on the right,
// optional external-link affordance.

import { C, F, R, S } from '@/design/tokens';
import type { EntryPrimarySource } from '@/lib/types/curriculum';

interface Props {
  sources: EntryPrimarySource[];
}

const TYPE_LABEL: Record<EntryPrimarySource['type'], string> = {
  book:          'Book',
  paper:         'Paper',
  manual:        'Manual',
  order:         'FERC Order',
  standard:      'Standard',
  'data-source': 'Data Source',
};

export function PrimarySourceList({ sources }: Props) {
  if (!sources || sources.length === 0) return null;

  return (
    <section style={{ marginTop: S.xxl }}>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      11,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         C.electricBlue,
          marginBottom:  S.md,
        }}
      >
        Primary Sources
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: S.sm }}>
        {sources.map((src, i) => (
          <li
            key={i}
            style={{
              display:        'grid',
              gridTemplateColumns: '1fr auto',
              alignItems:     'baseline',
              gap:            S.md,
              padding:        `${S.sm} 0`,
              borderBottom:   `1px solid ${C.borderDefault}`,
            }}
          >
            <div
              style={{
                fontFamily: F.display,
                fontStyle:  'italic',
                fontSize:   13,
                color:      C.textSecondary,
                lineHeight: 1.5,
              }}
            >
              {src.citation}
              {src.link && (
                <a
                  href={src.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginLeft:     S.sm,
                    color:          C.electricBlue,
                    textDecoration: 'none',
                    fontFamily:     F.mono,
                    fontSize:       10,
                  }}
                  aria-label="Open source in new tab"
                >
                  ↗
                </a>
              )}
            </div>
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      10,
                fontWeight:    600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         C.textMuted,
                border:        `1px solid ${C.borderDefault}`,
                borderRadius:  R.sm,
                padding:       '2px 8px',
                whiteSpace:    'nowrap',
              }}
            >
              {TYPE_LABEL[src.type]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default PrimarySourceList;

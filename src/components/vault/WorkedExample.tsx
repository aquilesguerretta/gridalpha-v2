// SCRIBE — L2 worked-example card.
// Contained card with eyebrow + EditorialIdentity title + prose. If a
// widgetSpec is present, mounts WidgetPlaceholder beneath the prose.

import { C, F, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import type { EntryWorkedExample } from '@/lib/types/curriculum';
import { WidgetPlaceholder } from './WidgetPlaceholder';

interface Props {
  workedExample: EntryWorkedExample;
}

export function WorkedExample({ workedExample }: Props) {
  const paragraphs = workedExample.body
    .split('\n\n')
    .filter((p) => p.trim().length > 0);

  return (
    <ContainedCard padding={S.lg} style={{ marginTop: S.xl }}>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      11,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         C.electricBlue,
          marginBottom:  S.xs,
        }}
      >
        Worked Example
      </div>
      <EditorialIdentity size="hero">{workedExample.title}</EditorialIdentity>
      <div style={{ height: S.md }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.md, maxWidth: 780 }}>
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              margin:     0,
              fontFamily: F.sans,
              fontSize:   14,
              color:      C.textSecondary,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}
          >
            {p}
          </p>
        ))}
      </div>
      {workedExample.widgetSpec && (
        <WidgetPlaceholder spec={workedExample.widgetSpec} />
      )}
    </ContainedCard>
  );
}

export default WorkedExample;

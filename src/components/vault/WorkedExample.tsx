// SCRIBE — L2 worked-example card.
// Contained card with eyebrow + EditorialIdentity title + prose. If a
// widgetSpec is present, mounts WidgetPlaceholder beneath the prose.

import { C, F, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import type { EntryWorkedExample } from '@/lib/types/curriculum';
import { WidgetPlaceholder } from './WidgetPlaceholder';
import { MarkdownProse } from './MarkdownProse';

interface Props {
  workedExample: EntryWorkedExample;
  /** Slug of the entry that owns this worked example, used for cross-link
   *  self-link suppression. */
  currentEntryId?: string;
}

export function WorkedExample({ workedExample, currentEntryId }: Props) {
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
      <MarkdownProse
        body={workedExample.body}
        currentEntryId={currentEntryId ?? ''}
        fontSize={14}
      />
      {workedExample.widgetSpec && (
        <WidgetPlaceholder spec={workedExample.widgetSpec} />
      )}
    </ContainedCard>
  );
}

export default WorkedExample;

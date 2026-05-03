// SCRIBE — Sub-Tier 1A entry viewer.
// Reads entrySlug and layer (from URL); looks up the entry via
// getEntry; mounts header + breadcrumb + layer toggle + body block per
// the brief's render plan. Marks the layer visited on mount and gates
// L3 + Next-entry behind L2 retrieval acknowledgement.

import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { PageAtmosphere } from '@/components/terminal/PageAtmosphere';
import {
  getEntry,
  getNextEntry,
  getPrevEntry,
} from '@/lib/curriculum/entriesIndex';
import { buildRetrievalPromptInstance } from '@/lib/curriculum';
import { useProgressStore } from '@/stores/progressStore';
import type {
  CurriculumEntry,
  EntryLayerContent,
  LayerKey,
} from '@/lib/types/curriculum';
import { LayerToggle } from './LayerToggle';
import { PrerequisiteChain } from './PrerequisiteChain';
import { EntryBreadcrumb } from './EntryBreadcrumb';
import { AudienceTag } from './AudienceTag';
import { RetrievalPrompt } from './RetrievalPrompt';
// ORACLE Wave 3 — wraps SCRIBE's RetrievalPrompt with the grading UI.
import { RetrievalPromptGrader } from './RetrievalPromptGrader';
// ORACLE Wave 3 — AI lesson summary panel below the header.
import { LessonSummaryPanel } from './LessonSummaryPanel';
import { WorkedExample } from './WorkedExample';
import { PrimarySourceList } from './PrimarySourceList';
import { ClosingAnchor } from './ClosingAnchor';
import { MarkdownProse } from './MarkdownProse';

import { EnergyTransformationChain } from '@/lib/curriculum/diagrams/energy-transformation-chain';
import { SpeedometerOdometer } from '@/lib/curriculum/diagrams/speedometer-odometer';
import { FormsOfEnergyNetwork } from '@/lib/curriculum/diagrams/forms-of-energy-network';
import { UnitConversionLadder } from '@/lib/curriculum/diagrams/unit-conversion-ladder';
import { HotCoffeeCooling } from '@/lib/curriculum/diagrams/hot-coffee-cooling';
import { EfficiencyBoundary } from '@/lib/curriculum/diagrams/efficiency-boundary';

type DiagramComponent = (props: { layer: LayerKey }) => ReactElement;

const DIAGRAM_COMPONENTS: Record<string, DiagramComponent> = {
  EnergyTransformationChain,
  SpeedometerOdometer,
  FormsOfEnergyNetwork,
  UnitConversionLadder,
  HotCoffeeCooling,
  EfficiencyBoundary,
};

interface EntryProps {
  entrySlug: string;
  layer: LayerKey;
}

export function Entry({ entrySlug, layer }: EntryProps) {
  const entry = getEntry(entrySlug);
  const markLayerVisited = useProgressStore((s) => s.markLayerVisited);
  const l2Acknowledged = useProgressStore((s) =>
    entry ? s.isRetrievalAcknowledged(entry.id, 'L2') : false,
  );

  useEffect(() => {
    if (entry) markLayerVisited(entry.id, layer);
  }, [entry, layer, markLayerVisited]);

  if (!entry) {
    return <EntryNotFound entrySlug={entrySlug} />;
  }

  const next = getNextEntry(entry.id);
  const prev = getPrevEntry(entry.id);
  const layerContent = entry.layers[layer];
  const l3Disabled = !l2Acknowledged;

  return (
    <PageAtmosphere variant="hero">
      <div style={{ padding: S.xl, maxWidth: 1080, margin: '0 auto' }}>
        {/* Top bar: breadcrumb + layer toggle */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            gap:            S.lg,
            flexWrap:       'wrap',
            marginBottom:   S.lg,
          }}
        >
          <EntryBreadcrumb entryTitle={entry.title} layer={layer} />
          <LayerToggle
            l3Disabled={l3Disabled}
            l3DisabledTooltip="Engage with the L2 retrieval prompt to unlock L3."
          />
        </div>

        {/* Prerequisite chain (entries beyond #001) */}
        {entry.prerequisites.length > 0 && (
          <PrerequisiteChain prerequisites={entry.prerequisites} />
        )}

        {/* Header */}
        <Header entry={entry} layer={layer} />

        {/* ORACLE Wave 3 — AI lesson summary panel (collapsible). */}
        <LessonSummaryPanel entrySlug={entry.id} layer={layer} />

        {/* Body content (layer-dependent) */}
        {layer === 'L1' && <LayerOneBody entry={entry} content={layerContent} />}
        {layer === 'L2' && <LayerTwoBody entry={entry} content={layerContent} />}
        {layer === 'L3' && <LayerThreeBody entry={entry} content={layerContent} />}

        {/* Footer: Prev / Next / Back */}
        <Footer
          prevSlug={prev?.id ?? null}
          prevTitle={prev?.title ?? null}
          nextSlug={next?.id ?? null}
          nextTitle={next?.title ?? null}
          nextDisabled={l3Disabled}
        />
      </div>
    </PageAtmosphere>
  );
}

function Header({ entry, layer }: { entry: CurriculumEntry; layer: LayerKey }) {
  const entryNum = entry.number.toString().padStart(3, '0');
  return (
    <header style={{ marginBottom: S.xxl }}>
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
        Entry {entryNum} · Foundations of Energy
      </div>
      <h1
        style={{
          margin:        0,
          marginBottom:  S.sm,
          fontFamily:    F.display,
          fontSize:      56,
          lineHeight:    1.05,
          color:         C.textPrimary,
          fontWeight:    400,
          letterSpacing: '-0.02em',
        }}
      >
        {entry.title}
      </h1>
      <div
        style={{
          fontFamily:    F.display,
          fontStyle:     'italic',
          fontSize:      22,
          color:         'rgba(255,255,255,0.55)',
          fontWeight:    400,
          lineHeight:    1.4,
          maxWidth:      900,
          marginBottom:  S.md,
        }}
      >
        {entry.thresholdConcept}
      </div>
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        S.md,
          fontFamily: F.mono,
          fontSize:   10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color:      C.textMuted,
        }}
      >
        <span>{entry.estimatedReadingTime[layer]} min read</span>
        <span aria-hidden>·</span>
        <span>Misconception · {entry.misconceptionDefeated}</span>
      </div>
    </header>
  );
}

function ProseBlock({
  body,
  currentEntryId,
  fontSize = 16,
}: {
  body: string;
  currentEntryId: string;
  fontSize?: number;
}) {
  return <MarkdownProse body={body} currentEntryId={currentEntryId} fontSize={fontSize} />;
}

function Diagram({ entry, layer }: { entry: CurriculumEntry; layer: LayerKey }) {
  const Component = DIAGRAM_COMPONENTS[entry.diagramSpec.componentName];
  if (!Component) return null;
  return (
    <ContainedCard padding={S.lg} style={{ marginTop: S.xl, marginBottom: S.xl }}>
      <Component layer={layer} />
      <div
        style={{
          marginTop:  S.md,
          fontFamily: F.display,
          fontStyle:  'italic',
          fontSize:   13,
          color:      'rgba(255,255,255,0.45)',
          textAlign:  'center',
        }}
      >
        {entry.diagramSpec.title} · {layer}
      </div>
    </ContainedCard>
  );
}

function LayerOneBody({
  entry,
  content,
}: {
  entry: CurriculumEntry;
  content: EntryLayerContent;
}) {
  return (
    <>
      <ProseBlock body={content.body} currentEntryId={entry.id} />
      {content.examples && content.examples.length > 0 && (
        <div
          style={{
            marginTop:           S.xl,
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap:                 S.md,
          }}
        >
          {content.examples.map((ex) => (
            <ContainedCard key={ex.id} padding={S.lg}>
              <div
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        S.sm,
                  flexWrap:   'wrap',
                  marginBottom: S.md,
                }}
              >
                {ex.audienceTags.map((tag) => (
                  <AudienceTag key={tag} archetype={tag} />
                ))}
              </div>
              <div
                style={{
                  fontFamily:    F.display,
                  fontStyle:     'italic',
                  fontSize:      18,
                  color:         C.textPrimary,
                  marginBottom:  S.sm,
                  lineHeight:    1.3,
                }}
              >
                {ex.title}
              </div>
              <ProseBlock body={ex.body} currentEntryId={entry.id} fontSize={14} />
            </ContainedCard>
          ))}
        </div>
      )}
      <Diagram entry={entry} layer="L1" />
      {content.closingAnchor && <ClosingAnchor text={content.closingAnchor} />}
      {content.retrievalPrompt && (
        <GradedRetrievalPrompt entry={entry} layer="L1" prompt={content.retrievalPrompt} />
      )}
    </>
  );
}

function LayerTwoBody({
  entry,
  content,
}: {
  entry: CurriculumEntry;
  content: EntryLayerContent;
}) {
  return (
    <>
      <ProseBlock body={content.body} currentEntryId={entry.id} />
      <Diagram entry={entry} layer="L2" />
      {content.workedExample && (
        <WorkedExample workedExample={content.workedExample} currentEntryId={entry.id} />
      )}
      {content.retrievalPrompt && (
        <GradedRetrievalPrompt entry={entry} layer="L2" prompt={content.retrievalPrompt} />
      )}
    </>
  );
}

/**
 * ORACLE Wave 3 — wraps SCRIBE's RetrievalPrompt in a RetrievalPromptGrader.
 * Falls back to the bare SCRIBE component if buildRetrievalPromptInstance
 * returns null (defensive — should never happen for prompts that exist in
 * the entry data).
 */
function GradedRetrievalPrompt({
  entry,
  layer,
  prompt,
}: {
  entry: CurriculumEntry;
  layer: LayerKey;
  prompt: string;
}) {
  const instance = buildRetrievalPromptInstance(entry, layer);
  if (!instance) {
    return <RetrievalPrompt entryId={entry.id} layer={layer} prompt={prompt} />;
  }
  return (
    <RetrievalPromptGrader instance={instance}>
      <RetrievalPrompt entryId={entry.id} layer={layer} prompt={prompt} />
    </RetrievalPromptGrader>
  );
}

function LayerThreeBody({
  entry,
  content,
}: {
  entry: CurriculumEntry;
  content: EntryLayerContent;
}) {
  return (
    <>
      <ProseBlock body={content.body} currentEntryId={entry.id} />
      <Diagram entry={entry} layer="L3" />
      {content.primarySources && <PrimarySourceList sources={content.primarySources} />}
    </>
  );
}

function Footer({
  prevSlug,
  prevTitle,
  nextSlug,
  nextTitle,
  nextDisabled,
}: {
  prevSlug: string | null;
  prevTitle: string | null;
  nextSlug: string | null;
  nextTitle: string | null;
  nextDisabled: boolean;
}) {
  return (
    <div
      style={{
        marginTop:    S.xxl,
        paddingTop:   S.lg,
        borderTop:    `1px solid ${C.borderDefault}`,
        display:      'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:   'center',
        flexWrap:     'wrap',
        gap:          S.md,
      }}
    >
      {prevSlug && prevTitle ? (
        <Link
          to={`/vault/alexandria/entry/${prevSlug}?layer=L1`}
          style={{
            fontFamily:     F.mono,
            fontSize:       12,
            fontWeight:     600,
            letterSpacing:  '0.10em',
            textTransform:  'uppercase',
            color:          C.electricBlue,
            textDecoration: 'none',
            border:         `1px solid ${C.borderActive}`,
            borderRadius:   R.md,
            padding:        `${S.sm} ${S.lg}`,
          }}
        >
          ← Previous: {prevTitle}
        </Link>
      ) : (
        <span />
      )}

      <Link
        to="/vault/alexandria"
        style={{
          fontFamily:     F.mono,
          fontSize:       11,
          fontWeight:     600,
          letterSpacing:  '0.12em',
          textTransform:  'uppercase',
          color:          C.textMuted,
          textDecoration: 'none',
        }}
      >
        Back to Alexandria
      </Link>

      {nextSlug && nextTitle ? (
        nextDisabled ? (
          <span
            title="Engage with the L2 retrieval prompt to continue."
            aria-disabled
            style={{
              fontFamily:     F.mono,
              fontSize:       12,
              fontWeight:     600,
              letterSpacing:  '0.10em',
              textTransform:  'uppercase',
              color:          C.textMuted,
              border:         `1px solid ${C.borderDefault}`,
              borderRadius:   R.md,
              padding:        `${S.sm} ${S.lg}`,
              cursor:         'not-allowed',
              opacity:        0.5,
            }}
          >
            Next: {nextTitle} →
          </span>
        ) : (
          <Link
            to={`/vault/alexandria/entry/${nextSlug}?layer=L1`}
            style={{
              fontFamily:     F.mono,
              fontSize:       12,
              fontWeight:     600,
              letterSpacing:  '0.10em',
              textTransform:  'uppercase',
              color:          C.bgBase,
              background:     C.electricBlue,
              border:         `1px solid ${C.electricBlue}`,
              borderRadius:   R.md,
              padding:        `${S.sm} ${S.lg}`,
              textDecoration: 'none',
            }}
          >
            Next: {nextTitle} →
          </Link>
        )
      ) : (
        <span />
      )}
    </div>
  );
}

function EntryNotFound({ entrySlug }: { entrySlug: string }) {
  return (
    <PageAtmosphere variant="hero">
      <div
        style={{
          padding:       S.xl,
          maxWidth:      720,
          margin:        '0 auto',
          display:       'flex',
          flexDirection: 'column',
          gap:           S.lg,
          alignItems:    'flex-start',
        }}
      >
        <div
          style={{
            fontFamily:    F.mono,
            fontSize:      11,
            fontWeight:    600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         C.alertWarning,
          }}
        >
          404 · Entry Not Found
        </div>
        <div
          style={{
            fontFamily:    F.display,
            fontSize:      48,
            color:         C.textPrimary,
            fontWeight:    400,
            letterSpacing: '-0.02em',
          }}
        >
          Coming soon.
        </div>
        <div
          style={{
            fontFamily: F.sans,
            fontSize:   16,
            color:      C.textSecondary,
            lineHeight: 1.5,
          }}
        >
          We haven't authored{' '}
          <code style={{ fontFamily: F.mono, color: C.electricBlue }}>{entrySlug}</code> yet. The
          Sub-Tier 1A entries are live; later sub-tiers are next.
        </div>
        <Link
          to="/vault/alexandria"
          style={{
            fontFamily:     F.mono,
            fontSize:       12,
            fontWeight:     600,
            letterSpacing:  '0.10em',
            textTransform:  'uppercase',
            color:          C.electricBlue,
            textDecoration: 'none',
            display:        'inline-flex',
            alignItems:     'center',
            gap:            S.xs,
            padding:        `${S.sm} ${S.md}`,
            border:         `1px solid ${C.borderActive}`,
            borderRadius:   R.md,
          }}
        >
          ← Back to Alexandria
        </Link>
      </div>
    </PageAtmosphere>
  );
}

export default Entry;

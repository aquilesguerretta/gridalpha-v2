// SCRIBE — Alexandria lesson viewer.
// Looks the lesson up by id, renders the editorial layout, mounts the quiz,
// and fires the visited-side-effect on mount.

import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { PageAtmosphere } from '@/components/terminal/PageAtmosphere';
import { ALEXANDRIA_NODES } from '@/lib/mock/vault-mock';
import { getLesson, getNextLesson } from '@/lib/curriculum';
import { useProgressStore } from '@/stores/progressStore';
import type { Lesson as LessonModel, LessonDiagram } from '@/lib/types/curriculum';
import { LessonQuiz } from './LessonQuiz';

interface LessonProps {
  lessonId: string;
}

export function Lesson({ lessonId }: LessonProps) {
  const lesson = getLesson(lessonId);
  const next = lesson ? getNextLesson(lesson.id) : null;
  const markVisited = useProgressStore((s) => s.markVisited);
  const isCompleted = useProgressStore((s) => s.isCompleted(lessonId));

  useEffect(() => {
    if (lesson) markVisited(lesson.id);
  }, [lesson, markVisited]);

  if (!lesson) {
    return <LessonNotFound lessonId={lessonId} />;
  }

  return (
    <PageAtmosphere variant="hero">
      <div style={{ padding: S.xl, maxWidth: 1080, margin: '0 auto' }}>
        <BackLink />
        <Header lesson={lesson} completed={isCompleted} />
        <Body lesson={lesson} />
        <LessonQuiz lessonId={lesson.id} quiz={lesson.quiz} />
        <Footer lesson={lesson} next={next} />
      </div>
    </PageAtmosphere>
  );
}

function BackLink() {
  return (
    <Link
      to="/vault/alexandria"
      style={{
        fontFamily:     F.mono,
        fontSize:       11,
        fontWeight:     600,
        letterSpacing:  '0.12em',
        textTransform:  'uppercase',
        color:          C.electricBlue,
        textDecoration: 'none',
        display:        'inline-flex',
        alignItems:     'center',
        gap:            S.xs,
        marginBottom:   S.lg,
      }}
    >
      ← Alexandria
    </Link>
  );
}

function Header({ lesson, completed }: { lesson: LessonModel; completed: boolean }) {
  return (
    <header style={{ marginBottom: S.xxl }}>
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            S.md,
          marginBottom:   S.md,
        }}
      >
        <span
          style={{
            fontFamily:    F.mono,
            fontSize:      11,
            fontWeight:    600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color:         C.electricBlue,
            border:        `1px solid ${C.borderActive}`,
            borderRadius:  R.sm,
            padding:       '4px 10px',
          }}
        >
          {lesson.eyebrow}
        </span>
        <span
          style={{
            fontFamily:    F.mono,
            fontSize:      11,
            color:         C.textMuted,
            letterSpacing: '0.10em',
          }}
        >
          {lesson.readingMinutes} MIN READ
        </span>
        {completed && (
          <span
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            6,
              marginLeft:     'auto',
              fontFamily:     F.mono,
              fontSize:       10,
              fontWeight:     600,
              letterSpacing:  '0.12em',
              textTransform:  'uppercase',
              color:          C.alertNormal,
            }}
          >
            <span
              style={{
                width:        6,
                height:       6,
                borderRadius: '50%',
                background:   C.alertNormal,
              }}
            />
            Completed
          </span>
        )}
      </div>

      <h1
        style={{
          fontFamily:    F.display,
          fontSize:      56,
          lineHeight:    1.05,
          color:         C.textPrimary,
          fontWeight:    400,
          letterSpacing: '-0.02em',
          margin:        0,
          marginBottom:  S.sm,
        }}
      >
        {lesson.title}
      </h1>

      <div
        style={{
          fontFamily:    F.display,
          fontSize:      24,
          fontStyle:     'italic',
          color:         'rgba(255,255,255,0.45)',
          fontWeight:    400,
          lineHeight:    1.3,
          maxWidth:      840,
        }}
      >
        {lesson.identity}
      </div>
    </header>
  );
}

function Body({ lesson }: { lesson: LessonModel }) {
  // Diagram lands between section 2 and section 3 by default,
  // or after section 1 if there are only two sections.
  const diagramAfterIndex = useMemo(() => {
    if (lesson.sections.length <= 2) return 0;
    return 1;
  }, [lesson.sections.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.xl }}>
      {lesson.sections.map((section, i) => (
        <div key={i}>
          <Section heading={section.heading} content={section.content} />
          {i === diagramAfterIndex && <Diagram diagram={lesson.diagram} />}
        </div>
      ))}
    </div>
  );
}

function Section({ heading, content }: { heading: string; content: string }) {
  const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);
  return (
    <section style={{ marginBottom: S.lg }}>
      <EditorialIdentity size="hero">{heading}</EditorialIdentity>
      <div style={{ height: S.md }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.md, maxWidth: 780 }}>
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              margin:     0,
              fontFamily: F.sans,
              fontSize:   16,
              color:      C.textSecondary,
              lineHeight: 1.7,
            }}
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

function Diagram({ diagram }: { diagram: LessonDiagram }) {
  return (
    <ContainedCard
      padding={S.lg}
      style={{ marginTop: S.xl, marginBottom: S.xl }}
    >
      {diagram.type === 'svg' && diagram.svg ? (
        <div
          role="img"
          aria-label={diagram.altText}
          style={{ width: '100%', display: 'block' }}
          dangerouslySetInnerHTML={{ __html: diagram.svg }}
        />
      ) : (
        <div
          role="img"
          aria-label={diagram.altText}
          style={{
            height:        220,
            display:       'flex',
            alignItems:    'center',
            justifyContent:'center',
            border:        `1px dashed ${C.borderDefault}`,
            borderRadius:  R.md,
            fontFamily:    F.mono,
            fontSize:      11,
            color:         C.textMuted,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Diagram pending
        </div>
      )}
      <div
        style={{
          marginTop:  S.md,
          fontFamily: F.display,
          fontSize:   14,
          fontStyle:  'italic',
          color:      'rgba(255,255,255,0.45)',
          textAlign:  'center',
        }}
      >
        {diagram.caption}
      </div>
    </ContainedCard>
  );
}

function Footer({ lesson, next }: { lesson: LessonModel; next: LessonModel | null }) {
  const conceptLabels = useMemo(() => {
    return lesson.relatedConcepts.map((id) => {
      const node = ALEXANDRIA_NODES.find((n) => n.id === id);
      return { id, label: node?.label ?? id };
    });
  }, [lesson.relatedConcepts]);

  return (
    <div
      style={{
        marginTop:    S.xxl,
        paddingTop:   S.lg,
        borderTop:    `1px solid ${C.borderDefault}`,
        display:      'flex',
        flexDirection: 'column',
        gap:          S.lg,
      }}
    >
      <div>
        <div
          style={{
            fontFamily:    F.mono,
            fontSize:      10,
            fontWeight:    600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         C.textMuted,
            marginBottom:  S.sm,
          }}
        >
          Related concepts
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: S.sm }}>
          {conceptLabels.map((c) => (
            <Link
              key={c.id}
              to="/vault/alexandria"
              style={{
                fontFamily:     F.mono,
                fontSize:       11,
                fontWeight:     500,
                letterSpacing:  '0.06em',
                color:          C.electricBlue,
                textDecoration: 'none',
                border:         `1px solid ${C.borderActive}`,
                borderRadius:   R.sm,
                padding:        '4px 10px',
                background:     C.electricBlueWash,
              }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {next ? (
        <Link
          to={`/vault/alexandria/lesson/${next.id}`}
          style={{
            alignSelf:      'flex-start',
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
          Next: {next.title} →
        </Link>
      ) : (
        <Link
          to="/vault/alexandria"
          style={{
            alignSelf:      'flex-start',
            fontFamily:     F.mono,
            fontSize:       12,
            fontWeight:     600,
            letterSpacing:  '0.10em',
            textTransform:  'uppercase',
            color:          C.electricBlue,
            border:         `1px solid ${C.borderActive}`,
            borderRadius:   R.md,
            padding:        `${S.sm} ${S.lg}`,
            textDecoration: 'none',
          }}
        >
          ← Back to Alexandria
        </Link>
      )}
    </div>
  );
}

function LessonNotFound({ lessonId }: { lessonId: string }) {
  return (
    <PageAtmosphere variant="hero">
      <div
        style={{
          padding:        S.xl,
          display:        'flex',
          flexDirection:  'column',
          gap:            S.lg,
          alignItems:     'flex-start',
          maxWidth:       720,
          margin:         '0 auto',
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
          404 · LESSON NOT FOUND
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
          <code style={{ fontFamily: F.mono, color: C.electricBlue }}>{lessonId}</code> yet. The
          foundation tier is live; the mechanics and advanced tiers are next.
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

export default Lesson;

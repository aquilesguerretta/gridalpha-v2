// ORACLE Wave 3 — Recall session.
//
// Full-screen overlay that walks the student through N prompts from the
// recall queue, grading each in turn. Reachable from VaultIndex.
//
// Selection: top-priority items from gradingStore.buildRecallQueue.
// Default session size: 3 prompts. The user can configure it via the
// `sessionSize` prop (capped at 5).
//
// Flow:
//   1. Mount → load queue, select top N
//   2. Show prompt 1 → student answers → submits → graded
//   3. Click "Next" → advances to prompt 2
//   4. After last prompt's grade → completion summary
//   5. "Close" anywhere → unmounts the overlay

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { useGradingStore } from '@/stores/gradingStore';
import { useGradeAnswer } from '@/hooks/useGradeAnswer';
import { listRetrievalPromptInstances } from '@/lib/curriculum';
import type {
  RecallQueueItem,
  RetrievalPromptInstance,
} from '@/lib/types/grading';
import { GradeBadge } from './GradeBadge';
import { FeedbackPanel } from './FeedbackPanel';

export interface RecallSessionProps {
  /** Number of prompts the session walks through (max 5). */
  sessionSize?: number;
  /** Called when the user closes the overlay. */
  onClose: () => void;
}

const DEFAULT_SIZE = 3;
const MAX_SIZE = 5;

export function RecallSession({
  sessionSize = DEFAULT_SIZE,
  onClose,
}: RecallSessionProps) {
  const buildRecallQueue = useGradingStore((s) => s.buildRecallQueue);

  // Snapshot the queue once on mount so the order doesn't shuffle
  // beneath the user mid-session as they grade earlier prompts.
  const session = useMemo(() => {
    const allPrompts = listRetrievalPromptInstances();
    const queue = buildRecallQueue(allPrompts);
    const N = Math.min(Math.max(1, sessionSize), MAX_SIZE);
    const top = queue.slice(0, N);
    const promptsById = new Map(allPrompts.map((p) => [p.promptId, p]));
    return top
      .map((q) => promptsById.get(q.promptId))
      .filter((p): p is RetrievalPromptInstance => Boolean(p))
      .map((p, idx) => ({ prompt: p, queueItem: top[idx] }));
    // Intentionally exclude `buildRecallQueue` from deps — we want a
    // stable snapshot for the duration of the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionSize]);

  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  // ESC closes the overlay.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const empty = session.length === 0;
  const current = !empty ? session[index] : null;
  const isLast = !empty && index === session.length - 1;

  const handleNext = () => {
    if (isLast) {
      setCompleted(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recall session"
      style={{
        position:    'fixed',
        inset:       0,
        zIndex:      9700,
        background:  'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)',
        display:     'flex',
        alignItems:  'flex-start',
        justifyContent: 'center',
        overflowY:   'auto',
        padding:     S.xl,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width:        '100%',
          maxWidth:     820,
          marginTop:    S.xl,
          marginBottom: S.xl,
          display:      'flex',
          flexDirection: 'column',
          gap:          S.lg,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        S.md,
          }}
        >
          <span
            style={{
              fontFamily:    F.mono,
              fontSize:      11,
              fontWeight:    600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         C.falconGold,
            }}
          >
            Recall Session
          </span>
          {!empty && !completed && (
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      10,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color:         C.textMuted,
              }}
            >
              Prompt {index + 1} of {session.length}
            </span>
          )}
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close recall session"
            style={{
              fontFamily:    F.mono,
              fontSize:      11,
              fontWeight:    600,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color:         C.textSecondary,
              background:    'transparent',
              border:        `1px solid ${C.borderDefault}`,
              borderRadius:  R.sm,
              padding:       `${S.xs} ${S.md}`,
              cursor:        'pointer',
            }}
          >
            Close · ESC
          </button>
        </div>

        {/* Session body */}
        {empty ? (
          <ContainedCard padding={S.xl}>
            <div
              style={{
                fontFamily:    F.display,
                fontSize:      32,
                fontStyle:     'italic',
                color:         'rgba(255,255,255,0.85)',
                marginBottom:  S.md,
              }}
            >
              No prompts to recall yet.
            </div>
            <p
              style={{
                margin:     0,
                fontFamily: F.sans,
                fontSize:   14,
                lineHeight: 1.55,
                color:      C.textSecondary,
              }}
            >
              Open an Alexandria entry, answer a retrieval prompt, and
              the recall session will pick up tomorrow.
            </p>
          </ContainedCard>
        ) : completed ? (
          <CompletionCard
            attempted={session.length}
            onClose={onClose}
          />
        ) : current ? (
          <RecallCard
            prompt={current.prompt}
            queueItem={current.queueItem}
            isLast={isLast}
            onNext={handleNext}
          />
        ) : null}
      </div>
    </div>
  );
}

// ─── Single-prompt card ──────────────────────────────────────────────

function RecallCard({
  prompt,
  queueItem,
  isLast,
  onNext,
}: {
  prompt: RetrievalPromptInstance;
  queueItem: RecallQueueItem;
  isLast: boolean;
  onNext: () => void;
}) {
  const { latestGrade, isGrading, error, submit } = useGradeAnswer(prompt);
  const [draft, setDraft] = useState('');
  const submitDisabled = isGrading || draft.trim().length === 0;

  // Auto-clear the input when we transition to a new prompt mid-session.
  useEffect(() => {
    setDraft('');
  }, [prompt.promptId]);

  return (
    <ContainedCard padding={S.lg}>
      {/* Prompt meta */}
      <div
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           S.md,
          marginBottom:  S.md,
          flexWrap:      'wrap',
        }}
      >
        <span
          style={{
            fontFamily:    F.mono,
            fontSize:      10,
            fontWeight:    600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color:         C.electricBlue,
          }}
        >
          {prompt.entryTitle} · Layer {prompt.layer}
        </span>
        {queueItem.lastGrade ? (
          <GradeBadge grade={queueItem.lastGrade} label={`Last: ${queueItem.lastGrade}`} />
        ) : (
          <span
            style={{
              fontFamily:    F.mono,
              fontSize:      10,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color:         C.electricBlueLight,
            }}
          >
            Fresh prompt
          </span>
        )}
        {Number.isFinite(queueItem.daysSinceLastSeen) &&
          queueItem.daysSinceLastSeen > 0 && (
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      10,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color:         C.textMuted,
              }}
            >
              Seen {queueItem.daysSinceLastSeen}d ago
            </span>
          )}
      </div>

      {/* Question */}
      <p
        style={{
          margin:     0,
          marginBottom: S.lg,
          fontFamily: F.display,
          fontStyle:  'italic',
          fontSize:   22,
          lineHeight: 1.4,
          color:      C.textPrimary,
        }}
      >
        {prompt.questionText}
      </p>

      {/* Input or feedback */}
      {!latestGrade && (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (!submitDisabled) void submit(draft.trim());
              }
            }}
            disabled={isGrading}
            placeholder="Write your answer in your own words…"
            rows={5}
            style={{
              width:        '100%',
              boxSizing:    'border-box',
              background:   C.bgSurface,
              border:       `1px solid ${C.borderDefault}`,
              borderTop:    `1px solid ${C.borderAccent}`,
              borderRadius: R.md,
              padding:      S.md,
              fontFamily:   F.sans,
              fontSize:     14,
              lineHeight:   1.5,
              color:        C.textPrimary,
              resize:       'vertical',
              outline:      'none',
              caretColor:   C.electricBlue,
              opacity:      isGrading ? 0.6 : 1,
            }}
          />

          {error && (
            <div
              role="alert"
              style={{
                marginTop:    S.sm,
                padding:      `${S.sm} ${S.md}`,
                background:   'rgba(239,68,68,0.08)',
                border:       `1px solid ${C.borderAlert}`,
                borderRadius: R.md,
                fontFamily:   F.sans,
                fontSize:     13,
                lineHeight:   1.45,
                color:        C.alertCritical,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginTop:  S.md,
              display:    'flex',
              alignItems: 'center',
              gap:        S.md,
            }}
          >
            <button
              type="button"
              onClick={() => void submit(draft.trim())}
              disabled={submitDisabled}
              style={{
                fontFamily:    F.mono,
                fontSize:      12,
                fontWeight:    600,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color:         submitDisabled ? C.textMuted : C.bgBase,
                background:    submitDisabled ? 'transparent' : C.electricBlue,
                border:        `1px solid ${
                  submitDisabled ? C.borderDefault : C.electricBlue
                }`,
                borderRadius:  R.md,
                padding:       `${S.sm} ${S.lg}`,
                cursor:        submitDisabled ? 'default' : 'pointer',
              }}
            >
              {isGrading ? 'Grading…' : 'Submit answer'}
            </button>
            <Link
              to={`/vault/alexandria/entry/${prompt.entrySlug}?layer=${prompt.layer}`}
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                fontWeight:    500,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color:         C.textMuted,
                textDecoration: 'none',
              }}
            >
              View entry →
            </Link>
          </div>
        </>
      )}

      {latestGrade && (
        <>
          <FeedbackPanel
            graded={latestGrade}
            onTryAgain={() => {
              // In a recall session "Try again" doesn't reset history —
              // we keep the attempt and let the user move forward.
              setDraft('');
            }}
          />
          <div style={{ marginTop: S.md, display: 'flex', gap: S.md }}>
            <button
              type="button"
              onClick={onNext}
              style={{
                fontFamily:    F.mono,
                fontSize:      12,
                fontWeight:    600,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color:         C.bgBase,
                background:    C.falconGold,
                border:        `1px solid ${C.falconGold}`,
                borderRadius:  R.md,
                padding:       `${S.sm} ${S.lg}`,
                cursor:        'pointer',
              }}
            >
              {isLast ? 'Finish session' : 'Next prompt →'}
            </button>
          </div>
        </>
      )}
    </ContainedCard>
  );
}

// ─── Completion card ─────────────────────────────────────────────────

function CompletionCard({
  attempted,
  onClose,
}: {
  attempted: number;
  onClose: () => void;
}) {
  return (
    <ContainedCard padding={S.xl}>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      11,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         C.falconGold,
          marginBottom:  S.sm,
        }}
      >
        Session Complete
      </div>
      <div
        style={{
          fontFamily:   F.display,
          fontStyle:    'italic',
          fontSize:     32,
          color:        C.textPrimary,
          marginBottom: S.md,
        }}
      >
        {attempted} {attempted === 1 ? 'prompt' : 'prompts'} graded.
      </div>
      <p
        style={{
          margin:     0,
          marginBottom: S.lg,
          fontFamily: F.sans,
          fontSize:   14,
          lineHeight: 1.55,
          color:      C.textSecondary,
        }}
      >
        Recall sessions strengthen the concepts you missed and rotate
        in fresh prompts you haven&rsquo;t seen yet. Come back tomorrow
        for a different slice.
      </p>
      <button
        type="button"
        onClick={onClose}
        style={{
          fontFamily:    F.mono,
          fontSize:      12,
          fontWeight:    600,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color:         C.electricBlue,
          background:    'transparent',
          border:        `1px solid ${C.borderActive}`,
          borderRadius:  R.md,
          padding:       `${S.sm} ${S.lg}`,
          cursor:        'pointer',
        }}
      >
        Done
      </button>
    </ContainedCard>
  );
}

export default RecallSession;

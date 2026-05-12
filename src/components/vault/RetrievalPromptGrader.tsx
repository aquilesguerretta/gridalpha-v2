// ORACLE Wave 3 — RetrievalPrompt grader wrapper.
//
// Wraps SCRIBE's <RetrievalPrompt> verbatim (passed as children) and adds
// the grading UI below it: a textarea for the answer, a Submit button,
// loading state, error banner, and the FeedbackPanel rendered against the
// latest GradedAnswer. SCRIBE's component itself is never modified.

import { useState, type ReactNode, type KeyboardEvent } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { useGradeAnswer } from '@/hooks/useGradeAnswer';
import type { RetrievalPromptInstance } from '@/lib/types/grading';
import { FeedbackPanel } from './FeedbackPanel';

interface Props {
  /** Canonical RetrievalPromptInstance for this prompt (built in
   *  curriculum/index.ts). Drives both the grader call and persistence. */
  instance: RetrievalPromptInstance;
  /** SCRIBE's <RetrievalPrompt> rendered verbatim — the question card. */
  children: ReactNode;
  /** Optional anchor base for FeedbackPanel's "Re-read" pointer. */
  anchorBase?: string;
}

export function RetrievalPromptGrader({
  instance,
  children,
  anchorBase,
}: Props) {
  const { latestGrade, isGrading, error, submit, retry } =
    useGradeAnswer(instance);
  const [draft, setDraft] = useState('');

  const trimmed = draft.trim();
  const submitDisabled = isGrading || trimmed.length === 0;

  const handleSubmit = () => {
    if (submitDisabled) return;
    void submit(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl+Enter submits; Shift+Enter inserts a newline.
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRetry = () => {
    retry();
    setDraft('');
  };

  return (
    <div data-oracle-grader={instance.promptId}>
      {/* SCRIBE's RetrievalPrompt — the question card. */}
      {children}

      {/* If the latest grade is visible, hide the input. The user can
          revise via the panel's "Try again" — that calls retry() which
          flips dismissed and re-shows the input. */}
      {!latestGrade && (
        <div
          style={{
            marginTop:    S.md,
            display:      'flex',
            flexDirection: 'column',
            gap:          S.sm,
          }}
        >
          <label
            htmlFor={`grader-${instance.promptId}`}
            style={{
              fontFamily:    F.mono,
              fontSize:      10,
              fontWeight:    600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color:         C.electricBlue,
            }}
          >
            Your answer · graded by GridAlpha AI
          </label>
          <textarea
            id={`grader-${instance.promptId}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGrading}
            placeholder="Write your answer in your own words. 2–4 sentences is plenty."
            rows={4}
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
              transition:   'opacity 150ms cubic-bezier(0.4,0,0.2,1)',
            }}
          />

          {error && (
            <div
              role="alert"
              style={{
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
              display:    'flex',
              alignItems: 'center',
              gap:        S.md,
            }}
          >
            <button
              type="button"
              onClick={handleSubmit}
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
                transition:    'all 150ms cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {isGrading ? 'Grading…' : 'Submit answer'}
            </button>
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      10,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color:         C.textMuted,
              }}
            >
              {isGrading
                ? 'GridAlpha AI is reading your answer…'
                : '⌘/Ctrl + Enter to submit'}
            </span>
          </div>
        </div>
      )}

      {latestGrade && (
        <FeedbackPanel
          graded={latestGrade}
          onTryAgain={handleRetry}
          anchorBase={anchorBase}
        />
      )}
    </div>
  );
}

export default RetrievalPromptGrader;

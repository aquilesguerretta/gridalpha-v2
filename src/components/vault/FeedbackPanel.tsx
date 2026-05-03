// ORACLE Wave 3 — graded-answer feedback panel.
// Renders below the student's answer once a GradedAnswer lands.
//
// Layout: GradeBadge + attempt counter on top row; HIT / MISSED concept
// columns; prose feedback paragraph; pointer-link to entry section if
// present; "Try again" button to reset the input for revision.

import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import type { GradedAnswer } from '@/lib/types/grading';
import { GradeBadge } from './GradeBadge';

interface Props {
  graded: GradedAnswer;
  /** Called when the student wants to revise — resets input + hides panel. */
  onTryAgain: () => void;
  /** Optional: if the entry exposes section anchors, the panel will
   *  render the pointer as a link. Otherwise it renders as quoted text. */
  anchorBase?: string;
}

export function FeedbackPanel({ graded, onTryAgain, anchorBase }: Props) {
  const pointer = graded.pointerToSection?.trim();
  const pointerHref = pointer && anchorBase ? `${anchorBase}#${slug(pointer)}` : null;

  return (
    <ContainedCard padding={S.lg} style={{ marginTop: S.md }}>
      {/* Top row: grade + attempt counter */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        S.md,
          marginBottom: S.md,
        }}
      >
        <GradeBadge grade={graded.grade} />
        <span
          style={{
            fontFamily:    F.mono,
            fontSize:      10,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color:         C.textMuted,
          }}
        >
          Attempt {graded.attemptNumber}
        </span>
      </div>

      {/* Hit / missed columns */}
      {(graded.conceptsHit.length > 0 || graded.conceptsMissed.length > 0) && (
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap:                 S.md,
            marginBottom:        S.md,
          }}
        >
          <ConceptColumn
            label="Hit"
            color={C.electricBlue}
            symbol="✓"
            items={graded.conceptsHit}
          />
          <ConceptColumn
            label="Missed"
            color={C.alertHigh}
            symbol="✗"
            items={graded.conceptsMissed}
            mutedWhenEmpty
          />
        </div>
      )}

      {/* Feedback prose */}
      <p
        style={{
          margin:     0,
          marginBottom: S.md,
          fontFamily: F.sans,
          fontSize:   14,
          lineHeight: 1.55,
          color:      C.textPrimary,
        }}
      >
        {graded.feedback}
      </p>

      {/* Pointer to section */}
      {pointer && (
        <div
          style={{
            marginBottom: S.md,
            padding:      `${S.sm} ${S.md}`,
            background:   C.bgSurface,
            border:       `1px solid ${C.borderDefault}`,
            borderTop:    `1px solid ${C.borderAccent}`,
            borderRadius: R.md,
            fontFamily:   F.sans,
            fontSize:     13,
            lineHeight:   1.4,
            color:        C.textSecondary,
          }}
        >
          <span
            style={{
              fontFamily:    F.mono,
              fontSize:      10,
              fontWeight:    600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         C.electricBlueLight,
              marginRight:   S.sm,
            }}
          >
            Re-read
          </span>
          {pointerHref ? (
            <a
              href={pointerHref}
              style={{ color: C.electricBlue, textDecoration: 'none' }}
            >
              {pointer}
            </a>
          ) : (
            <span style={{ color: C.textPrimary }}>{pointer}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: S.sm }}>
        <button
          type="button"
          onClick={onTryAgain}
          style={{
            fontFamily:    F.mono,
            fontSize:      11,
            fontWeight:    600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         C.electricBlue,
            background:    'transparent',
            border:        `1px solid ${C.borderActive}`,
            borderRadius:  R.md,
            padding:       `${S.sm} ${S.lg}`,
            cursor:        'pointer',
            transition:    'background-color 150ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          Try again
        </button>
      </div>
    </ContainedCard>
  );
}

// ─── Concept column ─────────────────────────────────────────────────

function ConceptColumn({
  label,
  color,
  symbol,
  items,
  mutedWhenEmpty,
}: {
  label: string;
  color: string;
  symbol: string;
  items: string[];
  mutedWhenEmpty?: boolean;
}) {
  const empty = items.length === 0;
  return (
    <div>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      10,
          fontWeight:    600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color:         empty && mutedWhenEmpty ? C.textMuted : color,
          marginBottom:  S.xs,
        }}
      >
        {label} {empty ? '' : `(${items.length})`}
      </div>
      {empty ? (
        <div
          style={{
            fontFamily: F.sans,
            fontSize:   13,
            color:      C.textMuted,
          }}
        >
          {mutedWhenEmpty ? '— none —' : ''}
        </div>
      ) : (
        <ul
          style={{
            margin:   0,
            padding:  0,
            listStyle: 'none',
            display:   'flex',
            flexDirection: 'column',
            gap:       S.xs,
          }}
        >
          {items.map((item) => (
            <li
              key={item}
              style={{
                display:    'flex',
                alignItems: 'flex-start',
                gap:        S.xs,
                fontFamily: F.sans,
                fontSize:   13,
                lineHeight: 1.4,
                color:      C.textPrimary,
              }}
            >
              <span
                aria-hidden
                style={{ color, flexShrink: 0, fontWeight: 600 }}
              >
                {symbol}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default FeedbackPanel;

// FORGE — Weekly review panel.
// Calls reviewPromptGenerator on the trader's entries and renders each
// surfaced prompt as a small card. Empty-state guides the user toward
// adding a few P&L-tagged entries to seed pattern detection.

import { useMemo, useState } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { useJournalStore } from '@/stores/journalStore';
import { generateReviewPrompts } from '@/lib/journal/reviewPromptGenerator';
import type { ReviewPrompt } from '@/lib/types/journal';

const TYPE_COLOR: Record<ReviewPrompt['type'], string> = {
  pattern: C.electricBlueLight,
  consistency: C.falconGold,
  reflection: C.textMuted,
  opportunity: C.alertNormal,
};

const TYPE_LABEL: Record<ReviewPrompt['type'], string> = {
  pattern: 'PATTERN',
  consistency: 'CONSISTENCY',
  reflection: 'REFLECTION',
  opportunity: 'OPPORTUNITY',
};

interface Props {
  onSelectRelated?: (relatedEntryIds: string[]) => void;
}

export function JournalReviewPanel({ onSelectRelated }: Props) {
  const entries = useJournalStore((s) => s.entries);
  const [refreshKey, setRefreshKey] = useState(0);

  const prompts = useMemo(
    () => generateReviewPrompts(entries),
    // refreshKey is intentionally a dependency so "Refresh" works
    // even if entries reference is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, refreshKey],
  );

  return (
    <ContainedCard padding={S.lg}>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: C.electricBlueLight,
          marginBottom: 4,
        }}
      >
        WEEKLY REVIEW
      </div>
      <EditorialIdentity size="section" marginBottom={S.lg}>
        Patterns to consider.
      </EditorialIdentity>

      {prompts.length === 0 ? (
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 13,
            lineHeight: 1.6,
            color: C.textMuted,
            padding: `${S.md} 0`,
          }}
        >
          No review prompts yet. Add a few entries with P&amp;L and zones, and
          patterns will surface here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
          {prompts.map((p) => (
            <div
              key={p.id}
              style={{
                background: C.bgSurface,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: R.md,
                padding: S.md,
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: F.mono,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: TYPE_COLOR[p.type],
                  marginBottom: S.sm,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: TYPE_COLOR[p.type],
                  }}
                />
                {TYPE_LABEL[p.type]}
              </div>
              <div
                style={{
                  fontFamily: F.sans,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: C.textPrimary,
                  marginBottom: S.sm,
                }}
              >
                {p.question}
              </div>
              {p.relatedEntryIds.length > 0 && onSelectRelated && (
                <button
                  type="button"
                  onClick={() => onSelectRelated(p.relatedEntryIds)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: F.mono,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.10em',
                    color: C.electricBlueLight,
                  }}
                >
                  {p.relatedEntryIds.length} related{' '}
                  {p.relatedEntryIds.length === 1 ? 'entry' : 'entries'} →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: S.lg,
          paddingTop: S.md,
          borderTop: `1px solid ${C.borderDefault}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: F.mono,
            fontSize: 10,
            color: C.textMuted,
            letterSpacing: '0.10em',
          }}
        >
          {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'}
        </span>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          style={{
            background: 'transparent',
            border: `1px solid ${C.borderDefault}`,
            borderRadius: R.md,
            padding: '6px 10px',
            cursor: 'pointer',
            fontFamily: F.mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.textSecondary,
          }}
        >
          Refresh prompts
        </button>
      </div>
    </ContainedCard>
  );
}

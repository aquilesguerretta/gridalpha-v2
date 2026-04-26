// FORGE — Single journal entry card.
// Renders title, body (with show-more), zones/tags chips, stance badge,
// P&L value, attachment thumbnails (with lightbox), and edit/delete/review
// actions. Wraps a FOUNDRY ContainedCard for the active-edge chrome.

import { useState } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import type { EntryStance, JournalEntry as JE } from '@/lib/types/journal';

interface Props {
  entry: JE;
  onEdit: (entry: JE) => void;
  onDelete: (entry: JE) => void;
  onMarkReviewed: (entryId: string) => void;
}

const STANCE_COLOR: Record<EntryStance, string> = {
  long: C.alertNormal,
  short: C.alertCritical,
  flat: C.electricBlue,
  observation: C.textMuted,
};

const STANCE_LABEL: Record<EntryStance, string> = {
  long: 'LONG',
  short: 'SHORT',
  flat: 'FLAT',
  observation: 'OBSERVATION',
};

const BODY_CLAMP_LINES = 4;

export function JournalEntry({ entry, onEdit, onDelete, onMarkReviewed }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const stanceColor = STANCE_COLOR[entry.stance];
  const pnlColor =
    entry.pnl == null
      ? C.textMuted
      : entry.pnl > 0
        ? C.falconGold
        : entry.pnl < 0
          ? C.alertCritical
          : C.textSecondary;

  const formattedPnl =
    entry.pnl == null
      ? '—'
      : `${entry.pnl >= 0 ? '+' : '−'}$${Math.abs(entry.pnl).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  return (
    <>
      <ContainedCard padding={S.lg}>
        {/* Top row: date + zones + tags + stance */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: S.sm,
            marginBottom: S.md,
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.textSecondary,
            }}
          >
            {entry.tradingDate}
          </span>

          <span style={{ color: C.borderStrong, fontSize: 10 }}>·</span>

          {/* Stance badge: 6×6 dot + 11px caps label */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: F.mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: stanceColor,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: stanceColor,
              }}
            />
            {STANCE_LABEL[entry.stance]}
          </span>

          {entry.zones.length > 0 && (
            <>
              <span style={{ color: C.borderStrong, fontSize: 10 }}>·</span>
              {entry.zones.map((z) => (
                <span
                  key={z}
                  style={{
                    fontFamily: F.mono,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: C.electricBlueLight,
                    background: C.electricBlueWash,
                    padding: '2px 6px',
                    borderRadius: R.sm,
                  }}
                >
                  {z}
                </span>
              ))}
            </>
          )}

          {entry.tags.length > 0 && (
            <>
              {entry.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: F.mono,
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    color: C.textSecondary,
                    background: C.bgSurface,
                    padding: '2px 6px',
                    borderRadius: R.sm,
                  }}
                >
                  #{t}
                </span>
              ))}
            </>
          )}

          {entry.reviewed && (
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: F.mono,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.alertNormal,
              }}
            >
              REVIEWED ✓
            </span>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily: F.sans,
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1.3,
            color: C.textPrimary,
            marginBottom: S.sm,
          }}
        >
          {entry.title}
        </div>

        {/* Body */}
        {entry.body && (
          <div
            style={{
              fontFamily: F.sans,
              fontSize: 14,
              lineHeight: 1.6,
              color: C.textSecondary,
              whiteSpace: 'pre-wrap',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: expanded ? 'unset' : BODY_CLAMP_LINES,
              overflow: expanded ? 'visible' : 'hidden',
              marginBottom: S.sm,
            }}
          >
            {entry.body}
          </div>
        )}

        {entry.body && entry.body.split('\n').length > BODY_CLAMP_LINES && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: F.mono,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.electricBlueLight,
              marginBottom: S.md,
            }}
          >
            {expanded ? '— Show less' : '+ Show more'}
          </button>
        )}

        {/* Attachments grid */}
        {entry.attachments.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: S.sm,
              marginTop: S.sm,
              marginBottom: S.md,
            }}
          >
            {entry.attachments.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setLightbox(a.dataUrl)}
                title={a.name}
                style={{
                  width: 80,
                  height: 80,
                  border: `1px solid ${C.borderDefault}`,
                  borderRadius: R.md,
                  background: C.bgSurface,
                  padding: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={a.dataUrl}
                  alt={a.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Footer: P&L + actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: S.lg,
            paddingTop: S.md,
            borderTop: `1px solid ${C.borderDefault}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: S.sm }}>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.textMuted,
              }}
            >
              P&amp;L
            </span>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 14,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: pnlColor,
              }}
            >
              {formattedPnl}
            </span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: S.md }}>
            {!entry.reviewed && (
              <button
                type="button"
                onClick={() => onMarkReviewed(entry.id)}
                style={actionLinkStyle(C.alertNormal)}
              >
                Mark reviewed
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(entry)}
              style={actionLinkStyle(C.electricBlueLight)}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(entry)}
              style={actionLinkStyle(C.alertCritical)}
            >
              Delete
            </button>
          </div>
        </div>
      </ContainedCard>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: S.xxl,
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox}
            alt="attachment"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: R.md,
            }}
          />
        </div>
      )}
    </>
  );
}

function actionLinkStyle(color: string): React.CSSProperties {
  return {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontFamily: F.mono,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color,
  };
}

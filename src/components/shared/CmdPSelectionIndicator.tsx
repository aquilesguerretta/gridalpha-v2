import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { C, F, R } from '@/design/tokens';
import { useTextSelection } from '@/hooks/useTextSelection';
import type { TextSelectionInfo } from '@/hooks/useTextSelection';

// CONDUIT Wave 3 — floating "⌘P TO EXPLORE" indicator.
//
// Subscribes to `useTextSelection` and renders a small pill anchored
// above the selection's bounding rect. Click → caller-supplied
// `onActivate(text)` opens the Cmd+P drawer.
//
// Portaled to `document.body` so the indicator escapes any stacking
// context (TopBar, modals, etc.) the same way our SavedViewsMenu does.

interface Props {
  onActivate: (text: string) => void;
}

const PILL_HEIGHT = 26;
const GAP_ABOVE_SELECTION = 8;

export function CmdPSelectionIndicator({ onActivate }: Props) {
  const selection = useTextSelection();
  const [hover, setHover] = useState(false);

  // 80ms fade-in: track whether the pill has been mounted long enough
  // to be opacity 1.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!selection) {
      setVisible(false);
      return;
    }
    const id = window.setTimeout(() => setVisible(true), 16);
    return () => window.clearTimeout(id);
  }, [selection]);

  if (!selection || !selection.bounds) return null;
  if (typeof document === 'undefined') return null;

  const { top, left } = anchor(selection);

  return createPortal(
    <button
      type="button"
      onMouseDown={(e) => {
        // Prevent the click from collapsing the selection before our
        // handler runs.
        e.preventDefault();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onActivate(selection.text);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Open Cmd+P explorer for "${truncate(selection.text)}"`}
      style={{
        position: 'fixed',
        top,
        left,
        height: PILL_HEIGHT,
        padding: '0 10px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: hover ? C.bgOverlay : C.bgElevated,
        border: `1px solid ${hover ? C.borderActive : C.borderDefault}`,
        borderRadius: R.sm,
        color: hover ? C.electricBlue : C.textSecondary,
        fontFamily: F.mono,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        zIndex: 9550,
        opacity: visible ? 0.96 : 0,
        transition:
          'opacity 80ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.30)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <span aria-hidden style={{ letterSpacing: '0.04em' }}>{'⌘P'}</span>
      <span>to explore</span>
    </button>,
    document.body,
  );
}

/** Compute pill position. Anchored above the selection by default,
 *  flips below when the selection is too close to the top of the
 *  viewport. Horizontally centered on the selection's midpoint and
 *  clamped inside the viewport. */
function anchor(selection: TextSelectionInfo): { top: number; left: number } {
  const b = selection.bounds!;
  const wantAbove = b.top - PILL_HEIGHT - GAP_ABOVE_SELECTION;
  const top =
    wantAbove >= 8 ? wantAbove : b.bottom + GAP_ABOVE_SELECTION;
  const cx = b.left + b.width / 2;
  // Pill width is dynamic; estimate ~118px so the centered clamp is
  // close enough that we don't bleed off-screen. The browser shrinks
  // the actual width to content.
  const estimatedWidth = 118;
  const left = clamp(cx - estimatedWidth / 2, 8, window.innerWidth - estimatedWidth - 8);
  return { top, left };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function truncate(s: string): string {
  return s.length > 32 ? `${s.slice(0, 30)}…` : s;
}

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { C, F, R, S } from '@/design/tokens';
import { useCmdPStore } from '@/stores/cmdpStore';
import { useCmdP } from '@/hooks/useCmdP';
import { RESULT_CATEGORIES } from '@/lib/types/cmdp';
import { CmdPResultSection } from './CmdPResultSection';

// CONDUIT Wave 3 — right-edge sliding drawer for Cmd+P results.
//
// Reads state from cmdpStore (open, query, results, isLoading). Uses
// the useCmdP hook for refine/close. Mounted once at the GlobalShell
// level via the new CommandPalette wrapper (kept for the existing
// import surface).
//
// Portaled to document.body so the drawer escapes any stacking context.

const DRAWER_WIDTH = 480;

export function CmdPDrawer() {
  const isOpen = useCmdPStore((s) => s.isOpen);
  const currentQuery = useCmdPStore((s) => s.currentQuery);
  const results = useCmdPStore((s) => s.results);
  const { refine, close } = useCmdP();

  const [refineText, setRefineText] = useState('');
  const [hoverClose, setHoverClose] = useState(false);

  // Sync local refine input to the active query whenever it changes.
  useEffect(() => {
    if (currentQuery) setRefineText(currentQuery.rawText);
    else setRefineText('');
  }, [currentQuery]);

  // ESC closes the drawer (in addition to the global handler).
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const surfaceLabel =
    currentQuery?.contextSnapshot.surface.surfaceLabel ?? 'GridAlpha';

  const handleSubmit = () => {
    const trimmed = refineText.trim();
    if (!trimmed) return;
    refine(trimmed);
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(8,9,11,0.55)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 9560,
        }}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Cmd+P contextual intelligence"
        aria-modal
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: DRAWER_WIDTH,
          height: '100vh',
          background: C.bgOverlay,
          borderLeft: `1px solid ${C.borderDefault}`,
          borderTop: `1px solid ${C.borderActive}`,
          zIndex: 9570,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-12px 0 32px rgba(0,0,0,0.30)',
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: `${S.lg} ${S.lg} ${S.md}`,
            borderBottom: `1px solid ${C.borderDefault}`,
            display: 'flex',
            flexDirection: 'column',
            gap: S.xs,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontFamily: F.mono,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: C.textMuted,
                display: 'flex',
                alignItems: 'center',
                gap: S.sm,
              }}
            >
              <span style={{
                padding: '2px 6px',
                border: `1px solid ${C.electricBlue}`,
                borderRadius: R.sm,
                color: C.electricBlue,
                fontWeight: 700,
              }}>
                ⌘P
              </span>
              <span>{surfaceLabel}</span>
            </div>
            <button
              type="button"
              onClick={close}
              onMouseEnter={() => setHoverClose(true)}
              onMouseLeave={() => setHoverClose(false)}
              aria-label="Close"
              style={{
                width: 24,
                height: 24,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderRadius: R.sm,
                color: hoverClose ? C.textPrimary : C.textMuted,
                cursor: 'pointer',
                transition: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <CloseIcon />
            </button>
          </div>

          {currentQuery && (
            <div
              style={{
                fontFamily: F.sans,
                fontSize: 18,
                fontWeight: 500,
                color: C.textPrimary,
                lineHeight: 1.3,
              }}
            >
              "{truncate(currentQuery.rawText, 64)}"
            </div>
          )}

          {/* Refine input */}
          <div
            style={{
              marginTop: S.sm,
              display: 'flex',
              alignItems: 'center',
              gap: S.sm,
              height: 36,
              padding: `0 ${S.md}`,
              background: C.bgSurface,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: R.md,
            }}
          >
            <SearchIcon />
            <input
              type="text"
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="REFINE QUERY"
              autoFocus={!currentQuery}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: F.mono,
                fontSize: 12,
                letterSpacing: '0.10em',
                color: C.textPrimary,
                caretColor: C.electricBlue,
              }}
            />
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: '0.10em',
                color: C.textMuted,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: R.sm,
                padding: '1px 5px',
              }}
            >
              ↵
            </span>
          </div>
        </header>

        {/* Body — result groups */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: `${S.md} ${S.sm} ${S.xl}`,
          }}
        >
          {!currentQuery ? (
            <EmptyState />
          ) : results ? (
            RESULT_CATEGORIES.map((category) => (
              <CmdPResultSection
                key={category}
                category={category}
                results={results.groups[category]}
                isLoading={results.isLoading[category]}
                onActivated={close}
              />
            ))
          ) : null}
        </div>
      </aside>
    </>,
    document.body,
  );
}

function EmptyState() {
  return (
    <div
      style={{
        padding: S.xl,
        textAlign: 'center',
        color: C.textMuted,
        fontFamily: F.sans,
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      Type a term in the input above, or close this drawer and highlight
      anything on the platform — press <span style={{ color: C.electricBlue }}>⌘P</span> to explore.
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={C.textMuted}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

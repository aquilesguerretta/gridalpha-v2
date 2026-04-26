import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { useSavedViews } from '@/hooks/useSavedViews';
import type { SavedView } from '@/stores/savedViewsStore';

// CONDUIT shared — saved views dropdown.
// Replaces the FOUNDRY mock list with real saved views from
// `useSavedViewsStore`. Stateless on its own — caller (SavedViewsTrigger)
// owns positioning, opening, and closing.

interface Props {
  open: boolean;
  onClose: () => void;
  /** The trigger button — used to position the dropdown below it. */
  anchorRef: RefObject<HTMLElement | null>;
  /** Called when the user clicks the "Save current view" header button. */
  onSaveCurrentClick: () => void;
}

export function SavedViewsMenu({
  open,
  onClose,
  anchorRef,
  onSaveCurrentClick,
}: Props) {
  const {
    views,
    restoreView,
    deleteView,
    togglePin,
    copyShareLinkFor,
  } = useSavedViews();

  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoverHeader, setHoverHeader] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Position the dropdown below the anchor button.
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [open, anchorRef]);

  // Click-outside to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      const menu = document.getElementById('conduit-saved-views-menu');
      if (menu?.contains(target)) return;
      onClose();
    };
    // Defer one frame so the click that opened the menu doesn't immediately close it.
    const id = window.setTimeout(() => {
      window.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('mousedown', handler);
    };
  }, [open, onClose, anchorRef]);

  // ESC closes.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Auto-dismiss the "Link copied" toast.
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (!open || !position) return null;

  const pinned = views.filter((v) => v.pinned);
  const unpinned = views.filter((v) => !v.pinned);

  const handleSelect = (id: string) => {
    restoreView(id);
    onClose();
  };

  const handleCopy = async (id: string) => {
    await copyShareLinkFor(id);
    setToast('Link copied');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete saved view "${name}"?`)) {
      deleteView(id);
    }
  };

  return (
    <>
      <div
        id="conduit-saved-views-menu"
        role="menu"
        aria-label="Saved views"
        style={{
          position: 'fixed',
          top: position.top,
          right: position.right,
          width: 320,
          maxHeight: '70vh',
          background: C.bgElevated,
          border: `1px solid ${C.borderDefault}`,
          borderTop: `1px solid ${C.borderActive}`,
          borderRadius: R.lg,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9400,
          boxShadow: '0 12px 32px rgba(0,0,0,0.40)',
        }}
      >
        {/* Header — save current view */}
        <button
          type="button"
          onClick={() => {
            onSaveCurrentClick();
            onClose();
          }}
          onMouseEnter={() => setHoverHeader(true)}
          onMouseLeave={() => setHoverHeader(false)}
          style={{
            height: 40,
            padding: `0 ${S.md}`,
            background: hoverHeader ? 'rgba(59,130,246,0.10)' : 'transparent',
            border: 'none',
            borderBottom: `1px solid ${C.borderDefault}`,
            color: C.electricBlue,
            fontFamily: F.mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          + Save current view
        </button>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: `${S.sm} 0` }}>
          {views.length === 0 ? (
            <div
              style={{
                padding: `${S.lg} ${S.lg}`,
                fontFamily: F.sans,
                fontSize: 13,
                color: C.textMuted,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              No saved views yet. Click "Save current view" to capture your work.
            </div>
          ) : (
            <>
              {pinned.length > 0 && (
                <Section
                  eyebrow="PINNED VIEWS"
                  views={pinned}
                  hovered={hovered}
                  setHovered={setHovered}
                  onSelect={handleSelect}
                  onTogglePin={togglePin}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                />
              )}
              {unpinned.length > 0 && (
                <Section
                  eyebrow="ALL VIEWS"
                  views={unpinned}
                  hovered={hovered}
                  setHovered={setHovered}
                  onSelect={handleSelect}
                  onTogglePin={togglePin}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            top: position.top + 8,
            right: position.right + 332,
            padding: `${S.sm} ${S.md}`,
            background: C.bgOverlay,
            border: `1px solid ${C.borderActive}`,
            borderRadius: R.md,
            fontFamily: F.mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: C.electricBlue,
            zIndex: 9450,
            boxShadow: '0 8px 18px rgba(0,0,0,0.35)',
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}

interface SectionProps {
  eyebrow: string;
  views: SavedView[];
  hovered: string | null;
  setHovered: (id: string | null) => void;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

function Section({
  eyebrow,
  views,
  hovered,
  setHovered,
  onSelect,
  onTogglePin,
  onCopy,
  onDelete,
}: SectionProps) {
  return (
    <div style={{ paddingBottom: S.sm }}>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: C.textMuted,
          padding: `${S.sm} ${S.md}`,
        }}
      >
        {eyebrow}
      </div>
      {views.map((v) => (
        <Row
          key={v.id}
          view={v}
          hovered={hovered === v.id}
          setHovered={(h) => setHovered(h ? v.id : null)}
          onSelect={() => onSelect(v.id)}
          onTogglePin={() => onTogglePin(v.id)}
          onCopy={() => onCopy(v.id)}
          onDelete={() => onDelete(v.id, v.name)}
        />
      ))}
    </div>
  );
}

interface RowProps {
  view: SavedView;
  hovered: boolean;
  setHovered: (h: boolean) => void;
  onSelect: () => void;
  onTogglePin: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

function Row({
  view,
  hovered,
  setHovered,
  onSelect,
  onTogglePin,
  onCopy,
  onDelete,
}: RowProps) {
  return (
    <div
      role="menuitem"
      tabIndex={0}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 40,
        padding: `0 ${S.md}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: S.sm,
        fontFamily: F.sans,
        fontSize: 13,
        color: hovered ? C.textPrimary : C.textSecondary,
        background: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <span
        style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {view.name}
      </span>
      {hovered ? (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <IconButton
            label={view.pinned ? 'Unpin' : 'Pin'}
            active={view.pinned}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
          >
            <PinIcon filled={view.pinned} />
          </IconButton>
          <IconButton
            label="Copy share link"
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
          >
            <LinkIcon />
          </IconButton>
          <IconButton
            label="Delete"
            danger
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <TrashIcon />
          </IconButton>
        </div>
      ) : (
        view.pinned && (
          <span style={{ color: C.electricBlue, display: 'flex' }}>
            <PinIcon filled />
          </span>
        )
      )}
    </div>
  );
}

interface IconButtonProps {
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

function IconButton({ label, active, danger, onClick, children }: IconButtonProps) {
  const [hover, setHover] = useState(false);
  const fg = danger
    ? hover
      ? C.alertCritical
      : C.textMuted
    : active
      ? C.electricBlue
      : hover
        ? C.textPrimary
        : C.textMuted;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        borderRadius: R.sm,
        color: fg,
        cursor: 'pointer',
        transition: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </button>
  );
}

function PinIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 17v5" />
      <path d="M9 10.76V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5.76l3 3.24H6z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 1 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

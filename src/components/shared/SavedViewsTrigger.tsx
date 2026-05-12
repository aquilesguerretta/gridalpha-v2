import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { C, F, R } from '@/design/tokens';
import { useAuthStore } from '@/stores/authStore';
import { useSavedViews } from '@/hooks/useSavedViews';
import { SavedViewsMenu } from './SavedViewsMenu';
import { SaveViewModal } from './SaveViewModal';

// CONDUIT shared — top-nav trigger for the saved views system.
// Bookmark icon button styled to match the other top-nav icon buttons in
// `GlobalShell.TopBar`. Owns the open/close state for both the menu and
// the save modal so the rest of the app doesn't have to wire them up.

export function SavedViewsTrigger() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const { saveCurrentAs } = useSavedViews();

  const location = useLocation();
  const profile = useAuthStore((s) => s.selectedProfile);
  const preview = `${location.pathname} · ${profile ?? 'no profile'}`;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label="Saved views"
        aria-expanded={menuOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          padding: 0,
          background: menuOpen ? C.electricBlueWash : 'transparent',
          border: `1px solid ${menuOpen ? C.borderActive : 'transparent'}`,
          borderRadius: R.md,
          color: menuOpen || hover ? C.electricBlue : C.textSecondary,
          cursor: 'pointer',
          transition:
            'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: F.mono,
          fontSize: 11,
        }}
      >
        <BookmarkIcon />
      </button>

      <SavedViewsMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorRef={buttonRef}
        onSaveCurrentClick={() => setSaveOpen(true)}
      />

      <SaveViewModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSave={(name) => {
          saveCurrentAs(name);
          setSaveOpen(false);
        }}
        preview={preview}
      />
    </>
  );
}

function BookmarkIcon() {
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
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { ProfileType } from '@/stores/authStore';
import { C, F, R, S } from '@/design/tokens';

const PROFILES: ProfileType[] = [
  'everyone',
  'trader',
  'analyst',
  'storage',
  'industrial',
  'student',
  'developer',
];

type ViewKey = 'nest' | 'atlas' | 'peregrine' | 'analytics' | 'vault';

const VIEWS: Array<{ id: ViewKey; label: string; path: string }> = [
  { id: 'nest',      label: 'THE NEST',   path: '/nest'      },
  { id: 'atlas',     label: 'GRID ATLAS', path: '/atlas'     },
  { id: 'peregrine', label: 'PEREGRINE',  path: '/peregrine' },
  { id: 'analytics', label: 'ANALYTICS',  path: '/analytics' },
  { id: 'vault',     label: 'VAULT',      path: '/vault'     },
];

/**
 * Floating dev-only profile + view switcher. Mounted at the very end
 * of GlobalShell inside an `import.meta.env.DEV` guard so production
 * builds tree-shake the import out entirely.
 *
 * Dropdown has two sections:
 *  • PROFILE — click writes selectedProfile to authStore; the active
 *    /nest route re-renders into the matching per-profile Nest.
 *  • VIEW — click navigates to the corresponding destination route.
 */
export function ProfileSwitcher() {
  const [open, setOpen] = useState(false);
  const selectedProfile = useAuthStore((s) => s.selectedProfile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const navigate = useNavigate();
  const location = useLocation();

  // Derive the active view from the current pathname so the VIEW
  // section can highlight the row the user is already looking at.
  const activeView: ViewKey | null = (() => {
    const p = location.pathname;
    if (p.startsWith('/peregrine')) return 'peregrine';
    if (p.startsWith('/analytics')) return 'analytics';
    if (p.startsWith('/atlas'))     return 'atlas';
    if (p.startsWith('/vault'))     return 'vault';
    if (p.startsWith('/nest'))      return 'nest';
    return null;
  })();

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: S.lg,
    right: S.lg,
    zIndex: 9999,
    fontFamily: F.mono,
    fontSize: 11,
  };

  const buttonStyle: React.CSSProperties = {
    background: C.bgElevated,
    border: `1px solid ${C.borderDefault}`,
    borderTop: '1px solid rgba(245,158,11,0.30)',
    borderRadius: R.md,
    padding: `${S.sm} ${S.md}`,
    color: C.textPrimary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: F.mono,
    fontSize: 11,
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: S.xs,
    background: C.bgElevated,
    border: `1px solid ${C.borderDefault}`,
    borderRadius: R.md,
    overflow: 'hidden',
    minWidth: 180,
  };

  const sectionLabelStyle: React.CSSProperties = {
    padding: `${S.xs} ${S.md}`,
    fontFamily: F.mono,
    fontSize: 9,
    fontWeight: 600,
    color: C.textMuted,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    background: 'rgba(255,255,255,0.02)',
    borderBottom: `1px solid ${C.borderDefault}`,
  };

  const optionStyle = (isActive: boolean): React.CSSProperties => ({
    padding: `${S.sm} ${S.md}`,
    color: isActive ? C.falconGold : C.textMuted,
    cursor: 'pointer',
    background: isActive ? 'rgba(245,158,11,0.06)' : 'transparent',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontWeight: isActive ? 600 : 400,
    fontFamily: F.mono,
    fontSize: 11,
  });

  const dividerStyle: React.CSSProperties = {
    height: 1,
    background: C.borderDefault,
    margin: `${S.sm} 0`,
  };

  return (
    <div style={containerStyle}>
      {open && (
        <div style={dropdownStyle}>
          {/* ─── PROFILE section ─── */}
          <div style={sectionLabelStyle}>PROFILE</div>
          {PROFILES.map((p) => (
            <div
              key={`profile-${p}`}
              style={optionStyle(p === selectedProfile)}
              onClick={() => {
                setProfile(p);
                setOpen(false);
              }}
              onMouseEnter={(e) => {
                if (p !== selectedProfile) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (p !== selectedProfile) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {p}
            </div>
          ))}

          {/* ─── divider ─── */}
          <div style={dividerStyle} />

          {/* ─── VIEW section ─── */}
          <div style={sectionLabelStyle}>VIEW</div>
          {VIEWS.map((v) => {
            const isActive = v.id === activeView;
            return (
              <div
                key={`view-${v.id}`}
                style={optionStyle(isActive)}
                onClick={() => {
                  navigate(v.path);
                  setOpen(false);
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {v.label}
              </div>
            );
          })}
        </div>
      )}
      <button
        type="button"
        style={buttonStyle}
        onClick={() => setOpen(!open)}
      >
        <span style={{ color: C.falconGold }}>●</span>
        DEV: {selectedProfile ?? 'none'}
        <span style={{ opacity: 0.5 }}>▾</span>
      </button>
    </div>
  );
}

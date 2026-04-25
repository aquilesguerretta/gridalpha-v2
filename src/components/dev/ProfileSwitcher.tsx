import { useState } from 'react';
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

/**
 * Floating dev-only profile switcher. Mounted at the very end of GlobalShell
 * inside an `import.meta.env.DEV` guard so production builds tree-shake the
 * import out entirely.
 */
export function ProfileSwitcher() {
  const [open, setOpen] = useState(false);
  const selectedProfile = useAuthStore((s) => s.selectedProfile);
  const setProfile = useAuthStore((s) => s.setProfile);

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
    minWidth: 160,
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

  return (
    <div style={containerStyle}>
      {open && (
        <div style={dropdownStyle}>
          {PROFILES.map((p) => (
            <div
              key={p}
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

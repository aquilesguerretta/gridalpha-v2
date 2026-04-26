import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { useUIStore } from '@/stores/uiStore';

// FOUNDRY shared — global command palette.
// Triggered by uiStore.commandPaletteOpen (Cmd/Ctrl+K).
// Visual only — selection just closes the palette.

interface PaletteResult {
  id: string;
  label: string;
  hint?: string;
}

interface PaletteGroup {
  eyebrow: string;
  results: PaletteResult[];
}

const GROUPS: PaletteGroup[] = [
  {
    eyebrow: 'ZONES',
    results: [
      { id: 'z-westhub',  label: 'WEST HUB',  hint: '$35.90/MWh' },
      { id: 'z-pseg',     label: 'PSEG',      hint: '$34.93/MWh' },
      { id: 'z-comed',    label: 'COMED',     hint: '$32.04/MWh' },
      { id: 'z-aep',      label: 'AEP',       hint: '$33.36/MWh' },
      { id: 'z-dominion', label: 'DOMINION',  hint: '$34.23/MWh' },
    ],
  },
  {
    eyebrow: 'PAGES',
    results: [
      { id: 'p-atlas',     label: 'Grid Atlas',  hint: 'g' },
      { id: 'p-peregrine', label: 'Peregrine',   hint: 'p' },
      { id: 'p-analytics', label: 'Analytics',   hint: 'a' },
      { id: 'p-vault',     label: 'Vault',       hint: 'v' },
      { id: 'p-nest',      label: 'Trader Nest', hint: 'n' },
    ],
  },
  {
    eyebrow: 'ACTIONS',
    results: [
      { id: 'a-export', label: 'Export current view' },
      { id: 'a-save',   label: 'Save view' },
      { id: 'a-ai',     label: 'Open AI Assistant' },
    ],
  },
  {
    eyebrow: 'RECENT',
    results: [
      { id: 'r-pseg',    label: 'PSEG zone',           hint: '2 min ago' },
      { id: 'r-elliott', label: 'Storm Elliott',       hint: '14 min ago' },
      { id: 'r-battery', label: 'Battery Arb tab',     hint: '38 min ago' },
      { id: 'r-spark',   label: 'Spark Spread tab',    hint: '1 hr ago' },
    ],
  },
];

const escHintStyle: CSSProperties = {
  fontFamily: F.mono,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.10em',
  color: C.textMuted,
  border: `1px solid ${C.borderDefault}`,
  borderRadius: R.sm,
  padding: '2px 6px',
  marginRight: S.lg,
  flexShrink: 0,
};

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const closeAll = useUIStore((s) => s.closeAll);
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  // Local ESC redundancy in addition to the global useKeyboardShortcuts handler.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeAll();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closeAll]);

  if (!open) return null;

  const filtered = GROUPS.map((g) => ({
    eyebrow: g.eyebrow,
    results: g.results.filter((r) =>
      r.label.toLowerCase().includes(query.toLowerCase()),
    ),
  })).filter((g) => g.results.length > 0);

  return (
    <div
      role="dialog"
      aria-label="Command palette"
      onClick={closeAll}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 120,
        zIndex: 9500,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 600,
          maxHeight: 480,
          background: C.bgElevated,
          border: `1px solid ${C.borderDefault}`,
          borderTop: `1px solid ${C.borderActive}`,
          borderRadius: R.lg,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            padding: `0 ${S.lg}`,
            borderBottom: `1px solid ${C.borderDefault}`,
            gap: S.md,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width={16}
            height={16}
            fill="none"
            stroke={C.textMuted}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            autoFocus
            type="text"
            placeholder="Search anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: F.mono,
              fontSize: 13,
              color: C.textPrimary,
              caretColor: C.electricBlue,
            }}
          />
          <span style={escHintStyle}>ESC</span>
        </div>

        {/* Results */}
        <div style={{ overflowY: 'auto', padding: `${S.sm} 0` }}>
          {filtered.map((group) => (
            <div key={group.eyebrow} style={{ paddingBottom: S.sm }}>
              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: C.textMuted,
                  padding: `${S.sm} ${S.lg}`,
                }}
              >
                {group.eyebrow}
              </div>
              {group.results.map((r) => (
                <div
                  key={r.id}
                  role="option"
                  aria-selected={hovered === r.id}
                  onMouseEnter={() => setHovered(r.id)}
                  onMouseLeave={() => setHovered((h) => (h === r.id ? null : h))}
                  onClick={closeAll}
                  style={{
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `0 ${S.lg}`,
                    fontFamily: F.mono,
                    fontSize: 12,
                    color: hovered === r.id ? C.textPrimary : C.textSecondary,
                    background: hovered === r.id ? 'rgba(59,130,246,0.10)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span>{r.label}</span>
                  {r.hint && (
                    <span style={{ fontSize: 11, color: C.textMuted }}>{r.hint}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

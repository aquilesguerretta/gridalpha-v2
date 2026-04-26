import { useState } from 'react';
import { C, F, R, S } from '@/design/tokens';

// FOUNDRY shared — saved views dropdown content.
// 280px wide. Stateless: caller (likely ARCHITECT in the top nav) is
// responsible for positioning, opening, and closing this menu.

export interface SavedView {
  id: string;
  name: string;
}

const SAVED_VIEWS: SavedView[] = [
  { id: 'sv-001', name: 'Morning routine' },
  { id: 'sv-002', name: 'PSEG basis watch' },
  { id: 'sv-003', name: 'Storage portfolio review' },
  { id: 'sv-004', name: 'Q4 retrospective' },
  { id: 'sv-005', name: 'Storm watch' },
];

interface Props {
  onSelect?: (id: string) => void;
}

export function SavedViewsMenu({ onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div
      role="menu"
      aria-label="Saved views"
      style={{
        width: 280,
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderTop: `1px solid ${C.borderActive}`,
        borderRadius: R.lg,
        overflow: 'hidden',
      }}
    >
      {SAVED_VIEWS.map((view) => (
        <div
          key={view.id}
          role="menuitem"
          tabIndex={0}
          onClick={() => onSelect?.(view.id)}
          onMouseEnter={() => setHovered(view.id)}
          onMouseLeave={() => setHovered((h) => (h === view.id ? null : h))}
          style={{
            height: 36,
            padding: `0 ${S.md}`,
            display: 'flex',
            alignItems: 'center',
            fontFamily: F.sans,
            fontSize: 13,
            color: hovered === view.id ? C.textPrimary : C.textSecondary,
            background: hovered === view.id ? 'rgba(255,255,255,0.03)' : 'transparent',
            cursor: 'pointer',
            transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {view.name}
        </div>
      ))}
    </div>
  );
}

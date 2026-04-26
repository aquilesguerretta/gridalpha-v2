import { F } from '@/design/tokens';
import type { CSSProperties } from 'react';

// FOUNDRY primitive — italic gray serif "section identity" line.
// One of two components permitted to use F.display in the terminal layer
// (the other is HeroNumber). Establishes editorial voice across surfaces.

type Size = 'hero' | 'section';

interface Props {
  children: string;
  size?: Size;
  marginTop?: number | string;
  marginBottom?: number | string;
}

const STYLES: Record<Size, CSSProperties> = {
  hero: {
    fontFamily: F.display,
    fontSize: 26,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    fontWeight: 400,
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  },
  section: {
    fontFamily: F.display,
    fontSize: 18,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    fontWeight: 400,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
  },
};

export function EditorialIdentity({ children, size = 'section', marginTop, marginBottom }: Props) {
  return (
    <div style={{ ...STYLES[size], marginTop, marginBottom }}>
      {children}
    </div>
  );
}

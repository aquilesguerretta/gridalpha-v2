import type { CSSProperties, ReactNode } from 'react';
import { C, R, S } from '@/design/tokens';
import { useHoverState } from './useHoverState';

// FOUNDRY primitive — active-edge card chrome.
// Background C.bgElevated, 1px C.borderDefault on left/right/bottom, plus a
// 1px top accent in electric blue (0.20 opacity), brightening to 0.40 on
// hover. R.lg corners. Default padding S.lg, optional minHeight override.

interface Props {
  children: ReactNode;
  padding?: CSSProperties['padding'];
  minHeight?: CSSProperties['minHeight'];
  style?: CSSProperties;
}

export function ContainedCard({
  children,
  padding = S.lg,
  minHeight,
  style,
}: Props) {
  const hover = useHoverState();
  const topEdge = hover.hovered
    ? 'rgba(59,130,246,0.40)'
    : 'rgba(59,130,246,0.20)';
  return (
    <div
      {...hover.bind}
      style={{
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderTop: `1px solid ${topEdge}`,
        borderRadius: R.lg,
        padding,
        minHeight,
        transition: 'border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

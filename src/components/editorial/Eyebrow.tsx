import type { CSSProperties, ReactNode } from 'react';
import { C, F } from '@/design/tokens';

type EyebrowProps = {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
};

/**
 * Editorial eyebrow label. F.mono, 11px, 0.12em tracking. Use above a
 * DisplayHeading to establish section context (e.g. "SIGN IN", "STEP 1 OF 3").
 */
export function Eyebrow({ children, color = C.electricBlue, style }: EyebrowProps) {
  return (
    <div
      style={{
        fontFamily: F.mono,
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

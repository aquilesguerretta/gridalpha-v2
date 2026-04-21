import type { CSSProperties } from 'react';
import { C, F } from '@/design/tokens';

type DisplayHeadingProps = {
  line1: string;
  line2?: string;
  line2Muted?: boolean;
  size?: number;
  style?: CSSProperties;
};

/**
 * Editorial display heading. Uses F.display (Instrument Serif). Optional
 * second line rendered italic + muted (rgba 0.45) when `line2Muted`.
 */
export function DisplayHeading({
  line1,
  line2,
  line2Muted = true,
  size = 48,
  style,
}: DisplayHeadingProps) {
  return (
    <h1
      style={{
        margin: 0,
        fontFamily: F.display,
        fontSize: `${size}px`,
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        color: C.textPrimary,
        ...style,
      }}
    >
      <span style={{ display: 'block' }}>{line1}</span>
      {line2 && (
        <span
          style={{
            display: 'block',
            fontStyle: line2Muted ? 'italic' : 'normal',
            color: line2Muted ? 'rgba(255,255,255,0.45)' : C.textPrimary,
          }}
        >
          {line2}
        </span>
      )}
    </h1>
  );
}

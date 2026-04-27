// SCRIBE — Smil-style civilizational closing anchor.
// Full-width prose card with subtle gold top border marking it as an
// anchoring moment at the close of L1.

import { C, F, S } from '@/design/tokens';

interface Props {
  text: string;
}

export function ClosingAnchor({ text }: Props) {
  return (
    <section
      aria-label="Civilizational anchor"
      style={{
        marginTop:    S.xxl,
        padding:      S.xl,
        background:   C.bgElevated,
        borderTop:    `1px solid rgba(245,158,11,0.30)`,
        borderRight:  `1px solid ${C.borderDefault}`,
        borderBottom: `1px solid ${C.borderDefault}`,
        borderLeft:   `1px solid ${C.borderDefault}`,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      11,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         C.falconGold,
          marginBottom:  S.md,
        }}
      >
        Civilizational Anchor
      </div>
      <p
        style={{
          margin:     0,
          fontFamily: F.display,
          fontSize:   18,
          fontStyle:  'italic',
          color:      'rgba(241,241,243,0.72)',
          lineHeight: 1.7,
        }}
      >
        {text}
      </p>
    </section>
  );
}

export default ClosingAnchor;

import type { ReactNode } from 'react';
import { C, F, S } from '@/design/tokens';
import { EditorialIdentity } from './EditorialIdentity';

// FOUNDRY primitive — eyebrow + editorial-identity + content pattern.
// No card chrome — used inside ContainedCards or directly in page grids
// to mark a section's voice without introducing another bordered surface.

interface Props {
  eyebrow: string;
  eyebrowColor?: 'blue' | 'gold';
  identity: string;
  children: ReactNode;
}

export function FlowSection({
  eyebrow,
  eyebrowColor = 'blue',
  identity,
  children,
}: Props) {
  const eyebrowHex = eyebrowColor === 'gold' ? C.falconGold : C.electricBlue;
  return (
    <section
      style={{
        borderTop: `1px solid ${C.borderDefault}`,
        paddingTop: S.md,
      }}
    >
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: eyebrowHex,
          marginBottom: S.xs,
        }}
      >
        {eyebrow}
      </div>
      <EditorialIdentity size="section" marginBottom={S.md}>{identity}</EditorialIdentity>
      <div>{children}</div>
    </section>
  );
}

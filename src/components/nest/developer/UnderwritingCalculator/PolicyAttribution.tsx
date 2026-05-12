// FORGE Wave 5 — Policy attribution (Phase 8 — STUB).

import { C, F, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import type { PolicyAttribution as PolicyAttr } from '@/lib/underwriting/types';

interface Props {
  attribution: PolicyAttr;
}

export function PolicyAttribution({ attribution }: Props) {
  void attribution;
  return (
    <ContainedCard padding={S.lg}>
      <div
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: C.electricBlueLight,
        }}
      >
        POLICY ATTRIBUTION — coming Phase 8
      </div>
    </ContainedCard>
  );
}

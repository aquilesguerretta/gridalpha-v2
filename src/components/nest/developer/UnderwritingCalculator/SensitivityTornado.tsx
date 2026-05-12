// FORGE Wave 5 — Sensitivity tornado (Phase 9 — STUB).

import { C, F, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import type { SensitivityEntry } from '@/lib/underwriting/types';

interface Props {
  entries: SensitivityEntry[];
  baseIRR: number;
}

export function SensitivityTornado({ entries, baseIRR }: Props) {
  void entries;
  void baseIRR;
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
        SENSITIVITY TORNADO — coming Phase 9
      </div>
    </ContainedCard>
  );
}

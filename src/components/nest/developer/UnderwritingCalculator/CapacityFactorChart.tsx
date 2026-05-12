// FORGE Wave 5 — Capacity factor chart (Phase 7 — STUB).

import { C, F, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import type { ProjectSpec } from '@/lib/underwriting/types';

interface Props {
  projectId: string;
  spec: ProjectSpec;
  capacityFactorByYear: number[];
}

export function CapacityFactorChart({
  projectId,
  spec,
  capacityFactorByYear,
}: Props) {
  void projectId;
  void spec;
  void capacityFactorByYear;
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
        CAPACITY FACTOR — coming Phase 7
      </div>
    </ContainedCard>
  );
}

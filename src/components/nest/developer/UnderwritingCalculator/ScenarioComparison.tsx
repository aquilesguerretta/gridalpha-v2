// FORGE Wave 5 — Scenario comparison (Phase 8 — STUB).

import { C, F, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import type {
  ProjectSpec,
  UnderwritingResults,
} from '@/lib/underwriting/types';

interface Props {
  spec: ProjectSpec;
  results: UnderwritingResults;
}

export function ScenarioComparison({ spec, results }: Props) {
  void spec;
  void results;
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
        SCENARIO COMPARISON — coming Phase 8
      </div>
    </ContainedCard>
  );
}

// FORGE Wave 5 — Revenue projection chart (Phase 7 — STUB).
// Replaced in Phase 7 with the full base/upside/downside line chart.

import { C, F, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import type { UnderwritingResults } from '@/lib/underwriting/types';

interface Props {
  projectId: string;
  results: UnderwritingResults;
}

export function RevenueProjectionChart({ projectId, results }: Props) {
  void projectId;
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
        REVENUE PROJECTION — coming Phase 7
      </div>
    </ContainedCard>
  );
}

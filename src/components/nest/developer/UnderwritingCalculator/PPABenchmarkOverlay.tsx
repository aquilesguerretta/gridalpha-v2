// FORGE Wave 5 — PPA benchmark overlay (Phase 9 — STUB).

import { C, F, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import type { PPABenchmarkBand } from '@/lib/underwriting/types';

interface Props {
  benchmark: PPABenchmarkBand;
  breakevenLMP: number;
}

export function PPABenchmarkOverlay({ benchmark, breakevenLMP }: Props) {
  void benchmark;
  void breakevenLMP;
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
        PPA BENCHMARK — coming Phase 9
      </div>
    </ContainedCard>
  );
}

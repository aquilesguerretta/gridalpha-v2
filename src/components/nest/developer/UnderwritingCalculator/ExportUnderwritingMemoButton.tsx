// FORGE Wave 5 — Underwriting memo PDF export button (Phase 11 — STUB).
//
// Static-import pattern (learned from Wave 2's ExportMemoButton):
// the PDF pipeline is unconditionally available, so we import the
// exporter directly. Real implementation in Phase 11 wires
// `exportUnderwritingMemo`; until then this button is a placeholder.

import { useState } from 'react';
import { C, F, R, S } from '@/design/tokens';
import type {
  ProjectSpec,
  UnderwritingResults,
} from '@/lib/underwriting/types';

interface Props {
  spec: ProjectSpec;
  results: UnderwritingResults;
}

export function ExportUnderwritingMemoButton({ spec, results }: Props) {
  const [busy] = useState(false);
  void spec;
  void results;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
      <button
        type="button"
        disabled
        title="Underwriting memo PDF export ships in Phase 11."
        style={{
          background: 'transparent',
          border: `1px solid ${C.borderDefault}`,
          borderRadius: R.md,
          padding: `0 ${S.lg}`,
          height: 40,
          fontFamily: F.mono,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: C.textMuted,
          cursor: 'not-allowed',
          opacity: 0.55,
        }}
      >
        {busy ? 'Generating…' : 'Export Memo (PDF) — Phase 11'}
      </button>
    </div>
  );
}

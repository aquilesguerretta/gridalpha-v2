// SCRIBE — "FOUNDATIONS OF ENERGY → ENTRY TITLE → LAYER" breadcrumb.

import { Link } from 'react-router-dom';
import { C, F, S } from '@/design/tokens';
import type { LayerKey } from '@/lib/types/curriculum';

interface Props {
  entryTitle: string;
  layer: LayerKey;
}

const LAYER_LABEL: Record<LayerKey, string> = {
  L1: 'L1 · Intuition',
  L2: 'L2 · Mechanism',
  L3: 'L3 · Practitioner',
};

export function EntryBreadcrumb({ entryTitle, layer }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        S.xs,
        fontFamily: F.mono,
        fontSize:   10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color:      C.textMuted,
        flexWrap:   'wrap',
      }}
    >
      <Link
        to="/vault/alexandria"
        style={{
          color:          C.electricBlue,
          textDecoration: 'none',
        }}
      >
        Foundations of Energy
      </Link>
      <span aria-hidden>→</span>
      <span style={{ color: C.textSecondary }}>{entryTitle}</span>
      <span aria-hidden>→</span>
      <span style={{ color: C.textPrimary, fontWeight: 700 }}>{LAYER_LABEL[layer]}</span>
    </nav>
  );
}

export default EntryBreadcrumb;

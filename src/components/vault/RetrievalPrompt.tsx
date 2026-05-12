// SCRIBE — retrieval-prompt card.
// Two modes:
//
// L1 (light-touch closing reflection): a "Mark complete" button that
//   persists to progressStore but does not gate anything.
//
// L2 (mandatory gate per Rule 4.2): an optional textarea + an
//   "I've engaged with this" button. Until the button is clicked, the L3
//   toggle and the Next-entry link are disabled with an explanatory
//   tooltip. Acknowledgment persists to progressStore.

import { useState } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { useProgressStore } from '@/stores/progressStore';
import type { LayerKey } from '@/lib/types/curriculum';

interface Props {
  entryId: string;
  layer: LayerKey;
  prompt: string;
}

export function RetrievalPrompt({ entryId, layer, prompt }: Props) {
  const acknowledged = useProgressStore((s) => s.isRetrievalAcknowledged(entryId, layer));
  const acknowledgeRetrieval = useProgressStore((s) => s.acknowledgeRetrieval);
  const [response, setResponse] = useState('');

  const isGate = layer === 'L2';
  const eyebrow = isGate ? 'Before You Continue' : 'Reflect';
  const identity = isGate ? 'Apply what you read.' : 'A real-world observation.';
  const ctaLabel = isGate ? "I've engaged with this" : 'Mark complete';

  return (
    <ContainedCard padding={S.lg} style={{ marginTop: S.xl }}>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      11,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         isGate ? C.falconGold : C.electricBlue,
          marginBottom:  S.xs,
        }}
      >
        {eyebrow}
      </div>
      <EditorialIdentity size="section">{identity}</EditorialIdentity>
      <div style={{ height: S.md }} />
      <p
        style={{
          margin:     0,
          fontFamily: F.sans,
          fontSize:   14,
          color:      C.textPrimary,
          lineHeight: 1.6,
          maxWidth:   780,
        }}
      >
        {prompt}
      </p>

      {isGate && (
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Optional — your answer is for you, not stored on a server."
          rows={4}
          disabled={acknowledged}
          style={{
            marginTop:    S.md,
            width:        '100%',
            boxSizing:    'border-box',
            background:   C.bgSurface,
            border:       `1px solid ${C.borderDefault}`,
            borderTop:    `1px solid ${C.borderAccent}`,
            borderRadius: R.md,
            padding:      S.md,
            fontFamily:   F.sans,
            fontSize:     14,
            color:        C.textPrimary,
            resize:       'vertical',
            outline:      'none',
          }}
        />
      )}

      <div style={{ marginTop: S.md, display: 'flex', alignItems: 'center', gap: S.md }}>
        <button
          type="button"
          onClick={() => acknowledgeRetrieval(entryId, layer)}
          disabled={acknowledged}
          style={{
            fontFamily:     F.mono,
            fontSize:       12,
            fontWeight:     600,
            letterSpacing:  '0.10em',
            textTransform:  'uppercase',
            color:          acknowledged ? C.bgBase : C.bgBase,
            background:     acknowledged ? C.alertNormal : C.electricBlue,
            border:         `1px solid ${acknowledged ? C.alertNormal : C.electricBlue}`,
            borderRadius:   R.md,
            padding:        `${S.sm} ${S.lg}`,
            cursor:         acknowledged ? 'default' : 'pointer',
            transition:     'background-color 150ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {acknowledged ? '✓ Acknowledged' : ctaLabel}
        </button>
        {isGate && !acknowledged && (
          <span
            style={{
              fontFamily:    F.mono,
              fontSize:      10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         C.textMuted,
            }}
          >
            Required to unlock L3 and Next entry
          </span>
        )}
      </div>
    </ContainedCard>
  );
}

export default RetrievalPrompt;

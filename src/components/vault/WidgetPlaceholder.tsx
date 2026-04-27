// SCRIBE — bordered placeholder card showing the widget spec for V1.
// The actual interactive widget ships in a later sprint; this card makes
// the spec visible so the worked example above isn't visually orphaned.

import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import type { EntryWidgetSpec } from '@/lib/types/curriculum';

interface Props {
  spec: EntryWidgetSpec;
}

export function WidgetPlaceholder({ spec }: Props) {
  return (
    <ContainedCard padding={S.lg} style={{ marginTop: S.lg }}>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      11,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         C.falconGold,
          marginBottom:  S.xs,
        }}
      >
        Interactive Widget — Coming Soon
      </div>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      10,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color:         C.textMuted,
          marginBottom:  S.md,
        }}
      >
        Type · {spec.type}
      </div>

      <div
        style={{
          fontFamily: F.sans,
          fontSize:   14,
          color:      C.textPrimary,
          lineHeight: 1.6,
          marginBottom: S.md,
        }}
      >
        {spec.description}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: S.md }}>
        <div>
          <div
            style={{
              fontFamily:    F.mono,
              fontSize:      10,
              fontWeight:    600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         C.electricBlue,
              marginBottom:  S.xs,
            }}
          >
            Inputs
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {spec.inputs.map((i) => (
              <li
                key={i.name}
                style={{
                  fontFamily:    F.mono,
                  fontSize:      11,
                  color:         C.textSecondary,
                  letterSpacing: '0.04em',
                  padding:       '3px 0',
                }}
              >
                · {i.name}
                {i.unit ? ` (${i.unit})` : ''}
                {i.range ? `, range ${i.range[0]}–${i.range[1]}` : ''}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div
            style={{
              fontFamily:    F.mono,
              fontSize:      10,
              fontWeight:    600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         C.electricBlue,
              marginBottom:  S.xs,
            }}
          >
            Outputs
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {spec.outputs.map((o) => (
              <li
                key={o.name}
                style={{
                  fontFamily:    F.mono,
                  fontSize:      11,
                  color:         C.textSecondary,
                  letterSpacing: '0.04em',
                  padding:       '3px 0',
                }}
              >
                · {o.name}
                {o.unit ? ` (${o.unit})` : ''}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        style={{
          marginTop:    S.md,
          paddingTop:   S.sm,
          borderTop:    `1px solid ${C.borderDefault}`,
          fontFamily:   F.display,
          fontStyle:    'italic',
          fontSize:     13,
          color:        'rgba(241,241,243,0.45)',
          lineHeight:   1.5,
        }}
      >
        This widget will be interactive in a future sprint. The worked example above shows the calculation for representative values.
      </div>

      {/* Visual indicator the placeholder is intentional */}
      <div
        style={{
          marginTop:    S.md,
          height:       72,
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          background:   'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(245,158,11,0.05) 100%)',
          border:       `1px dashed ${C.borderDefault}`,
          borderRadius: R.md,
          fontFamily:   F.mono,
          fontSize:     10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:        C.textMuted,
        }}
      >
        Widget mount point · {spec.type}
      </div>
    </ContainedCard>
  );
}

export default WidgetPlaceholder;

// SCRIBE — three-button L1/L2/L3 toggle.
// Active layer in C.electricBlue; inactive muted. The current layer comes
// from the URL search-params (?layer=L1|L2|L3) so deep links work; clicks
// navigate to the same entry with the new layer.

import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { C, F, R, S } from '@/design/tokens';
import type { LayerKey } from '@/lib/types/curriculum';

const LAYERS: Array<{ key: LayerKey; label: string }> = [
  { key: 'L1', label: 'L1 · INTUITION' },
  { key: 'L2', label: 'L2 · MECHANISM' },
  { key: 'L3', label: 'L3 · PRACTITIONER' },
];

interface LayerToggleProps {
  /** Disable the L3 button until the L2 retrieval prompt has been acknowledged. */
  l3Disabled?: boolean;
  l3DisabledTooltip?: string;
}

export function LayerToggle({ l3Disabled = false, l3DisabledTooltip }: LayerToggleProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const current = (searchParams.get('layer') as LayerKey) ?? 'L1';

  const goTo = (layer: LayerKey) => {
    const next = new URLSearchParams(searchParams);
    next.set('layer', layer);
    navigate({ pathname: location.pathname, search: next.toString() });
  };

  return (
    <div
      role="tablist"
      aria-label="Reading layer"
      style={{
        display:        'inline-flex',
        height:         36,
        alignItems:     'stretch',
        background:     C.bgElevated,
        border:         `1px solid ${C.borderDefault}`,
        borderRadius:   R.md,
        overflow:       'hidden',
      }}
    >
      {LAYERS.map((l) => {
        const active = l.key === current;
        const disabled = l.key === 'L3' && l3Disabled;
        return (
          <button
            key={l.key}
            role="tab"
            aria-selected={active}
            aria-disabled={disabled}
            disabled={disabled}
            title={disabled ? l3DisabledTooltip : undefined}
            onClick={() => !disabled && goTo(l.key)}
            style={{
              fontFamily:     F.mono,
              fontSize:       11,
              fontWeight:     active ? 700 : 600,
              letterSpacing:  '0.10em',
              textTransform:  'uppercase',
              color:          disabled ? C.textMuted : (active ? C.bgBase : C.textSecondary),
              background:     active ? C.electricBlue : 'transparent',
              border:         'none',
              padding:        `0 ${S.md}`,
              cursor:         disabled ? 'not-allowed' : 'pointer',
              opacity:        disabled ? 0.5 : 1,
              transition:     'background-color 150ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

export default LayerToggle;

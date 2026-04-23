import { C, F, R, S } from '@/design/tokens';
import { ZONE_LMP_DETAIL } from '../../../lib/pjm/mock-data';
import { HeroNumber } from '../../terminal/HeroNumber';

const ZONE_OPTIONS: { key: string; label: string }[] = [
  { key: 'WEST_HUB', label: 'WEST HUB' },
  { key: 'AEP',      label: 'AEP' },
  { key: 'PSEG',     label: 'PSEG' },
  { key: 'COMED',    label: 'COMED' },
  { key: 'RECO',     label: 'RECO' },
];

function regimeFor(price: number): { label: string; color: string } {
  if (price >= 45) return { label: 'SCARCITY',   color: C.alertCritical };
  if (price <= 30) return { label: 'SURPLUS',    color: C.electricBlue };
  if (price >= 40) return { label: 'TRANSITION', color: C.alertWarning };
  return { label: 'NORMAL', color: C.alertNormal };
}

export function HeroLMPBlock() {
  const zoneKey = 'WEST_HUB';
  const zoneLabel = 'WEST HUB';
  const data = ZONE_LMP_DETAIL[zoneKey] ?? ZONE_LMP_DETAIL['DEFAULT'];

  const deltaColor = data.delta >= 0 ? C.falconGold : C.electricBlue;
  const daPrice = data.avg24h;
  const daRtSpread = data.price - daPrice;
  const regime = regimeFor(data.price);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.lg }}>
      {/* Eyebrow row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: S.md,
          fontFamily: F.mono,
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: C.electricBlue }}>{zoneLabel}</span>
        <span style={{ color: C.textMuted }}>·</span>
        <span style={{ color: C.textMuted }}>14:22 ET</span>
        <span style={{ color: C.textMuted }}>·</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: C.alertNormal,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: C.alertNormal,
              display: 'inline-block',
            }}
          />
          LIVE
        </span>
      </div>

      {/* Hero number */}
      <HeroNumber value={data.price.toFixed(2)} unit="$/MWh" size={120} />

      {/* Context strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          gap: S.xl,
          fontFamily: F.mono,
          fontSize: '12px',
        }}
      >
        <ContextPair
          label="Δ vs −1H"
          value={`${data.delta >= 0 ? '+' : ''}${data.delta.toFixed(2)}`}
          valueColor={deltaColor}
        />
        <ContextPair label="24H AVG" value={data.avg24h.toFixed(2)} />
        <ContextPair label="DA" value={daPrice.toFixed(2)} />
        <ContextPair
          label="DA/RT SPREAD"
          value={`${daRtSpread >= 0 ? '+' : ''}${daRtSpread.toFixed(2)}`}
          valueColor={daRtSpread >= 0 ? C.falconGold : C.electricBlue}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.12em',
              color: C.textMuted,
              textTransform: 'uppercase',
            }}
          >
            REGIME
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: regime.color,
              padding: '2px 8px',
              borderRadius: R.sm,
              border: `1px solid ${regime.color}`,
              textTransform: 'uppercase',
            }}
          >
            {regime.label}
          </span>
        </div>
      </div>

      {/* Zone selector (visual only, Phase 1) */}
      <div>
        <select
          defaultValue={zoneKey}
          style={{
            background: C.bgElevated,
            color: C.textPrimary,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: R.md,
            padding: '6px 10px',
            fontFamily: F.mono,
            fontSize: '11px',
            letterSpacing: '0.08em',
          }}
        >
          {ZONE_OPTIONS.map((z) => (
            <option key={z.key} value={z.key}>
              {z.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ContextPair({
  label,
  value,
  valueColor = C.textPrimary,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <span
        style={{
          fontSize: '10px',
          letterSpacing: '0.12em',
          color: C.textMuted,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: valueColor,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}

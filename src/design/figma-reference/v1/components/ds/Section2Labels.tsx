import { C, F } from '../../tokens';
import { SectionShell, Specimen, Row } from './Shared';

const badgeBase: React.CSSProperties = {
  fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.08em',
  padding: '2px 6px', borderRadius: '4px', border: '1px solid', textTransform: 'uppercase',
  display: 'inline-block',
};

const regimeBase: React.CSSProperties = {
  fontFamily: F.mono, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
  padding: '3px 8px', borderRadius: '4px', border: '1px solid', textTransform: 'uppercase',
  display: 'inline-block',
};

export function Section2Labels() {
  return (
    <SectionShell index="02" title="Labels & Eyebrows">
      <Row gap={24}>
        <Specimen name="SectionEyebrow" spec="Geist Mono 11px · electricBlue · 0.12em">
          <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.electricBlue, letterSpacing: '0.12em' }}>
            01 · LIVE MARKETS
          </span>
        </Specimen>
        <Specimen name="CardLabel" spec="Geist Mono 11px · textMuted · 0.08em">
          <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em' }}>
            WESTERN_HUB LMP
          </span>
        </Specimen>
        <Specimen name="SubLabel" spec="Geist Mono 10px · textFaint">
          <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textFaint, letterSpacing: '0.08em' }}>
            24H AVG
          </span>
        </Specimen>
        <Specimen name="StatusBadge" spec="4 variants · live/stale/offline/simulated">
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ ...badgeBase, color: C.alertGreen, borderColor: C.alertGreen }}>LIVE</span>
            <span style={{ ...badgeBase, color: C.alertAmber, borderColor: C.alertAmber }}>STALE</span>
            <span style={{ ...badgeBase, color: C.alertRed, borderColor: C.alertRed }}>OFFLINE</span>
            <span style={{ ...badgeBase, color: C.falconGold, borderColor: C.falconGold }}>SIMULATED</span>
          </div>
        </Specimen>
        <Specimen name="RegimeBadge" spec="6 variants · burning/suppressed/emergency/discharging/charging/normal" width={680}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ ...regimeBase, color: C.falconGold, borderColor: C.falconGold, background: C.falconGoldWash }}>BURNING</span>
            <span style={{ ...regimeBase, color: C.electricBlue, borderColor: C.electricBlue, background: C.electricBlueWash }}>SUPPRESSED</span>
            <span style={{ ...regimeBase, color: C.alertRed, borderColor: C.alertRed, background: C.alertRedWash }}>EMERGENCY</span>
            <span style={{ ...regimeBase, color: C.falconGold, borderColor: C.falconGold, background: C.falconGoldWash }}>DISCHARGING</span>
            <span style={{ ...regimeBase, color: C.electricBlue, borderColor: C.electricBlue, background: C.electricBlueWash }}>CHARGING</span>
            <span style={{ ...regimeBase, color: C.textSecondary, borderColor: C.borderHover, background: 'rgba(255,255,255,0.08)' }}>NORMAL</span>
          </div>
        </Specimen>
      </Row>
    </SectionShell>
  );
}

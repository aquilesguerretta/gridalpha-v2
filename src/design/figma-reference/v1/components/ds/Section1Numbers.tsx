import { C, F } from '../../tokens';
import { SectionShell, Specimen, Row } from './Shared';

export function Section1Numbers() {
  return (
    <SectionShell index="01" title="Numbers & Data Display">
      <Row gap={24}>
        <Specimen name="HeroNumber" spec="Instrument Serif 96/100 · white · mono unit 16px">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontFamily: F.serif, fontSize: '96px', lineHeight: 1, color: C.textPrimary }}>33.50</span>
            <span style={{ fontFamily: F.mono, fontSize: '16px', color: C.textMuted, marginTop: '8px', letterSpacing: '0.08em' }}>$/MWh</span>
          </div>
        </Specimen>
        <Specimen name="LargeNumber" spec="Instrument Serif 56px · white">
          <span style={{ fontFamily: F.serif, fontSize: '56px', lineHeight: 1, color: C.textPrimary }}>42.80</span>
        </Specimen>
        <Specimen name="DataValue" spec="Geist Mono 500 · 24px · tabular-nums">
          <span style={{ fontFamily: F.mono, fontWeight: 500, fontSize: '24px', color: C.textPrimary, fontVariantNumeric: 'tabular-nums' }}>+14.9</span>
        </Specimen>
        <Specimen name="CompactValue" spec="Geist Mono 400 · 14px · table/strip use">
          <span style={{ fontFamily: F.mono, fontWeight: 400, fontSize: '14px', color: C.textPrimary, fontVariantNumeric: 'tabular-nums' }}>28.42</span>
        </Specimen>
        <Specimen name="ChangeDelta" spec="Geist Mono 13px · green +, red -, gold flat">
          <div style={{ display: 'flex', gap: '16px', fontFamily: F.mono, fontSize: '13px' }}>
            <span style={{ color: C.alertGreen }}>▲ 2.14</span>
            <span style={{ color: C.alertRed }}>▼ 1.82</span>
            <span style={{ color: C.falconGold }}>▶ 0.00</span>
          </div>
        </Specimen>
        <Specimen name="Unit" spec="Geist Mono 11px · textMuted · 0.08em">
          <div style={{ display: 'flex', gap: '12px', fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em' }}>
            <span>$/MWh</span><span>GW</span><span>%</span><span>MMBTU</span>
          </div>
        </Specimen>
      </Row>
    </SectionShell>
  );
}

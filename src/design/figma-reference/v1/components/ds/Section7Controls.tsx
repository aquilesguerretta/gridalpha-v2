import { C, F } from '../../tokens';
import { SectionShell, Annotation, Row, Specimen } from './Shared';

const btnBase: React.CSSProperties = {
  fontFamily: F.sans, fontSize: '14px', fontWeight: 500, height: '36px',
  borderRadius: '8px', padding: '0 20px', display: 'inline-flex', alignItems: 'center', gap: '8px',
  cursor: 'pointer', border: '1px solid transparent',
};

export function Section7Controls() {
  return (
    <SectionShell index="07" title="Controls & Inputs">
      <Row gap={24}>
        <Specimen name="Button · primary" spec="#3B82F6 bg · white · 36h · radius 8">
          <button style={{ ...btnBase, background: C.electricBlue, color: '#fff' }}>Run Simulation</button>
        </Specimen>
        <Specimen name="Button · ghost" spec="transparent · 1px border 0.12 · white text">
          <button style={{ ...btnBase, background: 'transparent', color: C.textPrimary, borderColor: C.borderHover }}>Cancel</button>
        </Specimen>
        <Specimen name="Button · icon-only" spec="36×36 · ghost treatment">
          <button style={{ ...btnBase, width: '36px', padding: 0, justifyContent: 'center', background: 'transparent', color: C.textPrimary, borderColor: C.borderHover }}>⋯</button>
        </Specimen>
        <Specimen name="Dropdown" spec="36h · #14141A · chevron right" width={220}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '36px',
            padding: '0 12px', background: C.bgElevated, border: `1px solid ${C.borderHover}`, borderRadius: '8px',
            fontFamily: F.sans, fontSize: '13px', color: C.textPrimary, width: '180px',
          }}>
            <span>CAISO · SP15</span>
            <span style={{ color: C.textMuted }}>▾</span>
          </div>
        </Specimen>
      </Row>

      <div style={{ marginTop: '32px' }}>
        <Row gap={24}>
          <Specimen name="MultiSelect" spec="inline tags above · mono 11 · accent-tint" width={300}>
            <div style={{ width: '260px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {['WESTERN_HUB', 'AEP_DAYTON', 'NI_HUB'].map(t => (
                  <span key={t} style={{
                    fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.08em',
                    padding: '3px 8px', borderRadius: '4px',
                    background: C.electricBlueWash, border: `1px solid ${C.electricBlue}`, color: C.electricBlue,
                  }}>{t} ×</span>
                ))}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '36px',
                padding: '0 12px', background: C.bgElevated, border: `1px solid ${C.borderHover}`, borderRadius: '8px',
                fontFamily: F.sans, fontSize: '13px', color: C.textMuted,
              }}>
                <span>Add zone…</span><span>▾</span>
              </div>
            </div>
          </Specimen>

          <Specimen name="Toggle" spec="44×24 pill · animated · #3B82F6 on">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: C.electricBlue, position: 'relative' }}>
                <div style={{ position: 'absolute', top: '2px', left: '22px', width: '20px', height: '20px', borderRadius: '10px', background: '#fff' }} />
              </div>
              <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: C.bgHover, border: `1px solid ${C.borderHover}`, position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1px', left: '1px', width: '20px', height: '20px', borderRadius: '10px', background: C.textMuted }} />
              </div>
            </div>
          </Specimen>

          <Specimen name="Slider" spec="2px track · accent fill · 16px handle" width={260}>
            <div style={{ width: '220px', position: 'relative' }}>
              <div style={{ height: '2px', background: C.borderHover, borderRadius: '1px' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, height: '2px', width: '64%', background: C.electricBlue }} />
              <div style={{ position: 'absolute', top: '-7px', left: 'calc(64% - 8px)', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', border: `2px solid ${C.electricBlue}` }} />
            </div>
          </Specimen>

          <Specimen name="Search" spec="36h · icon left · clear right" width={320}>
            <div style={{
              width: '280px', height: '36px', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '0 12px', background: C.bgElevated, border: `1px solid ${C.borderHover}`, borderRadius: '8px',
              fontFamily: F.sans, fontSize: '13px', color: C.textPrimary,
            }}>
              <span style={{ color: C.textMuted }}>⌕</span>
              <span style={{ flex: 1 }}>ercot north</span>
              <span style={{ color: C.textMuted, cursor: 'pointer' }}>×</span>
            </div>
          </Specimen>
        </Row>
      </div>

      <div style={{ marginTop: '32px' }}>
        <Row gap={24}>
          <Specimen name="TabStrip" spec="Inter 13 uppercase · 2px underline in accent" width={560}>
            <div style={{ display: 'flex', gap: '32px', borderBottom: `1px solid ${C.borderDefault}`, width: '480px' }}>
              {[
                { t: 'OVERVIEW', active: true },
                { t: 'FORECAST', active: false },
                { t: 'OUTAGES',  active: false },
                { t: 'SETTLEMENT', active: false },
              ].map(i => (
                <div key={i.t} style={{
                  fontFamily: F.sans, fontSize: '13px', letterSpacing: '0.08em',
                  color: i.active ? C.textPrimary : C.textMuted,
                  padding: '12px 0',
                  borderBottom: i.active ? `2px solid ${C.electricBlue}` : '2px solid transparent',
                  marginBottom: '-1px',
                }}>{i.t}</div>
              ))}
            </div>
          </Specimen>

          <Specimen name="Breadcrumb" spec="Geist Mono 11 · '/' separator · last white" width={480}>
            <div style={{ fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.08em' }}>
              <span style={{ color: C.textMuted }}>ANALYTICS</span>
              <span style={{ color: C.textFaint, margin: '0 8px' }}>/</span>
              <span style={{ color: C.textMuted }}>RESOURCE GAP</span>
              <span style={{ color: C.textFaint, margin: '0 8px' }}>/</span>
              <span style={{ color: C.textPrimary }}>CAISO 2026–2030</span>
            </div>
          </Specimen>
        </Row>
      </div>

      {/* ZoneSelector */}
      <div style={{ marginTop: '32px', maxWidth: '420px' }}>
        <div style={{
          background: C.bgElevated, border: `1px solid ${C.borderHover}`, borderRadius: '8px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.08em', marginBottom: '4px' }}>ACTIVE ZONE</div>
            <div style={{ fontFamily: F.serif, fontSize: '28px', color: C.textPrimary, lineHeight: 1 }}>CAISO · SP15</div>
          </div>
          <span style={{ color: C.textMuted, fontSize: '20px' }}>▾</span>
        </div>
        <Annotation name="ZoneSelector" spec="nest variant · serif prominent · opens searchable list" />
      </div>
    </SectionShell>
  );
}

import { C, F } from '../../tokens';
import { SectionShell, Annotation, Row } from './Shared';

export function Section8Nav() {
  return (
    <SectionShell index="08" title="Navigation & Shell">
      {/* TopNav */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          height: '56px', background: C.bgBase, border: `1px solid ${C.borderDefault}`, borderRadius: '8px',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: '32px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" stroke={C.electricBlue} strokeWidth="1.5" fill={C.electricBlueWash} />
              <polygon points="12,7 17,9.5 17,14.5 12,17 7,14.5 7,9.5" fill={C.electricBlue} />
            </svg>
            <span style={{ fontFamily: F.serif, fontSize: '18px', color: C.textPrimary, letterSpacing: '0.02em' }}>GridAlpha</span>
          </div>
          <div style={{ display: 'flex', gap: '28px', flex: 1 }}>
            {[
              { t: 'THE NEST', active: true },
              { t: 'GRID ATLAS', active: false },
              { t: 'PEREGRINE', active: false },
              { t: 'ANALYTICS', active: false },
              { t: 'VAULT', active: false },
            ].map(i => (
              <div key={i.t} style={{
                fontFamily: F.mono, fontSize: '13px', letterSpacing: '0.12em',
                color: i.active ? C.textPrimary : C.textMuted,
                paddingBottom: '4px',
                borderBottom: i.active ? `2px solid ${C.electricBlue}` : '2px solid transparent',
              }}>{i.t}</div>
            ))}
          </div>
          <div style={{
            height: '30px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px',
            background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '6px',
            fontFamily: F.sans, fontSize: '12px', color: C.textMuted,
          }}>
            <span>⌕</span><span>Search</span>
            <span style={{
              fontFamily: F.mono, fontSize: '10px', padding: '1px 6px', border: `1px solid ${C.borderHover}`,
              borderRadius: '4px', color: C.textMuted, marginLeft: '8px',
            }}>⌘K</span>
          </div>
          <div style={{ position: 'relative', width: '18px', height: '18px', color: C.textMuted, fontSize: '16px' }}>
            ⛉
            <span style={{ position: 'absolute', top: '-2px', right: '-4px', width: '6px', height: '6px', borderRadius: '50%', background: C.alertRed }} />
          </div>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: C.bgSurface, border: `1px solid ${C.borderHover}`,
            fontFamily: F.mono, fontSize: '11px', color: C.textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.04em' }}>AG</div>
        </div>
        <Annotation name="TopNav" spec="56h · hex logo · 5 nav · ⌘K · avatar · alerts" />
      </div>

      {/* SectionHeader */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ background: C.bgBase, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '32px' }}>
          <div style={{
            fontFamily: F.mono, fontSize: '11px', color: C.electricBlue,
            letterSpacing: '0.12em', marginBottom: '12px',
          }}>03 · ANALYTICS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: F.serif, fontSize: '48px', color: C.textPrimary, margin: 0, lineHeight: 1.05 }}>
                Resource Gap Analysis
              </h1>
              <div style={{ fontFamily: F.sans, fontSize: '16px', color: 'rgba(255,255,255,0.55)', marginTop: '8px' }}>
                Forward-looking capacity adequacy across ISO regions, 2026–2030.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                fontFamily: F.sans, fontSize: '14px', fontWeight: 500, height: '36px', padding: '0 16px',
                background: 'transparent', border: `1px solid ${C.borderHover}`, borderRadius: '8px', color: C.textPrimary,
              }}>Export</button>
              <button style={{
                fontFamily: F.sans, fontSize: '14px', fontWeight: 500, height: '36px', padding: '0 20px',
                background: C.electricBlue, border: 'none', borderRadius: '8px', color: '#fff',
              }}>Run Scenario</button>
            </div>
          </div>
        </div>
        <Annotation name="SectionHeader" spec="eyebrow · serif 48 · Inter 16 sub · right actions" />
      </div>

      <Row gap={24}>
        {/* BackButton */}
        <div>
          <button style={{
            fontFamily: F.sans, fontSize: '13px', height: '36px', padding: '0 14px',
            background: 'transparent', border: `1px solid ${C.borderHover}`, borderRadius: '8px',
            color: C.textPrimary, display: 'inline-flex', alignItems: 'center', gap: '8px',
          }}>← Back to Nest</button>
          <Annotation name="BackButton" spec="ghost · left arrow · full-view escape" />
        </div>

        {/* ProgressIndicator */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', width: '480px' }}>
            {[
              { t: 'Scope', done: true },
              { t: 'Assumptions', done: true },
              { t: 'Scenarios', active: true },
              { t: 'Review', active: false },
            ].map((s, i, arr) => (
              <div key={s.t} style={{ display: 'flex', alignItems: 'center', flex: i === arr.length - 1 ? 0 : 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: s.done ? C.electricBlue : 'transparent',
                    border: `1px solid ${s.done || s.active ? C.electricBlue : C.borderHover}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: F.mono, fontSize: '11px', color: s.done ? '#fff' : (s.active ? C.electricBlue : C.textMuted),
                  }}>{s.done ? '✓' : i + 1}</div>
                  <span style={{
                    fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.08em',
                    color: s.done || s.active ? C.textPrimary : C.textMuted,
                  }}>{s.t.toUpperCase()}</span>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ flex: 1, height: '1px', background: s.done ? C.electricBlue : C.borderHover, margin: '0 12px', marginBottom: '20px' }} />
                )}
              </div>
            ))}
          </div>
          <Annotation name="ProgressIndicator" spec="horizontal step tracker · analytics / curriculum" />
        </div>

        {/* KeyboardShortcut */}
        <div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['⌘K', '⌘P', '⇧⌘F', 'ESC'].map(k => (
              <span key={k} style={{
                fontFamily: F.mono, fontSize: '11px', padding: '4px 8px',
                border: `1px solid ${C.borderHover}`, borderRadius: '4px', color: C.textPrimary,
                background: C.bgElevated, letterSpacing: '0.04em',
              }}>{k}</span>
            ))}
          </div>
          <Annotation name="KeyboardShortcut" spec="pill · 1px border · mono 11" />
        </div>
      </Row>
    </SectionShell>
  );
}

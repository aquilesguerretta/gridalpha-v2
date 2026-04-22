import { C, F } from '../../tokens';
import { SectionShell, Annotation, Row } from './Shared';

export function Section10Overlays() {
  return (
    <SectionShell index="10" title="Overlay Components">
      <Row gap={24}>
        {/* Modal */}
        <div>
          <div style={{
            width: '520px', background: 'rgba(0,0,0,0.6)', borderRadius: '12px', padding: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '100%', maxWidth: '440px', background: C.bgElevated,
              border: `1px solid ${C.borderHover}`, borderRadius: '12px', padding: '28px',
            }}>
              <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.electricBlue, letterSpacing: '0.12em', marginBottom: '10px' }}>
                CONFIRM ACTION
              </div>
              <div style={{ fontFamily: F.serif, fontSize: '28px', color: C.textPrimary, lineHeight: 1.15, marginBottom: '12px' }}>
                Publish scenario to shared workspace?
              </div>
              <div style={{ fontFamily: F.sans, fontSize: '14px', color: C.textSecondary, lineHeight: 1.6, marginBottom: '24px' }}>
                All analysts on the CAISO desk will be able to view and fork this scenario. You can revoke access at any time.
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button style={{
                  fontFamily: F.sans, fontSize: '14px', height: '36px', padding: '0 16px',
                  background: 'transparent', border: `1px solid ${C.borderHover}`, borderRadius: '8px', color: C.textPrimary,
                }}>Cancel</button>
                <button style={{
                  fontFamily: F.sans, fontSize: '14px', fontWeight: 500, height: '36px', padding: '0 20px',
                  background: C.electricBlue, border: 'none', borderRadius: '8px', color: '#fff',
                }}>Publish</button>
              </div>
            </div>
          </div>
          <Annotation name="Modal" spec="black 60% backdrop · max 600 · centered card" />
        </div>

        {/* Drawer */}
        <div>
          <div style={{
            width: '480px', height: '360px', background: C.bgBase, border: `1px solid ${C.borderDefault}`,
            borderRadius: '8px', overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.6) 100%)` }} />
            <div style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: '320px',
              background: C.bgElevated, borderLeft: `1px solid ${C.borderHover}`, padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.12em' }}>CONTEXTUAL NEWS</div>
                <span style={{ color: C.textMuted, cursor: 'pointer', fontSize: '14px' }}>×</span>
              </div>
              <div style={{ fontFamily: F.serif, fontSize: '20px', color: C.textPrimary, lineHeight: 1.3, marginBottom: '12px' }}>
                PJM WEST spread widens on outage at Homer City
              </div>
              <div style={{ fontFamily: F.sans, fontSize: '13px', color: C.textSecondary, lineHeight: 1.6, marginBottom: '16px' }}>
                1,884 MW coal unit forced offline. DA/RT spread at <span style={{ fontFamily: F.mono, color: C.textPrimary }}>+18.42</span>.
              </div>
              <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textFaint, letterSpacing: '0.08em' }}>PJM OPS · 12 MIN AGO</div>
            </div>
          </div>
          <Annotation name="Drawer" spec="400w · right-edge slide · 200ms · ⌘P news panel" />
        </div>
      </Row>

      <div style={{ marginTop: '32px' }}>
        <Row gap={24}>
          {/* Toast */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '320px' }}>
              {[
                { t: 'Scenario saved to Vault',           c: C.alertGreen, lbl: 'SUCCESS' },
                { t: 'Data feed delayed 4 min',           c: C.alertAmber, lbl: 'WARNING' },
                { t: 'ERCOT endpoint temporarily down',   c: C.alertRed,   lbl: 'ERROR' },
                { t: 'New forecast available for SP15',   c: C.electricBlue, lbl: 'INFO' },
              ].map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                  background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px',
                  borderLeft: `3px solid ${t.c}`,
                }}>
                  <span style={{
                    fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.08em', color: t.c,
                    border: `1px solid ${t.c}`, borderRadius: '4px', padding: '2px 6px',
                  }}>{t.lbl}</span>
                  <span style={{ fontFamily: F.sans, fontSize: '13px', color: C.textPrimary, flex: 1 }}>{t.t}</span>
                  <span style={{ color: C.textMuted, fontSize: '14px' }}>×</span>
                </div>
              ))}
            </div>
            <Annotation name="Toast" spec="top-right · 4s auto-dismiss · info/success/warn/error" />
          </div>

          {/* Tooltip */}
          <div>
            <div style={{ position: 'relative', padding: '40px 0' }}>
              <span style={{ fontFamily: F.mono, fontSize: '13px', color: C.electricBlue, borderBottom: `1px dotted ${C.electricBlue}`, paddingBottom: '1px' }}>
                spark spread
              </span>
              <div style={{
                position: 'absolute', top: 0, left: '100px',
                background: C.bgSurface, border: `1px solid ${C.borderHover}`, borderRadius: '6px',
                padding: '8px 12px', maxWidth: '240px',
                fontFamily: F.sans, fontSize: '12px', color: C.textPrimary, lineHeight: 1.5,
              }}>
                The margin between power price and the fuel cost of the marginal gas generator.
              </div>
            </div>
            <Annotation name="Tooltip" spec="Inter 12 · small · hover explanatory" />
          </div>

          {/* CommandPalette */}
          <div>
            <div style={{
              width: '640px', background: 'rgba(20,20,26,0.92)', backdropFilter: 'blur(12px)',
              border: `1px solid ${C.borderHover}`, borderRadius: '12px', overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
                borderBottom: `1px solid ${C.borderSubtle}`,
              }}>
                <span style={{ color: C.textMuted, fontSize: '16px' }}>⌕</span>
                <span style={{ fontFamily: F.sans, fontSize: '15px', color: C.textPrimary, flex: 1 }}>ercot</span>
                <span style={{ fontFamily: F.mono, fontSize: '10px', padding: '2px 6px', border: `1px solid ${C.borderHover}`, borderRadius: '4px', color: C.textMuted }}>ESC</span>
              </div>
              <div style={{ padding: '8px 0' }}>
                <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.12em', padding: '8px 20px' }}>ZONES</div>
                {[
                  { t: 'ERCOT · NORTH',      sub: 'Current LMP 52.18 $/MWh',   hot: true  },
                  { t: 'ERCOT · WEST',       sub: 'Current LMP 38.40 $/MWh',   hot: false },
                  { t: 'ERCOT · HOUSTON',    sub: 'Current LMP 44.92 $/MWh',   hot: false },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px',
                    background: r.hot ? C.electricBlueWash : 'transparent',
                    borderLeft: r.hot ? `2px solid ${C.electricBlue}` : '2px solid transparent',
                  }}>
                    <span style={{ fontFamily: F.mono, fontSize: '13px', color: C.textPrimary, letterSpacing: '0.08em' }}>{r.t}</span>
                    <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.04em', marginLeft: 'auto' }}>{r.sub}</span>
                    <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textFaint }}>↵</span>
                  </div>
                ))}
                <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.12em', padding: '12px 20px 8px' }}>SCENARIOS</div>
                {[
                  { t: 'ERCOT 2027 resource gap',   sub: 'Analytics · 4d ago' },
                  { t: 'ERCOT summer peak scenario', sub: 'Vault · shared' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px' }}>
                    <span style={{ fontFamily: F.sans, fontSize: '13px', color: C.textPrimary }}>{r.t}</span>
                    <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, marginLeft: 'auto' }}>{r.sub}</span>
                  </div>
                ))}
              </div>
            </div>
            <Annotation name="CommandPalette" spec="640w · backdrop-blur · search + grouped results" />
          </div>
        </Row>
      </div>
    </SectionShell>
  );
}

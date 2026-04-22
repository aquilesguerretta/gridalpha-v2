import { C, F } from '../../tokens';
import { SectionShell, Annotation, Row, Specimen } from './Shared';

export function Section9Map() {
  return (
    <SectionShell index="09" title="Map Components · Grid Atlas">
      <Row gap={24}>
        <Specimen name="MapMarker" spec="plant · outage · facility · battery">
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: C.electricBlue, border: '2px solid rgba(59,130,246,0.3)' }} />
              <span style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.08em' }}>PLANT</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: C.alertRed, boxShadow: `0 0 0 6px rgba(239,68,68,0.2)` }} />
              <span style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.08em' }}>OUTAGE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: C.falconGold }} />
              <span style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.08em' }}>FACILITY</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: C.purple }} />
              <span style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.08em' }}>BATTERY</span>
            </div>
          </div>
        </Specimen>

        <Specimen name="MapLabel" spec="mono 11 · white · 2px text-shadow">
          <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textPrimary, letterSpacing: '0.12em', textShadow: '0 0 2px #000, 0 0 2px #000' }}>
            WESTERN_HUB
          </span>
        </Specimen>
      </Row>

      <div style={{ marginTop: '32px' }}>
        <Row gap={24}>
          {/* MapTooltip */}
          <div>
            <div style={{
              background: 'rgba(20,20,26,0.95)', backdropFilter: 'blur(8px)',
              border: `1px solid ${C.borderHover}`, borderRadius: '8px', padding: '14px 16px', width: '240px',
            }}>
              <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.08em', marginBottom: '6px' }}>COMANCHE PEAK · NUCLEAR</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
                <span style={{ fontFamily: F.serif, fontSize: '28px', color: C.textPrimary, lineHeight: 1 }}>2,300</span>
                <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.08em' }}>MW · NET</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.08em' }}>
                <span>ERCOT · N</span>
                <span style={{ color: C.alertGreen }}>ONLINE</span>
              </div>
            </div>
            <Annotation name="MapTooltip" spec="#14141A @ 95% · backdrop-blur · title / value / meta" />
          </div>

          {/* MapLayerPanel */}
          <div>
            <div style={{ width: '280px', background: C.bgElevated, border: `1px solid ${C.borderHover}`, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.12em', borderBottom: `1px solid ${C.borderSubtle}` }}>
                MAP LAYERS
              </div>
              {[
                { t: 'Transmission',   on: true  },
                { t: 'Generation',     on: true  },
                { t: 'LMP heatmap',    on: true  },
                { t: 'Outages',        on: false },
                { t: 'Weather',        on: false },
                { t: 'Interconnection queue', on: false },
              ].map(l => (
                <div key={l.t} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px',
                  borderTop: `1px solid ${C.borderSubtle}`,
                }}>
                  <span style={{ fontFamily: F.sans, fontSize: '13px', color: C.textPrimary }}>{l.t}</span>
                  <div style={{ width: '32px', height: '18px', borderRadius: '9px',
                    background: l.on ? C.electricBlue : C.bgHover,
                    border: l.on ? 'none' : `1px solid ${C.borderHover}`, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '2px', left: l.on ? '16px' : '2px',
                      width: '14px', height: '14px', borderRadius: '50%', background: l.on ? '#fff' : C.textMuted }} />
                  </div>
                </div>
              ))}
            </div>
            <Annotation name="MapLayerPanel" spec="280px · toggle layers · right of trigger" />
          </div>
        </Row>
      </div>

      {/* TimeScrubber */}
      <div style={{ marginTop: '32px' }}>
        <div style={{
          height: '60px', background: `linear-gradient(180deg, ${C.bgElevated} 0%, ${C.bgSurface} 100%)`,
          border: `1px solid ${C.borderDefault}`, borderRadius: '8px',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: '20px',
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: C.bgSurface, border: `1px solid ${C.borderHover}`, color: C.textPrimary, fontFamily: F.mono, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
            <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: C.bgSurface, border: `1px solid ${C.borderHover}`, color: C.textMuted, fontFamily: F.mono, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❚❚</button>
          </div>
          <div style={{ flex: 1, position: 'relative', height: '32px' }}>
            <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, height: '2px', background: C.borderHover }} />
            <div style={{ position: 'absolute', top: '16px', left: 0, width: '72%', height: '2px', background: C.electricBlue }} />
            <div style={{ position: 'absolute', top: '10px', left: 'calc(72% - 7px)', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', border: `2px solid ${C.electricBlue}` }} />
            <div style={{ position: 'absolute', top: '24px', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: '10px', color: C.textFaint, letterSpacing: '0.08em' }}>
              <span>-48H</span><span>-36H</span><span>-24H</span><span>-12H</span><span style={{ color: C.textPrimary }}>NOW</span>
            </div>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.textPrimary, letterSpacing: '0.08em' }}>-13H 22M</div>
        </div>
        <Annotation name="TimeScrubber" spec="60h · play/pause · -48 to NOW timeline · draggable handle" />
      </div>
    </SectionShell>
  );
}

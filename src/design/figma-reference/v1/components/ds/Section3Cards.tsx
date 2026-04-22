import { C, F } from '../../tokens';
import { SectionShell, Annotation } from './Shared';

const cardHeader: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
};
const label: React.CSSProperties = {
  fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em',
};
const live: React.CSSProperties = {
  fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.08em',
  color: C.alertGreen, border: `1px solid ${C.alertGreen}`, borderRadius: '4px', padding: '2px 6px',
};

export function Section3Cards() {
  return (
    <SectionShell index="03" title="Cards & Surfaces">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* BaseCard */}
        <div>
          <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '20px' }}>
            <div style={cardHeader}>
              <span style={label}>WESTERN_HUB LMP</span>
              <span style={live}>LIVE</span>
            </div>
            <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: '24px', color: C.textPrimary }}>42.80</div>
            <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, marginTop: '4px', letterSpacing: '0.08em' }}>
              $/MWh · <span style={{ color: C.alertGreen }}>▲ 2.14</span>
            </div>
          </div>
          <Annotation name="BaseCard" spec="bg #14141A · border 0.06 · radius 8 · padding 20" />
        </div>

        {/* ElevatedCard */}
        <div>
          <div style={{
            background: C.bgSurface, border: `1px solid ${C.borderHover}`, borderRadius: '8px', padding: '20px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(circle at 30% 0%, rgba(59,130,246,0.08), transparent 60%)',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={cardHeader}>
                <span style={label}>PJM · SPREAD</span>
                <span style={{ ...live, color: C.falconGold, borderColor: C.falconGold }}>BURNING</span>
              </div>
              <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: '24px', color: C.textPrimary }}>+18.42</div>
              <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, marginTop: '4px', letterSpacing: '0.08em' }}>DA vs RT · 16:00 ET</div>
            </div>
          </div>
          <Annotation name="ElevatedCard" spec="bg #1C1C24 · border 0.12 · optional radial glow" />
        </div>

        {/* CompactCard */}
        <div>
          <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '12px' }}>
            <div style={{ ...label, marginBottom: '6px' }}>ERCOT NORTH</div>
            <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: '18px', color: C.textPrimary }}>28.14</div>
          </div>
          <Annotation name="CompactCard" spec="padding 12 · strip rows of 4–5" />
        </div>
      </div>

      {/* DominantCard */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ background: C.bgElevated, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '8px', padding: '24px' }}>
          <div style={cardHeader}>
            <div>
              <div style={{ ...label, marginBottom: '6px' }}>CAISO SP15 · REAL-TIME LMP</div>
              <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textFaint, letterSpacing: '0.08em' }}>INTERVAL 14:55 PT</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={live}>LIVE</span>
              <span style={{ ...live, color: C.falconGold, borderColor: C.falconGold }}>SIMULATED</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontFamily: F.serif, fontSize: '96px', lineHeight: 1, color: C.textPrimary }}>86.40</span>
            <span style={{ fontFamily: F.mono, fontSize: '16px', color: C.textMuted, marginTop: '8px', letterSpacing: '0.08em' }}>$/MWh</span>
          </div>
          <div style={{
            display: 'flex', gap: '32px', paddingTop: '16px', borderTop: `1px solid ${C.borderSubtle}`,
            fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em',
          }}>
            <div>24H AVG <span style={{ color: C.textPrimary, marginLeft: '8px' }}>71.22</span></div>
            <div>DA <span style={{ color: C.textPrimary, marginLeft: '8px' }}>68.90</span></div>
            <div>SPREAD <span style={{ color: C.alertGreen, marginLeft: '8px' }}>+17.50</span></div>
            <div>LOAD <span style={{ color: C.textPrimary, marginLeft: '8px' }}>38.2 GW</span></div>
          </div>
        </div>
        <Annotation name="DominantCard" spec="HeroNumber body · footer strip of context · one per screen" />
      </div>

      {/* StripCard */}
      <div>
        <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={label}>GENERATION MIX · CAISO · NOW</span>
            <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em' }}>38.2 GW</span>
          </div>
          <div style={{ display: 'flex', height: '10px', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '32%', background: C.falconGold }} />
            <div style={{ width: '22%', background: C.alertGreen }} />
            <div style={{ width: '18%', background: '#FDE047' }} />
            <div style={{ width: '14%', background: '#38BDF8' }} />
            <div style={{ width: '8%', background: C.purple }} />
            <div style={{ width: '6%', background: '#6B7280' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.08em' }}>
            <span><span style={{ color: C.falconGold }}>■</span> GAS 32%</span>
            <span><span style={{ color: C.alertGreen }}>■</span> HYDRO 22%</span>
            <span><span style={{ color: '#FDE047' }}>■</span> SOLAR 18%</span>
            <span><span style={{ color: '#38BDF8' }}>■</span> WIND 14%</span>
            <span><span style={{ color: C.purple }}>■</span> BATT 8%</span>
            <span><span style={{ color: '#6B7280' }}>■</span> OTHER 6%</span>
          </div>
        </div>
        <Annotation name="StripCard" spec="full-width · bottom-of-screen strips · 16 / 24 padding" />
      </div>
    </SectionShell>
  );
}

import { C, F } from '../../tokens';
import { SectionShell, Annotation, Row } from './Shared';

function buildPath(values: number[], w: number, h: number) {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - ((v - min) / range) * h] as [number, number]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

const sparkData = [28, 31, 29, 34, 36, 33, 38, 42, 40, 44, 47, 45, 49, 52, 50];
const chartData = [42, 48, 45, 52, 58, 54, 62, 68, 64, 72, 78, 74, 82, 88, 84, 90, 86, 94];

export function Section4Charts() {
  return (
    <SectionShell index="04" title="Charts">
      <Row gap={24}>
        {/* SparkLine */}
        <div>
          <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '20px', width: '200px' }}>
            <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', marginBottom: '8px' }}>ERCOT NORTH · 24H</div>
            <div style={{ fontFamily: F.mono, fontWeight: 500, fontSize: '20px', color: C.textPrimary, marginBottom: '8px' }}>52.18</div>
            <svg width="120" height="40" viewBox="0 0 120 40">
              <path d={buildPath(sparkData, 120, 40)} fill="none" stroke={C.electricBlue} strokeWidth="2" />
            </svg>
          </div>
          <Annotation name="SparkLine" spec="120×40 · 2px stroke · no axes / labels" />
        </div>

        {/* SmoothLineChart */}
        <div>
          <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '20px', width: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em' }}>PJM WEST · LMP · 24H</span>
              <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textFaint, letterSpacing: '0.08em' }}>$/MWh</span>
            </div>
            <svg width="380" height="140" viewBox="0 0 380 140">
              {[20, 60, 100].map(y => (
                <line key={y} x1="0" x2="380" y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              ))}
              <path d={buildPath(chartData, 380, 120)} fill="none" stroke={C.electricBlue} strokeWidth="2" transform="translate(0,10)" />
              <line x1="260" x2="260" y1="0" y2="140" stroke="rgba(255,255,255,0.25)" strokeDasharray="2 3" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: '10px', color: C.textFaint, letterSpacing: '0.08em', marginTop: '6px' }}>
              <span>-24H</span><span>-18</span><span>-12</span><span>-6</span><span>NOW</span>
            </div>
          </div>
          <Annotation name="SmoothLineChart" spec="cubic bezier · horiz grid · crosshair 1px dashed" />
        </div>

        {/* FilledAreaChart */}
        <div>
          <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '20px', width: '420px' }}>
            <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', marginBottom: '12px' }}>SP15 LMP · FILLED</div>
            <svg width="380" height="140" viewBox="0 0 380 140">
              <defs>
                <linearGradient id="areafill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={C.electricBlue} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={C.electricBlue} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[20, 60, 100].map(y => (
                <line key={y} x1="0" x2="380" y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              ))}
              <path d={`${buildPath(chartData, 380, 120)} L 380 130 L 0 130 Z`} fill="url(#areafill)" transform="translate(0,10)" />
              <path d={buildPath(chartData, 380, 120)} fill="none" stroke={C.electricBlue} strokeWidth="2" transform="translate(0,10)" />
            </svg>
          </div>
          <Annotation name="FilledAreaChart" spec="stroke + linear gradient fill 20%→0%" />
        </div>
      </Row>

      <div style={{ marginTop: '32px' }}>
        <Row gap={24}>
          {/* StackedBar */}
          <div>
            <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '20px', width: '420px' }}>
              <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', marginBottom: '12px' }}>FUEL MIX · PJM · NOW</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: '10px', color: C.textFaint, marginBottom: '4px', letterSpacing: '0.08em' }}>
                <span>GAS 38%</span><span>COAL 22%</span><span>NUC 20%</span><span>REN 14%</span><span>OTH 6%</span>
              </div>
              <div style={{ display: 'flex', height: '12px', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '38%', background: C.falconGold }} />
                <div style={{ width: '22%', background: '#6B7280' }} />
                <div style={{ width: '20%', background: C.alertAmber }} />
                <div style={{ width: '14%', background: '#38BDF8' }} />
                <div style={{ width: '6%', background: C.purple }} />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.08em' }}>
                <span><span style={{ color: C.falconGold }}>■</span> GAS</span>
                <span><span style={{ color: '#6B7280' }}>■</span> COAL</span>
                <span><span style={{ color: C.alertAmber }}>■</span> NUC</span>
                <span><span style={{ color: '#38BDF8' }}>■</span> REN</span>
                <span><span style={{ color: C.purple }}>■</span> OTH</span>
              </div>
            </div>
            <Annotation name="StackedBar" spec="horizontal · % labels above · legend below" />
          </div>

          {/* Gauge */}
          <div>
            <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '20px', width: '220px', textAlign: 'center' }}>
              <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', marginBottom: '8px' }}>BESS · SOC</div>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ display: 'block', margin: '0 auto' }}>
                <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <circle cx="70" cy="70" r="60" fill="none" stroke={C.electricBlue} strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 60 * 0.74} ${2 * Math.PI * 60}`}
                  transform="rotate(-90 70 70)" strokeLinecap="round" />
                <text x="70" y="72" textAnchor="middle" fontFamily={F.serif} fontSize="36" fill={C.textPrimary}>74</text>
                <text x="70" y="92" textAnchor="middle" fontFamily={F.mono} fontSize="10" fill={C.textMuted} letterSpacing="0.08em">% SOC</text>
              </svg>
            </div>
            <Annotation name="Gauge" spec="140px · 2px active / 1px inactive arc" />
          </div>

          {/* WaterfallChart */}
          <div>
            <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '20px', width: '420px' }}>
              <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', marginBottom: '12px' }}>RESOURCE GAP · 2026→2030</div>
              <svg width="380" height="140" viewBox="0 0 380 140">
                {[{x:10,y:40,h:80,c:C.alertGreen,l:'+4.2'},{x:70,y:20,h:40,c:C.alertGreen,l:'+2.1'},{x:130,y:60,h:30,c:C.alertRed,l:'-1.5'},{x:190,y:70,h:20,c:C.alertRed,l:'-1.0'},{x:250,y:40,h:30,c:C.alertGreen,l:'+1.6'},{x:310,y:10,h:100,c:C.electricBlue,l:'NET'}].map((b,i)=>(
                  <g key={i}>
                    <rect x={b.x} y={b.y} width="50" height={b.h} fill={b.c} fillOpacity="0.75" />
                    <text x={b.x+25} y={b.y-4} textAnchor="middle" fontFamily={F.mono} fontSize="10" fill={C.textMuted}>{b.l}</text>
                  </g>
                ))}
                <line x1="0" x2="380" y1="120" y2="120" stroke="rgba(255,255,255,0.12)" />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: '10px', color: C.textFaint, letterSpacing: '0.08em' }}>
                <span>NEW</span><span>SOLAR</span><span>RET</span><span>NUC</span><span>BATT</span><span>NET</span>
              </div>
            </div>
            <Annotation name="WaterfallChart" spec="+/- bars · green add · red subtract · blue net" />
          </div>
        </Row>
      </div>
    </SectionShell>
  );
}

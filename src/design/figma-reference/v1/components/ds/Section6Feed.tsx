import { C, F } from '../../tokens';
import { SectionShell, Annotation } from './Shared';

const label: React.CSSProperties = { fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em' };
const ts:    React.CSSProperties = { fontFamily: F.mono, fontSize: '10px', color: C.textFaint, letterSpacing: '0.08em' };

function SourceChip({ s }: { s: string }) {
  return (
    <span style={{
      fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.08em', padding: '2px 6px',
      border: `1px solid ${C.borderHover}`, borderRadius: '4px', color: C.textSecondary,
    }}>{s}</span>
  );
}

export function Section6Feed() {
  return (
    <SectionShell index="06" title="Feed Components">
      {/* BreakingItem */}
      <div style={{ marginBottom: '32px', maxWidth: '760px' }}>
        <div style={{
          display: 'flex', background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', overflow: 'hidden',
        }}>
          <div style={{ width: '3px', background: C.alertRed }} />
          <div style={{ padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <SourceChip s="ERCOT OP" />
              <span style={ts}>16:42 CT · 4 MIN AGO</span>
              <span style={{ marginLeft: 'auto', fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.08em', color: C.alertRed, border: `1px solid ${C.alertRed}`, padding: '2px 6px', borderRadius: '4px' }}>EEA 2</span>
            </div>
            <div style={{ fontFamily: F.serif, fontSize: '24px', color: C.textPrimary, lineHeight: 1.2, marginBottom: '12px' }}>
              ERCOT issues <span style={{ color: C.alertRed }}>Energy Emergency Alert Level 2</span> — reserves below 2,300 MW as North zone load climbs past 78 GW.
            </div>
            <div style={{ fontFamily: F.sans, fontSize: '14px', color: C.textSecondary, lineHeight: 1.6 }}>
              Operating reserves have fallen below the 2,300 MW threshold for the first time this summer. Grid operator has called for demand response and is coordinating with neighboring balancing authorities. Real-time LMP in North Hub has spiked to <span style={{ color: C.textPrimary, fontFamily: F.mono }}>$328.40/MWh</span>.
            </div>
          </div>
        </div>
        <Annotation name="BreakingItem" spec="24 padding · 3px accent bar · serif headline · full AI summary" />
      </div>

      {/* StandardFeedItem */}
      <div style={{ marginBottom: '32px', maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { src: 'FERC', t: 'Order 2023 compliance filings due from 6 ISOs', ts: '09:14 ET · 2H AGO' },
          { src: 'CAISO', t: 'SP15 congestion rent up 18% week-over-week', ts: '14:08 PT · 30M AGO' },
        ].map((i, k) => (
          <div key={k} style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
              <SourceChip s={i.src} /><span style={ts}>{i.ts}</span>
            </div>
            <div style={{ fontFamily: F.sans, fontSize: '14px', color: C.textPrimary, lineHeight: 1.5 }}>{i.t}</div>
          </div>
        ))}
        <Annotation name="StandardFeedItem" spec="medium card · source + ts header · one-line body" />
      </div>

      {/* CompactFeedItem */}
      <div style={{ marginBottom: '32px', maxWidth: '760px' }}>
        <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', overflow: 'hidden' }}>
          {[
            { src: 'PJM',     t: 'Winter capacity auction clears at $270/MW-day',  ts: '10:22' },
            { src: 'ISO-NE',  t: 'Mystic retirement proceeding advances',            ts: '09:48' },
            { src: 'NYISO',   t: 'Zone A-F wholesale prices diverge at peak',       ts: '09:02' },
            { src: 'MISO',    t: 'Summer resource adequacy remains sufficient',     ts: '08:40' },
          ].map((i, k) => (
            <div key={k} style={{
              display: 'flex', alignItems: 'center', gap: '16px', height: '40px', padding: '0 16px',
              borderTop: k === 0 ? 'none' : `1px solid ${C.borderSubtle}`,
            }}>
              <SourceChip s={i.src} />
              <span style={{ flex: 1, fontFamily: F.sans, fontSize: '13px', color: C.textPrimary }}>{i.t}</span>
              <span style={ts}>{i.ts}</span>
            </div>
          ))}
        </div>
        <Annotation name="CompactFeedItem" spec="40px row · source + headline + ts inline" />
      </div>

      {/* AnomalyItem */}
      <div style={{ marginBottom: '32px', maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { sev: C.alertRed,    icon: '⚠', t: 'LMP deviation WESTERN_HUB',  d: '+2.3σ', zone: 'PJM · WEST',  ts: '14:22' },
          { sev: C.alertAmber,  icon: '◈', t: 'Load forecast divergence',    d: '+1.4σ', zone: 'ERCOT · N',   ts: '14:08' },
          { sev: C.falconGold,  icon: '◉', t: 'DA/RT spread widening',       d: '+1.8σ', zone: 'CAISO · SP15',ts: '13:55' },
        ].map((i, k) => (
          <div key={k} style={{
            display: 'flex', background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', overflow: 'hidden',
          }}>
            <div style={{ width: '3px', background: i.sev }} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px' }}>
              <span style={{ fontFamily: F.mono, fontSize: '14px', color: i.sev }}>{i.icon}</span>
              <span style={{ flex: 1, fontFamily: F.sans, fontSize: '13px', color: C.textPrimary }}>{i.t}</span>
              <span style={{ fontFamily: F.mono, fontSize: '13px', fontWeight: 600, color: i.sev, fontVariantNumeric: 'tabular-nums' }}>{i.d}</span>
              <span style={label}>{i.zone}</span>
              <span style={ts}>{i.ts}</span>
            </div>
          </div>
        ))}
        <Annotation name="AnomalyItem" spec="severity left border · σ magnitude · zone + ts" />
      </div>

      {/* ExplainerItem */}
      <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          {
            t: 'Why did SP15 prices spike this afternoon?',
            body: 'A transmission line derate on Path 26 cut imports from the north by 800 MW while CAISO load approached peak. Without enough local generation to fill the gap, real-time prices rose sharply.',
            concept: 'Transmission Constraint',
            data: 'Path 26 · 2,400 MW → 1,600 MW · 14:40 PT',
          },
          {
            t: 'What is a "burning" profitability regime?',
            body: 'Burning describes conditions where a gas-fired generator\'s spark spread — the margin between power price and fuel cost — is high enough that every incremental MWh produced is profitable.',
            concept: 'Spark Spread',
            data: 'PJM WEST · Spark 14.2 $/MWh · HR 7,500',
          },
        ].map((i, k) => (
          <div key={k} style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontFamily: F.serif, fontSize: '20px', color: C.textPrimary, marginBottom: '8px', lineHeight: 1.3 }}>{i.t}</div>
            <div style={{ fontFamily: F.sans, fontSize: '14px', color: C.textSecondary, lineHeight: 1.6, marginBottom: '12px' }}>{i.body}</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{
                fontFamily: F.mono, fontSize: '11px', letterSpacing: '0.08em',
                color: C.electricBlue, borderBottom: `1px solid ${C.electricBlue}`, paddingBottom: '1px',
              }}>→ {i.concept.toUpperCase()}</span>
              <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textFaint, letterSpacing: '0.08em' }}>{i.data}</span>
            </div>
          </div>
        ))}
        <Annotation name="ExplainerItem" spec="serif question · plain-language body · concept link + data evidence" />
      </div>
    </SectionShell>
  );
}

import { C, F } from '../../tokens';
import { SectionShell, Annotation } from './Shared';

const th: React.CSSProperties = {
  fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.08em',
  textTransform: 'uppercase', textAlign: 'left', padding: '0 16px', fontWeight: 500,
};
const td: React.CSSProperties = {
  fontFamily: F.mono, fontSize: '13px', color: C.textPrimary, padding: '0 16px',
  borderTop: `1px solid ${C.borderSubtle}`, fontVariantNumeric: 'tabular-nums',
};

const base = [
  { zone: 'WESTERN_HUB', lmp: '42.80', spread: '+2.14', vol: '8,420', regime: 'NORMAL' },
  { zone: 'AEP_DAYTON',  lmp: '39.62', spread: '+1.22', vol: '6,180', regime: 'NORMAL' },
  { zone: 'CHICAGO_HUB', lmp: '48.14', spread: '+5.08', vol: '9,240', regime: 'BURNING' },
  { zone: 'NI_HUB',      lmp: '36.90', spread: '-0.48', vol: '5,020', regime: 'NORMAL' },
  { zone: 'EASTERN_HUB', lmp: '52.18', spread: '+8.42', vol: '11,300', regime: 'BURNING' },
  { zone: 'DOMINION',    lmp: '38.20', spread: '-1.04', vol: '4,780', regime: 'SUPPRESSED' },
];

export function Section5Tables() {
  return (
    <SectionShell index="05" title="Data Tables">
      {/* BaseTable */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ height: '44px', background: 'rgba(255,255,255,0.02)' }}>
                <th style={th}>ZONE ▾</th>
                <th style={{ ...th, textAlign: 'right' }}>LMP $/MWh</th>
                <th style={{ ...th, textAlign: 'right' }}>SPREAD</th>
                <th style={{ ...th, textAlign: 'right' }}>VOL MWh</th>
                <th style={th}>REGIME</th>
              </tr>
            </thead>
            <tbody>
              {base.map(r => (
                <tr key={r.zone} style={{ height: '44px' }}>
                  <td style={td}>{r.zone}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{r.lmp}</td>
                  <td style={{ ...td, textAlign: 'right', color: r.spread.startsWith('-') ? C.alertRed : C.alertGreen }}>{r.spread}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{r.vol}</td>
                  <td style={td}>
                    <span style={{
                      fontFamily: F.mono, fontSize: '10px', letterSpacing: '0.08em', padding: '2px 6px',
                      borderRadius: '4px', border: '1px solid',
                      ...(r.regime === 'BURNING'
                        ? { color: C.falconGold, borderColor: C.falconGold, background: C.falconGoldWash }
                        : r.regime === 'SUPPRESSED'
                        ? { color: C.electricBlue, borderColor: C.electricBlue, background: C.electricBlueWash }
                        : { color: C.textSecondary, borderColor: C.borderHover }),
                    }}>{r.regime}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Annotation name="BaseTable" spec="row 44px · mono 13 · horiz dividers · sort arrows" />
      </div>

      {/* CompactTable */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ height: '32px' }}>
                <th style={th}>ZONE</th>
                <th style={{ ...th, textAlign: 'right' }}>LMP</th>
                <th style={{ ...th, textAlign: 'right' }}>Δ</th>
                <th style={{ ...th, textAlign: 'right' }}>VOL</th>
              </tr>
            </thead>
            <tbody>
              {base.slice(0, 5).map(r => (
                <tr key={r.zone} style={{ height: '32px' }}>
                  <td style={td}>{r.zone}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{r.lmp}</td>
                  <td style={{ ...td, textAlign: 'right', color: r.spread.startsWith('-') ? C.alertRed : C.alertGreen }}>{r.spread}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{r.vol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Annotation name="CompactTable" spec="row 32px · dense · watchlist use" />
      </div>

      {/* NumericTable */}
      <div>
        <div style={{ background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ height: '36px' }}>
                <th style={th}>CONTRACT</th>
                <th style={{ ...th, textAlign: 'right' }}>BID</th>
                <th style={{ ...th, textAlign: 'right' }}>ASK</th>
                <th style={{ ...th, textAlign: 'right' }}>LAST</th>
                <th style={{ ...th, textAlign: 'right' }}>SETTLE</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['PJM W · BAL-MO',     '42.125', '42.500', '42.380', '42.220'],
                ['PJM W · PRMT Q3',    '58.740', '59.120', '58.920', '58.640'],
                ['ERCOT N · BAL-DAY',  '128.500','130.250','129.400','127.820'],
                ['CAISO SP15 · 2027',  '74.200', '74.800', '74.520', '74.140'],
                ['NYISO-A · BAL-MO',   '36.420', '36.780', '36.640', '36.320'],
              ].map((row, i) => (
                <tr key={i} style={{ height: '36px' }}>
                  {row.map((c, j) => (
                    <td key={j} style={{ ...td, textAlign: j === 0 ? 'left' : 'right' }}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Annotation name="NumericTable" spec="right-aligned · tabular-nums · decimal lineup" />
      </div>
    </SectionShell>
  );
}

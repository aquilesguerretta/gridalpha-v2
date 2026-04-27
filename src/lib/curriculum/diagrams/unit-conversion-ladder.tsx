// SCRIBE — Diagram 4: Unit Conversion Ladder + Orders of Magnitude.
// Vertical logarithmic scale from 10⁻¹⁹ J to 10²⁴ J. Each marker is a
// recognisable example.
// L1 = ~10 markers.
// L2 = ~20 markers + "1 kWh = 3.6 × 10⁶ J" inset.
// L3 = full denser table with annotations.

import type { LayerKey } from '@/lib/types/curriculum';

interface Props {
  layer: LayerKey;
}

interface Marker {
  exp: number;
  label: string;
  layer: 1 | 2 | 3;
}

const MARKERS: Marker[] = [
  { exp: -19, label: 'C–H bond · single chemical bond',          layer: 2 },
  { exp: -19, label: '1 eV · electronvolt',                       layer: 1 },
  { exp: -11, label: 'fission of one U-235 atom · ~200 MeV',      layer: 2 },
  { exp: 0,   label: '1 J · lift an apple 1 m',                   layer: 1 },
  { exp: 1,   label: '1 calorie ≈ 4.18 J',                        layer: 2 },
  { exp: 4,   label: '1 AA battery · ~9 kJ',                      layer: 1 },
  { exp: 5,   label: '1 phone full charge · ~50 kJ',              layer: 2 },
  { exp: 6,   label: '1 kWh = 3.6 × 10⁶ J',                       layer: 1 },
  { exp: 8,   label: '1 gallon of gasoline · 1.3 × 10⁸ J',        layer: 1 },
  { exp: 8,   label: 'US household · daily electricity (~30 kWh)', layer: 2 },
  { exp: 8,   label: 'Tesla Model 3 battery · ~75 kWh',           layer: 2 },
  { exp: 9,   label: '1 BOE · barrel of oil (~6 × 10⁹ J)',        layer: 2 },
  { exp: 9,   label: '1 ton TNT · 4.18 GJ',                       layer: 3 },
  { exp: 10,  label: '1 ton of coal · ~24 GJ',                    layer: 1 },
  { exp: 13,  label: 'Hiroshima yield · ~6 × 10¹³ J',             layer: 1 },
  { exp: 13,  label: '24 GWh · 1 GW plant for 1 day',             layer: 2 },
  { exp: 16,  label: 'Annual large nuclear plant · ~3 × 10¹⁶ J',  layer: 1 },
  { exp: 18,  label: '1 EJ · exajoule',                            layer: 1 },
  { exp: 19,  label: 'US annual electricity · ~1.5 × 10¹⁹ J',     layer: 1 },
  { exp: 20,  label: 'Global primary energy · ~600 EJ',           layer: 1 },
  { exp: 22,  label: 'Annual US primary energy in BTU · 100 quad', layer: 3 },
  { exp: 24,  label: 'Annual solar at Earth · ~5.5 × 10²⁴ J',     layer: 1 },
];

const RANGE_MIN = -20;
const RANGE_MAX = 25;
const SVG_W = 760;
const SVG_H = 540;
const PAD_TOP = 40;
const PAD_BOT = 40;

function yFor(exp: number) {
  const t = (exp - RANGE_MIN) / (RANGE_MAX - RANGE_MIN);
  return SVG_H - PAD_BOT - t * (SVG_H - PAD_TOP - PAD_BOT);
}

export function UnitConversionLadder({ layer }: Props) {
  const showL2 = layer === 'L2' || layer === 'L3';
  const showL3 = layer === 'L3';
  const ladderX = 200;
  const visible = MARKERS.filter((m) => (m.layer === 1) || (showL2 && m.layer === 2) || (showL3 && m.layer === 3));

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <style>{`
        .lbl { font-family: 'Geist Mono', monospace; font-size: 10px; fill: rgba(241,241,243,0.45); letter-spacing: 0.10em; }
        .head { font-family: 'Geist Mono', monospace; font-size: 13px; fill: #F1F1F3; font-weight: 600; letter-spacing: 0.10em; text-transform: uppercase; }
        .anchor { font-family: 'Geist Mono', monospace; font-size: 10px; fill: rgba(241,241,243,0.85); letter-spacing: 0.04em; }
        .gold { font-family: 'Geist Mono', monospace; font-size: 11px; fill: #F59E0B; letter-spacing: 0.06em; }
      `}</style>

      <text x={SVG_W / 2} y="24" textAnchor="middle" className="head">
        Energy · Orders of Magnitude
      </text>

      {/* Ladder spine */}
      <line x1={ladderX} y1={PAD_TOP} x2={ladderX} y2={SVG_H - PAD_BOT} stroke="rgba(59,130,246,0.55)" strokeWidth="1.5" />

      {/* Decade ticks */}
      {Array.from({ length: RANGE_MAX - RANGE_MIN + 1 }).map((_, i) => {
        const exp = RANGE_MIN + i;
        const y = yFor(exp);
        const isMajor = exp % 5 === 0;
        return (
          <g key={`tick-${exp}`}>
            <line x1={ladderX - (isMajor ? 8 : 4)} y1={y} x2={ladderX} y2={y} stroke={isMajor ? 'rgba(241,241,243,0.55)' : 'rgba(241,241,243,0.20)'} strokeWidth="1" />
            {isMajor && (
              <text x={ladderX - 14} y={y + 3} textAnchor="end" className="lbl">
                10{exp >= 0 ? '+' + exp : exp} J
              </text>
            )}
          </g>
        );
      })}

      {/* Markers */}
      {visible.map((m, i) => {
        const y = yFor(m.exp);
        return (
          <g key={`mk-${i}`}>
            <circle cx={ladderX} cy={y} r="3" fill="#3B82F6" />
            <line x1={ladderX + 4} y1={y} x2={ladderX + 28} y2={y} stroke="rgba(59,130,246,0.40)" strokeWidth="1" />
            <text x={ladderX + 32} y={y + 3} className="anchor">
              {m.label}
            </text>
          </g>
        );
      })}

      {showL2 && (
        <g transform={`translate(${SVG_W - 200}, ${PAD_TOP + 24})`}>
          <rect x="0" y="0" width="180" height="80" rx="6" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.30)" strokeWidth="1" />
          <text x="90" y="22" textAnchor="middle" className="lbl" style={{ textTransform: 'uppercase' }}>Anchors</text>
          <text x="12" y="42" className="anchor">1 kWh = 3.6 × 10⁶ J</text>
          <text x="12" y="58" className="anchor">1 BTU ≈ 1,055 J</text>
          <text x="12" y="74" className="anchor">1 BOE ≈ 6.1 × 10⁹ J</text>
        </g>
      )}

      <text x={SVG_W / 2} y={SVG_H - 14} textAnchor="middle" className="lbl">
        {showL3 ? 'Every energy quantity reduces to joules. 25 orders of magnitude span the field.' : 'Every energy quantity reduces to joules.'}
      </text>
    </svg>
  );
}

export default UnitConversionLadder;

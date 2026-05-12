// SCRIBE — Diagram 1: Energy Transformation Chain.
// Horizontal chain: fuel → boiler → steam → turbine → generator → wire → battery → screen.
// L1 = simple labeled boxes with arrows.
// L2 = adds efficiency % at each step + form symbols (E_chem, E_therm, etc.).
// L3 = adds exergy destruction quantification at each step.

import type { LayerKey } from '@/lib/types/curriculum';

interface Props {
  layer: LayerKey;
}

const STAGES = [
  { id: 'fuel',      label: 'FUEL',       symbol: 'E_chem',  eff: 100, exergy: 100 },
  { id: 'boiler',    label: 'BOILER',     symbol: 'E_therm', eff: 88,  exergy: 60 },
  { id: 'steam',     label: 'STEAM',      symbol: 'E_therm', eff: 85,  exergy: 52 },
  { id: 'turbine',   label: 'TURBINE',    symbol: 'E_kin',   eff: 90,  exergy: 47 },
  { id: 'generator', label: 'GENERATOR',  symbol: 'E_elec',  eff: 99,  exergy: 46 },
  { id: 'wire',      label: 'WIRE',       symbol: 'E_elec',  eff: 96,  exergy: 44 },
  { id: 'battery',   label: 'BATTERY',    symbol: 'E_chem',  eff: 92,  exergy: 41 },
  { id: 'screen',    label: 'SCREEN',     symbol: 'E_em',    eff: 50,  exergy: 20 },
];

export function EnergyTransformationChain({ layer }: Props) {
  const showL2 = layer === 'L2' || layer === 'L3';
  const showL3 = layer === 'L3';
  const W = 920;
  const H = 280;
  const boxW = 96;
  const boxH = 56;
  const gap = (W - 32 - boxW * STAGES.length) / (STAGES.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <style>{`
        .lbl { font-family: 'Geist Mono', monospace; font-size: 9px; fill: rgba(241,241,243,0.85); letter-spacing: 0.10em; }
        .lbl-mute { font-family: 'Geist Mono', monospace; font-size: 9px; fill: rgba(241,241,243,0.45); letter-spacing: 0.10em; }
        .sym { font-family: 'Geist Mono', monospace; font-size: 9px; fill: #F59E0B; letter-spacing: 0.06em; }
        .eff { font-family: 'Geist Mono', monospace; font-size: 10px; fill: rgba(241,241,243,0.65); letter-spacing: 0.04em; font-weight: 600; }
        .ex  { font-family: 'Geist Mono', monospace; font-size: 9px; fill: #F59E0B; letter-spacing: 0.04em; }
      `}</style>

      <text x={W / 2} y={26} textAnchor="middle" className="lbl-mute" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        Energy Transformation Chain · Coal Plant to Phone Screen
      </text>

      {STAGES.map((s, i) => {
        const x = 16 + i * (boxW + gap);
        const y = 80;
        return (
          <g key={s.id}>
            <rect x={x} y={y} width={boxW} height={boxH} rx={6} ry={6} fill="rgba(59,130,246,0.10)" stroke="#3B82F6" strokeWidth={1} />
            <text x={x + boxW / 2} y={y + boxH / 2 + 4} textAnchor="middle" className="lbl" style={{ textTransform: 'uppercase' }}>
              {s.label}
            </text>
            {showL2 && (
              <text x={x + boxW / 2} y={y - 8} textAnchor="middle" className="sym" style={{ textTransform: 'uppercase' }}>
                {s.symbol}
              </text>
            )}
            {showL2 && i > 0 && (
              <text x={x + boxW / 2} y={y + boxH + 18} textAnchor="middle" className="eff">
                η = {s.eff}%
              </text>
            )}
            {showL3 && i > 0 && (
              <text x={x + boxW / 2} y={y + boxH + 34} textAnchor="middle" className="ex">
                Δexergy {s.exergy}%
              </text>
            )}
            {i < STAGES.length - 1 && (
              <line
                x1={x + boxW + 2}
                y1={y + boxH / 2}
                x2={x + boxW + gap - 2}
                y2={y + boxH / 2}
                stroke="rgba(59,130,246,0.55)"
                strokeWidth={1.5}
                markerEnd="url(#arrowhead-1)"
              />
            )}
          </g>
        );
      })}

      <defs>
        <marker id="arrowhead-1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(59,130,246,0.55)" />
        </marker>
      </defs>

      <text x={W / 2} y={H - 18} textAnchor="middle" className="lbl-mute" style={{ textTransform: 'uppercase' }}>
        {showL3
          ? 'Each transformation conserves energy and destroys exergy. Total wall-plug-to-useful ≈ 25–35%.'
          : showL2
          ? 'First Law efficiencies multiply along the chain.'
          : 'Energy transforms through every step. Total quantity preserved; useful fraction degraded.'}
      </text>
    </svg>
  );
}

export default EnergyTransformationChain;

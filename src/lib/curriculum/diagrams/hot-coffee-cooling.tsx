// SCRIBE — Diagram 5: Hot Coffee Cooling (Entropy / Second Law).
// Three panels: hot coffee in cool room → thermal energy flowing outward
// → uniform temperature equilibrium. Entropy-vs-time curve below.
// L1 = panels alone with before/during/after labels.
// L2 = adds Carnot formula η = 1 - T_C/T_H as a side inset.
// L3 = adds Boltzmann S = k_B ln Ω and a brief statistical interpretation.

import type { LayerKey } from '@/lib/types/curriculum';

interface Props {
  layer: LayerKey;
}

interface PanelProps {
  x: number;
  y: number;
  title: string;
  coffeeFill: string;
  arrowHeat: boolean;
  uniformGlow: boolean;
}

function Panel({ x, y, title, coffeeFill, arrowHeat, uniformGlow }: PanelProps) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width="180" height="160" rx="6" fill={uniformGlow ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)'} stroke="rgba(241,241,243,0.20)" strokeWidth="1" />
      {/* Cup */}
      <path d="M 60 60 L 60 118 Q 60 130 72 130 L 108 130 Q 120 130 120 118 L 120 60 Z" fill={coffeeFill} stroke="#3B82F6" strokeWidth="1.2" />
      <ellipse cx="90" cy="60" rx="30" ry="6" fill={coffeeFill} stroke="#3B82F6" strokeWidth="1.2" />
      {/* Handle */}
      <path d="M 120 75 Q 138 80 138 95 Q 138 112 120 116" fill="none" stroke="#3B82F6" strokeWidth="1.2" />
      {/* Steam / heat arrows */}
      {arrowHeat && (
        <>
          <path d="M 80 50 Q 76 38 84 28" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
          <path d="M 92 50 Q 96 36 88 24" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
          <path d="M 104 50 Q 108 38 100 26" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
          <text x="158" y="30" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="9" fill="#F59E0B" letterSpacing="0.10em">Q →</text>
        </>
      )}
      <text x="90" y="150" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="10" letterSpacing="0.12em" fill="rgba(241,241,243,0.85)" style={{ textTransform: 'uppercase' }}>
        {title}
      </text>
    </g>
  );
}

export function HotCoffeeCooling({ layer }: Props) {
  const showL2 = layer === 'L2' || layer === 'L3';
  const showL3 = layer === 'L3';

  return (
    <svg viewBox="0 0 720 480" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <style>{`
        .lbl { font-family: 'Geist Mono', monospace; font-size: 10px; fill: rgba(241,241,243,0.45); letter-spacing: 0.12em; text-transform: uppercase; }
        .head { font-family: 'Geist Mono', monospace; font-size: 13px; fill: #F1F1F3; font-weight: 600; letter-spacing: 0.10em; text-transform: uppercase; }
        .formula { font-family: 'Geist Mono', monospace; font-size: 13px; fill: #F59E0B; letter-spacing: 0.04em; }
      `}</style>

      <text x="360" y="28" textAnchor="middle" className="head">Hot Coffee · Why Energy Disperses</text>

      <Panel x={40}  y={64} title="BEFORE"  coffeeFill="#7c2d12" arrowHeat={false} uniformGlow={false} />
      <Panel x={270} y={64} title="DURING"  coffeeFill="#dc7d3d" arrowHeat={true}  uniformGlow={false} />
      <Panel x={500} y={64} title="AFTER"   coffeeFill="#8a8a8a" arrowHeat={false} uniformGlow={true} />

      {/* Entropy-vs-time curve */}
      <g transform="translate(80,260)">
        <line x1="0" y1="120" x2="560" y2="120" stroke="rgba(241,241,243,0.30)" strokeWidth="1" />
        <line x1="0" y1="0"   x2="0"   y2="120" stroke="rgba(241,241,243,0.30)" strokeWidth="1" />
        <text x="-26" y="0" className="lbl">S</text>
        <text x="560" y="135" className="lbl">t</text>
        <path d="M 0 110 Q 140 100 280 60 T 560 14" stroke="#3B82F6" strokeWidth="2" fill="none" />
        <text x="280" y="160" textAnchor="middle" className="lbl">Total entropy of universe ↑ over time</text>
      </g>

      {showL2 && (
        <g transform="translate(80,440)">
          <rect x="0" y="-32" width="240" height="32" rx="4" fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.30)" strokeWidth="1" />
          <text x="14" y="-12" className="formula">η_Carnot = 1 − T_C / T_H</text>
        </g>
      )}

      {showL3 && (
        <g transform="translate(420,440)">
          <rect x="0" y="-32" width="220" height="32" rx="4" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.30)" strokeWidth="1" />
          <text x="14" y="-12" className="formula" fill="#3B82F6">S = k_B ln Ω</text>
        </g>
      )}

      <text x="360" y="466" textAnchor="middle" className="lbl">
        {showL3
          ? 'Entropy counts microstates. Dispersion is overwhelmingly probable, not forced.'
          : showL2
          ? 'The Carnot limit makes the Second Law commercial.'
          : 'Energy spontaneously spreads out. Never the reverse.'}
      </text>
    </svg>
  );
}

export default HotCoffeeCooling;

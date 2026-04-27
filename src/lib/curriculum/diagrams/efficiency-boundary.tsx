// SCRIBE — Diagram 6: Efficiency Boundary Diagram (EV vs Gas Car).
// Two parallel chains side by side.
// Top: gasoline (well → refinery → distribution → tank → engine → wheels).
// Bottom: electric (power plant → transmission → charger → battery → motor → wheels).
// L1 = chains and per-step First Law efficiencies.
// L2 = adds boundary boxes (tank-to-wheel, well-to-wheel) around regions.
// L3 = adds Second Law / exergy destruction quantification at each step.

import type { LayerKey } from '@/lib/types/curriculum';

interface Props {
  layer: LayerKey;
}

interface ChainStage {
  label: string;
  eff: number; // First-law step efficiency (0..1)
  exergy?: number;
}

const GAS_CHAIN: ChainStage[] = [
  { label: 'WELL',         eff: 1.0,  exergy: 100 },
  { label: 'REFINERY',     eff: 0.85, exergy: 78  },
  { label: 'DISTRIBUTION', eff: 0.99, exergy: 76  },
  { label: 'TANK',         eff: 1.0,  exergy: 76  },
  { label: 'ENGINE',       eff: 0.30, exergy: 23  },
  { label: 'WHEELS',       eff: 0.85, exergy: 19  },
];

const EV_CHAIN: ChainStage[] = [
  { label: 'POWER PLANT', eff: 0.60, exergy: 60 },
  { label: 'TRANSMISSION', eff: 0.95, exergy: 57 },
  { label: 'CHARGER',     eff: 0.92, exergy: 52 },
  { label: 'BATTERY',     eff: 0.95, exergy: 49 },
  { label: 'MOTOR',       eff: 0.90, exergy: 44 },
  { label: 'WHEELS',      eff: 0.95, exergy: 42 },
];

const W = 920;
const BOX_W = 110;
const BOX_H = 46;

function rowX(i: number, gap: number) {
  return 40 + i * (BOX_W + gap);
}

interface RowProps {
  y: number;
  title: string;
  subtitle: string;
  chain: ChainStage[];
  showL2: boolean;
  showL3: boolean;
  highlightBoundary?: { fromIdx: number; toIdx: number; label: string }[];
}

function ChainRow({ y, title, subtitle, chain, showL2, showL3, highlightBoundary }: RowProps) {
  const gap = (W - 80 - BOX_W * chain.length) / (chain.length - 1);
  return (
    <g>
      <text x="40" y={y - 22} fontFamily="Geist Mono, monospace" fontSize="11" fontWeight="600" letterSpacing="0.10em" fill="#F1F1F3" style={{ textTransform: 'uppercase' }}>
        {title}
      </text>
      <text x="40" y={y - 8} fontFamily="Geist Mono, monospace" fontSize="9" letterSpacing="0.08em" fill="rgba(241,241,243,0.45)" style={{ textTransform: 'uppercase' }}>
        {subtitle}
      </text>

      {showL2 && highlightBoundary?.map((b, i) => {
        const x1 = rowX(b.fromIdx, gap) - 6;
        const x2 = rowX(b.toIdx, gap) + BOX_W + 6;
        return (
          <g key={`bnd-${i}`}>
            <rect x={x1} y={y - 4} width={x2 - x1} height={BOX_H + 8} rx="4" fill="none" stroke="rgba(245,158,11,0.55)" strokeWidth="1" strokeDasharray="3 3" />
            <text x={(x1 + x2) / 2} y={y + BOX_H + 18} textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="8" letterSpacing="0.10em" fill="#F59E0B" style={{ textTransform: 'uppercase' }}>
              {b.label}
            </text>
          </g>
        );
      })}

      {chain.map((s, i) => {
        const x = rowX(i, gap);
        return (
          <g key={`stage-${i}`}>
            <rect x={x} y={y} width={BOX_W} height={BOX_H} rx="4" fill="rgba(59,130,246,0.10)" stroke="#3B82F6" strokeWidth="1" />
            <text x={x + BOX_W / 2} y={y + BOX_H / 2 + 4} textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="9" letterSpacing="0.08em" fill="rgba(241,241,243,0.85)" style={{ textTransform: 'uppercase' }}>
              {s.label}
            </text>
            {i > 0 && (
              <text x={x + BOX_W / 2} y={y + BOX_H + 36} textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="9" letterSpacing="0.04em" fill="rgba(241,241,243,0.75)">
                η = {(s.eff * 100).toFixed(0)}%
              </text>
            )}
            {showL3 && s.exergy !== undefined && (
              <text x={x + BOX_W / 2} y={y + BOX_H + 50} textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="9" letterSpacing="0.04em" fill="#F59E0B">
                exergy {s.exergy}%
              </text>
            )}
            {i < chain.length - 1 && (
              <line x1={x + BOX_W + 2} y1={y + BOX_H / 2} x2={x + BOX_W + gap - 2} y2={y + BOX_H / 2} stroke="rgba(59,130,246,0.55)" strokeWidth="1.5" />
            )}
          </g>
        );
      })}
    </g>
  );
}

export function EfficiencyBoundary({ layer }: Props) {
  const showL2 = layer === 'L2' || layer === 'L3';
  const showL3 = layer === 'L3';

  return (
    <svg viewBox={`0 0 ${W} 460`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <text x={W / 2} y="28" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="13" fontWeight="600" letterSpacing="0.10em" fill="#F1F1F3" style={{ textTransform: 'uppercase' }}>
        Efficiency Depends on the System Boundary
      </text>

      <ChainRow
        y={120}
        title="Gasoline Pathway"
        subtitle="well-to-wheel ≈ 17–21%"
        chain={GAS_CHAIN}
        showL2={showL2}
        showL3={showL3}
        highlightBoundary={showL2 ? [
          { fromIdx: 3, toIdx: 5, label: 'Tank-to-Wheel ≈ 25–30%' },
          { fromIdx: 0, toIdx: 5, label: 'Well-to-Wheel ≈ 17–21%' },
        ] : []}
      />

      <ChainRow
        y={300}
        title="Electric Pathway · CCGT-charged"
        subtitle="well-to-wheel ≈ 33–45% depending on grid mix"
        chain={EV_CHAIN}
        showL2={showL2}
        showL3={showL3}
        highlightBoundary={showL2 ? [
          { fromIdx: 3, toIdx: 5, label: 'Battery-to-Wheel ≈ 80–85%' },
          { fromIdx: 0, toIdx: 5, label: 'Well-to-Wheel ≈ 45%' },
        ] : []}
      />

      <text x={W / 2} y="445" textAnchor="middle" fontFamily="Geist Mono, monospace" fontSize="10" letterSpacing="0.12em" fill="rgba(241,241,243,0.45)" style={{ textTransform: 'uppercase' }}>
        {showL3 ? 'Efficiency is a ratio of useful exergy out to total exergy in across a chosen boundary.' : 'Same technology, different boundaries, different efficiency answers.'}
      </text>
    </svg>
  );
}

export default EfficiencyBoundary;

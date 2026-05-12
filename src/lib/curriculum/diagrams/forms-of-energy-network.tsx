// SCRIBE — Diagram 3: Forms of Energy + Transformation Map.
// Central "Energy" node, spokes to seven form-nodes. Edges between forms
// labelled with named transformations.
// L1 = simplified to four forms (kinetic, thermal, chemical, electrical).
// L2 = all seven forms with transformation labels.
// L3 = adds typical efficiency limits to each transformation edge.

import type { LayerKey } from '@/lib/types/curriculum';

interface Props {
  layer: LayerKey;
}

const FORMS_L1 = [
  { id: 'kinetic',    label: 'KINETIC',    angle: 0   },
  { id: 'thermal',    label: 'THERMAL',    angle: 90  },
  { id: 'chemical',   label: 'CHEMICAL',   angle: 180 },
  { id: 'electrical', label: 'ELECTRICAL', angle: 270 },
];

const FORMS_FULL = [
  { id: 'kinetic',    label: 'KINETIC',    angle: 0    },
  { id: 'potential',  label: 'POTENTIAL',  angle: 51   },
  { id: 'thermal',    label: 'THERMAL',    angle: 102  },
  { id: 'chemical',   label: 'CHEMICAL',   angle: 154  },
  { id: 'electrical', label: 'ELECTRICAL', angle: 205  },
  { id: 'em',         label: 'EM RADIATION', angle: 256 },
  { id: 'nuclear',    label: 'NUCLEAR',    angle: 308  },
];

interface Edge {
  from: string;
  to: string;
  label: string;
  eff: string;
}

const EDGES: Edge[] = [
  { from: 'chemical',   to: 'thermal',    label: 'COMBUSTION',     eff: '95–99%' },
  { from: 'thermal',    to: 'kinetic',    label: 'HEAT ENGINE',    eff: '< CARNOT' },
  { from: 'kinetic',    to: 'electrical', label: 'GENERATOR',      eff: '98–99%' },
  { from: 'electrical', to: 'kinetic',    label: 'MOTOR',          eff: '90–96%' },
  { from: 'em',         to: 'electrical', label: 'PHOTOVOLTAIC',   eff: '< 33% (S-Q)' },
  { from: 'electrical', to: 'chemical',   label: 'ELECTROLYSIS',   eff: '60–80%' },
  { from: 'nuclear',    to: 'thermal',    label: 'FISSION',        eff: '~99%' },
];

const RADIUS = 150;
const NODE_R = 38;

function polar(angleDeg: number, r = RADIUS) {
  const t = (angleDeg * Math.PI) / 180;
  return { x: 280 + r * Math.cos(t), y: 220 + r * Math.sin(t) };
}

export function FormsOfEnergyNetwork({ layer }: Props) {
  const showL2 = layer === 'L2' || layer === 'L3';
  const showL3 = layer === 'L3';
  const forms = showL2 ? FORMS_FULL : FORMS_L1;
  const positions = new Map(forms.map((f) => [f.id, polar(f.angle)]));

  return (
    <svg viewBox="0 0 720 460" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <style>{`
        .lbl { font-family: 'Geist Mono', monospace; font-size: 9px; fill: rgba(241,241,243,0.85); letter-spacing: 0.08em; }
        .lbl-mute { font-family: 'Geist Mono', monospace; font-size: 9px; fill: rgba(241,241,243,0.45); letter-spacing: 0.10em; }
        .head { font-family: 'Geist Mono', monospace; font-size: 13px; fill: #F1F1F3; font-weight: 600; letter-spacing: 0.10em; }
        .core { font-family: 'Geist Mono', monospace; font-size: 11px; fill: #F59E0B; letter-spacing: 0.10em; font-weight: 600; }
        .edge { font-family: 'Geist Mono', monospace; font-size: 8px; fill: rgba(241,241,243,0.55); letter-spacing: 0.04em; }
        .eff { font-family: 'Geist Mono', monospace; font-size: 8px; fill: #F59E0B; letter-spacing: 0.02em; }
      `}</style>

      <text x="360" y="28" textAnchor="middle" className="head" style={{ textTransform: 'uppercase' }}>
        The Forms of Energy
      </text>

      {/* Spokes from centre to each form */}
      {forms.map((f) => {
        const p = positions.get(f.id)!;
        return (
          <line
            key={`spoke-${f.id}`}
            x1="280" y1="220"
            x2={p.x} y2={p.y}
            stroke="rgba(59,130,246,0.30)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
        );
      })}

      {/* Edges between forms (transformations) — only when forms exist on both ends */}
      {showL2 && EDGES.filter((e) => positions.has(e.from) && positions.has(e.to)).map((e, i) => {
        const a = positions.get(e.from)!;
        const b = positions.get(e.to)!;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        return (
          <g key={`edge-${i}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(245,158,11,0.55)" strokeWidth="1" />
            <text x={mx} y={my - 4} textAnchor="middle" className="edge" style={{ textTransform: 'uppercase' }}>
              {e.label}
            </text>
            {showL3 && (
              <text x={mx} y={my + 8} textAnchor="middle" className="eff">
                {e.eff}
              </text>
            )}
          </g>
        );
      })}

      {/* Centre Energy node */}
      <circle cx="280" cy="220" r="48" fill="rgba(245,158,11,0.10)" stroke="#F59E0B" strokeWidth="1.5" />
      <text x="280" y="216" textAnchor="middle" className="core" style={{ textTransform: 'uppercase' }}>
        ENERGY
      </text>
      <text x="280" y="232" textAnchor="middle" className="lbl-mute" style={{ textTransform: 'uppercase' }}>
        Conserved
      </text>

      {/* Form nodes */}
      {forms.map((f) => {
        const p = positions.get(f.id)!;
        return (
          <g key={f.id}>
            <circle cx={p.x} cy={p.y} r={NODE_R} fill="rgba(59,130,246,0.10)" stroke="#3B82F6" strokeWidth="1.5" />
            <text x={p.x} y={p.y + 3} textAnchor="middle" className="lbl" style={{ textTransform: 'uppercase' }}>
              {f.label}
            </text>
          </g>
        );
      })}

      <text x="600" y="450" textAnchor="end" className="lbl-mute" style={{ textTransform: 'uppercase' }}>
        {showL3 ? '7 forms · transformations annotated with efficiency limits' : showL2 ? '7 forms · named transformations' : '4 forms · simplified view'}
      </text>
    </svg>
  );
}

export default FormsOfEnergyNetwork;

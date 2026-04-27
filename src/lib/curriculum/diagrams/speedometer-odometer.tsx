// SCRIBE — Diagram 2: Speedometer-Odometer (Power vs Energy).
// Two car dashboards side by side: speedometer (instantaneous power) and
// odometer (accumulated energy). Below: power-vs-time curve, energy = area
// under the curve.
// L1 = two dashboards alone with simple "POWER" / "ENERGY" labels.
// L2 = adds the integral notation E = ∫P dt and labels the area under curve.
// L3 = adds a stylised PJM dispatch curve (variable load shape) with
//      annotated peak / off-peak hours.

import type { LayerKey } from '@/lib/types/curriculum';

interface Props {
  layer: LayerKey;
}

export function SpeedometerOdometer({ layer }: Props) {
  const showL2 = layer === 'L2' || layer === 'L3';
  const showL3 = layer === 'L3';

  return (
    <svg viewBox="0 0 800 420" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
      <style>{`
        .lbl { font-family: 'Geist Mono', monospace; font-size: 11px; fill: rgba(241,241,243,0.45); letter-spacing: 0.15em; text-transform: uppercase; }
        .head { font-family: 'Geist Mono', monospace; font-size: 13px; fill: #F1F1F3; font-weight: 600; letter-spacing: 0.10em; text-transform: uppercase; }
        .gold { fill: #F59E0B; font-family: 'Geist Mono', monospace; font-size: 11px; letter-spacing: 0.06em; }
        .formula { font-family: 'Geist Mono', monospace; font-size: 14px; fill: #F59E0B; letter-spacing: 0.02em; }
      `}</style>

      <text x="400" y="30" textAnchor="middle" className="head">Power vs Energy · Speedometer vs Odometer</text>

      {/* Speedometer — left */}
      <g transform="translate(180,150)">
        <circle cx="0" cy="0" r="80" fill="rgba(59,130,246,0.08)" stroke="#3B82F6" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="6" fill="#F59E0B" />
        <line x1="0" y1="0" x2="50" y2="-50" stroke="#F59E0B" strokeWidth="2" />
        {[
          [-70, 0],
          [-50, -50],
          [0, -70],
          [50, -50],
          [70, 0],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill="rgba(241,241,243,0.45)" />
        ))}
        <text x="0" y="55" textAnchor="middle" className="lbl">SPEEDOMETER</text>
        <text x="0" y="-100" textAnchor="middle" className="head">POWER</text>
        <text x="0" y="-118" textAnchor="middle" className="lbl">RATE · MW</text>
      </g>

      {/* Odometer — right */}
      <g transform="translate(620,150)">
        <rect x="-90" y="-40" width="180" height="80" rx="4" fill="rgba(59,130,246,0.08)" stroke="#3B82F6" strokeWidth="1.5" />
        <text x="0" y="-12" textAnchor="middle" className="head" style={{ fontSize: 18, letterSpacing: '0.15em' }}>
          245,318
        </text>
        <text x="0" y="14" textAnchor="middle" className="lbl">MWh ACCUMULATED</text>
        <text x="0" y="55" textAnchor="middle" className="lbl">ODOMETER</text>
        <text x="0" y="-60" textAnchor="middle" className="head">ENERGY</text>
        <text x="0" y="-78" textAnchor="middle" className="lbl">TOTAL · MWh</text>
      </g>

      {/* Power-vs-time curve at the bottom */}
      <g transform="translate(80,260)">
        <line x1="0" y1="120" x2="640" y2="120" stroke="rgba(241,241,243,0.25)" strokeWidth="1" />
        <line x1="0" y1="0"   x2="0"   y2="120" stroke="rgba(241,241,243,0.25)" strokeWidth="1" />
        <text x="-30" y="8" className="lbl">P</text>
        <text x="640" y="135" className="lbl">t</text>

        {showL3 ? (
          <path
            d="M 0 90 L 40 88 L 80 78 L 120 60 L 160 45 L 200 35 L 240 28 L 280 28 L 320 35 L 360 50 L 400 32 L 440 22 L 480 28 L 520 50 L 560 75 L 600 90 L 640 95"
            stroke="#3B82F6"
            strokeWidth="2"
            fill="rgba(59,130,246,0.12)"
            fillOpacity="1"
          />
        ) : (
          <path
            d="M 0 100 L 80 80 L 160 50 L 280 30 L 380 35 L 480 55 L 580 80 L 640 95"
            stroke="#3B82F6"
            strokeWidth="2"
            fill="rgba(59,130,246,0.12)"
          />
        )}

        {showL2 && (
          <text x="320" y="80" textAnchor="middle" className="formula">
            E = ∫ P(t) dt
          </text>
        )}
        {showL2 && (
          <text x="320" y="110" textAnchor="middle" className="lbl">
            energy = area under power curve
          </text>
        )}
        {showL3 && (
          <>
            <text x="240" y="22" textAnchor="middle" className="gold">PJM PEAK · 17:00</text>
            <text x="440" y="14" textAnchor="middle" className="gold">EVENING RAMP</text>
          </>
        )}
      </g>

      <text x="400" y="410" textAnchor="middle" className="lbl">
        {showL3
          ? 'Real PJM dispatch · variable load shape over 24 hours.'
          : showL2
          ? 'Power tells you the rate. Energy is the integral.'
          : 'Power and energy answer different questions.'}
      </text>
    </svg>
  );
}

export default SpeedometerOdometer;

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const ZONE_LMP_DETAIL: Record<string, {
  price: number
  energy: number
  congestion: number
  loss: number
  delta: number
  avg24h: number
  avgCongestion24h: number
  peak: { hour: string; price: number }
  cheapest: { hour: string; price: number }
}> = {
  'WEST_HUB': { price: 35.90, energy: 32.10, congestion: 2.40,  loss: 1.40,  delta: +1.2, avg24h: 33.8, avgCongestion24h: 1.8,  peak: { hour: '7AM', price: 48.2 },  cheapest: { hour: '3AM', price: 28.1 } },
  'COMED':    { price: 32.04, energy: 31.20, congestion: -0.30, loss: 1.14,  delta: -0.8, avg24h: 31.2, avgCongestion24h: -0.2, peak: { hour: '8AM', price: 41.5 },  cheapest: { hour: '4AM', price: 26.8 } },
  'AEP':      { price: 33.36, energy: 31.80, congestion: 0.42,  loss: 1.14,  delta: +0.4, avg24h: 32.1, avgCongestion24h: 0.3,  peak: { hour: '7AM', price: 44.2 },  cheapest: { hour: '3AM', price: 27.4 } },
  'PSEG':     { price: 34.93, energy: 32.10, congestion: 1.58,  loss: 1.25,  delta: +2.1, avg24h: 33.4, avgCongestion24h: 2.1,  peak: { hour: '6AM', price: 52.8 },  cheapest: { hour: '2AM', price: 28.9 } },
  'RECO':     { price: 36.60, energy: 32.10, congestion: 3.10,  loss: 1.40,  delta: +3.8, avg24h: 34.9, avgCongestion24h: 3.4,  peak: { hour: '6AM', price: 58.4 },  cheapest: { hour: '2AM', price: 29.2 } },
  'DOMINION': { price: 34.23, energy: 32.10, congestion: 0.88,  loss: 1.25,  delta: +0.9, avg24h: 32.8, avgCongestion24h: 0.7,  peak: { hour: '7AM', price: 46.1 },  cheapest: { hour: '3AM', price: 27.8 } },
  'BGE':      { price: 34.50, energy: 32.10, congestion: 1.15,  loss: 1.25,  delta: +1.4, avg24h: 33.1, avgCongestion24h: 1.0,  peak: { hour: '7AM', price: 47.3 },  cheapest: { hour: '3AM', price: 28.2 } },
  'PPL':      { price: 33.11, energy: 32.10, congestion: -0.18, loss: 1.19,  delta: -0.2, avg24h: 32.4, avgCongestion24h: -0.1, peak: { hour: '8AM', price: 43.1 },  cheapest: { hour: '4AM', price: 27.1 } },
  'PECO':     { price: 34.10, energy: 32.10, congestion: 0.75,  loss: 1.25,  delta: +1.1, avg24h: 32.9, avgCongestion24h: 0.6,  peak: { hour: '7AM', price: 45.8 },  cheapest: { hour: '3AM', price: 28.0 } },
  'DEFAULT':  { price: 33.50, energy: 32.10, congestion: 0.20,  loss: 1.20,  delta: +0.3, avg24h: 32.2, avgCongestion24h: 0.5,  peak: { hour: '7AM', price: 44.0 },  cheapest: { hour: '3AM', price: 27.5 } },
}

const ZONE_SPARKLINE: Record<string, number[]> = {
  'WEST_HUB': [0.4, 0.5, 0.8, 1.0, 0.7, 0.6],
  'COMED':    [0.3, 0.4, 0.7, 0.9, 0.6, 0.5],
  'PSEG':     [0.5, 0.6, 0.9, 1.0, 0.8, 0.7],
  'RECO':     [0.6, 0.7, 1.0, 1.0, 0.9, 0.8],
  'DEFAULT':  [0.4, 0.5, 0.7, 0.9, 0.6, 0.5],
}

const ZONE_24H_PRICES: Record<string, number[]> = {
  'WEST_HUB': [28.1,27.4,27.8,28.2,31.5,48.2,45.1,38.4,36.2,35.1,34.8,34.2,33.9,33.5,34.1,35.2,36.8,38.4,37.2,36.1,35.4,34.8,34.2,33.6],
  'PSEG':     [28.9,28.2,28.6,29.1,33.2,52.8,49.4,41.2,38.8,37.4,36.9,36.1,35.7,35.2,36.1,37.4,39.2,41.8,40.1,38.6,37.4,36.8,35.9,35.1],
  'RECO':     [29.2,28.8,29.1,29.6,34.8,58.4,54.2,44.8,41.2,39.8,38.9,38.0,37.4,36.9,37.8,39.2,41.8,44.9,42.8,40.9,39.4,38.6,37.4,36.4],
  'COMED':    [26.8,26.2,26.5,26.9,29.8,41.5,38.9,33.4,31.8,30.9,30.4,29.8,29.5,29.1,29.8,30.9,32.4,34.8,33.2,31.9,31.1,30.5,29.9,29.4],
  'DEFAULT':  [27.5,26.9,27.2,27.6,31.0,44.0,41.2,35.8,33.9,32.8,32.2,31.6,31.2,30.8,31.5,32.6,34.2,36.9,35.4,33.8,32.9,32.2,31.6,31.0],
}

const ZONE_CONSTRAINTS: Record<string, Array<{name: string; impact: number}>> = {
  'PSEG':     [{ name: 'Artificial Island Interface', impact: 1.42 }, { name: 'PJM-EAST Import Limit', impact: 0.82 }, { name: 'Bergen-Linden Corridor', impact: -0.34 }],
  'RECO':     [{ name: 'NY-NJ Interface', impact: 2.18 }, { name: 'Ramapo-Waldwick Line', impact: 0.91 }, { name: 'Bergen-Linden Corridor', impact: 0.12 }],
  'BGE':      [{ name: 'Potomac River Crossing', impact: 0.88 }, { name: 'Baltimore-Backbone', impact: 0.34 }, { name: 'PJM-DOM Interface', impact: -0.07 }],
  'DOMINION': [{ name: 'Meadow Brook-Loudoun', impact: 0.72 }, { name: 'Northern VA Load Pocket', impact: 0.31 }, { name: 'PJM-DOM South', impact: -0.15 }],
  'DEFAULT':  [{ name: 'System-Wide Congestion', impact: 0.24 }, { name: 'No binding constraints', impact: 0.00 }, { name: 'Normal operations', impact: 0.00 }],
}

const ZONE_GEN_MIX: Record<string, Array<{fuel: string; pct: number; color: string}>> = {
  'PSEG':     [{ fuel: 'Nuclear', pct: 48, color: '#9B59B6' }, { fuel: 'Gas', pct: 38, color: '#E67E22' }, { fuel: 'Solar', pct: 9, color: '#F1C40F' }, { fuel: 'Other', pct: 5, color: '#555' }],
  'COMED':    [{ fuel: 'Nuclear', pct: 62, color: '#9B59B6' }, { fuel: 'Gas', pct: 18, color: '#E67E22' }, { fuel: 'Wind', pct: 14, color: '#00A3FF' }, { fuel: 'Other', pct: 6, color: '#555' }],
  'AEP':      [{ fuel: 'Coal', pct: 38, color: '#7F8C8D' }, { fuel: 'Gas', pct: 31, color: '#E67E22' }, { fuel: 'Wind', pct: 22, color: '#00A3FF' }, { fuel: 'Other', pct: 9, color: '#555' }],
  'DOMINION': [{ fuel: 'Nuclear', pct: 34, color: '#9B59B6' }, { fuel: 'Gas', pct: 42, color: '#E67E22' }, { fuel: 'Solar', pct: 14, color: '#F1C40F' }, { fuel: 'Other', pct: 10, color: '#555' }],
  'DEFAULT':  [{ fuel: 'Gas', pct: 42, color: '#E67E22' }, { fuel: 'Nuclear', pct: 28, color: '#9B59B6' }, { fuel: 'Wind', pct: 18, color: '#00A3FF' }, { fuel: 'Other', pct: 12, color: '#555' }],
}

const ZONE_FORECAST: Record<string, Array<{hour: string; price: number}>> = {
  'PSEG':    [{ hour: '+1H', price: 35.8 }, { hour: '+2H', price: 36.4 }, { hour: '+3H', price: 37.1 }, { hour: '+4H', price: 36.8 }],
  'RECO':    [{ hour: '+1H', price: 37.2 }, { hour: '+2H', price: 38.1 }, { hour: '+3H', price: 39.4 }, { hour: '+4H', price: 38.6 }],
  'COMED':   [{ hour: '+1H', price: 31.8 }, { hour: '+2H', price: 32.1 }, { hour: '+3H', price: 31.6 }, { hour: '+4H', price: 31.2 }],
  'DEFAULT': [{ hour: '+1H', price: 33.8 }, { hour: '+2H', price: 34.2 }, { hour: '+3H', price: 34.8 }, { hour: '+4H', price: 34.1 }],
}

/* ─── HELPERS ─────────────────────────────────────────────────── */

/* FIX 10 — Peak at 45% from top (y=45), trough at 82% (y=82) */
function sparklinePoints(values: number[]): string {
  const w = 100 / (values.length - 1)
  return values.map((v, i) => `${i * w},${82 - v * 37}`).join(' ')
}

/* ─── CHART CONSTANTS ─────────────────────────────────────────── */

const CHART_HEIGHT = 240
const CHART_WIDTH = 1000
const PRICE_MIN = 24
const PRICE_MAX = 62

function priceToY(price: number): number {
  return CHART_HEIGHT - 20 - ((price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * (CHART_HEIGHT - 40)
}

function indexToX(i: number): number {
  return (i / 23) * CHART_WIDTH
}

/* ─── SUB-COMPONENTS ──────────────────────────────────────────── */

function LMPExpandedSystem() {
  const hubData = ZONE_LMP_DETAIL['WEST_HUB']
  const hubPrices = ZONE_24H_PRICES['WEST_HUB']

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflow: 'auto' }}>
      {/* West Hub dominant price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '72px', fontWeight: 'bold', color: '#FFFFFF', lineHeight: 1 }}>
          {hubData.price.toFixed(2)}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>$/MWh</span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: hubData.delta >= 0 ? '#FFB800' : '#00A3FF' }}>
            {hubData.delta >= 0 ? '▲' : '▼'} {Math.abs(hubData.delta).toFixed(2)} vs −1H
          </span>
        </div>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginLeft: '8px' }}>
          WEST HUB · SYSTEM REFERENCE
        </span>
      </div>

      {/* 24h trend chart */}
      <div style={{ flexShrink: 0, height: '200px', minHeight: '200px', position: 'relative' }}>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em' }}>
          24H LMP TREND — WEST HUB
        </span>
        <svg width="100%" height={200} viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ marginTop: '8px' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <line key={i} x1="0" y1={t * 180 + 10} x2="1000" y2={t * 180 + 10}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          <polyline
            points={hubPrices.map((p, i) => {
              const x = (i / 23) * 1000
              const y = 190 - ((p - 25) / 35) * 180
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#00D4FF"
            strokeWidth="2"
          />
          <polygon
            points={`0,190 ${hubPrices.map((p, i) => {
              const x = (i / 23) * 1000
              const y = 190 - ((p - 25) / 35) * 180
              return `${x},${y}`
            }).join(' ')} 1000,190`}
            fill="rgba(0,212,255,0.05)"
          />
        </svg>
      </div>

      {/* Market Drivers row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Weather */}
        <div style={{ flex: 1, padding: '16px', border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', marginBottom: '8px' }}>WEATHER</div>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '28px', color: '#FFFFFF', fontWeight: 'bold' }}>41°F</div>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>Cloudy · Normal demand</div>
        </div>
        {/* Load vs Forecast */}
        <div style={{ flex: 1, padding: '16px', border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', marginBottom: '8px' }}>LOAD VS FORECAST</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '28px', color: '#FFFFFF', fontWeight: 'bold' }}>128.4</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>GW</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', color: '#FF4444' }}>▼ 2.1 GW vs forecast</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', marginTop: '8px' }}>
            <div style={{ height: '100%', width: '92%', background: '#00D4FF' }} />
          </div>
        </div>
        {/* Zone extremes */}
        <div style={{ flex: 2, padding: '16px', border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', marginBottom: '12px' }}>ZONE EXTREMES</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { label: 'HIGHEST', zone: 'RECO',  price: 36.60, color: '#FF4444' },
              { label: 'LOWEST',  zone: 'COMED', price: 32.04, color: '#00D4FF' },
              { label: 'MOST CONGESTED', zone: 'PSEG', price: 1.58, color: '#FFB800' },
            ].map(({ label, zone, price, color }) => (
              <div key={label}>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.2)', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '18px', color, fontWeight: 'bold' }}>{price.toFixed(2)}</div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{zone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LMPExpandedZone({ zone }: { zone: string }) {
  const data = ZONE_LMP_DETAIL[zone] ?? ZONE_LMP_DETAIL['DEFAULT']
  const prices = ZONE_24H_PRICES[zone] ?? ZONE_24H_PRICES['DEFAULT']
  const hubPrices = ZONE_24H_PRICES['WEST_HUB']
  const constraints = ZONE_CONSTRAINTS[zone] ?? ZONE_CONSTRAINTS['DEFAULT']
  const genMix = ZONE_GEN_MIX[zone] ?? ZONE_GEN_MIX['DEFAULT']
  const forecast = ZONE_FORECAST[zone] ?? ZONE_FORECAST['DEFAULT']

  /* FIX 6 — absolute values for stacked bar */
  const energyAbs = Math.abs(data.energy)
  const congestionAbs = Math.abs(data.congestion)
  const lossAbs = Math.abs(data.loss)
  const total = energyAbs + congestionAbs + lossAbs

  /* FIX 1 — Interactive chart state */
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const chartRef = useRef<SVGSVGElement>(null)

  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    const index = Math.round(pct * 23)
    setHoverIndex(Math.min(23, Math.max(0, index)))
  }

  const handleChartMouseLeave = () => setHoverIndex(null)

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflow: 'auto' }}>

      {/* TOP SECTION — Zone header + component breakdown */}
      <div className="lmp-section-enter" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexShrink: 0 }}>
        {/* Price block */}
        <div>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', marginBottom: '4px' }}>
            {zone}
          </div>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '64px', fontWeight: 'bold', color: '#FFFFFF', lineHeight: 1 }}>
            {data.price.toFixed(2)}
          </div>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
            $/MWh
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '8px',
            padding: '3px 10px',
            background: data.delta >= 0 ? 'rgba(255,183,0,0.1)' : 'rgba(0,212,255,0.1)',
            border: `0.5px solid ${data.delta >= 0 ? 'rgba(255,183,0,0.3)' : 'rgba(0,212,255,0.3)'}`,
          }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: data.delta >= 0 ? '#FFB800' : '#00D4FF', fontWeight: 'bold' }}>
              {data.delta >= 0 ? '▲' : '▼'} {Math.abs(data.delta).toFixed(2)} vs −1H
            </span>
          </div>
        </div>

        {/* Component breakdown */}
        <div style={{ flex: 1, paddingTop: '8px' }}>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', marginBottom: '12px' }}>
            LMP COMPONENT BREAKDOWN
          </div>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '12px' }}>
            {[
              { label: 'ENERGY',     value: data.energy,     color: '#00D4FF' },
              { label: 'CONGESTION', value: data.congestion, color: data.congestion > 0.5 ? '#FFB800' : data.congestion < -0.1 ? '#FF4444' : '#00FFF0' },
              { label: 'LOSS',       value: data.loss,        color: 'rgba(255,120,120,0.8)' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                title={label === 'ENERGY' ? 'Marginal cost of energy at system reference' : label === 'CONGESTION' ? 'Transmission congestion rent — positive = import constraint' : 'Line loss adjustment'}
                style={{ cursor: 'help', transition: 'transform 0.1s ease' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.2)', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '22px', color, fontWeight: 'bold' }}>
                  {value >= 0 ? '+' : ''}{value.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          {/* FIX 6 — Proportional stacked bar — 8px, absolute values, overflow visible */}
          <div style={{ display: 'flex', height: '8px', width: '100%', overflow: 'visible' }}>
            <div className="lmp-bar-segment" style={{ display: 'block', height: '100%', width: `${(energyAbs / total) * 100}%`, background: '#00D4FF', borderRadius: 0 }} />
            <div className="lmp-bar-segment" style={{ display: 'block', height: '100%', width: `${(congestionAbs / total) * 100}%`, background: data.congestion > 0 ? '#FFB800' : '#FF4444', borderRadius: 0 }} />
            <div className="lmp-bar-segment" style={{ display: 'block', height: '100%', width: `${(lossAbs / total) * 100}%`, background: 'rgba(255,120,120,0.8)', borderRadius: 0 }} />
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
            {[
              { label: 'Energy', color: '#00D4FF' },
              { label: 'Congestion', color: '#FFB800' },
              { label: 'Loss', color: 'rgba(255,120,120,0.8)' },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', background: color }} />
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.25)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FIX 9 — METRICS STRIP — fixed 72px height */}
      <div className="lmp-section-enter" style={{
        height: '72px',
        flexShrink: 0,
        display: 'flex',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '0.5px solid rgba(255,255,255,0.05)',
        borderBottom: '0.5px solid rgba(255,255,255,0.05)',
      }}>
        {[
          {
            label: '24H AVERAGE',
            value: data.avg24h.toFixed(2),
            sub: '$/MWh',
            color: '#FFFFFF',
          },
          {
            label: '24H PEAK',
            value: data.peak.price.toFixed(2),
            sub: data.peak.hour,
            color: '#FF4444',
          },
          {
            label: '24H LOW',
            value: data.cheapest.price.toFixed(2),
            sub: data.cheapest.hour,
            color: '#00D4FF',
          },
          {
            label: 'AVG CONGESTION',
            value: (data.avgCongestion24h >= 0 ? '+' : '') + data.avgCongestion24h.toFixed(2),
            sub: '24H MEAN',
            color: data.avgCongestion24h > 0.3 ? '#FFB800' : '#00FFF0',
          },
        ].map(({ label, value, sub, color }, i, arr) => (
          <div
            key={label}
            className="lmp-metric-tile"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 20px',
              borderRight: i < arr.length - 1
                ? '0.5px solid rgba(255,255,255,0.06)'
                : 'none',
            }}
          >
            <div style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '8px',
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.15em',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}>
              {label}
            </div>
            <div style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '22px',
              fontWeight: 'bold',
              color,
              lineHeight: 1,
            }}>
              {value}
            </div>
            <div style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '9px',
              color: 'rgba(255,255,255,0.3)',
              marginTop: '3px',
            }}>
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── INTERACTIVE CHART WITH MOUSE TRACKING ── */}
      <div className="lmp-section-enter" style={{
        background: 'rgba(255,255,255,0.01)',
        padding: '16px 24px',
        minHeight: '240px',
        flex: '1 1 240px',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
      }}>
        {/* Chart header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em' }}>
            24H PRICE TREND — {zone} vs WEST HUB
          </span>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '20px', height: '2px', background: '#00D4FF' }} />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}>{zone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '20px', height: '0', borderTop: '1.5px dashed rgba(255,255,255,0.3)' }} />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}>WEST HUB</span>
            </div>
            {hoverIndex !== null && (
              <div style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '11px',
                color: '#00D4FF',
                fontWeight: 'bold',
                transition: 'color 0.1s',
              }}>
                {hoverIndex}:00 · ${prices[hoverIndex]?.toFixed(2)}/MWh
              </div>
            )}
          </div>
        </div>

        {/* SVG Chart */}
        <svg
          ref={chartRef}
          width="100%"
          height={CHART_HEIGHT}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          style={{ cursor: 'crosshair', display: 'block' }}
          onMouseMove={handleChartMouseMove}
          onMouseLeave={handleChartMouseLeave}
        >
          {/* Horizontal grid lines */}
          {[25, 30, 35, 40, 45, 50, 55, 60].map(price => {
            const y = priceToY(price)
            return (
              <g key={price}>
                <line x1="0" y1={y} x2={CHART_WIDTH} y2={y}
                  stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <text x="8" y={y - 4}
                  fontFamily="monospace" fontSize="12" fill="rgba(255,255,255,0.20)">
                  ${price}
                </text>
              </g>
            )
          })}

          {/* Hour labels on X axis */}
          {[0, 3, 6, 9, 12, 15, 18, 21, 23].map(i => (
            <text key={i}
              x={indexToX(i)}
              y={CHART_HEIGHT - 4}
              fontFamily="monospace"
              fontSize="11"
              fill="rgba(255,255,255,0.20)"
              textAnchor="middle"
            >
              {i}:00
            </text>
          ))}

          {/* 24h average line */}
          {(() => {
            const avgY = priceToY(data.avg24h)
            return (
              <line x1="0" y1={avgY} x2={CHART_WIDTH} y2={avgY}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
                strokeDasharray="4,4" />
            )
          })()}

          {/* Spread fill between zone and hub */}
          <polygon
            points={`${prices.map((p, i) => `${indexToX(i)},${priceToY(p)}`).join(' ')} ${hubPrices.slice().reverse().map((p, i) => `${indexToX(23 - i)},${priceToY(p)}`).join(' ')}`}
            fill={data.congestion > 0 ? 'rgba(255,183,0,0.07)' : 'rgba(0,212,255,0.05)'}
          />

          {/* West Hub reference line — dashed, faint */}
          <polyline
            points={hubPrices.map((p, i) => `${indexToX(i)},${priceToY(p)}`).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />

          {/* Zone area fill */}
          <polygon
            points={`${indexToX(0)},${CHART_HEIGHT} ${prices.map((p, i) => `${indexToX(i)},${priceToY(p)}`).join(' ')} ${indexToX(23)},${CHART_HEIGHT}`}
            fill="rgba(0,212,255,0.04)"
          />

          {/* Zone price line */}
          <polyline
            points={prices.map((p, i) => `${indexToX(i)},${priceToY(p)}`).join(' ')}
            fill="none"
            stroke="#00D4FF"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Peak marker */}
          {(() => {
            const peakIdx = prices.indexOf(Math.max(...prices))
            const x = indexToX(peakIdx)
            const y = priceToY(prices[peakIdx])
            return (
              <g>
                <circle cx={x} cy={y} r="5" fill="#FF4444" stroke="#0A0A0B" strokeWidth="2" />
                <text x={x + 10} y={y - 8} fontFamily="monospace" fontSize="12" fill="rgba(255,80,80,0.9)" fontWeight="bold">
                  {data.peak.hour} ${data.peak.price}
                </text>
              </g>
            )
          })()}

          {/* Cheapest marker */}
          {(() => {
            const lowIdx = prices.indexOf(Math.min(...prices))
            const x = indexToX(lowIdx)
            const y = priceToY(prices[lowIdx])
            return (
              <g>
                <circle cx={x} cy={y} r="5" fill="#00D4FF" stroke="#0A0A0B" strokeWidth="2" />
                <text x={x + 10} y={y + 16} fontFamily="monospace" fontSize="12" fill="rgba(0,212,255,0.9)" fontWeight="bold">
                  {data.cheapest.hour} ${data.cheapest.price}
                </text>
              </g>
            )
          })()}

          {/* HOVER LAYER — only when hovering */}
          {hoverIndex !== null && (() => {
            const x = indexToX(hoverIndex)
            const price = prices[hoverIndex]
            const y = priceToY(price)
            const hubPrice = hubPrices[hoverIndex]
            const hubY = priceToY(hubPrice)

            return (
              <g>
                {/* Vertical crosshair */}
                <line x1={x} y1="0" x2={x} y2={CHART_HEIGHT}
                  stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,3" />

                {/* Zone price dot — large, glowing */}
                <circle cx={x} cy={y} r="6" fill="#00D4FF" opacity="0.15" />
                <circle cx={x} cy={y} r="4" fill="#00D4FF" stroke="#0A0A0B" strokeWidth="2" />

                {/* Hub price dot — smaller */}
                <circle cx={x} cy={hubY} r="3" fill="rgba(255,255,255,0.4)" stroke="#0A0A0B" strokeWidth="1.5" />

                {/* Tooltip box — flip side if near right edge */}
                {(() => {
                  const tooltipX = hoverIndex > 18 ? x - 160 : x + 12
                  const tooltipY = Math.max(10, y - 48)
                  const spread = price - hubPrice

                  return (
                    <g>
                      <rect x={tooltipX} y={tooltipY} width="148" height="76" rx="0"
                        fill="#0A0A0B" stroke="rgba(0,212,255,0.25)" strokeWidth="0.5" />
                      {/* Hour */}
                      <text x={tooltipX + 10} y={tooltipY + 16}
                        fontFamily="monospace" fontSize="11" fill="rgba(255,255,255,0.4)" letterSpacing="2">
                        {hoverIndex}:00
                      </text>
                      {/* Zone price */}
                      <text x={tooltipX + 10} y={tooltipY + 36}
                        fontFamily="monospace" fontSize="16" fill="#FFFFFF" fontWeight="bold">
                        ${price.toFixed(2)}/MWh
                      </text>
                      {/* Hub spread */}
                      <text x={tooltipX + 10} y={tooltipY + 52}
                        fontFamily="monospace" fontSize="10"
                        fill={spread > 0 ? 'rgba(255,183,0,0.8)' : 'rgba(0,212,255,0.8)'}>
                        {spread >= 0 ? '+' : ''}{spread.toFixed(2)} vs Hub
                      </text>
                      {/* Zone indicator dot */}
                      <circle cx={tooltipX + 136} cy={tooltipY + 12} r="3"
                        fill="#00D4FF" />
                    </g>
                  )
                })()}
              </g>
            )
          })()}
        </svg>
      </div>

      {/* BOTTOM SECTION — Three panels, fixed 200px, never shrinks */}
      <div className="lmp-section-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', flexShrink: 0, height: '200px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>

        {/* Panel 1: Congestion Intelligence — accent left border */}
        <div className="lmp-panel-congestion" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', border: 'none', borderLeft: '2px solid rgba(255,183,0,0.4)', background: 'rgba(255,183,0,0.02)', padding: '16px 20px' }}>
          <div style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '9px',
            color: 'rgba(255,183,0,0.6)',
            letterSpacing: '0.15em',
            paddingBottom: '8px',
            marginBottom: '12px',
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            CONGESTION INTELLIGENCE
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0' }}>
            {constraints.map((c, i) => (
              <div key={i} className="lmp-constraint-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="constraint-name" style={{ fontFamily: "'Geist Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.4)', transition: 'color 0.15s ease' }}>
                  {c.name}
                </span>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', fontWeight: 'bold', color: c.impact > 0.5 ? '#FFB800' : c.impact < 0 ? '#FF4444' : 'rgba(255,255,255,0.3)' }}>
                  {c.impact >= 0 ? '+' : ''}{c.impact.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Zone Generation Mix — accent left border */}
        <div className="lmp-panel-genmix" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', border: 'none', borderLeft: '2px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.01)', padding: '16px 20px' }}>
          <div style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '9px',
            color: 'rgba(0,212,255,0.6)',
            letterSpacing: '0.15em',
            paddingBottom: '8px',
            marginBottom: '12px',
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            ZONE GENERATION MIX
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ display: 'flex', height: '6px', marginBottom: '4px', overflow: 'hidden', flexShrink: 0 }}>
              {genMix.map(({ fuel, pct, color }) => (
                <div key={fuel} className="lmp-bar-segment" style={{ width: `${pct}%`, background: color }} />
              ))}
            </div>
            {genMix.map(({ fuel, pct, color }) => (
              <div key={fuel} className="lmp-genmix-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', background: color }} />
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>{fuel}</span>
                </div>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 'bold' }}>
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Price Forecast — accent left border */}
        <div className="lmp-panel-forecast" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', border: 'none', borderLeft: '2px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.01)', padding: '16px 20px' }}>
          <div style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '9px',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.15em',
            paddingBottom: '8px',
            marginBottom: '12px',
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            PRICE FORECAST
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0' }}>
            {forecast.map(({ hour, price }) => {
              const delta = price - data.price
              return (
                <div key={hour} className="lmp-forecast-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{hour}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '13px', fontWeight: 'bold', color: '#FFFFFF' }}>
                      {price.toFixed(2)}
                    </span>
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '9px', color: delta >= 0 ? '#FFB800' : '#00D4FF' }}>
                      {delta >= 0 ? '▲' : '▼'}{Math.abs(delta).toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── MAIN COMPONENT ──────────────────────────────────────────── */

export function LMPCard({ selectedZone }: { selectedZone: string | null }) {
  const [lmpExpanded, setLmpExpanded] = useState(false)
  const [lmpClosing, setLmpClosing] = useState(false)

  const closeLmp = () => {
    setLmpClosing(true)
    setTimeout(() => {
      setLmpExpanded(false)
      setLmpClosing(false)
    }, 300)
  }

  // ESC key closes overlay
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lmpExpanded) closeLmp()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lmpExpanded])

  const zoneKey = selectedZone ?? 'WEST_HUB'
  const lmpData = ZONE_LMP_DETAIL[zoneKey] ?? ZONE_LMP_DETAIL['DEFAULT']
  const sparkData = ZONE_SPARKLINE[zoneKey] ?? ZONE_SPARKLINE['DEFAULT']

  return (
    <>
      {/* ── COMPACT STATE — FIX 1: Three explicit zones 20/50/30 ── */}
      <div
        onClick={() => setLmpExpanded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        {/* FIX 2+10 — Background sparkline — opacity 0.12, strokeWidth 3 */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12, pointerEvents: 'none' }}
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <polyline
            points={sparklinePoints(sparkData)}
            fill="none"
            stroke="#00D4FF"
            strokeWidth="3"
          />
        </svg>

        {/* ZONE 1 — Top 20% — Zone name + LIVE badge */}
        <div style={{
          flex: '0 0 20%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '9px',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            {selectedZone ?? 'WEST HUB'} LMP
          </span>
          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '8px',
            color: '#00FFF0',
            letterSpacing: '0.15em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span className="live-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00FFF0', display: 'inline-block' }} />
            LIVE
          </span>
        </div>

        {/* ZONE 2 — Middle 50% — Dominant price + delta badge */}
        <div style={{
          flex: '0 0 50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <div style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '42px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {lmpData.price.toFixed(2)}
          </div>
          <div style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '10px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
          }}>
            $/MWh
          </div>
          {/* Delta badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '2px',
            background: lmpData.delta >= 0 ? 'rgba(255,183,0,0.1)' : 'rgba(0,163,255,0.1)',
            border: `0.5px solid ${lmpData.delta >= 0 ? 'rgba(255,183,0,0.3)' : 'rgba(0,163,255,0.3)'}`,
          }}>
            <span style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '10px',
              color: lmpData.delta >= 0 ? '#FFB800' : '#00A3FF',
              fontWeight: 'bold',
            }}>
              {lmpData.delta >= 0 ? '▲' : '▼'} {Math.abs(lmpData.delta).toFixed(2)} vs −1H
            </span>
          </div>
        </div>

        {/* ZONE 3 — Bottom 30% — FIX 3: Component rows + expand hint */}
        <div style={{
          flex: '0 0 30%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 16px 14px 16px',
          gap: '6px',
          overflow: 'visible',
        }}>
          {[
            { label: 'ENERGY',     value: lmpData.energy,     color: '#00D4FF' },
            { label: 'CONGESTION', value: lmpData.congestion, color: lmpData.congestion > 0.5 ? '#FFB800' : lmpData.congestion < -0.1 ? '#FF4444' : '#00FFF0' },
            { label: 'LOSS',       value: lmpData.loss,        color: 'rgba(255,100,100,0.7)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em' }}>
                {label}
              </span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', color, fontWeight: 'bold' }}>
                {value >= 0 ? '+' : ''}{value.toFixed(2)}
              </span>
            </div>
          ))}
          {/* Expand hint */}
          <div style={{ textAlign: 'center', marginTop: '2px' }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>
              ↗ CLICK TO EXPAND
            </span>
          </div>
        </div>
      </div>

      {/* ── EXPANDED OVERLAY — portaled to body to escape BentoCard's backdropFilter containing block ── */}
      {lmpExpanded && createPortal(
        <>
          {/* Dimmed backdrop */}
          <div
            onClick={closeLmp}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 60,
              background: 'rgba(10,10,11,0.82)',
              backdropFilter: 'blur(2px)',
            }}
          />
          {/* Main overlay panel */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 61,
            width: '95vw',
            height: '95vh',
            background: '#0A0A0B',
            border: '0.5px solid rgba(0,212,255,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: lmpClosing
              ? 'modal-collapse 300ms cubic-bezier(0.16,1,0.3,1) forwards'
              : 'modal-expand 300ms cubic-bezier(0.16,1,0.3,1) forwards',
            boxShadow: '0 0 80px rgba(0,212,255,0.08)',
          }}>
            {/* Header */}
            <div style={{
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              borderBottom: '0.5px solid rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em' }}>
                  LMP INTELLIGENCE
                </span>
                {selectedZone && (
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '11px', color: '#00D4FF', letterSpacing: '0.1em' }}>
                    / {selectedZone}
                  </span>
                )}
              </div>
              <button
                onClick={closeLmp}
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.04)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                }}
              >
                ESC / CLOSE
              </button>
            </div>

            {/* Content — branches based on zone selection */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {selectedZone ? <LMPExpandedZone zone={selectedZone} /> : <LMPExpandedSystem />}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

// src/components/ZonePriceMatrix.tsx
// Data-dense PJM zone price matrix — 20 zones, sortable, live pulse on price change.
// Replaces the legacy 3D PJMNodeGraph in the Market Pulse panel.
//
// Mock data wired inline; swap for live feed in Sprint 2C.

import { useEffect, useMemo, useState } from 'react';
import { C, F, R, S } from '@/design/tokens';

// ── Types ────────────────────────────────────────────────────────

interface ZoneData {
  id:          string;
  name:        string;
  lmp:         number;
  delta:       number;   // vs system average
  trend:       number[]; // last 5 data points for sparkline
  congestion:  number;
  loss:        number;
}

type SortMode = 'deviation' | 'price' | 'congestion' | 'alpha';

// ── Mock data ────────────────────────────────────────────────────

const ZONE_DATA: ZoneData[] = [
  { id: 'WEST',    name: 'WEST HUB', lmp: 35.90, delta:  0.00, trend: [33.2, 34.1, 34.8, 35.2, 35.9], congestion:  2.40, loss: 1.40 },
  { id: 'PSEG',    name: 'PSEG',     lmp: 38.20, delta:  2.30, trend: [35.1, 36.2, 37.0, 37.8, 38.2], congestion:  4.10, loss: 1.80 },
  { id: 'RECO',    name: 'RECO',     lmp: 62.40, delta: 26.50, trend: [41.2, 48.3, 55.1, 59.8, 62.4], congestion: 28.20, loss: 2.10 },
  { id: 'COMED',   name: 'COMED',    lmp: 22.30, delta: -13.60, trend: [28.4, 26.1, 24.8, 23.2, 22.3], congestion: -1.20, loss: 0.90 },
  { id: 'AEP',     name: 'AEP',      lmp: 29.40, delta: -6.50, trend: [32.1, 31.4, 30.8, 30.1, 29.4], congestion:  0.80, loss: 1.20 },
  { id: 'DOM',     name: 'DOM',      lmp: 34.15, delta: -1.75, trend: [34.8, 34.6, 34.4, 34.3, 34.1], congestion:  1.90, loss: 1.50 },
  { id: 'DUQ',     name: 'DUQ',      lmp: 27.88, delta: -8.02, trend: [30.2, 29.8, 29.1, 28.4, 27.9], congestion:  0.40, loss: 1.10 },
  { id: 'JCPL',    name: 'JCPL',     lmp: 41.22, delta:  5.32, trend: [37.8, 38.9, 39.8, 40.6, 41.2], congestion:  6.80, loss: 1.90 },
  { id: 'PPL',     name: 'PPL',      lmp: 33.05, delta: -2.85, trend: [34.9, 34.4, 33.9, 33.4, 33.1], congestion:  1.20, loss: 1.40 },
  { id: 'PECO',    name: 'PECO',     lmp: 36.80, delta:  0.90, trend: [35.2, 35.8, 36.2, 36.5, 36.8], congestion:  2.10, loss: 1.60 },
  { id: 'BGE',     name: 'BGE',      lmp: 37.40, delta:  1.50, trend: [35.8, 36.2, 36.8, 37.1, 37.4], congestion:  2.80, loss: 1.70 },
  { id: 'PENELEC', name: 'PENELEC',  lmp: 31.20, delta: -4.70, trend: [33.8, 33.1, 32.4, 31.8, 31.2], congestion:  0.60, loss: 1.20 },
  { id: 'MET_ED',  name: 'MET-ED',   lmp: 32.90, delta: -3.00, trend: [34.8, 34.2, 33.7, 33.2, 32.9], congestion:  0.90, loss: 1.30 },
  { id: 'ATSI',    name: 'ATSI',     lmp: 28.60, delta: -7.30, trend: [31.2, 30.4, 29.8, 29.1, 28.6], congestion:  0.30, loss: 1.10 },
  { id: 'DEOK',    name: 'DEOK',     lmp: 26.90, delta: -9.00, trend: [30.1, 29.2, 28.4, 27.6, 26.9], congestion:  0.20, loss: 1.00 },
  { id: 'DAY',     name: 'DAY',      lmp: 24.10, delta: -11.80, trend: [28.4, 27.1, 26.0, 24.9, 24.1], congestion: -0.80, loss: 0.90 },
  { id: 'CE',      name: 'CE',       lmp: 23.40, delta: -12.50, trend: [27.8, 26.4, 25.2, 24.1, 23.4], congestion: -1.10, loss: 0.85 },
  { id: 'EKPC',    name: 'EKPC',     lmp: 25.60, delta: -10.30, trend: [29.1, 28.0, 27.2, 26.4, 25.6], congestion: -0.40, loss: 0.95 },
  { id: 'APS',     name: 'APS',      lmp: 30.10, delta: -5.80, trend: [32.8, 32.1, 31.4, 30.8, 30.1], congestion:  0.50, loss: 1.15 },
  { id: 'AECO',    name: 'AECO',     lmp: 39.60, delta:  3.70, trend: [36.4, 37.2, 38.1, 38.9, 39.6], congestion:  5.20, loss: 1.85 },
];

const SYSTEM_AVG = 35.90;
const ALERT_COUNT = 3;

// ── Helpers ──────────────────────────────────────────────────────

/** 5-point sparkline as SVG polyline points scaled to a 0-100 viewBox. */
function sparklinePoints(values: number[], width = 100, height = 24): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 0.001);
  const stepX = width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function deltaColor(delta: number): string {
  if (delta > 0.5)  return C.alertCritical;   // meaningfully above avg → expensive
  if (delta < -0.5) return C.alertNormal;     // meaningfully below avg → cheap
  return C.textMuted;                          // ~ at system avg
}

function trendColor(delta: number): string {
  if (delta > 0.5)  return C.alertCritical;
  if (delta < -0.5) return C.alertNormal;
  return C.electricBlue;
}

// ── Subcomponents ────────────────────────────────────────────────

interface SortButtonProps {
  id:       SortMode;
  label:    string;
  active:   boolean;
  onClick:  (id: SortMode) => void;
}

function SortButton({ id, label, active, onClick }: SortButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        padding:       '4px 10px',
        background:    active ? C.electricBlueWash : 'transparent',
        border:        `1px solid ${active ? C.electricBlue : C.borderDefault}`,
        borderRadius:  R.sm,
        color:         active ? C.electricBlue : C.textMuted,
        fontFamily:    F.mono,
        fontSize:      '9px',
        fontWeight:    active ? '600' : '400',
        letterSpacing: '0.10em',
        cursor:        'pointer',
        transition:    'background 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {label}
    </button>
  );
}

interface ZoneCardProps {
  zone:      ZoneData;
  selected:  boolean;
  flashing:  boolean;
  onSelect:  (id: string) => void;
}

function ZoneCard({ zone, selected, flashing, onSelect }: ZoneCardProps) {
  const dColor = deltaColor(zone.delta);
  const tColor = trendColor(zone.delta);
  const deltaStr = `${zone.delta > 0 ? '+' : ''}${zone.delta.toFixed(2)}`;
  const topBorderColor = selected
    ? C.electricBlue
    : flashing
      ? tColor
      : C.borderAccent;

  return (
    <div
      onClick={() => onSelect(zone.id)}
      style={{
        position:      'relative',
        padding:       S.md,
        background:    C.bgElevated,
        border:        `1px solid ${C.borderDefault}`,
        borderTop:     `1px solid ${topBorderColor}`,
        borderRadius:  R.md,
        cursor:        'pointer',
        display:       'flex',
        flexDirection: 'column',
        gap:           S.xs,
        minWidth:      0,
        transition:    'border-top-color 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity:       flashing ? 0.95 : 1,
      }}
      onMouseEnter={(e) => {
        if (!selected && !flashing) {
          (e.currentTarget as HTMLDivElement).style.borderTopColor = C.borderActive;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected && !flashing) {
          (e.currentTarget as HTMLDivElement).style.borderTopColor = C.borderAccent;
        }
      }}
    >
      {/* Row 1 — zone name + live-pulse dot */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            S.xs,
      }}>
        <span style={{
          fontFamily:    F.mono,
          fontSize:      '10px',
          fontWeight:    '600',
          color:         C.textSecondary,
          letterSpacing: '0.10em',
          overflow:      'hidden',
          textOverflow:  'ellipsis',
          whiteSpace:    'nowrap' as const,
        }}>
          {zone.name}
        </span>
        <span
          aria-hidden
          style={{
            width:      6,
            height:     6,
            borderRadius: '50%',
            background: flashing ? tColor : C.borderStrong,
            boxShadow:  flashing ? `0 0 6px ${tColor}` : 'none',
            transition: 'background 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
          }}
        />
      </div>

      {/* Row 2 — LMP price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: S.xs }}>
        <span style={{
          fontFamily:         F.mono,
          fontSize:           '20px',
          fontWeight:         '700',
          color:              C.textPrimary,
          fontVariantNumeric: 'tabular-nums',
          lineHeight:         1,
        }}>
          ${zone.lmp.toFixed(2)}
        </span>
        <span style={{
          fontFamily:    F.mono,
          fontSize:      '9px',
          color:         C.textMuted,
          letterSpacing: '0.08em',
        }}>
          /MWh
        </span>
      </div>

      {/* Row 3 — sparkline */}
      <svg
        viewBox="0 0 100 24"
        preserveAspectRatio="none"
        style={{ width: '100%', height: 22, display: 'block' }}
      >
        <polyline
          points={sparklinePoints(zone.trend, 100, 24)}
          fill="none"
          stroke={tColor}
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Row 4 — delta + congestion */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            S.xs,
      }}>
        <span style={{
          fontFamily:         F.mono,
          fontSize:           '10px',
          fontWeight:         '600',
          color:              dColor,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing:      '0.02em',
        }}>
          {deltaStr}
        </span>
        <span style={{
          fontFamily:         F.mono,
          fontSize:           '9px',
          color:              C.textMuted,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing:      '0.06em',
        }}>
          CONG {zone.congestion >= 0 ? '+' : ''}{zone.congestion.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

interface ZonePriceMatrixProps {
  onZoneSelect?: (zoneId: string | null) => void;
  expanded?:     boolean;
}

export default function ZonePriceMatrix({ onZoneSelect, expanded = false }: ZonePriceMatrixProps) {
  const [sortMode,      setSortMode]      = useState<SortMode>('deviation');
  const [selectedZone,  setSelectedZone]  = useState<string | null>(null);
  const [flashingZones, setFlashingZones] = useState<Set<string>>(new Set());
  const [updatedSecAgo, setUpdatedSecAgo] = useState(4);

  const sortedZones = useMemo(() => {
    const arr = [...ZONE_DATA];
    return arr.sort((a, b) => {
      if (sortMode === 'deviation')  return Math.abs(b.delta) - Math.abs(a.delta);
      if (sortMode === 'price')      return b.lmp - a.lmp;
      if (sortMode === 'congestion') return Math.abs(b.congestion) - Math.abs(a.congestion);
      if (sortMode === 'alpha')      return a.name.localeCompare(b.name);
      return 0;
    });
  }, [sortMode]);

  // Simulate price pulses — flash a random zone every 2s
  useEffect(() => {
    const interval = setInterval(() => {
      const randomZone = ZONE_DATA[Math.floor(Math.random() * ZONE_DATA.length)];
      setFlashingZones(prev => {
        const next = new Set(prev);
        next.add(randomZone.id);
        return next;
      });
      setTimeout(() => {
        setFlashingZones(prev => {
          const next = new Set(prev);
          next.delete(randomZone.id);
          return next;
        });
      }, 600);
      setUpdatedSecAgo(0);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Tick "updated Ns ago" counter
  useEffect(() => {
    const id = setInterval(() => setUpdatedSecAgo((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleSelect = (id: string) => {
    const next = selectedZone === id ? null : id;
    setSelectedZone(next);
    onZoneSelect?.(next);
  };

  const sortButtons: Array<{ id: SortMode; label: string }> = [
    { id: 'deviation',  label: 'DEVIATION'  },
    { id: 'price',      label: 'PRICE'      },
    { id: 'congestion', label: 'CONGESTION' },
    { id: 'alpha',      label: 'ALPHA'      },
  ];

  return (
    <div style={{
      position:      'absolute',
      inset:         0,
      display:       'flex',
      flexDirection: 'column',
      background:    C.bgBase,
      overflow:      'hidden',
    }}>
      {/* ── Header row ───────────────────────────────────── */}
      <div style={{
        height:         48,
        flexShrink:     0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            S.md,
        padding:        `0 ${S.md}`,
        borderBottom:   `1px solid ${C.borderDefault}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: S.md, minWidth: 0 }}>
          <span style={{
            fontFamily:    F.mono,
            fontSize:      '10px',
            color:         C.textMuted,
            letterSpacing: '0.16em',
            textTransform: 'uppercase' as const,
            whiteSpace:    'nowrap' as const,
          }}>
            MARKET PULSE
          </span>
          <span style={{
            padding:            '3px 10px',
            background:         C.bgSurface,
            border:             `1px solid ${C.borderDefault}`,
            borderRadius:       R.sm,
            fontFamily:         F.mono,
            fontSize:           '11px',
            color:              C.textSecondary,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing:      '0.04em',
            whiteSpace:         'nowrap' as const,
          }}>
            SYS AVG&nbsp; ${SYSTEM_AVG.toFixed(2)}/MWh
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: S.xs, flexShrink: 0 }}>
          {sortButtons.map(({ id, label }) => (
            <SortButton
              key={id}
              id={id}
              label={label}
              active={sortMode === id}
              onClick={setSortMode}
            />
          ))}
        </div>
      </div>

      {/* ── System stats row ─────────────────────────────── */}
      <div style={{
        height:       32,
        flexShrink:   0,
        display:      'flex',
        alignItems:   'center',
        gap:          S.md,
        padding:      `0 ${S.md}`,
        borderBottom: `1px solid ${C.borderDefault}`,
      }}>
        {[
          `${ZONE_DATA.length} ZONES`,
          `${ALERT_COUNT} ALERTS`,
          `UPDATED ${updatedSecAgo}S AGO`,
        ].map((label, i, arr) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: S.md }}>
            <span style={{
              fontFamily:    F.mono,
              fontSize:      '10px',
              color:         C.textMuted,
              letterSpacing: '0.10em',
              whiteSpace:    'nowrap' as const,
            }}>
              {label}
            </span>
            {i < arr.length - 1 && (
              <span style={{ color: C.borderStrong, fontSize: '10px' }}>·</span>
            )}
          </span>
        ))}
      </div>

      {/* ── Zone grid ────────────────────────────────────── */}
      <div style={{
        flex:     1,
        minHeight: 0,
        overflowY: 'auto',
        padding:  S.sm,
      }}>
        <div style={{
          display:             'grid',
          gridTemplateColumns: expanded ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)',
          gap:                 S.sm,
        }}>
          {sortedZones.map(zone => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              selected={selectedZone === zone.id}
              flashing={flashingZones.has(zone.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

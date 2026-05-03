// ATLAS Wave 2 — Time-travel legend.
// Current timestamp + delta-from-now indicator. Mounted inside the
// scrubber pill on the right side. Renders a compact stack:
//   ┌──────────────────────┐
//   │  DEC 23, 2022 14:00  │
//   │  −18:42 ago · LIVE   │
//   └──────────────────────┘

import { useEffect, useState } from 'react';
import { C, F } from '@/design/tokens';
import { useTimeTravelStore } from '@/stores/timeTravelStore';

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/New_York', hour12: false,
  }).replace(',', ' ·').toUpperCase();
}

function formatDelta(targetIso: string): string {
  const target = Date.parse(targetIso);
  if (Number.isNaN(target)) return '';
  const delta = Date.now() - target;
  if (delta < 60_000) return 'JUST NOW';
  const mins = Math.floor(delta / 60_000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `−${days}D ${hours % 24}H AGO`;
  if (hours >= 1) return `−${hours}H ${(mins % 60).toString().padStart(2, '0')}M AGO`;
  return `−${mins}M AGO`;
}

export function TimeTravelLegend() {
  const mode = useTimeTravelStore((s) => s.mode);
  const currentTimestamp = useTimeTravelStore((s) => s.currentTimestamp);
  const activeEventId = useTimeTravelStore((s) => s.activeEventId);

  // Re-render every 30s so the delta-from-now ticks.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (mode === 'live') return;
    const id = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, [mode]);

  const isLive = mode === 'live';

  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'flex-end',
      gap:            2,
      paddingLeft:    12,
      borderLeft:     `1px solid ${C.borderDefault}`,
      minWidth:       170,
    }}>
      <span style={{
        fontFamily:         F.mono,
        fontSize:           11,
        fontWeight:         700,
        letterSpacing:      '0.10em',
        color:              isLive ? C.alertNormal : C.textPrimary,
        fontVariantNumeric: 'tabular-nums',
        textTransform:      'uppercase',
      }}>
        {isLive ? 'NOW · LIVE' : formatTimestamp(currentTimestamp)}
      </span>
      <span style={{
        fontFamily:    F.mono,
        fontSize:      10,
        letterSpacing: '0.14em',
        color:         isLive ? C.alertNormal : C.falconGold,
        textTransform: 'uppercase',
      }}>
        {isLive
          ? 'PJM · REAL-TIME'
          : mode === 'event-replay'
            ? `EVENT · ${activeEventId?.toUpperCase() ?? ''}`
            : formatDelta(currentTimestamp)}
      </span>
    </div>
  );
}

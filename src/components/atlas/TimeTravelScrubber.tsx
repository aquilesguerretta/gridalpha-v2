// ATLAS Wave 2 — TimeTravelScrubber.
//
// The horizontal slider + playback controls that anchor the bottom of
// the GridAtlasView. Replaces the legacy "floating timeline pill" that
// only drove a 49-frame buffer.
//
// Layout left → right:
//   [ EVENTS ▾ ]    [ ◀ play ]  [ 1× 2× 4× 8× ]  [ ─────●───── ]  [ NOW ↻ ]  [ DEC 23 14:00 / -18H ago ]
//
// Highlight markers render above the slider track when an event is
// active. Clicking a marker calls scrubToTimestamp on that highlight.

import { useMemo, useRef, useState } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { useTimeTravelStore } from '@/stores/timeTravelStore';
import { getEvent } from '@/lib/atlas/eventLibrary';
import type { EventHighlight } from '@/lib/types/timeTravel';
import { TimeTravelLegend } from './TimeTravelLegend';
import { EventReplayMenu } from './EventReplayMenu';

const SIGNIFICANCE_COLOR: Record<EventHighlight['significance'], string> = {
  critical: '#EF4444',
  notable:  '#FBBF24',
  context:  '#3B82F6',
};

export function TimeTravelScrubber() {
  const mode             = useTimeTravelStore((s) => s.mode);
  const scrubPosition    = useTimeTravelStore((s) => s.scrubPosition);
  const isPlaying        = useTimeTravelStore((s) => s.isPlaying);
  const playbackSpeed    = useTimeTravelStore((s) => s.playbackSpeed);
  const activeEventId    = useTimeTravelStore((s) => s.activeEventId);
  const rangeStart       = useTimeTravelStore((s) => s.rangeStart);
  const rangeEnd         = useTimeTravelStore((s) => s.rangeEnd);
  const scrubTo          = useTimeTravelStore((s) => s.scrubTo);
  const scrubToTimestamp = useTimeTravelStore((s) => s.scrubToTimestamp);
  const exitToLive       = useTimeTravelStore((s) => s.exitToLive);
  const togglePlayback   = useTimeTravelStore((s) => s.togglePlayback);
  const setSpeed         = useTimeTravelStore((s) => s.setSpeed);

  const [eventsOpen, setEventsOpen] = useState(false);
  const eventsBtnRef = useRef<HTMLButtonElement | null>(null);

  const activeEvent = activeEventId ? getEvent(activeEventId) : null;
  const highlights: EventHighlight[] = activeEvent?.highlights ?? [];

  // Convert a highlight timestamp to its 0..1 position along the active range.
  const highlightPositions = useMemo(() => {
    const startMs = Date.parse(rangeStart);
    const endMs   = Date.parse(rangeEnd);
    const span    = endMs - startMs;
    if (Number.isNaN(span) || span <= 0) return [];
    return highlights.map((h) => {
      const ts = Date.parse(h.timestamp);
      return {
        h,
        position: Math.max(0, Math.min(1, (ts - startMs) / span)),
      };
    });
  }, [highlights, rangeStart, rangeEnd]);

  return (
    <div style={{
      position:       'absolute',
      bottom:         18,
      left:           '50%',
      transform:      'translateX(-50%)',
      width:          'min(960px, calc(100% - 72px))',
      zIndex:         12,
      display:        'flex',
      flexDirection:  'column',
      gap:            8,
      padding:        '12px 18px',
      background:     'rgba(10,10,11,0.85)',
      border:         `1px solid ${C.borderDefault}`,
      borderRadius:   22,
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      boxShadow:      '0 12px 32px rgba(0,0,0,0.45)',
      pointerEvents:  'auto',
    }}>
      {/* Top row: controls + legend */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            S.md,
      }}>
        {/* EVENTS dropdown trigger */}
        <button
          ref={eventsBtnRef}
          onClick={() => setEventsOpen((o) => !o)}
          style={{
            background:    eventsOpen ? 'rgba(245,158,11,0.16)' : 'transparent',
            border:        `1px solid ${eventsOpen ? 'rgba(245,158,11,0.55)' : C.borderDefault}`,
            borderRadius:  R.md,
            padding:       '5px 10px',
            color:         eventsOpen ? '#FBBF24' : C.textSecondary,
            fontFamily:    F.mono,
            fontSize:      10,
            fontWeight:    600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor:        'pointer',
            display:       'inline-flex',
            alignItems:    'center',
            gap:           6,
          }}
        >
          ◇ EVENTS
          <span style={{ fontSize: 9, opacity: 0.7 }}>{eventsOpen ? '▴' : '▾'}</span>
        </button>

        {/* Play/pause */}
        <button
          onClick={togglePlayback}
          disabled={mode === 'live'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          style={{
            background:    'transparent',
            border:        `1px solid ${mode === 'live' ? C.borderDefault : 'rgba(0,255,240,0.55)'}`,
            borderRadius:  R.md,
            padding:       '5px 10px',
            color:         mode === 'live' ? C.textMuted : '#00FFF0',
            fontFamily:    F.mono,
            fontSize:      11,
            cursor:        mode === 'live' ? 'not-allowed' : 'pointer',
            opacity:       mode === 'live' ? 0.5 : 1,
            minWidth:      36,
          }}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>

        {/* Speed selector */}
        <div style={{
          display:      'inline-flex',
          gap:          2,
          padding:      2,
          border:       `1px solid ${C.borderDefault}`,
          borderRadius: R.md,
          background:   'rgba(255,255,255,0.02)',
        }}>
          {([1, 2, 4, 8] as const).map((s) => {
            const active = playbackSpeed === s;
            return (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                style={{
                  background:     active ? 'rgba(0,255,240,0.18)' : 'transparent',
                  border:         'none',
                  color:          active ? '#00FFF0' : C.textMuted,
                  fontFamily:     F.mono,
                  fontSize:       10,
                  fontWeight:     active ? 700 : 500,
                  letterSpacing:  '0.06em',
                  cursor:         'pointer',
                  padding:        '4px 8px',
                  borderRadius:   4,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {s}×
              </button>
            );
          })}
        </div>

        {/* Slider region — flex: 1 */}
        <div style={{ flex: 1, position: 'relative', height: 28 }}>
          {/* Highlights bar — only visible when event-replay */}
          {mode === 'event-replay' && highlightPositions.length > 0 && (
            <div style={{
              position:      'absolute',
              top:           0,
              left:          0,
              right:         0,
              height:        12,
              pointerEvents: 'none',
            }}>
              {highlightPositions.map(({ h, position }, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    scrubToTimestamp(h.timestamp)
                  }
                  title={`${h.label}${h.zone ? ` · ${h.zone}` : ''}`}
                  style={{
                    position:     'absolute',
                    left:         `calc(${position * 100}% - 5px)`,
                    top:          0,
                    width:        10,
                    height:       12,
                    background:   'transparent',
                    border:       'none',
                    cursor:       'pointer',
                    pointerEvents: 'auto',
                    padding:      0,
                  }}
                  aria-label={h.label}
                >
                  <svg viewBox="0 0 10 12" width={10} height={12}>
                    <path
                      d="M5 0 L10 9 L0 9 Z"
                      fill={SIGNIFICANCE_COLOR[h.significance]}
                      opacity={0.85}
                      stroke="rgba(0,0,0,0.4)"
                      strokeWidth={0.5}
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* Slider input */}
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(scrubPosition * 1000)}
            onChange={(e) => scrubTo(Number(e.target.value) / 1000)}
            style={{
              position:   'absolute',
              left:       0,
              right:      0,
              bottom:     2,
              width:      '100%',
              appearance: 'none',
              height:     4,
              borderRadius: 2,
              outline:    'none',
              cursor:     'pointer',
              background:
                mode === 'live'
                  ? 'rgba(255,255,255,0.10)'
                  : `linear-gradient(to right, #00FFF0 0%, #3B82F6 ${scrubPosition * 100}%, rgba(255,255,255,0.12) ${scrubPosition * 100}%)`,
            }}
          />

          {/* Tick marks every 25% (or every 6h on a 24h-equivalent range) */}
          <div style={{
            position:    'absolute',
            top:         18,
            left:        0,
            right:       0,
            display:     'flex',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}>
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <span
                key={t}
                style={{
                  width:  1,
                  height: 4,
                  background: t === 1 && mode === 'live' ? '#10B981' : C.textMuted,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        </div>

        {/* Return to live */}
        <button
          onClick={exitToLive}
          disabled={mode === 'live'}
          style={{
            background:    mode === 'live' ? 'transparent' : 'rgba(16,185,129,0.12)',
            border:        `1px solid ${mode === 'live' ? C.borderDefault : 'rgba(16,185,129,0.55)'}`,
            borderRadius:  R.md,
            padding:       '5px 10px',
            color:         mode === 'live' ? C.textMuted : '#10B981',
            fontFamily:    F.mono,
            fontSize:      10,
            fontWeight:    600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor:        mode === 'live' ? 'not-allowed' : 'pointer',
            opacity:       mode === 'live' ? 0.5 : 1,
            whiteSpace:    'nowrap',
          }}
        >
          NOW ↻
        </button>

        <TimeTravelLegend />
      </div>

      {/* EventReplayMenu — positioned above the EVENTS button */}
      {eventsOpen && (
        <EventReplayMenu
          onClose={() => setEventsOpen(false)}
        />
      )}
    </div>
  );
}

// ATLAS Wave 2 — EventReplayMenu.
// Dropdown panel listing the curated NamedEvents. Opens above the
// scrubber when the user clicks the EVENTS button. Selecting an event
// puts the store into 'event-replay' mode at the event's start.

import { C, F, R, S } from '@/design/tokens';
import { NAMED_EVENTS } from '@/lib/atlas/eventLibrary';
import { useTimeTravelStore } from '@/stores/timeTravelStore';
import type { NamedEvent } from '@/lib/types/timeTravel';

function durationLabel(event: NamedEvent): string {
  const ms = Date.parse(event.endTimestamp) - Date.parse(event.startTimestamp);
  if (Number.isNaN(ms) || ms <= 0) return '';
  const hours = Math.round(ms / 3_600_000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const rem  = hours % 24;
    return rem === 0 ? `${days}D` : `${days}D ${rem}H`;
  }
  return `${hours}H`;
}

function rangeLabel(event: NamedEvent): string {
  const a = new Date(event.startTimestamp);
  const b = new Date(event.endTimestamp);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return '';
  return `${a.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} → ${b.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`;
}

interface Props {
  onClose: () => void;
}

export function EventReplayMenu({ onClose }: Props) {
  const selectEvent  = useTimeTravelStore((s) => s.selectEvent);
  const activeEvent  = useTimeTravelStore((s) => s.activeEventId);
  const togglePlayback = useTimeTravelStore((s) => s.togglePlayback);

  const handleSelect = (event: NamedEvent) => {
    selectEvent(event.id);
    onClose();
  };

  const handlePlay = (event: NamedEvent) => {
    selectEvent(event.id);
    // Kick playback on the next frame so the store transition lands first.
    requestAnimationFrame(() => togglePlayback());
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label="Event Replay"
      style={{
        position:       'absolute',
        bottom:         'calc(100% + 8px)',
        left:           18,
        width:          420,
        background:     'rgba(15,15,18,0.96)',
        border:         `1px solid ${C.borderDefault}`,
        borderTop:      `1px solid rgba(245,158,11,0.45)`,
        borderRadius:   R.md,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding:        S.sm,
        boxShadow:      '0 20px 48px rgba(0,0,0,0.5)',
        display:        'flex',
        flexDirection:  'column',
        gap:            6,
        zIndex:         50,
      }}
    >
      {/* Header */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        padding:        '4px 6px 8px',
        borderBottom:   `1px solid ${C.borderDefault}`,
      }}>
        <span style={{
          fontFamily:    F.mono,
          fontSize:      10,
          fontWeight:    700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         '#FBBF24',
        }}>
          Event Replay
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background:    'transparent',
            border:        'none',
            color:         C.textMuted,
            fontFamily:    F.mono,
            fontSize:      14,
            cursor:        'pointer',
            padding:       0,
            lineHeight:    1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Event rows */}
      {NAMED_EVENTS.map((event) => {
        const isActive = event.id === activeEvent;
        return (
          <div
            key={event.id}
            onClick={() => handleSelect(event)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect(event);
              }
            }}
            style={{
              display:        'flex',
              flexDirection:  'column',
              gap:            4,
              padding:        '8px 10px',
              borderRadius:   R.md,
              border:         `1px solid ${isActive ? 'rgba(245,158,11,0.45)' : 'transparent'}`,
              borderLeft:     `2px solid ${isActive ? '#FBBF24' : 'transparent'}`,
              background:     isActive ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
              cursor:         'pointer',
              transition:     'background 150ms cubic-bezier(0.4,0,0.2,1), border-color 150ms cubic-bezier(0.4,0,0.2,1)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            }}
          >
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              gap:            S.sm,
            }}>
              <span style={{
                fontFamily:    F.mono,
                fontSize:      12,
                fontWeight:    700,
                color:         isActive ? '#FBBF24' : C.textPrimary,
                letterSpacing: '0.04em',
              }}>
                {event.name}
              </span>
              <span style={{
                fontFamily:    F.mono,
                fontSize:      10,
                fontWeight:    600,
                color:         C.textMuted,
                letterSpacing: '0.10em',
              }}>
                {durationLabel(event)}
              </span>
            </div>
            <span style={{
              fontFamily:    F.mono,
              fontSize:      10,
              color:         C.textSecondary,
              letterSpacing: '0.06em',
              lineHeight:    1.5,
            }}>
              {event.description}
            </span>
            <div style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              marginTop:      2,
            }}>
              <span style={{
                fontFamily:    F.mono,
                fontSize:      9,
                color:         C.textMuted,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
              }}>
                {rangeLabel(event)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay(event);
                }}
                style={{
                  background:    'rgba(0,255,240,0.12)',
                  border:        '1px solid rgba(0,255,240,0.45)',
                  borderRadius:  R.sm,
                  padding:       '3px 8px',
                  color:         '#00FFF0',
                  fontFamily:    F.mono,
                  fontSize:      9,
                  fontWeight:    700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  cursor:        'pointer',
                }}
              >
                ▶ PLAY
              </button>
            </div>
          </div>
        );
      })}

      <span style={{
        marginTop:     6,
        padding:       '0 6px',
        fontFamily:    F.mono,
        fontSize:      9,
        color:         C.textMuted,
        letterSpacing: '0.10em',
        lineHeight:    1.5,
      }}>
        V1 — Hand-curated mocks. Live PJM historical wire-up arrives in a future sprint.
      </span>
    </div>
  );
}

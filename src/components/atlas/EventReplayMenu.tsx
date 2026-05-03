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
        // CHROMA Wave 3 — bgOverlay (raised tier) + falcon-gold active
        // edge top + low-alpha shadow only enough to lift off the map.
        background:     C.bgOverlay,
        border:         `1px solid ${C.borderDefault}`,
        borderTop:      `1px solid ${C.falconGold}`,
        borderRadius:   R.lg,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding:        S.sm,
        boxShadow:      '0 8px 24px rgba(0,0,0,0.20)',
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
          color:         C.falconGoldLight,
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
              border:         `1px solid ${isActive ? C.falconGold : 'transparent'}`,
              borderLeft:     `2px solid ${isActive ? C.falconGoldLight : 'transparent'}`,
              background:     isActive ? C.falconGoldWash : C.bgSurface,
              cursor:         'pointer',
              transition:     'background 150ms cubic-bezier(0.4,0,0.2,1), border-color 150ms cubic-bezier(0.4,0,0.2,1)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = C.bgElevated;
                e.currentTarget.style.borderLeftColor = C.electricBlue;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = C.bgSurface;
                e.currentTarget.style.borderLeftColor = 'transparent';
              }
            }}
          >
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              gap:            S.sm,
            }}>
              <span style={{
                fontFamily:    F.sans,
                fontSize:      15,
                fontWeight:    600,
                color:         isActive ? C.falconGoldLight : C.textPrimary,
                letterSpacing: '0',
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
              fontFamily:    F.sans,
              fontSize:      12,
              color:         C.textSecondary,
              letterSpacing: '0',
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
                fontSize:      10,
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
                  background:    C.electricBlueWash,
                  border:        `1px solid ${C.borderActive}`,
                  borderRadius:  R.sm,
                  padding:       '3px 8px',
                  color:         C.electricBlue,
                  fontFamily:    F.mono,
                  fontSize:      10,
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
        fontSize:      10,
        color:         C.textMuted,
        letterSpacing: '0.10em',
        lineHeight:    1.5,
      }}>
        V1 — Hand-curated mocks. Live PJM historical wire-up arrives in a future sprint.
      </span>
    </div>
  );
}

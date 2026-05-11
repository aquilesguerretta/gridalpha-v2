// CHROMA Wave 4 — ConnectionStatusDot primitive.
//
// Surfaces the SSE / WebSocket stream state in the global header next
// to the LIVE indicator. Reads from FORGE Wave 5's useLMPStream hook
// (or any equivalent stream hook) — the consumer passes a single
// `status` prop; this primitive owns the visual treatment only.
//
// States:
//   connected     — green dot, no animation
//   reconnecting  — amber dot, 1.2s pulse
//   disconnected  — red dot, no animation
//
// Visual:
//   - 8px circle
//   - Status-driven color from C.alertNormal / C.alertWarning /
//     C.alertCritical
//   - Reconnecting state animates via `ga-connection-reconnect`
//     keyframe (defined in src/index.css)
//
// Accessibility:
//   - role="status" + aria-label for screen-reader announcements
//   - Visible tooltip on hover via the native `title` attribute

import type { CSSProperties } from 'react';
import { C } from '@/design/tokens';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

interface Props {
  status: ConnectionStatus;
  /** Diameter in px. Default 8. */
  size?: number;
  /** Inline style overrides for fine-tuning placement. */
  style?: CSSProperties;
}

const STATUS_COLOR: Record<ConnectionStatus, string> = {
  connected:    C.alertNormal,
  reconnecting: C.alertWarning,
  disconnected: C.alertCritical,
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connected:    'Live stream connected',
  reconnecting: 'Reconnecting…',
  disconnected: 'Disconnected from stream',
};

export function ConnectionStatusDot({ status, size = 8, style }: Props) {
  const color = STATUS_COLOR[status];
  const label = STATUS_LABEL[status];

  return (
    <span
      role="status"
      aria-label={label}
      title={label}
      style={{
        display:      'inline-block',
        width:        size,
        height:       size,
        borderRadius: '50%',
        background:   color,
        animation:    status === 'reconnecting'
          ? 'ga-connection-reconnect 1.2s ease-in-out infinite'
          : 'none',
        flexShrink:   0,
        ...style,
      }}
    />
  );
}

export default ConnectionStatusDot;

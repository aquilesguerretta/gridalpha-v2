import { C } from '@/design/tokens';

// FOUNDRY primitive — minimal 6×6 status indicator dot.
// Composed inside other components (RegimeBadge, AIAssistant header, etc.).
// 'live' pulses opacity 1 ↔ 0.4 on a 2s cycle; others are static.

type Status = 'live' | 'stale' | 'offline' | 'simulated';

interface Props {
  status: Status;
}

const COLOR_MAP: Record<Status, string> = {
  live:      C.alertNormal,
  stale:     C.alertWarning,
  offline:   C.alertCritical,
  simulated: C.electricBlue,
};

const KEYFRAMES_ID = 'foundry-status-dot-keyframes';
const KEYFRAMES_CSS = '@keyframes foundry-status-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }';

export function StatusDot({ status }: Props) {
  return (
    <>
      <style id={KEYFRAMES_ID}>{KEYFRAMES_CSS}</style>
      <span
        aria-label={`status ${status}`}
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: COLOR_MAP[status],
          animation: status === 'live'
            ? 'foundry-status-pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            : undefined,
        }}
      />
    </>
  );
}

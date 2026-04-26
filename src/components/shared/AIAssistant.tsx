import { C, F, R, S } from '@/design/tokens';
import { useUIStore } from '@/stores/uiStore';
import { StatusDot } from '@/components/terminal/StatusDot';

// FOUNDRY shared — floating AI Assistant chat panel.
// Bottom-right, 360×480, zIndex 9000. Visual only — no API calls.

interface ChatExchange {
  user: string;
  ai: string;
}

const MOCK_EXCHANGES: ChatExchange[] = [
  {
    user: "What's driving PSEG basis today?",
    ai: 'PSEG is +$2.10 vs WEST_HUB this hour. Artificial Island Interface has been binding for three consecutive hours and a Bergen-Linden derate is pushing internal generation up the heat-rate stack. Watch the 06:30 commercial ramp — if reserves stay tight, expect another print above $5 spread.',
  },
  {
    user: "Who's setting price right now in COMED?",
    ai: 'Wind is on the margin in COMED — 18.4 GW of wind output against 14.2 GW load. LMP suppressed at $32.04 with a 90-min window of negative pricing likely overnight if the cold front holds. MISO export limit is the relief valve.',
  },
  {
    user: 'Is Storm Elliott a useful comp for tonight?',
    ai: 'Risk profile is similar but the system is meaningfully hardened since 2022. CP penalties drove $1.8B of generator pain in 2022/23; forced-outage rates run ~60% lower in cold conditions today thanks to gas-electric coordination upgrades. Tail-risk pricing on the forward curve still under-prices Elliott-class events.',
  },
];

export function AIAssistant() {
  const open = useUIStore((s) => s.aiAssistantOpen);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-label="GridAlpha AI Assistant"
      style={{
        position: 'fixed',
        right: 24,
        bottom: 84,
        width: 360,
        height: 480,
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderTop: `1px solid ${C.borderActive}`,
        borderRadius: R.lg,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9000,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          gap: S.sm,
          padding: `0 ${S.lg}`,
          borderBottom: `1px solid ${C.borderDefault}`,
          fontFamily: F.mono,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textPrimary,
          flexShrink: 0,
        }}
      >
        <StatusDot status="live" />
        <span>GridAlpha AI · Online</span>
      </div>

      {/* Chat history */}
      <div
        style={{
          flex: 1,
          padding: S.lg,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: S.lg,
        }}
      >
        {MOCK_EXCHANGES.map((ex, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
            <div
              style={{
                alignSelf: 'flex-end',
                maxWidth: '80%',
                padding: `${S.sm} ${S.md}`,
                background: C.electricBlueWash,
                border: `1px solid ${C.borderAccent}`,
                borderRadius: R.md,
                fontFamily: F.sans,
                fontSize: 13,
                lineHeight: 1.5,
                color: C.textPrimary,
              }}
            >
              {ex.user}
            </div>
            <div
              style={{
                alignSelf: 'flex-start',
                maxWidth: '90%',
                padding: `${S.sm} ${S.md}`,
                background: C.bgSurface,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: R.md,
                fontFamily: F.sans,
                fontSize: 13,
                lineHeight: 1.5,
                color: C.textSecondary,
              }}
            >
              {ex.ai}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div
        style={{
          height: 48,
          padding: `0 ${S.md}`,
          borderTop: `1px solid ${C.borderDefault}`,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          placeholder="Ask anything about today's market..."
          aria-label="Ask the GridAlpha AI"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: F.sans,
            fontSize: 13,
            color: C.textPrimary,
            caretColor: C.electricBlue,
          }}
        />
      </div>
    </div>
  );
}

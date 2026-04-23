import { C, F, R, S } from '@/design/tokens';

type BadgeSeverity = 'critical' | 'warning';

type Story = {
  source: string;
  timeAgo: string;
  headline: string;
  badge: { label: string; color: BadgeSeverity } | null;
};

const MOCK_STORIES: Story[] = [
  {
    source: 'ERCOT OP',
    timeAgo: '4 MIN AGO',
    headline: 'ERCOT issues Energy Emergency Alert Level 2',
    badge: { label: 'EEA 2', color: 'critical' },
  },
  {
    source: 'PJM OPS',
    timeAgo: '32 MIN AGO',
    headline: 'Homer City 1,884 MW unit forced offline',
    badge: null,
  },
  {
    source: 'FERC',
    timeAgo: '2H AGO',
    headline: 'Order 2023 compliance filings due from 6 ISOs',
    badge: null,
  },
];

function badgeColor(s: BadgeSeverity): string {
  return s === 'critical' ? C.alertCritical : C.falconGold;
}

export function PeregrinePreview() {
  return (
    <div style={{ borderTop: `1px solid ${C.borderDefault}`, paddingTop: S.md }}>
      {/* Eyebrow row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: S.sm,
        }}
      >
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: C.falconGold,
          }}
        >
          PEREGRINE · BREAKING
        </span>
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '10px',
            letterSpacing: '0.08em',
            color: C.electricBlue,
            cursor: 'default',
          }}
        >
          Open Peregrine →
        </span>
      </div>

      {/* Stories */}
      <div>
        {MOCK_STORIES.map((story, i) => {
          const isLast = i === MOCK_STORIES.length - 1;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: `${S.md} 0`,
                borderBottom: isLast ? 'none' : `1px solid ${C.borderDefault}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: S.sm,
                }}
              >
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    color: C.textMuted,
                    background: C.bgElevated,
                    padding: '2px 6px',
                    borderRadius: R.sm,
                    textTransform: 'uppercase',
                  }}
                >
                  {story.source}
                </span>
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: '10px',
                    color: C.textMuted,
                    marginLeft: 'auto',
                    letterSpacing: '0.08em',
                  }}
                >
                  {story.timeAgo}
                </span>
              </div>

              <div
                style={{
                  fontFamily: F.sans,
                  fontSize: '15px',
                  fontWeight: 500,
                  color: C.textPrimary,
                  lineHeight: 1.4,
                }}
              >
                {story.headline}
              </div>

              {story.badge && (
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontFamily: F.mono,
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      color: badgeColor(story.badge.color),
                      padding: '2px 6px',
                      borderRadius: R.sm,
                      border: `1px solid ${badgeColor(story.badge.color)}`,
                      textTransform: 'uppercase',
                    }}
                  >
                    {story.badge.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

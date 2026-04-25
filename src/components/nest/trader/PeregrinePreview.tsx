import { C, F, R, S } from '@/design/tokens';

type BadgeSeverity = 'critical' | 'warning';

type Story = {
  source: string;
  timeAgo: string;
  headline: string;
  summary: string | null;
  badge: { label: string; color: BadgeSeverity } | null;
};

const MOCK_STORIES: Story[] = [
  {
    source: 'ERCOT OP',
    timeAgo: '4 MIN AGO',
    headline: 'ERCOT issues Energy Emergency Alert Level 2',
    summary: 'Reserves below 2,300 MW as North zone load climbs past 78 GW',
    badge: { label: 'EEA 2', color: 'critical' },
  },
  {
    source: 'PJM OPS',
    timeAgo: '32 MIN AGO',
    headline: 'Homer City 1,884 MW unit forced offline',
    summary: null,
    badge: null,
  },
  {
    source: 'FERC',
    timeAgo: '2H AGO',
    headline: 'Order 2023 compliance filings due from 6 ISOs',
    summary: null,
    badge: null,
  },
];

function badgeColor(s: BadgeSeverity): string {
  return s === 'critical' ? C.alertCritical : C.falconGold;
}

function SourcePill({ label }: { label: string }) {
  return (
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
      {label}
    </span>
  );
}

function HeroStory({ story }: { story: Story }) {
  const accent = story.badge ? badgeColor(story.badge.color) : C.alertCritical;
  // Build a faint wash that matches severity (~4% alpha) instead of hardcoding red
  // Critical → red, warning → gold, else electricBlue
  const washStops =
    story.badge?.color === 'warning'
      ? 'rgba(245,158,11,0.04)'
      : story.badge?.color === 'critical'
      ? 'rgba(239,68,68,0.04)'
      : 'rgba(59,130,246,0.04)';
  return (
    <div
      style={{
        padding: S.lg,
        borderBottom: `1px solid ${C.borderDefault}`,
        background: `linear-gradient(135deg, ${washStops} 0%, transparent 60%)`,
        display: 'flex',
        flexDirection: 'column',
        gap: S.sm,
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: S.sm,
        }}
      >
        <SourcePill label={story.source} />
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '10px',
            color: C.textMuted,
            marginLeft: 'auto',
            letterSpacing: '0.08em',
            fontWeight: 400,
          }}
        >
          {story.timeAgo}
        </span>
      </div>

      {/* Headline — sans-serif, NOT Instrument Serif */}
      <div
        style={{
          fontFamily: F.sans,
          fontSize: '18px',
          fontWeight: 500,
          color: C.textPrimary,
          lineHeight: 1.3,
        }}
      >
        {story.headline}
      </div>

      {/* Summary */}
      {story.summary && (
        <div
          style={{
            fontFamily: F.sans,
            fontSize: '13px',
            color: C.textMuted,
            lineHeight: 1.4,
          }}
        >
          {story.summary}
        </div>
      )}

      {/* Severity badge */}
      {story.badge && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: accent,
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: F.mono,
              fontSize: '10px',
              letterSpacing: '0.18em',
              color: accent,
              textTransform: 'uppercase',
            }}
          >
            {story.badge.label}
          </span>
        </div>
      )}
    </div>
  );
}

function CompactStory({
  story,
  isLast,
}: {
  story: Story;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        padding: `${S.md} ${S.lg}`,
        borderBottom: isLast ? 'none' : `1px solid ${C.borderDefault}`,
        display: 'flex',
        alignItems: 'center',
        gap: S.sm,
        minWidth: 0,
      }}
    >
      <SourcePill label={story.source} />
      <span
        style={{
          fontFamily: F.mono,
          fontSize: '10px',
          color: C.textMuted,
          letterSpacing: '0.08em',
          flexShrink: 0,
          fontWeight: 400,
        }}
      >
        {story.timeAgo}
      </span>
      <span
        style={{
          fontFamily: F.sans,
          fontSize: '13px',
          fontWeight: 500,
          color: C.textPrimary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
          flex: 1,
        }}
      >
        {story.headline}
      </span>
    </div>
  );
}

export function PeregrinePreview() {
  const [hero, ...rest] = MOCK_STORIES;
  return (
    <div style={{ borderTop: `1px solid ${C.borderDefault}`, paddingTop: S.md }}>
      {/* Eyebrow row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: S.sm,
          padding: `0 ${S.lg}`,
        }}
      >
        <span
          style={{
            fontFamily: F.mono,
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.18em',
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
            fontWeight: 500,
          }}
        >
          Open Peregrine →
        </span>
      </div>

      {/* Hero */}
      {hero && <HeroStory story={hero} />}

      {/* Compact items */}
      {rest.map((s, i) => (
        <CompactStory key={i} story={s} isLast={i === rest.length - 1} />
      ))}
    </div>
  );
}

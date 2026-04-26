// ATLAS — Vault Alexandria curriculum.
// Concept map (SVG node graph, 18 nodes, 3 tiers) + 3 feature cards.
// SCRIBE: nodes with an authored lesson are clickable and route to the
// lesson viewer; nodes without a lesson dim and show "coming soon" on
// hover. Visited / completed state is read from useProgressStore and
// reflected on each node, plus a LessonProgress strip below the map.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { PageAtmosphere } from '@/components/terminal/PageAtmosphere';
import { ALEXANDRIA_NODES } from '@/lib/mock/vault-mock';
import type { ConceptNode } from '@/lib/types/vault';
import { hasLesson } from '@/lib/curriculum';
import { useProgressStore } from '@/stores/progressStore';
import { LessonProgress } from './LessonProgress';

const NODE_W = 140;
const NODE_H = 60;
const SVG_W  = 1080;
const SVG_H  = 480;

function buildEdges(): Array<{
  from: ConceptNode;
  to: ConceptNode;
  unlocked: boolean;
}> {
  const byId = new Map(ALEXANDRIA_NODES.map((n) => [n.id, n]));
  const edges: Array<{ from: ConceptNode; to: ConceptNode; unlocked: boolean }> = [];
  for (const n of ALEXANDRIA_NODES) {
    for (const pid of n.parents) {
      const p = byId.get(pid);
      if (!p) continue;
      edges.push({ from: p, to: n, unlocked: n.unlocked && p.unlocked });
    }
  }
  return edges;
}

function nodeCenter(n: ConceptNode) {
  return { cx: n.x, cy: n.y };
}

function curvedPath(
  from: { cx: number; cy: number },
  to:   { cx: number; cy: number },
): string {
  // Cubic Bezier — vertical "S" curve between tiers.
  const midY = (from.cy + to.cy) / 2;
  return `M ${from.cx} ${from.cy + NODE_H / 2}
          C ${from.cx} ${midY}, ${to.cx} ${midY}, ${to.cx} ${to.cy - NODE_H / 2}`;
}

function ConceptMap() {
  const edges = buildEdges();
  const navigate = useNavigate();
  const visited = useProgressStore((s) => s.visited);
  const completed = useProgressStore((s) => s.completed);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const handleNodeActivate = (n: ConceptNode) => {
    if (!hasLesson(n.id)) return;
    navigate(`/vault/alexandria/lesson/${n.id}`);
  };

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      {/* Tier band labels */}
      {[
        { y: 80,  label: 'FOUNDATION' },
        { y: 240, label: 'MECHANICS'  },
        { y: 400, label: 'ADVANCED'   },
      ].map((band) => (
        <text
          key={`band-${band.label}`}
          x={16}
          y={band.y + 4}
          fill={C.textMuted}
          fontFamily="'Geist Mono', 'Fira Code', monospace"
          fontSize={9}
          letterSpacing="0.18em"
          opacity={0.5}
        >
          {band.label}
        </text>
      ))}

      {/* Edges */}
      {edges.map((e, i) => {
        const f = nodeCenter(e.from);
        const t = nodeCenter(e.to);
        return (
          <path
            key={`edge-${i}`}
            d={curvedPath(f, t)}
            fill="none"
            stroke={e.unlocked ? 'rgba(59,130,246,0.40)' : 'rgba(255,255,255,0.15)'}
            strokeWidth={1}
          />
        );
      })}

      {/* Nodes */}
      {ALEXANDRIA_NODES.map((n) => {
        const x = n.x - NODE_W / 2;
        const y = n.y - NODE_H / 2;
        const available = hasLesson(n.id);
        const isVisited = visited.has(n.id);
        const isCompleted = completed.has(n.id);
        const isHovered = hoverId === n.id;

        const stroke = available
          ? (isHovered ? C.electricBlueLight : C.electricBlue)
          : (n.unlocked ? 'rgba(59,130,246,0.30)' : 'rgba(255,255,255,0.20)');
        const fill = available
          ? (isHovered ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.10)')
          : (n.unlocked ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.03)');
        const labelColor = available || n.unlocked ? C.textPrimary : C.textMuted;
        const groupOpacity = available ? 1 : 0.5;
        const cursor = available ? 'pointer' : 'not-allowed';
        const tooltip = available ? `Open lesson — ${n.label}` : `${n.label} — Coming soon`;

        return (
          <g
            key={n.id}
            opacity={groupOpacity}
            style={{ cursor, pointerEvents: 'auto' }}
            onClick={() => handleNodeActivate(n)}
            onMouseEnter={() => setHoverId(n.id)}
            onMouseLeave={() => setHoverId((curr) => (curr === n.id ? null : curr))}
            tabIndex={available ? 0 : -1}
            role={available ? 'link' : undefined}
            aria-label={tooltip}
            onKeyDown={(e) => {
              if (!available) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNodeActivate(n);
              }
            }}
          >
            <title>{tooltip}</title>
            {(available || n.unlocked) && (
              <rect
                x={x - 2}
                y={y - 2}
                width={NODE_W + 4}
                height={NODE_H + 4}
                rx={10}
                ry={10}
                fill="none"
                stroke={available && isHovered ? 'rgba(59,130,246,0.55)' : 'rgba(59,130,246,0.20)'}
                strokeWidth={2}
              />
            )}
            <rect
              x={x}
              y={y}
              width={NODE_W}
              height={NODE_H}
              rx={8}
              ry={8}
              fill={fill}
              stroke={stroke}
              strokeWidth={isHovered && available ? 1.5 : 1}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              fill={labelColor}
              fontFamily="'Geist Mono', 'Fira Code', monospace"
              fontSize={11}
              fontWeight={600}
              letterSpacing="0.10em"
              style={{ textTransform: 'uppercase', pointerEvents: 'none' }}
            >
              {n.label.toUpperCase()}
            </text>

            {/* Visited / completed indicator — top-right corner of the node. */}
            {isCompleted ? (
              <g pointerEvents="none">
                <circle cx={x + NODE_W - 8} cy={y + 8} r={5} fill={C.alertNormal} />
                <path
                  d={`M ${x + NODE_W - 10.5} ${y + 8} l 1.8 1.8 l 3.4 -3.4`}
                  stroke={C.bgBase}
                  strokeWidth={1.4}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ) : isVisited ? (
              <circle
                cx={x + NODE_W - 8}
                cy={y + 8}
                r={4}
                fill="none"
                stroke={C.electricBlue}
                strokeWidth={1.5}
                pointerEvents="none"
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function Alexandria() {
  const unlockedCount = ALEXANDRIA_NODES.filter((n) => n.unlocked).length;
  const totalCount = ALEXANDRIA_NODES.length;

  return (
    <PageAtmosphere>
      <div style={{ padding: S.xl }}>
        {/* Page header */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'flex-end',
            marginBottom:   S.xxl,
            gap:            S.lg,
          }}
        >
          <div>
            <div
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                fontWeight:    600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         C.electricBlue,
                marginBottom:  S.xs,
              }}
            >
              02 · CURRICULUM
            </div>
            <div
              style={{
                fontFamily:    F.display,
                fontSize:      48,
                lineHeight:    1.05,
                color:         C.textPrimary,
                fontWeight:    400,
                letterSpacing: '-0.02em',
                marginBottom:  S.sm,
              }}
            >
              Alexandria.
            </div>
            <div
              style={{
                fontFamily:    F.display,
                fontSize:      24,
                fontStyle:     'italic',
                color:         'rgba(255,255,255,0.45)',
                fontWeight:    400,
                lineHeight:    1.3,
                maxWidth:      640,
              }}
            >
              The energy industry's library.
            </div>
          </div>
          <div
            style={{
              display:        'flex',
              flexDirection:  'column',
              gap:            S.xs,
              alignItems:     'flex-end',
              padding:        `${S.sm} ${S.md}`,
              border:         `1px solid ${C.borderDefault}`,
              borderRadius:   R.md,
              background:     C.bgElevated,
            }}
          >
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      10,
                color:         C.textMuted,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
              }}
            >
              Progress
            </span>
            <span
              style={{
                fontFamily:         F.mono,
                fontSize:           18,
                fontWeight:         700,
                color:              C.electricBlue,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {unlockedCount} / {totalCount} unlocked
            </span>
          </div>
        </div>

        {/* Concept map */}
        <ContainedCard style={{ marginBottom: S.xl, height: 600 }}>
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              marginBottom:   S.md,
            }}
          >
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                fontWeight:    600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         C.electricBlue,
              }}
            >
              CONCEPT MAP · 18 NODES · 3 TIERS
            </span>
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                color:         'rgba(245,158,11,0.65)',
                letterSpacing: '0.08em',
              }}
            >
              FOLLOW THE BLUE
            </span>
          </div>
          <div style={{ height: 'calc(100% - 32px)', minHeight: 0 }}>
            <ConceptMap />
          </div>
        </ContainedCard>

        {/* Reading progress strip — visited / completed cells */}
        <LessonProgress />

        {/* Feature cards row */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap:                 S.md,
          }}
        >
          <SandboxCard />
          <InterviewPrepCard />
          <CohortsCard />
        </div>
      </div>
    </PageAtmosphere>
  );
}

function SandboxCard() {
  return (
    <ContainedCard style={{ height: 280, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      11,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         C.electricBlue,
          marginBottom:  S.xs,
        }}
      >
        SANDBOX MODE
      </div>
      <EditorialIdentity size="section" marginBottom={S.md}>Practice trading.</EditorialIdentity>
      <div
        style={{
          fontFamily:   F.sans,
          fontSize:     14,
          color:        C.textSecondary,
          lineHeight:   1.5,
          marginBottom: S.md,
        }}
      >
        Practice on historical PJM data without real-money risk.
      </div>
      <div
        style={{
          flex:         1,
          background:   'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(245,158,11,0.10) 100%)',
          border:       `1px solid ${C.borderDefault}`,
          borderRadius: R.md,
          minHeight:    72,
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          fontFamily:   F.mono,
          fontSize:     10,
          color:        C.textMuted,
          letterSpacing:'0.12em',
        }}
      >
        SESSION PREVIEW · 2025-08-04 PSEG
      </div>
      <button
        type="button"
        style={{
          marginTop:      S.md,
          alignSelf:      'flex-start',
          fontFamily:     F.mono,
          fontSize:       11,
          fontWeight:     600,
          letterSpacing:  '0.10em',
          textTransform:  'uppercase',
          color:          C.electricBlue,
          background:     'transparent',
          border:         `1px solid ${C.borderActive}`,
          borderRadius:   R.md,
          padding:        `${S.sm} ${S.md}`,
          cursor:         'pointer',
        }}
      >
        Continue session →
      </button>
    </ContainedCard>
  );
}

const INTERVIEW_QUESTIONS = [
  'Why does PJM-East basis blow out in summer evenings?',
  'How does ELCC change the value proposition for new battery storage?',
  'What forced PJM\'s 2025/26 BRA to clear at $269.92/MW-day?',
];

function InterviewPrepCard() {
  return (
    <ContainedCard style={{ height: 280, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      11,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         C.electricBlue,
          marginBottom:  S.xs,
        }}
      >
        INTERVIEW PREP
      </div>
      <EditorialIdentity size="section" marginBottom={S.md}>5 questions this week.</EditorialIdentity>
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm, flex: 1 }}>
        {INTERVIEW_QUESTIONS.map((q, i) => (
          <div
            key={i}
            style={{
              display:        'flex',
              alignItems:     'flex-start',
              gap:            S.sm,
              fontFamily:     F.sans,
              fontSize:       13,
              color:          C.textSecondary,
              lineHeight:     1.4,
            }}
          >
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      10,
                fontWeight:    700,
                color:         C.falconGold,
                letterSpacing: '0.06em',
                flexShrink:    0,
                paddingTop:    2,
              }}
            >
              0{i + 1}
            </span>
            <span>{q}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        style={{
          marginTop:      S.md,
          alignSelf:      'flex-start',
          fontFamily:     F.mono,
          fontSize:       11,
          fontWeight:     600,
          letterSpacing:  '0.10em',
          textTransform:  'uppercase',
          color:          C.electricBlue,
          background:     'transparent',
          border:         `1px solid ${C.borderActive}`,
          borderRadius:   R.md,
          padding:        `${S.sm} ${S.md}`,
          cursor:         'pointer',
        }}
      >
        Start practice →
      </button>
    </ContainedCard>
  );
}

const COHORT_MEMBERS = [
  { name: 'Maya R.',   progress: 0.84 },
  { name: 'Devon T.',  progress: 0.62 },
  { name: 'Sara K.',   progress: 0.55 },
  { name: 'You',       progress: 0.32 },
];

function CohortsCard() {
  return (
    <ContainedCard style={{ height: 280, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      11,
          fontWeight:    600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         C.electricBlue,
          marginBottom:  S.xs,
        }}
      >
        COHORTS
      </div>
      <EditorialIdentity size="section" marginBottom={S.md}>Your study group.</EditorialIdentity>
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm, flex: 1 }}>
        {COHORT_MEMBERS.map((m) => {
          const isYou = m.name === 'You';
          return (
            <div
              key={m.name}
              style={{
                display:             'grid',
                gridTemplateColumns: '90px 1fr 40px',
                alignItems:          'center',
                gap:                 S.sm,
              }}
            >
              <span
                style={{
                  fontFamily:    F.mono,
                  fontSize:      11,
                  fontWeight:    isYou ? 700 : 500,
                  color:         isYou ? C.falconGold : C.textPrimary,
                  letterSpacing: '0.06em',
                }}
              >
                {m.name}
              </span>
              <div
                style={{
                  height:       4,
                  background:   C.bgSurface,
                  borderRadius: 2,
                  overflow:     'hidden',
                }}
              >
                <div
                  style={{
                    width:      `${Math.round(m.progress * 100)}%`,
                    height:     '100%',
                    background: isYou ? C.falconGold : C.electricBlue,
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily:         F.mono,
                  fontSize:           11,
                  color:              C.textMuted,
                  fontVariantNumeric: 'tabular-nums',
                  textAlign:          'right',
                }}
              >
                {Math.round(m.progress * 100)}%
              </span>
            </div>
          );
        })}
      </div>
      <Link
        to="/vault/alexandria"
        style={{
          marginTop:      S.md,
          alignSelf:      'flex-start',
          fontFamily:     F.mono,
          fontSize:       11,
          fontWeight:     600,
          letterSpacing:  '0.10em',
          textTransform:  'uppercase',
          color:          C.falconGold,
          textDecoration: 'none',
        }}
      >
        Weekly challenge →
      </Link>
    </ContainedCard>
  );
}

export default Alexandria;

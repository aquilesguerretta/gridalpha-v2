// SCRIBE — Alexandria progress strip.
// Renders below the concept map. Reads useProgressStore for visited /
// completed counts and shows one cell per ALEXANDRIA_NODE.

import { useMemo } from 'react';
import { C, F, S } from '@/design/tokens';
import { ALEXANDRIA_NODES } from '@/lib/mock/vault-mock';
import { hasLesson } from '@/lib/curriculum';
import { useProgressStore } from '@/stores/progressStore';

const CELL_SIZE = 14;
const CELL_GAP = 6;

export function LessonProgress() {
  const visited = useProgressStore((s) => s.visited);
  const completed = useProgressStore((s) => s.completed);

  const counts = useMemo(() => {
    let visitedCount = 0;
    let completedCount = 0;
    for (const node of ALEXANDRIA_NODES) {
      if (visited.has(node.id)) visitedCount += 1;
      if (completed.has(node.id)) completedCount += 1;
    }
    return { visited: visitedCount, completed: completedCount, total: ALEXANDRIA_NODES.length };
  }, [visited, completed]);

  return (
    <div
      style={{
        marginTop:    S.lg,
        padding:      `${S.md} ${S.lg}`,
        background:   C.bgElevated,
        border:       `1px solid ${C.borderDefault}`,
        borderTop:    `1px solid ${C.borderAccent}`,
        borderRadius: 8,
        display:      'flex',
        flexDirection: 'column',
        gap:          S.md,
      }}
    >
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'baseline',
          gap:            S.md,
          flexWrap:       'wrap',
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
          Your progress
        </span>
        <span
          style={{
            fontFamily:         F.mono,
            fontSize:           11,
            color:              C.textSecondary,
            letterSpacing:      '0.06em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {counts.visited} of {counts.total} visited · {counts.completed} of {counts.total} completed
        </span>
      </div>

      <div
        style={{
          display:             'grid',
          gridTemplateColumns: `repeat(${ALEXANDRIA_NODES.length}, ${CELL_SIZE}px)`,
          gap:                 CELL_GAP,
          alignItems:          'center',
        }}
      >
        {ALEXANDRIA_NODES.map((node) => {
          const isVisited = visited.has(node.id);
          const isCompleted = completed.has(node.id);
          const lessonExists = hasLesson(node.id);
          return (
            <ProgressCell
              key={node.id}
              title={`${node.label}${lessonExists ? '' : ' — coming soon'}`}
              visited={isVisited}
              completed={isCompleted}
              lessonExists={lessonExists}
            />
          );
        })}
      </div>
    </div>
  );
}

function ProgressCell({
  title,
  visited,
  completed,
  lessonExists,
}: {
  title: string;
  visited: boolean;
  completed: boolean;
  lessonExists: boolean;
}) {
  const background = (() => {
    if (completed) return C.electricBlue;
    if (visited) return 'rgba(59,130,246,0.10)';
    return 'transparent';
  })();
  const borderColor = (() => {
    if (completed) return C.electricBlue;
    if (visited) return C.electricBlue;
    if (lessonExists) return C.borderStrong;
    return C.borderDefault;
  })();
  return (
    <span
      title={title}
      aria-label={title}
      style={{
        width:        CELL_SIZE,
        height:       CELL_SIZE,
        borderRadius: 3,
        background,
        border:       `1px solid ${borderColor}`,
        opacity:      lessonExists ? 1 : 0.5,
        display:      'inline-block',
      }}
    />
  );
}

export default LessonProgress;

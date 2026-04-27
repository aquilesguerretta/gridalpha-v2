// SCRIBE — Alexandria progress strip.
// Renders below the concept map. Counts BOTH:
//   (a) Lesson-format nodes (the original 18 ConceptNodes), and
//   (b) CurriculumEntry-format nodes (the 6 Sub-Tier 1A entries).
// Total is unified to 24. Cells for new entries get a falcon-gold border
// accent so the new tier is visually distinguishable in the strip.

import { useMemo } from 'react';
import { C, F, S } from '@/design/tokens';
import {
  ALEXANDRIA_NODES,
  FOUNDATIONS_OF_ENERGY_NODES,
} from '@/lib/mock/vault-mock';
import { hasLesson } from '@/lib/curriculum';
import { hasEntry } from '@/lib/curriculum/entriesIndex';
import { useProgressStore } from '@/stores/progressStore';

const CELL_SIZE = 14;
const CELL_GAP = 6;

interface UnifiedCell {
  id: string;
  label: string;
  available: boolean;
  visited: boolean;
  completed: boolean;
  /** true → new Sub-Tier 1A entry (gold accent); false → original Lesson. */
  isEntry: boolean;
}

export function LessonProgress() {
  const visited = useProgressStore((s) => s.visited);
  const completed = useProgressStore((s) => s.completed);
  const visitedLayers = useProgressStore((s) => s.visitedLayers);
  const ackd = useProgressStore((s) => s.retrievalAcknowledged);

  const cells = useMemo<UnifiedCell[]>(() => {
    const entryCells: UnifiedCell[] = FOUNDATIONS_OF_ENERGY_NODES.map((n) => {
      const layers = visitedLayers[n.id] ?? [];
      const isVisited = layers.includes('L1');
      const isCompleted =
        ackd[`${n.id}:L2`] === true || layers.length === 3;
      return {
        id:        n.id,
        label:     n.label,
        available: hasEntry(n.id),
        visited:   isVisited,
        completed: isCompleted,
        isEntry:   true,
      };
    });
    const lessonCells: UnifiedCell[] = ALEXANDRIA_NODES.map((n) => ({
      id:        n.id,
      label:     n.label,
      available: hasLesson(n.id),
      visited:   visited.has(n.id),
      completed: completed.has(n.id),
      isEntry:   false,
    }));
    return [...entryCells, ...lessonCells];
  }, [visited, completed, visitedLayers, ackd]);

  const counts = useMemo(() => {
    let v = 0;
    let c = 0;
    for (const cell of cells) {
      if (cell.visited) v += 1;
      if (cell.completed) c += 1;
    }
    return { visited: v, completed: c, total: cells.length };
  }, [cells]);

  return (
    <div
      style={{
        marginBottom: S.xl,
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
          {counts.visited} of {counts.total} visited · {counts.completed} of{' '}
          {counts.total} completed
        </span>
      </div>

      <div
        style={{
          display:             'grid',
          gridTemplateColumns: `repeat(${cells.length}, ${CELL_SIZE}px)`,
          gap:                 CELL_GAP,
          alignItems:          'center',
        }}
      >
        {cells.map((cell) => (
          <ProgressCell
            key={cell.id}
            title={`${cell.label}${cell.available ? '' : ' — coming soon'}`}
            visited={cell.visited}
            completed={cell.completed}
            available={cell.available}
            isEntry={cell.isEntry}
          />
        ))}
      </div>
    </div>
  );
}

function ProgressCell({
  title,
  visited,
  completed,
  available,
  isEntry,
}: {
  title: string;
  visited: boolean;
  completed: boolean;
  available: boolean;
  isEntry: boolean;
}) {
  const accent = isEntry ? C.falconGold : C.electricBlue;
  const wash = isEntry ? 'rgba(245,158,11,0.10)' : 'rgba(59,130,246,0.10)';

  const background = (() => {
    if (completed) return accent;
    if (visited) return wash;
    return 'transparent';
  })();
  const borderColor = (() => {
    if (completed || visited) return accent;
    if (available) return isEntry ? 'rgba(245,158,11,0.30)' : C.borderStrong;
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
        opacity:      available ? 1 : 0.5,
        display:      'inline-block',
      }}
    />
  );
}

export default LessonProgress;

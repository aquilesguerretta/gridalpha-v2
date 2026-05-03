// SCRIBE — Alexandria curriculum barrel + lookup helpers.
// Each lesson id matches a ConceptNode id in ALEXANDRIA_NODES. Adding a new
// lesson is two steps: drop a new file in ./lessons/ and register it here.
//
// ORACLE Wave 3 — also exposes listRetrievalPromptInstances() that walks
// SCRIBE's Sub-Tier 1A entries and surfaces every (entrySlug, layer) pair
// with a retrieval prompt as a RetrievalPromptInstance ready for grading.

import type {
  CurriculumEntry,
  EntryLayerContent,
  Lesson,
  LayerKey,
} from '@/lib/types/curriculum';
import type { RetrievalPromptInstance } from '@/lib/types/grading';
import { listEntries } from './entriesIndex';
import { whatIsElectricity } from './lessons/what-is-electricity';
import { theGrid } from './lessons/the-grid';
import { supplyAndDemand } from './lessons/supply-and-demand';
import { isosAndRtos } from './lessons/isos-and-rtos';

export const LESSONS: Record<string, Lesson> = {
  [whatIsElectricity.id]: whatIsElectricity,
  [theGrid.id]: theGrid,
  [supplyAndDemand.id]: supplyAndDemand,
  [isosAndRtos.id]: isosAndRtos,
};

export function getLesson(id: string): Lesson | null {
  return LESSONS[id] ?? null;
}

export function listLessons(): Lesson[] {
  return Object.values(LESSONS);
}

export function hasLesson(id: string): boolean {
  return id in LESSONS;
}

export function getNextLesson(currentId: string): Lesson | null {
  const current = LESSONS[currentId];
  if (!current?.nextLessonId) return null;
  return LESSONS[current.nextLessonId] ?? null;
}

// ─── ORACLE Wave 3 — retrieval-prompt instances ──────────────────────

const LAYERS: LayerKey[] = ['L1', 'L2', 'L3'];

/**
 * Build a RetrievalPromptInstance for one (entry, layer) pair.
 * Exposed individually so the Entry component can pass the same
 * instance to both the SCRIBE component and the ORACLE Grader.
 */
export function buildRetrievalPromptInstance(
  entry: CurriculumEntry,
  layer: LayerKey,
): RetrievalPromptInstance | null {
  const content = entry.layers[layer] as EntryLayerContent | undefined;
  if (!content?.retrievalPrompt) return null;

  return {
    promptId:        `${entry.id}:${layer}`,
    entrySlug:       entry.id,
    entryTitle:      entry.title,
    layer,
    questionText:    content.retrievalPrompt,
    expectedConcepts: deriveExpectedConcepts(entry, layer),
    rubric:           buildRubric(entry, layer),
  };
}

/**
 * Walk every Sub-Tier 1A entry and emit a RetrievalPromptInstance for
 * each (entry, layer) pair that carries a retrieval prompt. Used by the
 * recall queue and the recall session.
 */
export function listRetrievalPromptInstances(): RetrievalPromptInstance[] {
  const out: RetrievalPromptInstance[] = [];
  for (const entry of listEntries()) {
    for (const layer of LAYERS) {
      const instance = buildRetrievalPromptInstance(entry, layer);
      if (instance) out.push(instance);
    }
  }
  return out;
}

// ─── Heuristic helpers (no curriculum-content edits) ────────────────

/**
 * Derive a small list of "expected concepts" the answer should reference.
 * The curriculum doesn't carry an explicit list, so we draw from:
 *   - the threshold concept's noun phrases (split on punctuation)
 *   - the entry title
 * The grader uses these as guidance, not a hard checklist.
 */
function deriveExpectedConcepts(
  entry: CurriculumEntry,
  _layer: LayerKey,
): string[] {
  const fragments = entry.thresholdConcept
    .split(/[;,.]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 120);
  // Cap to keep the prompt small.
  const concepts = [entry.title, ...fragments].slice(0, 4);
  return Array.from(new Set(concepts));
}

/**
 * Build a per-layer rubric paragraph the grader uses as a guide. The
 * rubric pulls in the entry's threshold concept and the misconception
 * the entry exists to defeat — the grader weights them appropriately
 * for the layer.
 */
function buildRubric(entry: CurriculumEntry, layer: LayerKey): string {
  const layerExpectation: Record<LayerKey, string> = {
    L1:
      'Layer 1 = intuition. The answer should demonstrate the student grasps the' +
      ' central idea in plain language. Precision matters less than recognition.',
    L2:
      'Layer 2 = mechanism. The answer should show the student can apply the' +
      ' concept — not just recognise it. Look for cause-and-effect reasoning.',
    L3:
      'Layer 3 = practitioner. The answer should integrate the concept into' +
      ' real-world energy market reasoning with quantitative or institutional' +
      ' specifics.',
  };

  return [
    layerExpectation[layer],
    `Threshold concept the entry teaches: ${entry.thresholdConcept}`,
    `Misconception this entry exists to defeat: ${entry.misconceptionDefeated}`,
    'Grade against whether the answer either lands the threshold concept or actively rebuts the misconception.',
  ].join(' ');
}

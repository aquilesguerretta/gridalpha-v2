// SCRIBE — Alexandria curriculum barrel + lookup helpers.
// Each lesson id matches a ConceptNode id in ALEXANDRIA_NODES. Adding a new
// lesson is two steps: drop a new file in ./lessons/ and register it here.

import type { Lesson } from '@/lib/types/curriculum';
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

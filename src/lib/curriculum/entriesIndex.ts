// SCRIBE — Sub-Tier 1A "Foundations of Energy" entry registry.
// Parallel to ./index.ts (which serves the original 4 Lesson-format entries).
// Adding a new entry: drop a file in ./entries/ exporting a CurriculumEntry,
// import it here, and add it to ENTRIES.

import type { CurriculumEntry } from '@/lib/types/curriculum';
import { whatIsEnergy } from './entries/what-is-energy';
import { powerVsEnergy } from './entries/power-vs-energy';
import { formsOfEnergy } from './entries/forms-of-energy';
import { unitsAndOrdersOfMagnitude } from './entries/units-and-orders-of-magnitude';
import { entropyAndSecondLaw } from './entries/entropy-and-second-law';
import { efficiency } from './entries/efficiency';

export const ENTRIES: Record<string, CurriculumEntry> = {
  [whatIsEnergy.id]: whatIsEnergy,
  [powerVsEnergy.id]: powerVsEnergy,
  [formsOfEnergy.id]: formsOfEnergy,
  [unitsAndOrdersOfMagnitude.id]: unitsAndOrdersOfMagnitude,
  [entropyAndSecondLaw.id]: entropyAndSecondLaw,
  [efficiency.id]: efficiency,
};

export function getEntry(id: string): CurriculumEntry | null {
  return ENTRIES[id] ?? null;
}

export function listEntries(): CurriculumEntry[] {
  return Object.values(ENTRIES);
}

export function hasEntry(id: string): boolean {
  return id in ENTRIES;
}

export function getNextEntry(currentId: string): CurriculumEntry | null {
  const all = listEntries().sort((a, b) => a.number - b.number);
  const idx = all.findIndex((e) => e.id === currentId);
  if (idx < 0 || idx === all.length - 1) return null;
  return all[idx + 1];
}

export function getPrevEntry(currentId: string): CurriculumEntry | null {
  const all = listEntries().sort((a, b) => a.number - b.number);
  const idx = all.findIndex((e) => e.id === currentId);
  if (idx <= 0) return null;
  return all[idx - 1];
}

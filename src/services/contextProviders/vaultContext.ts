// ORACLE Wave 2 — Vault context providers.
//
// One file covers all five Vault surfaces (index, alexandria, lesson,
// entry, case-study) because they share the same underlying mocks and
// curriculum APIs. Each is a separate exported provider so the
// PROVIDER_REGISTRY can dispatch on SurfaceKey directly.

import type { ContextProvider } from '../aiContext';
import { CASE_STUDIES, ALEXANDRIA_NODES, FOUNDATIONS_OF_ENERGY_NODES } from '@/lib/mock/vault-mock';
import { getLesson } from '@/lib/curriculum';
import { getEntry } from '@/lib/curriculum/entriesIndex';

// Pull the focused entity id from the URL pathname. Vault routes follow the
// shape `/vault/alexandria/{lesson|entry}/<slug>` or `/vault/<caseStudyId>`.
function trailingSegment(pathname: string, prefix: string): string | undefined {
  const trimmed = pathname.replace(/\/+$/, '');
  const idx = trimmed.indexOf(prefix);
  if (idx === -1) return undefined;
  const tail = trimmed.slice(idx + prefix.length);
  return tail.length > 0 ? tail : undefined;
}

export const vaultIndexContextProvider: ContextProvider = (input) => {
  const description =
    `Vault index. The user is browsing the case-study library and ` +
    `Alexandria curriculum entry point. ${CASE_STUDIES.length} case studies ` +
    `available across heatwaves, scarcity events, basis blowouts, and ` +
    `capacity-market shortages. Alexandria has ` +
    `${FOUNDATIONS_OF_ENERGY_NODES.length} Foundations-of-Energy entries ` +
    `and ${ALEXANDRIA_NODES.length} foundation/mechanics/advanced concept nodes.`;

  return {
    surfaceLabel: 'Vault',
    selectedZone: input.selectedZone ?? null,
    visibleData: {
      description,
      metrics: {
        caseStudies: CASE_STUDIES.length,
        alexandriaNodes: ALEXANDRIA_NODES.length,
        foundationsEntries: FOUNDATIONS_OF_ENERGY_NODES.length,
      },
    },
  };
};

export const vaultAlexandriaContextProvider: ContextProvider = (input) => {
  const description =
    `Vault · Alexandria concept map. The user is browsing the curriculum ` +
    `graph (Foundations of Energy, Foundation, Mechanics, Advanced tiers). ` +
    `Each node maps to a lesson or a Sub-Tier 1A entry; clicking a node ` +
    `opens it. The user is exploring how energy concepts relate to each other.`;

  return {
    surfaceLabel: 'Vault · Alexandria',
    selectedZone: input.selectedZone ?? null,
    visibleData: {
      description,
      metrics: {
        totalNodes: ALEXANDRIA_NODES.length + FOUNDATIONS_OF_ENERGY_NODES.length,
      },
    },
  };
};

export const vaultLessonContextProvider: ContextProvider = (input) => {
  const slug = trailingSegment(input.pathname, '/alexandria/lesson/');
  const lesson = slug ? getLesson(slug) : null;

  const description = lesson
    ? `Vault · Alexandria lesson "${lesson.title}" (${lesson.difficulty}). ` +
      `Reading time ~${lesson.readingMinutes} min. ` +
      `Sections: ${lesson.sections.map((s) => s.heading).join('; ')}. ` +
      `Quiz at the end (5 questions). Related concepts the lesson links ` +
      `to: ${lesson.relatedConcepts.join(', ') || 'none'}.`
    : `Vault · Alexandria lesson viewer (lesson not yet authored).`;

  return {
    surfaceLabel: 'Vault · Lesson',
    selectedZone: input.selectedZone ?? null,
    currentItemId: lesson?.id ?? slug,
    currentItemTitle: lesson?.title,
    visibleData: {
      description,
      metrics: lesson
        ? {
            difficulty: lesson.difficulty,
            readingMinutes: lesson.readingMinutes,
            sections: lesson.sections.length,
          }
        : undefined,
    },
  };
};

export const vaultEntryContextProvider: ContextProvider = (input) => {
  const slug = trailingSegment(input.pathname, '/alexandria/entry/');
  const entry = slug ? getEntry(slug) : null;
  const layerRaw = input.searchParams.layer ?? 'L1';
  const layer: 'L1' | 'L2' | 'L3' =
    layerRaw === 'L2' || layerRaw === 'L3' ? layerRaw : 'L1';

  const description = entry
    ? `Vault · Alexandria entry "${entry.title}" — currently reading layer ` +
      `${layer} (${layer === 'L1' ? 'intuition' : layer === 'L2' ? 'mechanism' : 'practitioner'}). ` +
      `Threshold concept: ${entry.thresholdConcept} ` +
      `Misconception this entry defeats: ${entry.misconceptionDefeated}.`
    : `Vault · Alexandria entry viewer (entry not yet authored).`;

  return {
    surfaceLabel: 'Vault · Entry',
    selectedZone: input.selectedZone ?? null,
    currentItemId: entry?.id ?? slug,
    currentItemTitle: entry?.title,
    currentLayer: layer,
    visibleData: {
      description,
      metrics: entry
        ? {
            tier: entry.tier,
            subTier: entry.subTier,
            entryNumber: entry.number,
            readingMinutes: entry.estimatedReadingTime?.[layer] ?? 0,
          }
        : undefined,
    },
  };
};

export const vaultCaseStudyContextProvider: ContextProvider = (input) => {
  const trimmed = input.pathname.replace(/\/+$/, '');
  const idx = trimmed.lastIndexOf('/vault/');
  const id = idx === -1 ? '' : trimmed.slice(idx + '/vault/'.length);
  const study = CASE_STUDIES.find((c) => c.id === id);

  const description = study
    ? `Vault · Case study "${study.title}" (${study.date}, ${study.region}, ` +
      `severity ${study.severity}). ${study.headline} ` +
      `Key metrics: ${study.metrics.map((m) => `${m.label}=${m.value}`).join(', ')}. ` +
      `What happened: ${study.whatHappened.slice(0, 200)}…`
    : `Vault · Case study viewer (case study not found).`;

  return {
    surfaceLabel: 'Vault · Case Study',
    selectedZone: input.selectedZone ?? null,
    currentItemId: study?.id ?? id,
    currentItemTitle: study?.title,
    visibleData: {
      description,
      metrics: study
        ? {
            date: study.date,
            region: study.region,
            severity: study.severity,
            category: study.category,
          }
        : undefined,
    },
  };
};

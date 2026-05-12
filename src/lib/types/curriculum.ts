// SCRIBE — Alexandria curriculum types.
//
// Two coexisting schemas:
// 1. Lesson / LessonSection / LessonDiagram / Quiz* — backs the original
//    4 foundation lessons (what-is-electricity, the-grid, supply-and-demand,
//    isos-and-rtos). Locked.
// 2. CurriculumEntry / EntryLayerContent / EntryExample / etc. — backs the
//    new Sub-Tier 1A "Foundations of Energy" entries (six entries authored
//    by the curriculum author, rendered verbatim by SCRIBE).

import type { AudienceArchetype } from './audience';

export type LessonDifficulty = 'foundation' | 'mechanics' | 'advanced';

export interface QuizOption {
  id: string;
  text: string;
  correct: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

export interface LessonSection {
  /** A subhead for navigation; rendered as italic gray serif identity line. */
  heading: string;
  /** Body content as plain text. Use \n\n for paragraph breaks. */
  content: string;
}

export interface LessonDiagram {
  /** Inline SVG markup or a placeholder description. */
  type: 'svg' | 'placeholder';
  /** SVG markup if type is 'svg'. */
  svg?: string;
  /** Caption rendered below the diagram. */
  caption: string;
  /** Short note explaining the diagram for screen readers / fallback. */
  altText: string;
}

export interface Lesson {
  /** Matches ConceptNode.id from ALEXANDRIA_NODES. */
  id: string;
  /** Concept label, mirrors the node label. */
  title: string;
  /** Foundation, mechanics, or advanced. */
  difficulty: LessonDifficulty;
  /** Estimated reading time in minutes. */
  readingMinutes: number;
  /** Short hook shown above the title. */
  eyebrow: string;
  /** Italic gray serif identity line below the title. */
  identity: string;
  /** Ordered narrative sections. */
  sections: LessonSection[];
  /** One diagram per lesson — renders between sections per the design pattern. */
  diagram: LessonDiagram;
  /** Five-question quiz. */
  quiz: QuizQuestion[];
  /** IDs of related concepts (matches other ConceptNode.id values). */
  relatedConcepts: string[];
  /** ID of the next recommended lesson. */
  nextLessonId: string | null;
}

// ── Sub-Tier 1A "Foundations of Energy" entry schema ──────────────────────

export type LayerKey = 'L1' | 'L2' | 'L3';

export interface EntryExample {
  id: string;
  title: string;
  body: string;
  audienceTags: AudienceArchetype[];
}

export interface EntryWidgetInput {
  name: string;
  unit?: string;
  type: 'number' | 'select';
  range?: [number, number];
  default?: number | string;
  options?: string[];
}

export interface EntryWidgetOutput {
  name: string;
  unit?: string;
  computation: string;
}

export interface EntryWidgetSpec {
  type: 'slider-set' | 'unit-converter' | 'comparator' | 'calculator';
  description: string;
  inputs: EntryWidgetInput[];
  outputs: EntryWidgetOutput[];
}

export interface EntryWorkedExample {
  id: string;
  title: string;
  body: string;
  widgetSpec?: EntryWidgetSpec;
}

export interface EntryPrimarySource {
  citation: string;
  type: 'book' | 'paper' | 'manual' | 'order' | 'standard' | 'data-source';
  link?: string;
}

export interface EntryLayerContent {
  body: string;
  retrievalPrompt?: string;
  examples?: EntryExample[];
  workedExample?: EntryWorkedExample;
  primarySources?: EntryPrimarySource[];
  closingAnchor?: string;
}

export interface EntryDiagramSpec {
  title: string;
  description: string;
  layerProgression: {
    L1: string;
    L2: string;
    L3: string;
  };
  designNotes: string;
  /** Component name from src/lib/curriculum/diagrams/ that renders this diagram. */
  componentName: string;
}

export interface CurriculumEntry {
  /** URL-safe slug; matches ConceptNode.id in FOUNDATIONS_OF_ENERGY_NODES. */
  id: string;
  /** Sequence within sub-tier (1..6 for Sub-Tier 1A). */
  number: number;
  title: string;
  tier: 1 | 2 | 3 | 4 | 5;
  phase: 1 | 2 | 3 | 4 | 5;
  /** e.g. "1A". */
  subTier: string;
  thresholdConcept: string;
  misconceptionDefeated: string;
  /** Entry IDs that should be read first. */
  prerequisites: string[];
  /** Phase 1 / 1A entries are foundational, not technology-specific — null. */
  transformationChain: string | null;
  diagramSpec: EntryDiagramSpec;
  layers: {
    L1: EntryLayerContent;
    L2: EntryLayerContent;
    L3: EntryLayerContent;
  };
  estimatedReadingTime: {
    L1: number;
    L2: number;
    L3: number;
  };
}

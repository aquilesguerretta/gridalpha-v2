// SCRIBE — Alexandria curriculum types.
// Backs the lesson engine: structured content + diagram + 5-question quiz,
// keyed off the same id as the corresponding ConceptNode in ALEXANDRIA_NODES.

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

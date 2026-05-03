// ORACLE Wave 3 — parse the grader's JSON response.
//
// Sonnet usually emits clean JSON when instructed, but it occasionally:
//   - wraps the object in ```json ... ``` fences,
//   - emits trailing commas (rare for Sonnet, more common for Haiku),
//   - prefixes a one-liner like "Here is the grade:" before the JSON,
//   - swaps quote styles (single vs double) inside string values.
//
// The parser handles each of those defensively. On unrecoverable input it
// returns a structured error so the caller can show "system error, please
// try again" without blowing the panel up.

import type { GradeLevel, GradedAnswer } from '@/lib/types/grading';

interface RawGraderResponse {
  grade?: unknown;
  conceptsHit?: unknown;
  conceptsMissed?: unknown;
  feedback?: unknown;
  pointerToSection?: unknown;
}

const VALID_GRADES: GradeLevel[] = ['poor', 'partial', 'strong', 'excellent'];

export type ParseResult =
  | { ok: true; grade: ParsedGrade }
  | { ok: false; error: string };

/** Subset of GradedAnswer that comes from the model — no metadata yet. */
export interface ParsedGrade {
  grade: GradeLevel;
  conceptsHit: string[];
  conceptsMissed: string[];
  feedback: string;
  pointerToSection?: string;
}

/**
 * Parse the model's response into a ParsedGrade. Returns a structured
 * error rather than throwing — the caller decides how to surface it.
 */
export function parseGraderResponse(raw: string): ParseResult {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, error: 'Empty grader response.' };
  }

  const candidate = stripWrappers(raw);

  let parsed: RawGraderResponse;
  try {
    parsed = JSON.parse(candidate) as RawGraderResponse;
  } catch {
    // Try one more time with trailing-comma cleanup.
    try {
      parsed = JSON.parse(removeTrailingCommas(candidate)) as RawGraderResponse;
    } catch {
      return {
        ok: false,
        error: 'Grader returned non-JSON output. Please try again.',
      };
    }
  }

  return validateAndCoerce(parsed);
}

/**
 * Strip code fences, leading prose, and outer whitespace. We aim to
 * land on the largest balanced `{ ... }` block in the input.
 */
function stripWrappers(input: string): string {
  let s = input.trim();

  // Strip ```json ... ``` or ``` ... ``` fences if present.
  const fenceMatch = /```(?:json)?\s*([\s\S]*?)\s*```/i.exec(s);
  if (fenceMatch) {
    s = fenceMatch[1].trim();
  }

  // If there's still surrounding prose, find the outermost balanced
  // braces. This handles "Here is the grade: { ... }".
  const open = s.indexOf('{');
  const close = s.lastIndexOf('}');
  if (open !== -1 && close !== -1 && close > open) {
    s = s.slice(open, close + 1);
  }

  return s.trim();
}

/** Remove trailing commas before `}` or `]`. Cheap and good enough. */
function removeTrailingCommas(input: string): string {
  return input.replace(/,(\s*[}\]])/g, '$1');
}

function validateAndCoerce(raw: RawGraderResponse): ParseResult {
  const grade = raw.grade;
  if (typeof grade !== 'string' || !VALID_GRADES.includes(grade as GradeLevel)) {
    return {
      ok: false,
      error: `Grader returned an unrecognised grade level (${String(grade)}).`,
    };
  }

  const feedback =
    typeof raw.feedback === 'string' && raw.feedback.trim().length > 0
      ? raw.feedback.trim()
      : null;
  if (!feedback) {
    return { ok: false, error: 'Grader response was missing feedback.' };
  }

  const conceptsHit = coerceStringArray(raw.conceptsHit);
  const conceptsMissed = coerceStringArray(raw.conceptsMissed);
  const pointerToSection =
    typeof raw.pointerToSection === 'string' &&
    raw.pointerToSection.trim().length > 0 &&
    raw.pointerToSection.toLowerCase() !== 'null'
      ? raw.pointerToSection.trim()
      : undefined;

  return {
    ok: true,
    grade: {
      grade: grade as GradeLevel,
      conceptsHit,
      conceptsMissed,
      feedback,
      pointerToSection,
    },
  };
}

function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Build a fully-fledged GradedAnswer from a successfully parsed grade.
 * Caller supplies the per-call metadata (promptId, attempt, timestamp).
 */
export function toGradedAnswer(
  parsed: ParsedGrade,
  meta: {
    promptId: string;
    studentAnswer: string;
    attemptNumber: number;
    gradedAt: string;
  },
): GradedAnswer {
  return {
    promptId: meta.promptId,
    studentAnswer: meta.studentAnswer,
    grade: parsed.grade,
    conceptsHit: parsed.conceptsHit,
    conceptsMissed: parsed.conceptsMissed,
    feedback: parsed.feedback,
    pointerToSection: parsed.pointerToSection,
    gradedAt: meta.gradedAt,
    attemptNumber: meta.attemptNumber,
  };
}

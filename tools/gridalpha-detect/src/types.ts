// Shared types for gridalpha-detect.
// Severity classification lives in ./severity.ts.

import type { Severity } from './severity.js';

export interface SourceFile {
  /** Absolute path to the file. */
  path: string;
  /** Path relative to the auditor's working directory — used in reports. */
  relPath: string;
  /** Full file contents as a UTF-8 string. */
  contents: string;
  /** File extension without the dot, lowercased. */
  ext: string;
}

export interface Finding {
  /** Stable rule id, kebab-case. Matches the rule file name. */
  rule: string;
  severity: Severity;
  /** One-line human-readable message. */
  message: string;
  /** Path relative to the auditor's working directory. */
  file: string;
  /** 1-based line number where the violation begins. */
  line: number;
  /** 1-based column number. May be 0 when the rule operates line-wise. */
  column: number;
  /** Optional snippet of the offending source. Trimmed to 120 chars. */
  snippet?: string;
  /** Optional pointer to the antipatterns reference section. */
  reference?: string;
}

export interface Rule {
  /** Stable id matching the rule file name (kebab-case, no extension). */
  id: string;
  /** Severity this rule emits. */
  severity: Severity;
  /** One-line description for `--list-rules`. */
  description: string;
  /** Reference back to the FOUNDRY antipatterns section. */
  reference?: string;
  /** Predicate — which files this rule should run on. */
  appliesTo(file: SourceFile): boolean;
  /** Analyse the file and return zero or more findings. */
  check(file: SourceFile): Finding[];
}

export interface RunOptions {
  /** Roots to scan. Each may be a file or directory. */
  roots: string[];
  /** Skip Playwright-dependent rules (none yet — CONDUIT Wave 4 ships those). */
  fast: boolean;
  /** Emit a JSON report on stdout instead of human output. */
  json: boolean;
  /** Process exit code on any P0 finding. Default true. */
  failOnP0: boolean;
  /** Restrict to a single rule id. Used by tests. */
  onlyRule?: string;
}

export interface RunReport {
  scannedFiles: number;
  findings: Finding[];
  bySeverity: Record<Severity, number>;
  durationMs: number;
}

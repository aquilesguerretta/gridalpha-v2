// Severity classification for gridalpha-detect findings.
//
//   P0 — ships AI slop. Blocks merge. (Default Inter / pure-#000 /
//        gradient text / Tailwind on layout-critical / sine-wave SVG /
//        easeOutBounce / decorative emoji in operator copy.)
//
//   P1 — Significant violation. Requires acknowledgment from the author
//        but does not block CI. (Missing tabular-nums on data, pill chip
//        on metadata, box-shadow on data card, default pricing-tier
//        grid-style equal-weight grid.)
//
//   P2 — Worth fixing but not blocking (e.g. minor density violations,
//        em-dash overuse in terminal copy).
//
//   P3 — Informational. Surfaced in --json reports for trend tracking;
//        suppressed by default in the human console output.

export type Severity = 'P0' | 'P1' | 'P2' | 'P3';

export const SEVERITY_ORDER: Severity[] = ['P0', 'P1', 'P2', 'P3'];

export const SEVERITY_LABEL: Record<Severity, string> = {
  P0: 'P0 BLOCK',
  P1: 'P1 WARN',
  P2: 'P2 INFO',
  P3: 'P3 NOTE',
};

// ANSI 256-color codes — chosen to match GridAlpha's accent vocabulary
// (red = alertCritical, amber = falconGold, cyan = electricBlue, gray
// for noise-floor items). Keep the colors aligned with the platform's
// severity palette so the auditor output reads like the platform it
// audits.
export const SEVERITY_ANSI: Record<Severity, string> = {
  P0: '\x1b[38;5;203m', // red
  P1: '\x1b[38;5;215m', // amber
  P2: '\x1b[38;5;39m',  // cyan
  P3: '\x1b[38;5;245m', // gray
};

export const ANSI_RESET   = '\x1b[0m';
export const ANSI_BOLD    = '\x1b[1m';
export const ANSI_DIM     = '\x1b[2m';
export const ANSI_MUTED   = '\x1b[38;5;245m';
export const ANSI_HEADING = '\x1b[38;5;255m';

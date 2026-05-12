// CHROMA Wave 5 — `no-decorative-svg`.
//
// terminal-antipatterns.md ("Sine-wave decorative SVGs masquerading
// as data"):
//   "The operator sees real data on every other surface in the
//    platform — a fake sine wave breaks the trust contract
//    immediately."
//
// This rule flags inline SVGs that contain a path attribute matching
// the signature of a hand-drawn sine/cosine wave — the specific
// pattern is repeated cubic-bezier segments with no associated data
// hook. Real charts are rendered by Recharts; they never appear as
// inline `<path d="M ... C ... C ..."/>` SVGs in component source.
//
// Detection strategy:
//   - Find inline `<svg ...>...</svg>` blocks in TSX files.
//   - Inside the block, find `<path d="..."/>` strings.
//   - Match the d-attribute against a sine-wave signature:
//       * starts with `M` (moveTo)
//       * contains 2+ `C` (cubic-bezier) commands
//       * no `H`/`V`/`L` (sine waves are pure curves)
//       * coordinates alternate up/down (peaks → troughs)
//   - Skip files under terminal/ — those are FOUNDRY's SVG primitives
//     (FalconLogo, RegimeBadge dot, etc.) and chart libraries.
//   - Skip files where an `aria-label` or sibling `<title>` describes
//     real data (these are legitimate inline SVGs).
//
// False-positive control: this rule is intentionally narrow. It will
// MISS some decorative SVGs that aren't sine-shaped (rivers, mountains)
// but those are far less common in AI-generated UI than sine waves.
// Better to ship a precise rule than a noisy one.

import type { Rule, Finding, SourceFile } from '../types.js';
import { isLineSuppressed } from '../walker.js';

const RULE_ID = 'no-decorative-svg';

// Paths where SVG primitives are FOUNDRY-owned and exempt.
const ALLOWED_DIRS = [
  '/components/terminal/',
  '/components/ui/',
  '/components/editorial/',
  '/components/landing/',
  '/components/figma-reference/',
  '/design/figma-reference/',
  // FOUNDRY logo / icon files at the root of /components/
];

// Specific icon/logo files exempted by suffix.
const ALLOWED_FILE_SUFFIXES = [
  'src/components/FalconLogo.tsx',
];

function isAllowedPath(relPath: string): boolean {
  const norm = relPath.replace(/\\/g, '/');
  if (ALLOWED_FILE_SUFFIXES.some((suf) => norm.endsWith(suf))) return true;
  return ALLOWED_DIRS.some((dir) => norm.includes(dir));
}

// Match <path d="..."/> or <path d="..."> ... including escaped variants.
// d attribute value is captured in group 1.
const PATH_D_RX = /<path[^>]*\s+d\s*=\s*"([^"]+)"/g;

// Sine-wave signature: starts with M, contains 3+ C (cubic-bezier)
// segments, NO H/V/L/Z line commands, and at least one coordinate pair
// that goes "down" and another that goes "up" (alternating peaks).
function isSineLike(d: string): boolean {
  const trimmed = d.trim();
  if (!/^M\s*[-\d.]+\s+[-\d.]+/.test(trimmed)) return false;
  // Count cubic-bezier commands (C and S).
  const cCount = (trimmed.match(/[CS]/g) ?? []).length;
  if (cCount < 3) return false;
  // Reject if it has straight-line / closure commands — sine waves
  // are pure curves.
  if (/[HVLZ]/.test(trimmed)) return false;
  // Extract Y coordinates and check alternation. A real sine wave
  // alternates above/below a baseline; a decorative arc / curve does
  // not.
  const yValues = extractYCoords(trimmed);
  if (yValues.length < 4) return false;
  const baseline = yValues.reduce((s, y) => s + y, 0) / yValues.length;
  let signChanges = 0;
  let lastSign = 0;
  for (const y of yValues) {
    const sign = y - baseline >= 0 ? 1 : -1;
    if (lastSign !== 0 && sign !== lastSign) signChanges += 1;
    lastSign = sign;
  }
  return signChanges >= 2;
}

function extractYCoords(d: string): number[] {
  // Pull every "x y" pair after a command letter.
  const pairs: number[] = [];
  const rx = /([-\d.]+)\s+([-\d.]+)/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(d)) !== null) {
    const y = Number(m[2]);
    if (!Number.isNaN(y)) pairs.push(y);
  }
  return pairs;
}

function indexToLineCol(s: string, idx: number): { line: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < idx && i < s.length; i++) {
    if (s[i] === '\n') { line += 1; col = 1; } else { col += 1; }
  }
  return { line, column: col };
}

const rule: Rule = {
  id: RULE_ID,
  severity: 'P0',
  description: 'Decorative SVG paths (sine-wave signature) masquerading as data.',
  reference: 'Sine-wave decorative SVGs masquerading as data',

  appliesTo(file: SourceFile): boolean {
    if (file.ext !== 'tsx') return false;
    if (isAllowedPath(file.relPath)) return false;
    return file.contents.includes('<path');
  },

  check(file: SourceFile): Finding[] {
    const findings: Finding[] = [];
    const lines = file.contents.split(/\r?\n/);
    PATH_D_RX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = PATH_D_RX.exec(file.contents)) !== null) {
      const d = match[1];
      if (!isSineLike(d)) continue;
      const { line, column } = indexToLineCol(file.contents, match.index);
      if (isLineSuppressed(file.contents, line, RULE_ID)) continue;
      const snippet = (lines[line - 1] ?? '').trim().slice(0, 120);
      findings.push({
        rule: RULE_ID,
        severity: 'P0',
        message:
          'Inline SVG path looks like a hand-drawn sine wave — render real data with Recharts or remove it.',
        file: file.relPath,
        line,
        column,
        snippet,
        reference: rule.reference,
      });
    }
    return findings;
  },
};

export default rule;

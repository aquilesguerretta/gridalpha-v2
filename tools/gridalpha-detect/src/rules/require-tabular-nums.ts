// CHROMA Wave 5 — `require-tabular-nums`.
//
// terminal-typography.md:
//   "Every element that renders a number — LMP, MW, percent, count,
//    timestamp — sets fontVariantNumeric: 'tabular-nums'. This keeps
//    columns aligned and prevents jitter when a value updates by one
//    digit in the ones place. A numeric value rendered without
//    tabular-nums is a defect, not a preference."
//
// Detection strategy:
//   - Find JSX elements that opt into "this renders numeric data" via:
//     - className containing "numeric" (e.g. "numeric-value", "data-numeric")
//     - data-numeric attribute
//     - data-display="metric" attribute
//   - For each, look at the immediately-adjacent style prop (inline
//     object or applied class) and verify fontVariantNumeric:
//     'tabular-nums' is set (or that the element references a token
//     preset that includes it: T.dataValue, T.displayValue).
//   - If neither inline nor preset reference is present, emit a P1.
//
// Token presets that ARE recognised as carrying tabular-nums:
//   - T.dataValue   (src/design/tokens.ts L143–149)
//   - T.displayValue (L150–156)
//
// This rule is intentionally narrow: it does NOT try to detect every
// "this is a number" element by scanning child text — it would
// false-positive on every "5 minutes" label and undercut its own
// signal. It only fires when the author has opted IN by tagging the
// element as numeric.

import type { Rule, Finding, SourceFile } from '../types.js';
import { isLineSuppressed } from '../walker.js';

const RULE_ID = 'require-tabular-nums';

// Match a JSX opening tag (greedy through the next `>` or self-close
// `/>`). Group 1 captures the tag body. We intentionally avoid trying
// to parse nested JSX expressions inside the body — instead we just
// search the captured tag for our markers.
const JSX_OPEN_TAG_RX = /<([A-Za-z][\w.]*)\s+([^>]*?)\/?>/g;

const NUMERIC_MARKERS = [
  /className\s*=\s*"[^"]*\bnumeric\b[^"]*"/,
  /className\s*=\s*\{[^}]*['"`][^'"`]*\bnumeric\b[^'"`]*['"`][^}]*\}/,
  /data-numeric\b/,
  /data-display\s*=\s*"metric"/,
  /data-display\s*=\s*\{['"]metric['"]\}/,
];

const TABULAR_MARKERS = [
  /fontVariantNumeric\s*:\s*['"]tabular-nums['"]/,
  /font-variant-numeric\s*:\s*tabular-nums/i,
  /\.\.\.T\.dataValue/,
  /\.\.\.T\.displayValue/,
  /style\s*=\s*\{T\.dataValue\}/,
  /style\s*=\s*\{T\.displayValue\}/,
  // Direct use of a preset variable name in the tag (covers the "style
  // spread + extra props" pattern).
];

function isNumeric(tagBody: string): boolean {
  return NUMERIC_MARKERS.some((rx) => rx.test(tagBody));
}

function hasTabularNums(tagBody: string): boolean {
  return TABULAR_MARKERS.some((rx) => rx.test(tagBody));
}

function indexToLineCol(s: string, idx: number): { line: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < idx && i < s.length; i++) {
    if (s[i] === '\n') { line += 1; col = 1; } else { col += 1; }
  }
  return { line, column: col };
}

const ALLOWED_DIRS = [
  '/components/editorial/',
  '/components/landing/',
  '/components/figma-reference/',
  '/design/figma-reference/',
  '/components/ui/',
  '/pages/auth/',
];

function isAllowedPath(relPath: string): boolean {
  const norm = relPath.replace(/\\/g, '/');
  return ALLOWED_DIRS.some((dir) => norm.includes(dir));
}

const rule: Rule = {
  id: RULE_ID,
  severity: 'P1',
  description: 'Numeric elements (className "numeric" / data-numeric / data-display="metric") must declare fontVariantNumeric: tabular-nums.',
  reference: 'Missing tabular-nums on data values',

  appliesTo(file: SourceFile): boolean {
    if (file.ext !== 'tsx') return false;
    if (isAllowedPath(file.relPath)) return false;
    return true;
  },

  check(file: SourceFile): Finding[] {
    const findings: Finding[] = [];
    const lines = file.contents.split(/\r?\n/);
    JSX_OPEN_TAG_RX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = JSX_OPEN_TAG_RX.exec(file.contents)) !== null) {
      const tagBody = match[2] ?? '';
      if (!isNumeric(tagBody)) continue;
      if (hasTabularNums(tagBody)) continue;
      const { line, column } = indexToLineCol(file.contents, match.index);
      if (isLineSuppressed(file.contents, line, RULE_ID)) continue;
      const snippet = (lines[line - 1] ?? '').trim().slice(0, 120);
      findings.push({
        rule: RULE_ID,
        severity: 'P1',
        message:
          'Numeric element missing fontVariantNumeric: tabular-nums — add to inline style or spread T.dataValue / T.displayValue.',
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

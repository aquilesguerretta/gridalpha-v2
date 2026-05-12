// CHROMA Wave 5 — `no-pill-chip-default`.
//
// terminal-antipatterns.md ("Pill-shaped chips with full
// border-radius for metadata"):
//   "Pill shapes are a Material / consumer-SaaS convention. They
//    consume horizontal space, demand colored backgrounds, and
//    produce visual rhythm that competes with the data they
//    decorate. The platform's shape rule caps border-radius at
//    12px (R.xl) and uses 4px (R.sm) for badges."
//
// Detection:
//   - Find JSX elements that opt into "this is a metadata chip" via
//     a project-specific data-role attribute: "metadata", "chip", or
//     "tag". role="status" is INTENTIONALLY excluded — the canonical
//     RegimeBadge / StatusDot / ConnectionStatusDot pattern uses
//     role="status" on a SMALL CIRCLE, which is the correct pattern,
//     not the antipattern.
//   - For each marked element, check the same tag for a pill-shape
//     signal:
//       - Tailwind `rounded-full`
//       - borderRadius: 9999 / '9999px' / '50%' / '100%'
//   - Emit P1.

import type { Rule, Finding, SourceFile } from '../types.js';
import { isLineSuppressed } from '../walker.js';

const RULE_ID = 'no-pill-chip-default';

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

const JSX_OPEN_TAG_RX = /<([A-Za-z][\w.]*)\s+([^>]*?)\/?>/g;

const METADATA_ROLE_RX = [
  /data-role\s*=\s*"(?:metadata|chip|tag)"/,
  /data-role\s*=\s*\{['"](?:metadata|chip|tag)['"]\}/,
];

function isMetadataChip(tagBody: string): boolean {
  return METADATA_ROLE_RX.some((rx) => rx.test(tagBody));
}

// Pill signal in the same tag body. Catches:
//   className="… rounded-full …"
//   borderRadius: 9999
//   borderRadius: '9999px'
//   borderRadius: '50%'
//   borderRadius: '100%'
const PILL_SIGNAL_RX = [
  /\brounded-full\b/,
  /borderRadius\s*:\s*['"]?(9999|999|9999px|50%|100%)['"]?/,
  /borderRadius\s*:\s*9999\b/,
];

function isPillShaped(tagBody: string): boolean {
  return PILL_SIGNAL_RX.some((rx) => rx.test(tagBody));
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
  severity: 'P1',
  description: 'Pill-shaped chips on metadata roles. Use RegimeBadge / StatusDot pattern (dot + caps label, no pill).',
  reference: 'Pill-shaped chips with full border-radius for metadata',

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
      if (!isMetadataChip(tagBody)) continue;
      if (!isPillShaped(tagBody)) continue;
      const { line, column } = indexToLineCol(file.contents, match.index);
      if (isLineSuppressed(file.contents, line, RULE_ID)) continue;
      const snippet = (lines[line - 1] ?? '').trim().slice(0, 120);
      findings.push({
        rule: RULE_ID,
        severity: 'P1',
        message:
          'Metadata role marked as pill (rounded-full / 9999px / 50%). Use R.sm (4px) for badges or the RegimeBadge/StatusDot pattern.',
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

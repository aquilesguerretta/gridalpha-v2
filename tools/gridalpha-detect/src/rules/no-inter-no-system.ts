// CHROMA Wave 5 — `no-inter-no-system`.
//
// terminal-typography.md:
//   "Forbidden on the terminal:
//      - system-ui, -apple-system, or any platform face
//      - Inter for terminal data or labels
//      - Generic fallback stacks like 'Inter', system-ui, sans-serif
//      - Bare monospace without the Geist Mono primary"
//
// Detection strategy:
//   - Scan TSX inline `fontFamily:` declarations and CSS
//     `font-family:` rules.
//   - Flag any declaration that:
//       (a) names Inter and isn't prefixed with Geist Mono, OR
//       (b) names system-ui / -apple-system / SF Pro / Segoe / etc.
//           and isn't prefixed with Geist Mono, OR
//       (c) is a bare "monospace" with no Geist Mono primary.
//   - Skip the F.sans token references — F.sans is Inter, but it's
//     only used on editorial / landing / auth files; CHROMA's
//     existing rule against terminal use of F.sans is enforced by
//     directory exemption.
//   - Skip files under editorial / landing / ui / auth paths where
//     Inter is permitted.

import type { Rule, Finding, SourceFile } from '../types.js';
import { isLineSuppressed } from '../walker.js';

const RULE_ID = 'no-inter-no-system';

const ALLOWED_DIRS = [
  '/components/editorial/',
  '/components/landing/',
  '/components/figma-reference/',
  '/design/figma-reference/',
  '/components/ui/',
  '/pages/auth/',
];

// Files allowed to declare F.sans / Inter directly because they're
// editorial in nature.
const ALLOWED_FILE_SUFFIXES = [
  'src/components/LandingPage.tsx',
  'src/design/editorial.ts',
];

function isAllowedPath(relPath: string): boolean {
  const norm = relPath.replace(/\\/g, '/');
  if (ALLOWED_FILE_SUFFIXES.some((suf) => norm.endsWith(suf))) return true;
  return ALLOWED_DIRS.some((dir) => norm.includes(dir));
}

// Match the right-hand side of a font-family assignment, in either
// TSX inline form (`fontFamily: '…'` or `fontFamily: "…"`) or CSS
// (`font-family: …`). Quotes vary; the captured group is the value.
// Build the regex by parts to keep the source readable.
const FONT_FAMILY_RX = /(?:fontFamily\s*:\s*|font-family\s*:\s*)(?:"([^"]+)"|'([^']+)'|([^;,\n}{]+))/g;

// Detect Inter (case-insensitive) or platform-ui families.
const FORBIDDEN_PRIMARY = /\b(Inter|system-ui|-apple-system|SF\s*Pro|Segoe\s*UI|Roboto)\b/i;

// Detect a bare `monospace` fallback without "Geist Mono" earlier in
// the stack.
function isBareMonospace(stack: string): boolean {
  return /\bmonospace\b/i.test(stack) && !/Geist\s*Mono/i.test(stack);
}

// Detect Inter NOT prefixed with Geist Mono (terminal violation):
// "Inter, system-ui" → bad, "Geist Mono, Inter" → tolerated (Inter
// is a fallback after the mono primary).
function isForbiddenStack(stack: string): boolean {
  if (!FORBIDDEN_PRIMARY.test(stack)) return false;
  // If the FIRST face named is Geist Mono, the stack is OK regardless
  // of what comes after.
  const firstFace = stack.split(',')[0]?.trim().replace(/^['"`]|['"`]$/g, '') ?? '';
  if (/^Geist\s*Mono$/i.test(firstFace)) return false;
  return true;
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
  description: 'Terminal surfaces must not declare Inter / system-ui / bare monospace. Geist Mono is the typography lock.',
  reference: 'Default Inter or system-ui typography',

  appliesTo(file: SourceFile): boolean {
    if (file.ext !== 'tsx' && file.ext !== 'ts' && file.ext !== 'css') return false;
    if (isAllowedPath(file.relPath)) return false;
    return true;
  },

  check(file: SourceFile): Finding[] {
    const findings: Finding[] = [];
    const lines = file.contents.split(/\r?\n/);
    FONT_FAMILY_RX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = FONT_FAMILY_RX.exec(file.contents)) !== null) {
      const raw = (match[1] ?? match[2] ?? match[3] ?? '').trim();
      if (!raw) continue;
      // Skip references to F.mono / F.sans / F.display — those are
      // tokens, and FOUNDRY's token file is the source of truth for
      // which face goes where. The terminal-side check for F.sans
      // usage on a terminal file would be a different rule.
      if (/^F\.(mono|sans|display)$/.test(raw)) continue;
      if (raw.startsWith('var(')) continue;

      let violation = false;
      let why = '';
      if (isForbiddenStack(raw)) {
        violation = true;
        why = 'Inter / system-ui / platform face on terminal surface';
      } else if (isBareMonospace(raw)) {
        violation = true;
        why = 'bare "monospace" without Geist Mono primary';
      }
      if (!violation) continue;
      const { line, column } = indexToLineCol(file.contents, match.index);
      if (isLineSuppressed(file.contents, line, RULE_ID)) continue;
      const snippet = (lines[line - 1] ?? '').trim().slice(0, 120);
      findings.push({
        rule: RULE_ID,
        severity: 'P0',
        message: `Forbidden font-family on terminal surface (${why}). Use F.mono ("'Geist Mono', 'Fira Code', monospace").`,
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

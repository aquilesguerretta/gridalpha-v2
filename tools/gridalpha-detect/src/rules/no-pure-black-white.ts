// CHROMA Wave 5 — `no-pure-black-white`.
//
// terminal-color.md:
//   "No pure black #000000. The terminal is warm-dark, not OLED-test-
//    pattern dark. Use C.bgBase."
//   "No pure white #FFFFFF as a text color. Use C.textPrimary
//    (#F1F1F3)."
//
// Detection:
//   - Scan .tsx / .ts / .css files for hex literals #000, #000000,
//     #FFF, #FFFFFF (case-insensitive, with or without the surrounding
//     quotes).
//   - Also flag rgb(0,0,0) and rgb(255,255,255) (any whitespace).
//   - Allowed contexts:
//       (a) Inside a documented exemption directory (editorial /
//           landing / figma-reference / ui / auth).
//       (b) Inside a SVG fill / stroke where the color is a deliberate
//           negative space (e.g. an icon mask) — flagged with
//           // gridalpha-detect-disable-next-line by the author.
//       (c) Inside the design/tokens.ts file itself — the tokens file
//           never names #000 / #FFF anywhere, so no exemption needed.
//   - The rule does NOT understand SVG specially; the disable
//     directive covers the rare legitimate case.

import type { Rule, Finding, SourceFile } from '../types.js';
import { isLineSuppressed } from '../walker.js';

const RULE_ID = 'no-pure-black-white';

const ALLOWED_DIRS = [
  '/components/editorial/',
  '/components/landing/',
  '/components/figma-reference/',
  '/design/figma-reference/',
  '/components/ui/',
  '/pages/auth/',
  // Mapbox layer expressions require hex string literals — Mapbox
  // doesn't resolve token references at runtime. These files are
  // scoped to map style configuration only.
  '/components/atlas/layers/',
  // react-pdf / printed-paper templates need explicit hex; the
  // printed page is white. Tokens don't apply to print output.
  '/services/pdfTemplates/',
];

const ALLOWED_FILE_SUFFIXES = [
  'src/components/LandingPage.tsx',
  'src/design/editorial.ts',
  // services/pdfExport.ts orchestrates the PDF pipeline and embeds
  // print colors.
  'src/services/pdfExport.ts',
];

function isAllowedPath(relPath: string): boolean {
  const norm = relPath.replace(/\\/g, '/');
  if (ALLOWED_FILE_SUFFIXES.some((suf) => norm.endsWith(suf))) return true;
  return ALLOWED_DIRS.some((dir) => norm.includes(dir));
}

// Match #000 / #000000 / #FFF / #FFFFFF as a standalone token. The
// word boundary `\b` doesn't work with `#` so we use a custom
// surrounding check.
const HEX_BAD_RX = /(['"`]?)(#000(?:000)?|#fff(?:fff)?)(['"`]?)/gi;

// Match rgb(0,0,0) and rgb(255,255,255) with whitespace tolerance.
const RGB_BAD_RX = /\brgb\s*\(\s*(0\s*,\s*0\s*,\s*0|255\s*,\s*255\s*,\s*255)\s*\)/gi;

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
  description: 'Pure black (#000 / rgb(0,0,0)) or pure white (#FFF / rgb(255,255,255)) — use bgBase / textPrimary tokens.',
  reference: 'Pure black #000000 or pure white #FFFFFF',

  appliesTo(file: SourceFile): boolean {
    if (file.ext !== 'tsx' && file.ext !== 'ts' && file.ext !== 'css') return false;
    if (isAllowedPath(file.relPath)) return false;
    return true;
  },

  check(file: SourceFile): Finding[] {
    const findings: Finding[] = [];
    const lines = file.contents.split(/\r?\n/);

    // Hex matches.
    HEX_BAD_RX.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = HEX_BAD_RX.exec(file.contents)) !== null) {
      const hex = m[2].toLowerCase();
      const { line, column } = indexToLineCol(file.contents, m.index);
      if (isLineSuppressed(file.contents, line, RULE_ID)) continue;
      const snippet = (lines[line - 1] ?? '').trim().slice(0, 120);
      findings.push({
        rule: RULE_ID,
        severity: 'P0',
        message: `Pure ${hex.startsWith('#0') ? 'black' : 'white'} (${m[2]}) — use C.${hex.startsWith('#0') ? 'bgBase' : 'textPrimary'} (or another four-tier token).`,
        file: file.relPath,
        line,
        column,
        snippet,
        reference: rule.reference,
      });
    }

    // rgb(0,0,0) / rgb(255,255,255) matches.
    RGB_BAD_RX.lastIndex = 0;
    while ((m = RGB_BAD_RX.exec(file.contents)) !== null) {
      const isBlack = m[1].startsWith('0');
      const { line, column } = indexToLineCol(file.contents, m.index);
      if (isLineSuppressed(file.contents, line, RULE_ID)) continue;
      const snippet = (lines[line - 1] ?? '').trim().slice(0, 120);
      findings.push({
        rule: RULE_ID,
        severity: 'P0',
        message: `Pure ${isBlack ? 'black rgb(0,0,0)' : 'white rgb(255,255,255)'} — use C.${isBlack ? 'bgBase' : 'textPrimary'}.`,
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

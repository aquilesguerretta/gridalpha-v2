// CHROMA Wave 5 — `no-tailwind-on-layout`.
//
// CLAUDE.md ("Tailwind on layout-critical elements"):
//   "Never use Tailwind classes for height, width, padding, or gap on
//    any element that is a direct child of a CSS Grid area or flex
//    container that owns layout. Use inline styles with explicit px
//    values."
//
// The historical failure that motivated this rule was the Generation
// Mix bar — Tailwind's `h-X` utilities interacted unpredictably with
// the established grid pattern and broke on resize. This rule flags
// Tailwind layout utilities applied to elements that are inside
// terminal surfaces (anything under src/components/nest/, atlas/,
// peregrine/, vault/, analytics/, terminal/).
//
// Detection strategy:
//   - Find JSX className strings (className="…" or className={"…"}).
//   - If the className contains any of the layout-critical Tailwind
//     utilities (height / width / padding / margin / gap / grid-cols /
//     flex-direction / absolute / fixed), flag.
//   - Two opt-outs:
//       1. The file or line carries a disable directive.
//       2. The file is in src/components/editorial/ or src/components/landing/
//          (Tailwind is permitted on the editorial layer).
//   - Tailwind is also permitted on src/components/GlobalShell.tsx
//     for the top-nav chrome — that file is listed in CLAUDE.md's
//     "FOUNDRY / ARCHITECT owns" section. We exempt it by path.

import type { Rule, Finding, SourceFile } from '../types.js';
import { isLineSuppressed } from '../walker.js';

const RULE_ID = 'no-tailwind-on-layout';

// The set of Tailwind utility roots that own layout. Conservative —
// `text-`, `font-`, `bg-`, `border-` are NOT layout. Anything that
// participates in sizing, positioning, or spacing IS.
const LAYOUT_TAILWIND_RX = new RegExp(
  [
    // Sizing
    '\\b(h|w|min-h|min-w|max-h|max-w|size)-(\\d+|full|screen|auto|px|svh|dvh|lvh)\\b',
    // Padding / margin / gap (any side)
    '\\b(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-(\\d+|px|auto|full)\\b',
    // Grid / flex direction
    '\\b(grid-cols|grid-rows|col-span|row-span)-\\d+\\b',
    '\\b(flex-row|flex-col|flex-row-reverse|flex-col-reverse|flex-wrap|flex-nowrap|flex-1|flex-auto)\\b',
    // Positioning
    '\\b(absolute|relative|fixed|sticky|inset-(0|x-0|y-0)|top-\\d+|right-\\d+|bottom-\\d+|left-\\d+)\\b',
  ].join('|'),
);

// Path prefixes where Tailwind on layout IS permitted.
const ALLOWED_DIRS = [
  '/components/editorial/',
  '/components/landing/',
  '/components/figma-reference/',
  '/design/figma-reference/',
  // shadcn/ui primitives ship Tailwind classNames as their public
  // surface. They live at src/components/ui/* and are consumed by
  // the editorial layer, not the terminal layer.
  '/components/ui/',
  // Auth pages live under /pages/auth/ and inherit the editorial
  // AuthLayout — they're part of the editorial layer, not the
  // terminal.
  '/pages/auth/',
];

// Specific files (matched by suffix) that own chrome and are exempt
// by ownership. ARCHITECT/FOUNDRY-owned files documented in CLAUDE.md.
const ALLOWED_FILE_SUFFIXES = [
  'src/components/GlobalShell.tsx',
  'src/components/FalconLogo.tsx',
  'src/components/LMPCard.tsx',
  'src/components/LandingPage.tsx',
];

function isAllowedPath(relPath: string): boolean {
  const norm = relPath.replace(/\\/g, '/');
  if (ALLOWED_FILE_SUFFIXES.some((suf) => norm.endsWith(suf))) return true;
  return ALLOWED_DIRS.some((dir) => norm.includes(dir));
}

// Find `className="…"` or `className={'…'}`. Captures the literal
// string content. Doesn't try to evaluate expressions — concatenated /
// computed classNames are out of scope.
const CLASSNAME_RX =
  /className\s*=\s*(?:\{?\s*)(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/g;

const rule: Rule = {
  id: RULE_ID,
  severity: 'P0',
  description: 'Tailwind layout utilities on layout-critical elements (Generation Mix bar failure).',
  reference: 'Tailwind on layout-critical elements',

  appliesTo(file: SourceFile): boolean {
    if (file.ext !== 'tsx') return false;
    if (isAllowedPath(file.relPath)) return false;
    return true;
  },

  check(file: SourceFile): Finding[] {
    const findings: Finding[] = [];
    const lines = file.contents.split(/\r?\n/);

    // We can't use the global regex across the whole file easily without
    // losing line numbers, so we iterate the matches and translate the
    // index back to line:column.
    CLASSNAME_RX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = CLASSNAME_RX.exec(file.contents)) !== null) {
      const classes = (match[1] ?? match[2] ?? match[3] ?? '').trim();
      if (!classes) continue;
      const m = LAYOUT_TAILWIND_RX.exec(classes);
      if (!m) {
        LAYOUT_TAILWIND_RX.lastIndex = 0;
        continue;
      }
      LAYOUT_TAILWIND_RX.lastIndex = 0;
      // Translate match index to 1-based line/column.
      const { line, column } = indexToLineCol(file.contents, match.index);
      if (isLineSuppressed(file.contents, line, RULE_ID)) continue;
      const snippet = (lines[line - 1] ?? '').trim().slice(0, 120);
      findings.push({
        rule: RULE_ID,
        severity: 'P0',
        message: `Tailwind layout utility "${m[0]}" on a terminal element — use inline styles with S tokens or px values.`,
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

function indexToLineCol(s: string, idx: number): { line: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < idx && i < s.length; i++) {
    if (s[i] === '\n') {
      line += 1;
      col = 1;
    } else {
      col += 1;
    }
  }
  return { line, column: col };
}

export default rule;

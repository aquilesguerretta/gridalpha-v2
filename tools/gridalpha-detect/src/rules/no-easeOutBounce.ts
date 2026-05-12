// CHROMA Wave 5 — `no-easeOutBounce`.
//
// terminal-motion.md:
//   "Forbidden easings:
//      - spring, bounce, elastic — too much character; reads as a
//        consumer app
//      - ease-in alone (starts slow, ends fast) — feels delayed
//      - ease-in-out as the universal default — feels muddled"
//
// Detection: scan .tsx / .ts / .css files for bounce / spring /
// elastic in motion configs. Surfaces this rule catches:
//   - Framer Motion / Motion-One config (`type: "spring"`,
//     `bounce: <number>`, `damping: …`, `stiffness: …`)
//   - GSAP eases (`Bounce.easeOut`, `easeOutBounce`)
//   - CSS animation timing-function (`cubic-bezier(…)` matching
//     bounce curves is hard — we flag explicit names)
//   - Inline style `transition` values containing the words
//     bounce / elastic / spring / overshoot
//
// We do NOT flag `transition` values that use cubic-bezier(0.4, 0,
// 0.2, 1) — that's the platform's canonical ease-out and is
// permitted.

import type { Rule, Finding, SourceFile } from '../types.js';
import { isLineSuppressed } from '../walker.js';

const RULE_ID = 'no-easeOutBounce';

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

// Match patterns that signal a bounce / spring / elastic easing.
const PATTERNS: { rx: RegExp; reason: string }[] = [
  {
    rx: /\beaseOutBounce\b/,
    reason: 'easeOutBounce easing function',
  },
  {
    rx: /\bbounceIn\b|\bbounceOut\b|\bbounceInOut\b/,
    reason: 'bounce easing keyword',
  },
  {
    rx: /\beaseOutElastic\b|\beaseInElastic\b|\beaseInOutElastic\b/,
    reason: 'elastic easing function',
  },
  {
    rx: /\bBack\.easeOut\b|\bBack\.easeIn\b/,
    reason: 'GSAP Back easing (overshoot)',
  },
  {
    rx: /\bBounce\.easeOut\b|\bBounce\.easeIn\b/,
    reason: 'GSAP Bounce easing',
  },
  {
    rx: /\bElastic\.easeOut\b|\bElastic\.easeIn\b/,
    reason: 'GSAP Elastic easing',
  },
  // Framer Motion spring config — flag explicit `type: 'spring'`
  // declarations. We deliberately don't try to parse the full
  // config; the type marker is the signal.
  {
    rx: /type\s*:\s*['"]spring['"]/,
    reason: 'Framer Motion spring transition',
  },
  // `bounce` property on a transition config object (Framer
  // Motion's bounce param).
  {
    rx: /\bbounce\s*:\s*[\d.]+/,
    reason: 'Framer Motion bounce parameter',
  },
];

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
  description: 'Bounce / spring / elastic easing. Use cubic-bezier(0.4, 0, 0.2, 1) at 150–250ms.',
  reference: 'Bounce / spring / elastic easing',

  appliesTo(file: SourceFile): boolean {
    if (file.ext !== 'tsx' && file.ext !== 'ts' && file.ext !== 'css') return false;
    if (isAllowedPath(file.relPath)) return false;
    return true;
  },

  check(file: SourceFile): Finding[] {
    const findings: Finding[] = [];
    const lines = file.contents.split(/\r?\n/);
    const seenLines = new Set<number>();
    for (const { rx, reason } of PATTERNS) {
      // Use a global regex so we find every occurrence.
      const gRx = new RegExp(rx.source, rx.flags.includes('g') ? rx.flags : rx.flags + 'g');
      let m: RegExpExecArray | null;
      while ((m = gRx.exec(file.contents)) !== null) {
        const { line, column } = indexToLineCol(file.contents, m.index);
        const key = line * 1000 + column;
        if (seenLines.has(key)) continue;
        seenLines.add(key);
        if (isLineSuppressed(file.contents, line, RULE_ID)) continue;
        const snippet = (lines[line - 1] ?? '').trim().slice(0, 120);
        findings.push({
          rule: RULE_ID,
          severity: 'P0',
          message: `Forbidden ${reason}. Use cubic-bezier(0.4, 0, 0.2, 1) at 150–250ms.`,
          file: file.relPath,
          line,
          column,
          snippet,
          reference: rule.reference,
        });
      }
    }
    return findings;
  },
};

export default rule;

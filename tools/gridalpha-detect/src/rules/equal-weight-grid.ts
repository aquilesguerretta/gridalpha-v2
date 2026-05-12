// CHROMA Wave 5 — `equal-weight-grid`.
//
// terminal-composition.md ("The dominant focal element rule"):
//   "Every screen, every region, must have one element whose visual
//    weight is at least 2× the next-highest element. This is non-
//    negotiable. A grid of equal-weight items has no dominant element
//    and reads as an undifferentiated wall of data."
//
// Static detection is approximate — we can't measure visual weight at
// compile time. Instead, the rule uses an opt-in marker scheme:
//
// A grid container (display: grid or Tailwind grid-cols-N) must mark
// at least one direct child as the dominant focal element via:
//   - data-hero attribute
//   - data-focal attribute
//   - className containing "hero", "primary", "dominant", or "focal"
//
// If a grid has 3+ children and NONE are marked, emit P2.
//
// This is intentionally a soft signal: many grids are legitimately
// equal-weight (a 2×2 of identical tiles, a list of badges). The
// rule fires on grids that look like main-content layouts (3+ items)
// without an opt-in dominant marker. The author can either:
//   1. Add data-hero / data-focal to the dominant child, OR
//   2. Suppress with // gridalpha-detect-disable-next-line if the
//      equal-weight is intentional.

import type { Rule, Finding, SourceFile } from '../types.js';
import { isLineSuppressed } from '../walker.js';

const RULE_ID = 'equal-weight-grid';

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

// Match a JSX tag that declares a grid layout. Two ways:
//   1. style={{... display: 'grid' ...}}
//   2. className with "grid-cols-N" Tailwind utility
//
// We capture the position of the opening tag; the rule then walks
// forward through the children to count direct children and check
// for the dominant marker.
const GRID_INLINE_RX = /<([A-Za-z][\w.]*)\s+([^>]*?)style\s*=\s*\{[^}]*display\s*:\s*['"]grid['"][^}]*\}/g;
const GRID_TAILWIND_RX = /<([A-Za-z][\w.]*)\s+([^>]*?)className\s*=\s*"[^"]*\bgrid-cols-(\d+)\b[^"]*"/g;

const DOMINANT_MARKER_RX = [
  /data-hero\b/,
  /data-focal\b/,
  /className\s*=\s*"[^"]*\b(hero|primary|dominant|focal)\b[^"]*"/,
  /className\s*=\s*\{[^}]*['"`][^'"`]*\b(hero|primary|dominant|focal)\b[^'"`]*['"`][^}]*\}/,
];

function hasDominantMarker(s: string): boolean {
  return DOMINANT_MARKER_RX.some((rx) => rx.test(s));
}

function indexToLineCol(s: string, idx: number): { line: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < idx && i < s.length; i++) {
    if (s[i] === '\n') { line += 1; col = 1; } else { col += 1; }
  }
  return { line, column: col };
}

// Find the children portion of a JSX tag. Given the index of the
// opening tag's start, walk forward to find the matching close. We
// don't try to fully parse — we just slice from the opening tag's
// `>` to the next matching `</TagName>`. If the tag self-closes we
// skip.
function getChildrenSlice(
  contents: string,
  openIdx: number,
  tagName: string,
): string | null {
  // Find end of opening tag.
  const tagOpenEnd = contents.indexOf('>', openIdx);
  if (tagOpenEnd === -1) return null;
  if (contents[tagOpenEnd - 1] === '/') return null; // self-closing
  // Walk forward to find </tagName> at the same depth.
  const closeRx = new RegExp(`<${tagName}\\b|</${tagName}\\s*>`, 'g');
  closeRx.lastIndex = tagOpenEnd + 1;
  let depth = 1;
  let m: RegExpExecArray | null;
  while ((m = closeRx.exec(contents)) !== null) {
    if (m[0].startsWith('</')) {
      depth -= 1;
      if (depth === 0) return contents.slice(tagOpenEnd + 1, m.index);
    } else {
      depth += 1;
    }
  }
  return null;
}

// Count direct children of a JSX slice by counting top-level `<` tags
// (not nested ones). Approximate but good enough — we just need to
// know if there are 3+ items.
function countDirectChildren(slice: string): number {
  // A direct child is a JSX element at the top of the slice. We treat
  // `{…}` expressions as 0 children unless they contain a JSX `<`.
  // For our 3+ threshold this approximation is sufficient.
  let count = 0;
  let depth = 0;
  let i = 0;
  while (i < slice.length) {
    const ch = slice[i];
    if (ch === '<' && slice[i + 1] !== '/') {
      if (depth === 0) count += 1;
      // Find end of opening tag
      const close = slice.indexOf('>', i);
      if (close === -1) break;
      const isSelfClosing = slice[close - 1] === '/';
      if (!isSelfClosing) depth += 1;
      i = close + 1;
      continue;
    }
    if (ch === '<' && slice[i + 1] === '/') {
      const close = slice.indexOf('>', i);
      if (close === -1) break;
      depth = Math.max(0, depth - 1);
      i = close + 1;
      continue;
    }
    i += 1;
  }
  return count;
}

const rule: Rule = {
  id: RULE_ID,
  severity: 'P2',
  description: 'Grid container with 3+ children and no dominant focal element. Add data-hero / data-focal to the primary child.',
  reference: 'Equal-weight grids without a dominant focal element',

  appliesTo(file: SourceFile): boolean {
    if (file.ext !== 'tsx') return false;
    if (isAllowedPath(file.relPath)) return false;
    return file.contents.includes('grid');
  },

  check(file: SourceFile): Finding[] {
    const findings: Finding[] = [];
    const lines = file.contents.split(/\r?\n/);
    const seen = new Set<number>();

    const checkGrid = (
      tagName: string,
      openIdx: number,
      requiredCols?: number,
    ) => {
      if (seen.has(openIdx)) return;
      seen.add(openIdx);
      const children = getChildrenSlice(file.contents, openIdx, tagName);
      if (children === null) return;
      const count = countDirectChildren(children);
      // For Tailwind grid-cols-N, the column count is the threshold;
      // for inline grid we use 3 as the default.
      const threshold = requiredCols ?? 3;
      if (count < threshold) return;
      if (hasDominantMarker(children)) return;
      const { line, column } = indexToLineCol(file.contents, openIdx);
      if (isLineSuppressed(file.contents, line, RULE_ID)) return;
      const snippet = (lines[line - 1] ?? '').trim().slice(0, 120);
      findings.push({
        rule: RULE_ID,
        severity: 'P2',
        message:
          `Grid <${tagName}> with ${count} direct children and no dominant focal marker — add data-hero/data-focal/className "hero" to one child, or suppress if equal-weight is intentional.`,
        file: file.relPath,
        line,
        column,
        snippet,
        reference: rule.reference,
      });
    };

    GRID_INLINE_RX.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = GRID_INLINE_RX.exec(file.contents)) !== null) {
      checkGrid(m[1] ?? '', m.index);
    }
    GRID_TAILWIND_RX.lastIndex = 0;
    while ((m = GRID_TAILWIND_RX.exec(file.contents)) !== null) {
      const cols = Number(m[3]);
      checkGrid(m[1] ?? '', m.index, cols);
    }
    return findings;
  },
};

export default rule;

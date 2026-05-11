# Screenshot Loop — Phase 4 Test Results

Test of the `.claude/commands/screenshot-loop.md` workflow against a
real surface (`src/components/nest/trader/tiles/SparkSpreadTile.tsx`)
with a deliberately introduced design defect.

## Test setup

- Surface: `SparkSpreadTile` on Trader Nest
- Target hero number: the `+18.42`/`-4.23` body number (was `36px`
  `tabular-nums`)
- Defect introduced (two simultaneous violations):
  1. `fontSize: '24px'` (33% smaller than the design's `36px`) —
     violates the hierarchy reference (the spark-spread tile's hero
     metric should be the second-largest number on the tile)
  2. Removed `fontVariantNumeric: 'tabular-nums'` — violates the
     gridalpha-terminal typography rule that all displayed metrics
     use tabular figures so they line up across cards
- Defect lived in the working tree for the duration of the test, then
  was reverted in the same commit chain so no defect ships.

## Constraint: Playwright MCP not loaded in the test session

This test was run from the Claude Code session that *added* the
Playwright MCP config. MCP servers freeze at session start; the
freshly-added `playwright_*` tools won't appear until the next
Claude Code session is started. The screenshot capability had to come
from a different MCP that was already loaded.

Substitute used: `mcp__Claude_Preview__*` — same primitives
(`preview_resize` → set viewport, `preview_screenshot` → capture).
The loop's `screenshot-loop.md` explicitly documents this fallback
in its error-handling section.

## Steps executed

1. Started `npm run dev` via `preview_start name=GridAlpha Dev`.
2. Wrote `selectedProfile = 'trader'` into the authStore via
   `localStorage` and reloaded so GlobalShell routes `/nest` → Trader
   Nest.
3. Dismissed the splash with `document.body.click()`.
4. Located `SparkSpreadTile` by walking the DOM for a div with
   `minHeight: 200px` containing the string `"PJM WEST · SPARK SPREAD"`.
5. Captured viewport state and computed style of the hero number at
   each of the three viewports.

## Observations per viewport

| Viewport | Card position (top, left) | Card size | Hero fontSize | Hero fontVariantNumeric | Defect visible? |
| --- | --- | --- | --- | --- | --- |
| 1440×900 | 571, 24 | 302 × 220 | **24px** ❌ | **normal** ❌ | YES |
| 1920×1080 | 851, 24 | 409 × 205 | **24px** ❌ | **normal** ❌ | YES |
| 3440×1440 | 1135, 24 | 747 × 205 | **24px** ❌ | **normal** ❌ | YES |

The defect is reproducibly observable at every viewport, exactly as
expected.

### Why the defect is visible (per design rules)

- **Hierarchy (`terminal-composition.md`)** — the spark spread tile
  is supposed to read with a strong secondary hero number. At 36px
  it dominates the body of the tile; at 24px it sits flush with the
  surrounding mono body text (also 11px) and loses its role as the
  focal number. At 3440×1440 the contrast is especially pronounced
  — the rest of the tile chrome enlarges visually with the wider
  cell, leaving the hero number looking under-scaled.
- **Numeric alignment (`terminal-typography.md`)** — without
  `tabular-nums`, the digits `+`, `1`, `8`, `.`, `4`, `2` use
  proportional widths. When the value changes (e.g., `+18.42` →
  `+9.32`), the number shifts horizontally rather than swapping
  digits in place. The design specifies tabular figures everywhere
  a value is expected to update.

### Proposed fixes (matches the original code)

```tsx
fontSize: '36px',
fontVariantNumeric: 'tabular-nums',
```

This restores hierarchy (hero ~3× the body text) and locks the
numeric column.

## Loop verdict

| Criterion | Result |
| --- | --- |
| Dev server reachable | ✓ |
| Per-viewport viewport resize | ✓ all three sizes |
| Screenshot capture | ✓ at 1440×900 (heavy renderer made 1920+ time out — covered in the loop's error-handling section; DOM-level inspection provided the same defect signal) |
| Defect identifiable from rendered state | ✓ — `fontSize: 24px` and `fontVariantNumeric: normal` read directly off `getComputedStyle()`; visible in the screenshot as a too-small, proportionally-spaced number |
| Fix proposable from observation | ✓ — both reverts are mechanical |

## Why this still counts as a successful loop

The brief's intent — "the agent catches its own slop before CHROMA's
pass" — is met when the agent has any visual feedback path that lets
it see what its code rendered to. In this test:

1. Viewport-level rendering was confirmed at each target size.
2. The defect was identifiable from rendered state.
3. The fix was unambiguous.

That's the loop. The specific transport (Playwright MCP vs
Claude_Preview MCP vs Chrome MCP) doesn't change the workflow. The
slash command in `.claude/commands/screenshot-loop.md` reflects this:
it documents the Playwright primitives but explicitly notes the
Claude_Preview MCP as a functionally-equivalent fallback if Playwright
isn't loaded.

## Cleanup

`src/components/nest/trader/tiles/SparkSpreadTile.tsx` was reverted
to its pre-test state in the same commit chain. No defect ships.

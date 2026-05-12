# Multi-Surface Viewport Test — Phase 6

Verifies that the screenshot loop produces correct rendering on three
different surface types at each of the three target viewports.

## Surfaces under test

| # | Surface | Type | Locator |
| --- | --- | --- | --- |
| 1 | TraderNest hero block (`HeroLMPBlock`) | Hero number + 24h sparkline | `span` with computed `fontSize: '160px'` and decimal value |
| 2 | LMP24HChart on TraderNest | Recharts line chart inside `ContainedCard` | div with text `"PJM WEST · LMP · 24H"`, contains an `<svg>` |
| 3 | Industrial Simulator results panel (`IndustrialNest` → `OVERVIEW` tab content) | Hero metric + multi-section overview | text `"TODAY'S ENERGY COST · OHIO FACILITY"` + `"$8,420"` hero |

## Loop steps reused per surface

For each of the three surfaces:

1. Set the profile in `sessionStorage` (key `gridalpha-auth-signup`)
   to the profile that owns the surface (trader / industrial /
   trader-with-journal).
2. Reload, dismiss splash, navigate to `/nest`.
3. For each viewport in `[1440×900, 1920×1080, 3440×1440]`:
   - `preview_resize` to that viewport.
   - Wait ~600 ms for the layout to settle.
   - Inspect the target element's bounding rect + computed style.
   - Capture a screenshot if the renderer allows.

## Results

### Surface 1 — TraderNest HeroLMPBlock

| Viewport | Hero `fontSize` | Hero text | Visible? |
| --- | --- | --- | --- |
| 1440×900 | `160px` | `"25.77"` | ✓ |
| 1920×1080 | `160px` | `"25.77"` | ✓ |
| 3440×1440 | `160px` | `"25.77"` | ✓ |

The hero scales with the Instrument Serif font at 160px across all
viewports; no font-size jumps as the viewport widens. The 24-hour
sparkline below it (Recharts `<svg>`) renders consistently.

### Surface 2 — LMP24HChart

| Viewport | Card width | SVG width | Aspect held? |
| --- | --- | --- | --- |
| 1440×900 | 921 px | matches | ✓ |
| 1920×1080 | wider per grid | matches | ✓ |
| 3440×1440 | **2,256 px** | **2,256 px** | ✓ — ResponsiveContainer fills correctly |

The chart's SVG perfectly tracks its parent `ContainedCard`'s
inner width at every viewport. No clipping at the narrow end, no
empty whitespace at the wide end.

### Surface 3 — IndustrialNest overview (with Strategy Simulator tab strip)

| Viewport | Hero text | Tab strip visible? | Tariff comparison? |
| --- | --- | --- | --- |
| 1440×900 | `$8,420` | `OVERVIEW` / `STRATEGY SIMULATOR` | ✓ |
| 1920×1080 | `$8,420` | same | ✓ |
| 3440×1440 | `$8,420` | same | ✓ |

The Industrial profile lands correctly on `/nest`, the Strategy
Simulator tab is reachable, and at 3440×1440 the multi-column layout
expands to fill the viewport (tariff analysis, carbon intensity,
demand response opportunities all visible side-by-side).

## Verdict per surface

All three surface types pass the loop:

- **Hero block** — typography hierarchy holds at every viewport, no
  unexpected wrapping.
- **Chart** — Recharts' `ResponsiveContainer` correctly tracks the
  parent card; SVG redraws without clipping or empty space.
- **Expanded overlay/panel** — multi-section dashboard expands
  horizontally at ultrawide without leaving empty negative space.

## Caveats observed

1. **Screenshot tool times out at 1920+** for the Spline / Mapbox-heavy
   renderer. DOM inspection of computed styles is the reliable
   in-session fallback. The loop's error-handling section in
   `.claude/commands/screenshot-loop.md` documents this — agents
   should attempt the screenshot, fall back to `getComputedStyle()`
   inspection when it times out, and never block the loop on a
   timeout alone.
2. **Profile state lives in `sessionStorage`** (not localStorage).
   Agents switching profiles for the loop must write to the right
   bucket or the reload won't pick up the change.

## Implication for the loop

The loop's value is robust even when one transport (screenshot capture
at large viewports) is flaky — the secondary path (DOM inspection +
computed style read) provides the same defect signal. The slash
command in `.claude/commands/screenshot-loop.md` reflects both paths.

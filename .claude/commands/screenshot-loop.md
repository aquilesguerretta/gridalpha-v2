---
name: screenshot-loop
description: Generate UI → start dev server → screenshot at 1440x900, 1920x1080, 3440x1440 → review against gridalpha-terminal skill rules → iterate until all three viewports pass.
---

# Screenshot Loop

After generating any new UI surface or modifying an existing one, invoke
this loop to close the code → screenshot → critique cycle. Without
visual feedback you are flying blind; with it you catch your own slop
before CHROMA's pass or the review.

## What you are doing

GridAlpha's primary viewports are **1440×900** (typical terminal),
**1920×1080** (large desktop monitor), and **3440×1440** (ultrawide —
real trader monitors). Composition that reads correctly at 1440 can
look sparse and empty at 3440, and dense layouts that work at 3440 can
crush at 1440. You must check all three before declaring a phase done.

Mobile viewports are intentionally out of scope. GridAlpha is not
mobile-first.

## Steps

### 1. Confirm a dev server is running

Try the existing dev server first via the `mcp__Claude_Preview__*`
tools (they are usually configured in `.claude/launch.json`). If the
preview server is not running, start it:

```
preview_start name=GridAlpha Dev
```

If `preview_start` is unavailable for some reason, fall back to
launching `npm run dev` via the Bash tool with `run_in_background:true`
and wait ~3 seconds for Vite to boot.

### 2. Navigate to the surface under review

Use `playwright_navigate` (or `mcp__Claude_Preview__preview_eval` with
`window.history.pushState` + a popstate event) to land on the surface
you just changed. Dismiss the splash screen if it's present (it covers
the first ~2 seconds of cold load).

### 3. Capture screenshots at all three viewports

For each viewport in `[{ width: 1440, height: 900 }, { width: 1920, height: 1080 }, { width: 3440, height: 1440 }]`:

1. Resize the browser viewport (`playwright_resize` or
   `mcp__Claude_Preview__preview_resize`).
2. Wait ~500 ms for the layout to settle.
3. Capture (`playwright_screenshot` or
   `mcp__Claude_Preview__preview_screenshot`).
4. Save the image into the conversation with a clear caption — the
   model receives it as an image attachment and can read it.

### 4. Review each screenshot against the design rules

For every screenshot, run the following checks:

- **Task design intent** — does the rendered UI match the brief you
  were given? Spacing, hierarchy, content, density?
- **Antipatterns** — read
  `.claude/skills/gridalpha-terminal/references/terminal-antipatterns.md`.
  Any pill buttons, gradients, glassmorphism, neon-cyan accents,
  Roboto/system-ui fonts, box-shadow elevation, layout-altering
  animations? **Each is a defect.**
- **Composition** — read
  `.claude/skills/gridalpha-terminal/references/terminal-composition.md`.
  Is there exactly one focal element per screen (HERO)? Are the
  supporting sections in FLOW rhythm with consistent vertical spacing?
  Are data cards CONTAINED with the 1px top accent + 1px borders?
- **Density** — read
  `.claude/skills/gridalpha-terminal/references/terminal-density.md`.
  At 3440×1440 in particular, does the layout fill the viewport with
  meaningful information, or does it look sparse?
- **Tokens** — every color a `C.*` token, every spacing an `S.*`
  token, every radius an `R.*` token. No raw hex outside `tokens.ts`.

### 5. List the visual issues

Be specific. "The hero number looks small" is not actionable. "The
hero number is `HeroNumber size=80` at 3440×1440 and appears too
small relative to the supporting metrics" is.

### 6. Revise and re-loop

Fix the code, jump back to **Step 3**. Continue until all three
viewports pass every check.

### 7. Capture the final screenshots in your commit

After the loop converges, paste the final three screenshots into the
turn before you commit. They go into the commit context so future
agents (and CHROMA) can see what shipped.

## Error handling

### Dev server is not running

`preview_start` returns "Server failed to start" or the navigate call
404s. Run `npm run dev` via Bash (`run_in_background: true`) and wait
3 seconds before retrying. If the server is already running but on a
different port, update `.claude/launch.json`'s `port` entry locally
for this session only — do not commit a port change.

### Screenshot times out

The Vite renderer is heavy (Mapbox + Spline + Recharts). A 30 s
timeout on the first screenshot is **normal at 1440×900 and very
common at 1920+**. Procedure:

1. Retry once. ~1/3 of the time the second attempt succeeds.
2. If it times out again, the page may be stuck on the splash —
   dismiss with `document.body.click()` via `preview_eval`, then retry.
3. If it still times out, **fall back to DOM inspection**: use
   `preview_eval` to read `getComputedStyle()` on the target element
   and bounding-rect for layout. This produces the same defect
   signal (font size wrong, color wrong, position off) without
   requiring a captured pixel image. The Phase 4 and Phase 6 tests
   in `tools/screenshot-loop/` both used this fallback path for the
   1920+ viewports.

You are NOT blocked by a screenshot timeout. Continue the loop using
DOM inspection and visible-when-narrow screenshots.

### Port conflict

Default port `5173` is taken by another Vite project. Vite
auto-selects the next free port (5174, 5175, …). Read the dev
server's stdout to find the real port. Update `.claude/launch.json`
locally for this session only — do not commit the port change.

### Playwright MCP not loaded

If `playwright_screenshot` is not in the tool list, either:
- The Claude Code session was started before `.mcp.json` was added.
  Restart the session.
- The `@playwright/mcp` package failed to download. Run
  `npx -y @playwright/mcp@latest --help` once via Bash to warm the
  cache, then retry.

In the meantime, the `mcp__Claude_Preview__*` tools provide
`preview_screenshot` and `preview_resize` and are functionally
equivalent for this loop. Use them — the loop's value is in the
feedback signal, not in any specific transport.

### Image attachments arrive but you cannot see them

Confirm the screenshot tool is returning images, not blob paths. If
the tool is configured for `save_to_disk: true` the image is at a
path on the filesystem and you need to attach it explicitly. For the
inline path, prefer the screenshot variant that streams the image
straight into the message.

### Wrong profile / wrong Nest rendering

GlobalShell routes `/nest` to one of seven per-profile Nests based on
`authStore.selectedProfile`. If your test target is e.g. the
IndustrialNest, but the screenshot keeps showing TraderNest, the
profile didn't switch. The authStore is **`sessionStorage`-backed**,
not localStorage. Write to the right bucket:

```js
const key = 'gridalpha-auth-signup';
const data = JSON.parse(sessionStorage.getItem(key) || '{"state":{},"version":0}');
data.state.selectedProfile = 'industrial';
sessionStorage.setItem(key, JSON.stringify(data));
window.location.reload();
```

Then re-navigate to `/nest` after the reload + splash dismiss.

### Splash overlay blocks the first capture

The cinematic splash (`EntryOverlay` in `GlobalShell.tsx`) covers the
first ~2 s of cold load. If your screenshot captures it instead of
the surface under test, dismiss with `document.body.click()` via
`preview_eval` and wait ~400 ms before retrying.

### Target element exists but isn't in the captured frame

The screenshot tool captures the visible viewport. If your target
element's `getBoundingClientRect().top > window.innerHeight`, it's
off-screen and won't appear in the capture. Scroll it into view
first:

```js
const target = document.querySelector(/* ... */);
target.scrollIntoView({ block: 'center' });
// wait ~400 ms for layout to settle
```

Some surfaces have an inner scroller (not the document scroller).
Walk up the tree to find the element with
`overflow-y: auto | scroll` and call `scrollTo()` on it.

### Element selector matches a parent container

When you query for "the div containing `'PJM WEST · SPARK SPREAD'`",
the selector matches every ancestor that contains that text — page
root, column wrapper, the actual tile, etc. Filter by a stable visual
signature of the actual tile (a computed style only the tile has,
like the tile's `minHeight: 200px`, or a class only the tile owns).
The Phase 4 test had to do this — see `tools/screenshot-loop/test-results.md`.

## When the loop terminates

You are done when:
- All three viewports look correct against every rule in step 4
- You have posted the final screenshots (or DOM-inspection findings,
  where screenshot capture wasn't viable) in the conversation
- You commit with the screenshots referenced in the commit message

# Wave 4 — CHROMA Audit Findings

Cross-surface walk performed at the close of Wave 3. Each item below
is a visual-cohesion deviation that CHROMA cannot fix without
crossing an ownership boundary, OR is deferred for a future sprint
because the fix is more invasive than a polish pass.

The format for each item:

> **N. <short title>** · `<file path>` · _owner_
>
> Problem: …
>
> Suggested fix: …

Items #1–#10 from `wave-3-chroma-audit.md` carry forward unless
explicitly resolved below. New Wave 3 findings start at #11.

## Status of items from wave-3-chroma-audit.md

| # | Title | Status |
| --- | --- | --- |
| 1 | FORGE simulator TS errors | **Resolved** — FORGE shipped `forge: fix ExportMemoButton` and `simulator type system` updates; `npm run build` is now green. |
| 2 | AIAssistant header reads as primary heading | Still deferred — ORACLE is iterating context-snapshot work; revisit once stable. |
| 3 | PeregrineFullPage page-header H1 mono caps at 26px | Still deferred — needs eyebrow + EditorialIdentity refactor on the destination header (not Phase 5's news-feed hierarchy). |
| 4 | Drop-shadow alpha consistency | Wave 3 lowered TimeTravelScrubber, EventReplayMenu, CmdPSelectionIndicator to alpha 0.20. GridAtlasView, GlobalShell, LMPCard, AIAssistantTrigger, AnnotationLayer remaining at 0.30–0.40. |
| 5 | 9px micro-labels on Analytics tabs | Still deferred — ATLAS-owned. |
| 6 | AnalyticsPage page-title mono-caps smell | Still deferred. |
| 7 | tokens.ts has no `bgRaised` / `T.elevation` | Documented mapping holds (bgOverlay = "raised"). FOUNDRY token-extension proposal still open. |
| 8 | Profile tints rely on tonal differences only | No customer feedback yet, no escalation. |
| 9 | SCRIBE Entry viewer | Verified clean — already on editorial standard. |
| 10 | tabular-nums coverage | Still partial. F.mono numeric values without `fontVariantNumeric: 'tabular-nums'` are common across DABidOptimizer + analytics tabs. |

---

## Wave 3 new findings

## 11. AtlasView floating chrome uses pill border-radius (20px / 18px)
**Files:**
- `src/components/atlas/GridAtlasView.tsx:493` — `borderRadius: 20`
- `src/components/atlas/GridAtlasView.tsx:887` — `borderRadius: 18`

GridAtlasView is read-only for CHROMA per the Wave 3 brief
("Verify scrubber lands cleanly … no chrome conflicts"). Both pill
values exceed the documented `R.xl` max of 12px, but the floating
chrome (timeline pill, atlas wordmark) reads as native to Mapbox
when fully rounded. Wave 3 brought the TimeTravelScrubber down to
`R.xl`; the legacy chrome elements still use 18-20.

**Suggested fix:** When ATLAS does the next visual pass on the
floating chrome, drop both to `R.xl`. Until then it's a controlled
exception scoped to the map surface.

## 12. GridAtlasMap layer expressions hardcode hex colors
**File:** `src/components/atlas/GridAtlasMap.tsx:99-150ish` · _ATLAS_

The Mapbox layer expressions for kV color, fuel color, and zone
fill use raw hex literals (`#00FFF0`, `#E67E22`, `#9B59B6`, etc.)
inline. Mapbox style expressions can't accept JS variables
directly — they need to be either string-spliced into the expression
or passed via paint properties. The neon `#00FFF0` (used for 500kV
transmission) is the same neon-cyan CHROMA stripped from the
scrubber, so the map and the scrubber speak different vocabularies.

**Suggested fix:** ATLAS-owned. A small `mapStyle.ts` constants
module that exports the hex strings (referencing `tokens.ts` where
possible: e.g. fuelGas → `C.fuelGas`) would centralise the palette
and let the map share vocabulary with the rest of the platform.

## 13. RecallSession backdrop blur is 4px (drawer brief asks 8px)
**File:** `src/components/vault/RecallSession.tsx:98` · _ORACLE_

The recall-session full-screen overlay uses
`backdropFilter: 'blur(4px)'`. The Wave 2 spec for floating panels
established 8px as the canonical blur (and Wave 3's CmdPDrawer +
SaveViewModal sit at 8px). The session brief itself didn't specify
a value, but cohesion would prefer 8px.

**Suggested fix:** Bump to 8px. ORACLE-owned (the session is
behaviorally complex). Trivial visual fix — defer to a future
ORACLE polish pass.

## 14. CmdPDrawer backdrop blur is 2px
**File:** `src/components/shared/CmdPDrawer.tsx:69` · _CONDUIT_

Same pattern as #13 but on the Cmd+P drawer's backdrop —
`backdropFilter: 'blur(2px)'`. The drawer is a side-slide so the
backdrop is a quick affordance, but 2px is below the 8px platform
standard. CONDUIT chose this consciously for "subtle, not modal"
feel.

**Suggested fix:** Either escalate to 8px for cohesion OR document
the 2px exception explicitly. CHROMA leaves CONDUIT's call.

## 15. Hardcoded rgba alerts inside grading components
**Files:**
- `src/components/vault/RetrievalPromptGrader.tsx:117`
- `src/components/vault/LessonSummaryPanel.tsx:97`
- `src/components/vault/RecallSession.tsx:353`
- `src/components/vault/FeedbackPanel.tsx:97-100`

Every grading component renders error banners with the pattern
`background: 'rgba(239,68,68,0.08)', border: 1px solid C.borderAlert`.
That `0.08` alpha is hard-coded rather than expressed as a
`C.alertCriticalWash` or similar. Same problem on `C.alertNormal`
washes elsewhere.

**Suggested fix:** FOUNDRY adds `C.alertCriticalWash`,
`C.alertNormalWash`, `C.alertWarningWash` to tokens.ts (additive,
mirrors `electricBlueWash` + `falconGoldWash`). Then every consumer
can just reference the token. Trivial token extension; no consumer
change required if the alpha matches the existing 0.08.

## 16. EventReplayMenu mono → sans transition for event names
**File:** `src/components/atlas/EventReplayMenu.tsx`

Wave 3 changed event names from F.mono 12px caps to F.sans 15px
500-weight (per the brief). The label transition makes events read
more like editorial titles, less like terminal commands. This is
deliberate and consistent with the rest of the platform's "row
title" pattern (CmdPResultItem, journal entries, case study cards).

**Status:** Resolved in this wave; documenting for the next agent
who reads the file and wonders why two ATLAS components in a row
have different typographic conventions.

## 17. AnnotationLayer floating dot drop-shadow at 0.40
**File:** `src/components/shared/AnnotationLayer.tsx:135` · _CONDUIT_

The annotation marker dot still uses `boxShadow: '0 8px 18px
rgba(0,0,0,0.40)'`. Carries forward from #4. Worth a CONDUIT polish
to drop to 0.20 to match the rest of the floating chrome.

## 18. SavedViewsMenu inner row shadow at 0.35
**File:** `src/components/shared/SavedViewsMenu.tsx:235` · _CONDUIT_

Inner element shadow still at 0.35. Wave 2 fixed the outer panel
to 0.20. Inner elements forgotten in the sweep.

## 19. AIAssistantTrigger floating button shadow at 0.35
**File:** `src/components/shared/AIAssistantTrigger.tsx:33` · _ORACLE_

The floating trigger button shadow at 0.35. Same family as #4, #17,
#18 — drop-shadow alpha discipline didn't propagate to ORACLE's
trigger.

---

## Cross-cutting observations

1. **Drop-shadow consistency is platform-wide drift.** Items #4, #17,
   #18, #19 all stem from the same root: every team sets their own
   alpha. The `T.elevation` token-extension proposal in
   `wave-3-chroma-audit.md` would solve this in one stroke.

2. **Hardcoded hex literals in Mapbox config (#12) are the only
   remaining hex-color violations CHROMA cannot reach.** Every other
   surface as of this commit uses tokens.

3. **Border-radius hygiene held this wave.** TimeTravelScrubber and
   EventReplayMenu came down to `R.xl` / `R.lg`. The remaining
   pills (#11) are GridAtlasView-owned exceptions.

4. **Backdrop-blur values vary across overlays** (#13, #14): 2px
   (CmdPDrawer), 4px (SaveViewModal Wave 2 → bumped to 8px,
   RecallSession), 8px (TimeTravelScrubber, EventReplayMenu). The
   8px standard should be the rule unless an explicit "subtle hover"
   intent justifies less.

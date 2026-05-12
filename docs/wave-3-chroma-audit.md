# Wave 3 — CHROMA Audit Findings

Cross-surface walk performed at the close of Wave 2. Each item below is a
visual-cohesion deviation that CHROMA cannot fix without crossing an
ownership boundary into another agent's territory, OR that is deferred for
a future sprint because the fix is more invasive than a polish pass.

The format for each item:

> **N. <short title>** · `<file path>` · _owner_
>
> Problem: …
>
> Suggested fix: …

---

## 1. Pre-existing FORGE TypeScript errors block `npm run build`
**File:** `src/lib/simulator/runSimulation.ts` · _FORGE_

Two TypeScript errors live in HEAD:

- Line 72 — `Type 'number' is not assignable to type '0.87'`. A literal
  type was inferred where a `number` is being assigned. Likely needs
  `as const` removed, or the constant typed as `number` rather than its
  literal value.
- Line 283 — `'optimistic' is declared but its value is never read`.
  Either consume the variable or drop the declaration.

These pre-date Wave 2. Every CHROMA Phase 5+ commit had clean typecheck on
the touched files but `npm run build` fails because of these two. FORGE
should fix them in the next simulator commit so the branch returns to
green.

---

## 2. AIAssistant header reads as a primary heading rather than an eyebrow
**File:** `src/components/shared/AIAssistant.tsx` · _ORACLE_

The chat panel header (`GridAlpha AI · Online`) is rendered at
`fontFamily: F.mono`, `fontSize: 11`, `color: C.textPrimary`. Mono caps at
textPrimary reads as a strong title — but the panel itself is a floating
inline panel sitting on the page, not a destination header. Within the
four-tier hierarchy, the panel header should be muted (textMuted) so the
streaming content reads as the dominant element.

**Suggested fix:** Drop the header color to `C.textSecondary` or
`C.textMuted`, and let the StatusDot + streaming caret carry the visual
charge. Defer until ORACLE finishes wiring the new
`useAIContextSnapshot` hook (active as of this audit).

---

## 3. PeregrineFullPage page-header H1 uses mono caps at 26px
**File:** `src/components/peregrine/PeregrineFullPage.tsx` · _CHROMA / TERMINAL/_

The destination header `PEREGRINE INTELLIGENCE` at line 113-119 is
rendered as `F.mono`, `fontSize: 26px`, `fontWeight: 700`, `letterSpacing:
0.04em`, uppercase. This is a "system label" treatment — every other
destination uses the eyebrow + EditorialIdentity rhythm
(VaultIndex / Alexandria / per-profile Nests). Wave 2 added hero
hierarchy to the news feed but did not refactor the page header itself —
the header still reads as a Bloomberg ticker label rather than an
editorial identity.

**Suggested fix:** Replace the 26px mono caps with eyebrow ("PJM MARKET
INTELLIGENCE", already there) + EditorialIdentity ("Live intelligence."
or similar), matching the rhythm used on every other destination.
Minor refactor — does not touch news-data flow.

---

## 4. Drop-shadow alpha on overlays inconsistent across CONDUIT/ATLAS/FOUNDRY
**Files:**
- `src/components/atlas/GridAtlasView.tsx:919` — `0 8px 22px rgba(0,0,0,0.35)`
- `src/components/GlobalShell.tsx:1538` — same
- `src/components/LMPCard.tsx:344` — `0 4px 16px rgba(0,0,0,0.4)`
- `src/components/shared/AIAssistantTrigger.tsx:33` — `0 4px 12px rgba(0,0,0,0.35)`
- `src/components/shared/AnnotationLayer.tsx:135` — `0 8px 18px rgba(0,0,0,0.40)`
- `src/components/shared/SavedViewsMenu.tsx:235` — `0 8px 18px rgba(0,0,0,0.35)` (inner element)

Wave 2 lowered the outer-panel shadows on SavedViewsMenu and
AnnotationDrawer to alpha 0.20 per the design rule "borders carry the
hierarchy, the shadow only separates from the layer behind." Several
inner elements and other overlays are still at 0.35–0.40.

**Suggested fix:** A separate sweep that lowers every overlay/popover/
floating element to alpha ≤ 0.25, OR a `T.elevation` token added to
`design/tokens.ts` so the value is shared. Tokens belong to FOUNDRY.
Tokens-extension proposal noted at the end of this doc.

---

## 5. Chart legend / micro-label fontSize 9px on Analytics tabs
**Files:**
- `src/components/analytics/tabs/BatteryArb.tsx:71`
- `src/components/analytics/tabs/Convergence.tsx:65,125`
- `src/components/analytics/tabs/MarginalFuel.tsx:68,85`

Analytics tabs use `fontSize: 9` on micro-labels (legend chips,
sub-axis ticks). The four-tier text scale starts at 10px — 9px is below
the documented system. At Trader-Nest density these labels are still
readable, but they break the typographic hygiene rule "no font size
below 10px."

**Suggested fix:** Promote the 9px micro-labels to 10px. ATLAS owns
those tab files now that they have eyebrows + identity. CHROMA can do
the bump in a polish-only pass, but it is being deferred so it can be
batched with any other Wave 3 ATLAS work on those tabs.

---

## 6. AnalyticsPage page-title is mono caps at 22px (same smell as Peregrine)
**File:** `src/components/AnalyticsPage.tsx:65-74` · _ATLAS_

The destination header `ANALYTICS` is rendered as `F.mono`, `fontSize:
22px`, `fontWeight: 700`, uppercase — same "system label" treatment that
Peregrine uses (see #3). Should follow the destination rhythm: eyebrow
("PJM MARKET INTELLIGENCE", already present) + EditorialIdentity hero.

**Suggested fix:** Same as #3 — small editorial refactor on the page
header. Does not touch tab content or data flow. Could be done as a
single AnalyticsPage commit.

---

## 7. tokens.ts has no `bgRaised` / `T.elevation` despite usage in the brief
**File:** `src/design/tokens.ts` · _FOUNDRY_

The Wave 2 brief calls for a four-tier elevation system anchored at
`#0C0D10` with the names `bgBase` / `bgSurface` / `bgElevated` /
`bgRaised`. The actual tokens are anchored at `#111117` and named
`bgBase` / `bgElevated` / `bgSurface` / `bgOverlay`. Each named tier maps
roughly but the canvas-deep `#0C0D10` and the "raised modal" tier do
not exist as tokens. CHROMA worked around this by mapping `bgOverlay`
to "raised" (used in SavedViewsMenu/AnnotationDrawer Phase 7) but that
is a convention, not a contract.

**Suggested fix:** Either rename / re-anchor the tokens to match the
brief, OR document the actual mapping in a "TOKEN CONTRACTS" section
of CLAUDE.md so future agents stop reading the brief literally. Token
edits belong to FOUNDRY. Documentation belongs to whichever agent
runs the next CHROMA pass.

---

## 8. Profile-specific atmospheric tints rely on tonal differences only
**File:** `src/components/terminal/PageAtmosphere.tsx`

The five profile tints (analyst / storage / industrial / student /
developer) are very subtle by design. On displays without enough color
gamut (older monitors, projectors, some mobile screens), the tonal
difference may not register at all — every Nest will read as the same
neutral white vignette. This is a deliberate design choice but worth
noting.

**Suggested fix:** Defer until product testing surfaces it as a real
issue. Possible escalation: bump tint alpha from 0.020-0.022 to
0.030-0.035, but that risks the Nests reading as "the green page"
or "the gold page", which violates "one product, six profiles."

---

## 9. SCRIBE's Entry viewer — coordination only
**File:** `src/components/vault/Entry.tsx` · _SCRIBE_

SCRIBE shipped Entry.tsx during Wave 2 (Sub-Tier 1A renderer). Per the
brief, CHROMA does not modify SCRIBE's curriculum work. The file uses
`PageAtmosphere variant="hero"` and editorial reading typography
(56px Instrument Serif title, 16px body at line-height 1.7,
maxWidth 780-ish) — already on the editorial standard. No CHROMA
intervention needed; flagged here only so future audits recognise it
as covered.

---

## 10. tabular-nums coverage on data-dense components
**Across** `src/components/`

`fontVariantNumeric: 'tabular-nums'` is used 107 times. `F.mono` is used
hundreds of times. Most data tables and charts inherit tabular-nums
through `T.dataValue` / `T.displayValue` presets, but a number of
inline-styled mono numerics do not — column totals shift fractionally
when values change.

**Suggested fix:** Audit every `F.mono` element that displays a
numeric value and add `fontVariantNumeric: 'tabular-nums'` if missing.
Deferred to a dedicated typography-hygiene pass — too broad for a
Wave 2 polish.

---

## Token-extension proposal (for FOUNDRY)

If FOUNDRY is willing to extend `design/tokens.ts` (additive, never
breaking), the following would make future CHROMA passes easier:

```ts
// New section — elevation shadows
export const E = {
  panel:   '0 8px 24px rgba(0,0,0,0.20)',  // dropdowns, side drawers
  modal:   '0 12px 32px rgba(0,0,0,0.25)', // centred modals
  trigger: '0 4px 12px rgba(0,0,0,0.20)',  // FAB-style triggers
};

// New section — profile colors (for non-atmospheric uses too)
export const PROFILE = {
  analyst:    '#B4C8DC',  // blue-gray
  storage:    '#78C8DC',  // teal
  industrial: '#DCC8B4',  // sand
  student:    '#B4DCC8',  // soft green
  developer:  '#DCC8A0',  // warm gold
};
```

Keeping these tokens centralized prevents the rgba-string-soup
problem and lets a single edit ripple to every consumer.

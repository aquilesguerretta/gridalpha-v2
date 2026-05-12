# Terminal anti-patterns

The most important file in this skill. Every item below is a pattern
that produces immediate, visible failure for GridAlpha. Most are
defaults in modern UI training data. Avoiding them is the single
highest-leverage thing the skill does.

Cross-references:
- See `terminal-typography.md` for positive typography alternatives.
- See `terminal-color.md` for positive color alternatives.
- See `terminal-composition.md` for positive composition alternatives.

---

## Generic SaaS hero

**Anti-pattern.** Centered headline + subhead + CTA button + decorative
gradient background. Often paired with a hero illustration.

**Why it's wrong for GridAlpha.** The terminal has no hero-section
job. Every screen leads with data, not with marketing copy. A
centered hero with a CTA is the visual signal of a landing page; the
operator is not being marketed to — they are working.

**Do instead.** Use the HERO composition mode (`terminal-composition.md`):
a left-aligned HeroNumber at 96–160px, an italic-gray-serif identity
line, and supporting metrics at 32–56px. No CTA. No subhead.

---

## Three-column feature card grid

**Anti-pattern.** Three identical bordered cards with an icon, a
short heading, and a paragraph each. Used as the second section of
every SaaS landing page.

**Why it's wrong.** Equal-weight grids violate the dominant focal
element rule (`terminal-composition.md`). They also tell the
operator that three things are equally important — almost never
true. And they put chrome (card borders) on top of content that is
better served as FLOW prose.

**Do instead.** Use FLOW mode with eyebrows + identity lines marking
each section. If the three items are genuinely a list, use a
`DataTable`.

---

## Stats section with oversized floating numbers and tiny labels

**Anti-pattern.** "$2.4B / 14k customers / 99.9% uptime" rendered as
giant disconnected numbers with whisper-thin labels below.

**Why it's wrong.** This is the SaaS-marketing version of a metric.
GridAlpha's `HeroNumber` primitive is the correct alternative — it
binds the number to its unit suffix in Falcon Gold, sits alongside
a F.mono label, and lives inside a tight identity-line treatment.
The oversized-floating treatment loses the unit, loses the precision,
and signals "designed for investors" rather than "designed for
operators".

**Do instead.** Use `HeroNumber` (`src/components/terminal/HeroNumber.tsx`)
or `MetricTile` with `regime` and `sub` props.

---

## Pricing tier comparison cards

**Anti-pattern.** Three or four cards showing tiers (Basic / Pro /
Enterprise) with checkmarks for features and a CTA.

**Why it's wrong.** GridAlpha terminal surfaces never compare
purchase tiers. If they need to compare entities (zones, plants,
strategies), use a `DataTable`.

**Do instead.** `DataTable` with one row per entity, columns for the
attributes being compared. Sort rows by the primary attribute.

---

## Purple-to-blue gradient hero backgrounds

**Anti-pattern.** Linear gradient from purple through blue (or
sometimes pink → orange) under hero copy.

**Why it's wrong.** This is the Web3 / consumer SaaS / crypto signal.
GridAlpha is none of those. The terminal canvas is warm-dark
(`C.bgBase`) with deliberate atmospheric vignettes (radial gradients
at low alpha) — never a sweeping linear gradient.

**Do instead.** Page canvas at `C.bgBase` with `PageAtmosphere`
(`src/components/terminal/PageAtmosphere.tsx`) providing the subtle
vignette.

---

## Gradient text for emphasis

**Anti-pattern.** `background-clip: text` with a gradient fill to
make a headline "pop".

**Why it's wrong.** Loses tabular-nums alignment for numeric values,
fails contrast checks, signals "marketing landing page". Emphasis
in GridAlpha is carried by size, weight, and color tier — not by
gradient fill.

**Do instead.** `C.textPrimary` at the appropriate weight, or
`C.electricBlue` if the emphasis is a live/active state.

---

## Pure black `#000000` or pure white `#FFFFFF`

**Anti-pattern.** Surfaces filled with `#000` or text rendered in `#FFF`.

**Why it's wrong.** Pure black reads as OLED test pattern; pure
white is hostile contrast on a dark surface. Both look like a CSS
reset that nobody finished.

**Do instead.** Backgrounds use `C.bgBase` / `bgElevated` / `bgSurface`
/ `bgOverlay`. Text uses `C.textPrimary` (`#F1F1F3`) / `textSecondary`
/ `textMuted`. See `terminal-color.md`.

---

## Default Inter or system-ui typography

**Anti-pattern.** Surfaces shipped with `font-family: Inter, system-ui,
sans-serif` (or no font declaration, falling through to the platform
default).

**Why it's wrong.** Inter is the editorial face (`F.sans`) for landing
and auth surfaces — not the terminal face. System-ui pulls in
SF Pro / Segoe / whatever the platform serves and produces typography
that varies across operators' machines. Bloomberg Terminal does not
look different on a Mac than on a Windows workstation; GridAlpha
should be the same.

**Do instead.** `F.mono` (Geist Mono) on every terminal surface.
See `terminal-typography.md`.

---

## Bounce / spring / elastic easing

**Anti-pattern.** Transitions that overshoot then settle. Cards that
"bounce" into place. Buttons that compress with a spring on press.

**Why it's wrong.** Reads as consumer app character. The operator
should not perceive the system as having character — it should
perceive it as responsive. Sharp ease-out feels responsive; bounce
feels playful.

**Do instead.** `cubic-bezier(0.4, 0, 0.2, 1)` at 150–250ms. See
`terminal-motion.md`.

---

## Glassmorphism on data cards

**Anti-pattern.** `backdrop-filter: blur(...)` on a bordered card
that contains data values.

**Why it's wrong.** Backdrop blur reduces the legibility of the
data behind it (which the operator may also need) and adds a
"frosted" character that conflicts with the institutional aesthetic.
It is also expensive on mid-range hardware.

**Do instead.** Blur is permitted only on the Cmd+P modal backdrop
(`rgba(0,0,0,0.6)` + `blur(4px)`) and on the AI Assistant trigger's
drop shadow context — never on a data-bearing surface. Data cards
get a solid `bgElevated` fill.

---

## Drop shadows on data cards

**Anti-pattern.** `box-shadow: 0 2px 8px rgba(0,0,0,0.20)` on every
data card.

**Why it's wrong.** Elevation in the terminal is communicated by the
four-tier surface palette (`bgBase` → `bgElevated` → `bgSurface` →
`bgOverlay`) and by the 1px top-edge accent. Drop shadows on every
card flatten the elevation hierarchy and add visual noise on a
data-dense surface.

**Do instead.** Use surface elevation. Drop shadows are reserved
for raised floating UI (CommandPalette, SavedViewsMenu,
AnnotationDrawer) at alpha ≤ 0.25, and the AI Assistant trigger
which needs to read as a deliberate floating button.

---

## Pill-shaped chips with full border-radius for metadata

**Anti-pattern.** Status indicators, tags, and metadata wrapped in
`border-radius: 9999px` pills with colored backgrounds.

**Why it's wrong.** Pill shapes are a Material / consumer-SaaS
convention. They consume horizontal space, demand colored
backgrounds, and produce visual rhythm that competes with the data
they decorate. The platform's shape rule caps border-radius at
12px (`R.xl`) and uses 4px (`R.sm`) for badges.

**Do instead.** Use the typography-led badge pattern from
`RegimeBadge` and `StatusDot`: 6×6 dot + F.mono caps label in the
relevant color. No pill background.

---

## Em-dash overuse as visual connector

**Anti-pattern.** Em dashes — used like this — sprinkled through
copy for visual interest, often combined with italic-gray-serif
flourishes outside the editorial layer.

**Why it's wrong.** Em dashes are a literary device. On a terminal
surface, they read as decorative copywriting. Operator-facing copy
should be terse: a label, a value, a unit, a timestamp.

**Do instead.** F.mono caps separators (` · `, middle-dot at
0.10em letter-spacing) for inline metadata. Em dashes belong to the
editorial / landing surface and to long-form prose (case studies,
documentation).

---

## Centered text alignment as default

**Anti-pattern.** Everything centered. Hero copy centered. Card
content centered. Tables centered.

**Why it's wrong.** Left-aligned data is faster to scan because the
eye returns to a consistent left edge between rows. Centered data
introduces a moving left edge that costs the operator a fraction of
a second per row — on a 20-row table, that's a real cost.

**Do instead.** Left-align everything by default. Right-align
numeric columns in `DataTable`. Center is reserved for empty-state
illustrations and explicitly-symmetric callouts (rare).

---

## Linear / Arc / Raycast / Notion minimalism

**Anti-pattern.** Adopting the aesthetic vocabulary of Linear, Arc,
Raycast, or Notion as a positive reference. Pastel accent colors,
soft-edged cards, generous whitespace, single-purpose pages.

**Why it's wrong.** These are positive references **for SaaS tools**
where the user is doing one task at a time and decoration helps. They
are **anti-references for GridAlpha**, which is an institutional
terminal where density is the value. A surface that "feels like
Linear" has been designed against the platform's grain.

**Do instead.** Anchor on Bloomberg Terminal, Palantir Gotham, ISA-101
industrial HMI references. Their density and discipline are the
target.

---

## Tailwind on layout-critical elements

**Anti-pattern.** Using Tailwind utility classes (`h-screen`, `w-full`,
`grid grid-cols-3`, `p-4`) on elements that participate in a CSS Grid
or Flex container that owns layout.

**Why it's wrong.** A historical failure documented in `CLAUDE.md`:
Tailwind classes for layout properties interact unpredictably with
the established grid pattern in `GlobalShell` and break in resize
events. Layout-critical elements must use inline styles with explicit
px values.

**Do instead.** Inline styles with `S` tokens for spacing and explicit
px values for grid dimensions. Tailwind is permitted only on
decorative or content elements that don't participate in
grid/flex sizing.

---

## Sine-wave decorative SVGs masquerading as data

**Anti-pattern.** A perfect sine wave rendered as a "chart" in a hero
section to imply data activity.

**Why it's wrong.** It is not data. The operator sees real data on
every other surface in the platform — a fake sine wave breaks the
trust contract immediately. It also signals "designer-built, not
operator-built".

**Do instead.** Render the real 24h LMP series with Recharts, or
omit the visual entirely. No fake data, ever.

---

## Equal-weight grids without a dominant focal element

**Anti-pattern.** A 3×3 grid of identically-sized cards. A row of
four identically-styled tiles. Every visible region has the same
visual weight.

**Why it's wrong.** Violates the dominant focal element rule
(`terminal-composition.md`). Operators scanning the page have no
anchor and end up reading every cell before they find the one that
matters.

**Do instead.** Designate one element as dominant (2× the next-
highest weight) via HeroNumber size, surface elevation shift, or
saturation. Smaller tiles can group around the dominant element.

---

## Missing tabular-nums on data values

**Anti-pattern.** A column of prices, percentages, or counts where
the digits don't align vertically because the numeric font is
proportional.

**Why it's wrong.** The column becomes unreadable as a column —
each row's digits sit at a different horizontal position. The
operator's eye has to re-aim per row.

**Do instead.** `fontVariantNumeric: 'tabular-nums'` on every
element that renders a number. This is non-negotiable. See
`terminal-typography.md`.

---

## Hero number templates with oversized numbers and tiny labels

**Anti-pattern.** A "stats hero" with a number at 96–120px and a
label below at 12px. Often rendered in default sans-serif at
modest weight.

**Why it's wrong.** This is the design-portfolio convention — it
sells the number, not the operator's understanding. Without the
unit suffix bound to the number, without the F.mono label rendering,
without the italic-gray-serif identity line nearby, the hero number
is decoration.

**Do instead.** Use the `HeroNumber` primitive. It binds the
Instrument Serif numeric face to the Falcon Gold unit suffix and
fits inside a `MetricTile` or a HERO composition that supplies the
label and identity line.

---

## "Loading..." text or generic spinners

**Anti-pattern.** Rendering "Loading..." text or a generic spinning
icon while async data is fetched.

**Why it's wrong.** The operator learns nothing about what's loading
or how long it will take. Generic spinners also produce a uniform
loading feel across the platform that doesn't communicate the
shape of the data.

**Do instead.** Use the `Skeleton.*` primitives (line, block, circle,
chart, hero number) shaped to the data that will appear. The
operator's eye finds the eventual position of the value before the
value arrives.

---

## Stale data rendered without a stale badge

**Anti-pattern.** A live metric continues rendering at full weight
after the underlying data stops updating.

**Why it's wrong.** The operator may act on a value that's actually
twenty minutes old, thinking it's live. Operator-trust failure.

**Do instead.** Use the `StaleBadge` primitive at the top-right of
the data container, surfacing the data age. The data continues to
render (the operator may still want to see the last-known value)
but the badge communicates its age.

---

## Decorative emoji in operator-facing copy

**Anti-pattern.** ⚡ in section headers, 🔥 next to high-volatility
zones, 📊 in card titles.

**Why it's wrong.** Emoji are platform-rendered (different on
different OS), break the F.mono cap rhythm, and signal "consumer
SaaS" or "designed for screenshots". Operators don't need emoji to
understand that a Storm Elliott case study is a critical event.

**Do instead.** Severity is communicated via color (`alertCritical`)
and via the StatusDot / RegimeBadge primitives. Section markers
are eyebrows in F.mono caps. The platform contains zero decorative
emoji.

# GridAlpha terminal — reference surfaces

Four surfaces in the existing codebase that exemplify the skill in
action. Each one demonstrates how multiple references compose into a
single coherent terminal surface.

---

## 1. TraderNest top fold

**Files.** `src/components/nest/trader/TraderNest.tsx`,
`src/components/nest/trader/HeroLMPBlock.tsx`,
`src/components/nest/trader/LMP24HChart.tsx`,
`src/components/nest/trader/ZoneWatchlist.tsx`.

**Why it exemplifies the skill.** This is the canonical HERO + FLOW
composition. The HeroLMPBlock takes the dominant focal weight via a
HeroNumber at 96–160px; the 24h chart, watchlist, and tile row below
it flow vertically without card chrome. Density is unambiguously high
(~50 data elements visible in the top fold) but every element earns
its position. References drawn: typography (Geist Mono lock,
tabular-nums, F.mono caps eyebrows), color (four-tier elevation,
Falcon Gold unit suffix on `$/MWh`, calm electric-blue active edges),
composition (HERO mode for the hero block, FLOW for the body),
density (operator-grade information per pixel).

**Design decisions worth highlighting.**

- The HeroNumber's Instrument Serif numeric face (the F.display
  exception scoped to the primitive) is paired with the Falcon Gold
  `$/MWh` suffix and a F.mono caps "WEST HUB · LMP" eyebrow above.
  Three faces, three roles, no ambiguity.
- The italic gray serif identity line ("Live.") supplies brand voice
  without adding visual weight. The eye still lands on the number,
  not on the identity line.
- The four-tile lower row (Spark Spread / BESS / Fuel Mix) uses
  `MetricTile` (compact-card CONTAINED sub-mode) because each tile
  is genuinely a discrete unit — a deliberate exception to the
  FLOW default, justified by the grouping signal.

---

## 2. Atlas time-travel scrubber + event replay state

**Files.** `src/components/atlas/TimeTravelScrubber.tsx`,
`src/components/atlas/EventReplayMenu.tsx`,
`src/components/atlas/TimeTravelLegend.tsx`.

**Why it exemplifies the skill.** The scrubber and event-replay menu
demonstrate how a stateful control surface stays on the GridAlpha
visual register. Mode changes (live → scrubbed → event-replay) are
the only animations on the surface — pure state-change motion, no
decoration. The event-replay state surfaces a falcon-gold "TIME
TRAVEL ACTIVE" pill that follows the Falcon Gold semantic rule
(deliberate moments, attention-inviting state). The map underneath
continues to render real data; the scrubber controls it.

**Design decisions worth highlighting.**

- The neon-cyan-and-glow first-pass got de-neoned in CHROMA Wave 3:
  electric-blue replaces every hardcoded `#00FFF0`, drop-shadow alpha
  drops from 0.45 to 0.20, the pill border-radius caps at `R.xl`
  (12px max). The result reads as terminal control, not as a sci-fi
  HUD.
- The "RETURN TO LIVE" affordance is text with an underline-on-hover,
  not a pill-shaped green button. Affordance is communicated by
  typography position and Falcon Gold semantic, not by chrome.
- The scrubber's loading state (when the historical fetch is in
  flight) reuses the `ga-connection-reconnect` pulse keyframes —
  one ambient animation pattern shared across the platform.

---

## 3. Industrial Strategy Simulator results

**Files.** `src/components/nest/industrial/StrategySimulator/SimulatorView.tsx`,
`src/components/nest/industrial/StrategySimulator/StrategyRanking.tsx`,
`src/components/nest/industrial/StrategySimulator/StrategyDetail.tsx`.

**Why it exemplifies the skill.** The simulator results page is the
canonical CONTAINED-dominant-card example. The ranked-strategy list
and per-strategy detail panel each wrap in `ContainedCard` because
each is a discrete unit the operator inspects. The top-ranked
strategy gets a "RECOMMENDED" eyebrow in falcon-gold — the warning-
adjacent semantic used here to mean "high-attention" (the operator's
recommended action). The hero NPV value uses the HeroNumber primitive
inside the detail panel; supporting metrics (payback years, IRR,
risk score) render at the smaller-scale F.mono with tabular-nums.

**Design decisions worth highlighting.**

- The dominant focal element rule plays out at the surface level
  (the ranking + detail grid dominates) and at the per-card level
  (the NPV HeroNumber dominates each detail panel). Nested
  hierarchies, each respecting the 2× rule.
- Scenario sensitivity (base / optimistic / pessimistic) is exposed
  as a tight three-button toggle, not as three separate cards. The
  data updates in place — animation is the toggle's color shift, not
  a card swap.
- "Export memo" is a button with text affordance, not an icon-only
  affordance. Operators reading the page get the action's intent
  without needing tooltip-hover.

---

## 4. Storage DA Bid Optimizer bid curve

**Files.** `src/components/nest/storage/DABidOptimizer/OptimizerView.tsx`,
`src/components/nest/storage/DABidOptimizer/BidCurveChart.tsx`,
`src/components/nest/storage/DABidOptimizer/AssetDetail.tsx`.

**Why it exemplifies the skill.** The Storage DA Bid Optimizer is
the cleanest demonstration of the platform's chart + data-table
pattern. The bid-curve chart renders 24 hours of charge/discharge
bars with the LMP overlay; below it sits the full hourly bid schedule
in a `DataTable` so the operator can read both shapes
simultaneously. Charge bars use `C.electricBlueLight` (calm blue,
deliberate-moment usage); discharge bars use `C.falconGold` (the
profitability moment); idle hours render in `C.alertNormal` muted
green. Three accent colors, ISA-101 semantic discipline.

**Design decisions worth highlighting.**

- The chart wraps in `AnnotatableChart` (`storage-bid-curve-<assetId>`),
  giving the operator the ability to annotate a specific hour without
  modifying the chart component itself. Wrap-not-replace.
- The performance-vs-optimal gauge sits next to the asset detail
  panel rather than under a separate "Performance" tab — the
  operator should see how well the schedule extracts revenue at
  the same glance as the schedule itself. Density supporting
  situational awareness.
- The PDF export button is a static-import wired affordance, not a
  feature-detected dynamic import (Wave 2's FORGE simulator hit
  that bug; Wave 3 doesn't repeat it). Affordance reliability is
  part of the institutional aesthetic.

---

## How to use these examples

When generating a new surface, identify which of the four it most
resembles (HERO-led Nest, stateful control, dominant-card results,
chart + table). Open the relevant files and trace the import graph
into FOUNDRY's primitives — `HeroNumber`, `ContainedCard`,
`MetricTile`, `DataTable`, `RegimeBadge`, `StatusDot`,
`EditorialIdentity`, `FlowSection`. The skill's references describe
the **vocabulary**; these examples describe the **idioms** that
vocabulary composes into.

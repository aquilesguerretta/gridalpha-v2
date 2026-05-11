# Terminal composition

How GridAlpha terminal surfaces lay out content. Three composition
modes — HERO, FLOW, CONTAINED — applied per region.

## The three modes

### HERO

A single dominant element occupies the primary visual weight of the
region. Everything else recedes. The hero element carries one
big-number reading, often paired with an italic-gray-serif identity
line and a tight set of supporting metrics in mono caps.

The HERO mode is the resolution of the "dominant focal element" rule
(below). It is the **only** way to mark a region as primary.

Used for: the top fold of every Nest, the hero strip of a destination
page, the headline section of a case study.

### FLOW

Continuous information flow down the page **without card chrome**.
Headers, eyebrows, data tables, charts, and aside callouts stack
vertically with the 8px baseline grid handling rhythm. There is no
bordered surface separating items — they sit on the page canvas
(`C.bgBase`).

FLOW is the **default** mode for most terminal surfaces. Reach for it
before reaching for CONTAINED.

Used for: the body of every Nest below the hero strip, every Analytics
tab, every Vault case study after the hero, every destination index.

### CONTAINED

A discrete unit of UI is wrapped in an explicit bordered surface.
Three sub-modes, narrowly scoped:

| Sub-mode | When to use |
| --- | --- |
| **Dominant card** | A region that needs to read as a single discrete unit and out-weigh nearby FLOW content. Example: the simulator results panel in IndustrialNest, the bid-curve panel in StorageNest. |
| **Compact card** | A small tile grouped with other small tiles, where the boundary helps distinguish the group from the page chrome. Example: `MetricTile`, the four-tile lower row of TraderNest. |
| **Expanded overlay** | A raised floating panel (modal, dropdown, side drawer) one elevation tier above the page chrome. Backed by `C.bgOverlay`. Example: `CommandPalette`, `SavedViewsMenu`, `AnnotationDrawer`. |

CONTAINED is **never** the default. Reach for it only when one of the
three sub-modes above applies. A CONTAINED block in the middle of a
FLOW page is a deliberate weight signal — not visual decoration.

## The card-heavy anti-pattern

Cards as default is AI slop. Every shipped open-source dashboard
template wraps every value in a card. GridAlpha rejects this. A region
of FLOW content beats a region of identically-bordered cards because
the operator can scan FLOW vertically without their eye stopping at
every border.

Symptoms of the anti-pattern, in this codebase, that get rejected in
review:

- Three-column or four-column equal-weight card grids without a
  designated dominant card
- Hero strips made of cards rather than a single HERO composition
- A FLOW page with every section wrapped in `ContainedCard`
- Cards nested inside cards
- A card whose only content is one number and one label (use FLOW
  with a `HeroNumber` instead, or use `MetricTile` if you genuinely
  need the compact-card grouping)

## The dominant focal element rule

Every screen, every region, must have **one element whose visual
weight is at least 2× the next-highest element**. This is non-
negotiable. A grid of equal-weight items has no dominant element and
reads as an undifferentiated wall of data.

Levers to produce the 2× weight:

- HeroNumber size jump (96–160 vs nested metrics at 32–56)
- Surface elevation shift (CONTAINED dominant card on a FLOW page)
- Atmospheric vignette tinting under the focal region
- Color saturation on the focal data (live `electricBlue` accent edge,
  Falcon Gold callout) while the rest stays muted

If a region has equal-weight items only, it is either the wrong
composition (use HERO for one of them) or it is genuinely a list (use
a `DataTable`, which is a single visual unit, not N equal cards).

## Grid and rhythm

- 8px baseline. All vertical and horizontal spacing is a multiple of 8.
- Allowed gaps: 4, 8, 12, 16, 24, 32, 48 — these are the `S` tokens.
- Tightly-coupled items (label + value, dot + caption): 4–8px
- Related items in a group (tiles in a row, fields in a form): 12–16px
- Sections in a FLOW page: 24–32px
- Major composition mode change (HERO → FLOW): 32px or a 1px rule

Internal card padding is `S.lg` (16px). Never 24px+ on a data card.
Never less than 12px.

## No nested cards

CONTAINED inside CONTAINED is forbidden. If a card contains a region
that needs visual separation, use:

- A nested cell at `C.bgSurface` (one tier above `bgElevated`) with no
  border, OR
- A 1px `borderDefault` divider between rows, OR
- An eyebrow + identity line (FLOW within CONTAINED) without further
  chrome.

The nested-cards instinct is an AI slop tell.

## Reference surfaces

### 1. HERO — `HeroLMPBlock.tsx` in `src/components/nest/trader/`

The Trader Nest top fold. A HeroNumber at size 96–160 dominates;
supporting stats (24h average, delta, regime badge) read at 32–56;
the italic gray serif identity line ("Live.") provides voice without
adding visual weight. The 2× rule is met by the HeroNumber size jump.

### 2. FLOW — body of Trader Nest below the hero strip

The Trader Nest body stacks the LMP 24h chart, AnomalyFeed,
ZoneWatchlist, the SparkSpread/Bess/FuelMix tile row, and the
PeregrinePreview rail vertically. No card chrome wraps the regions —
the page canvas (`C.bgBase`) holds them together. Each section is
marked by a `FlowSection` eyebrow + identity line, not by a border.

### 3. CONTAINED — `SimulatorView.tsx` results panel in `src/components/nest/industrial/StrategySimulator/`

The Industrial Strategy Simulator results page is the "dominant card"
example. The ranked-strategy list and the per-strategy detail panel
each render inside `ContainedCard` because each is a discrete unit that
must read as a single object the operator inspects. The expanded
overlay sub-mode is exemplified by `CommandPalette` (`src/components/
shared/CommandPalette.tsx`) sitting on `C.bgOverlay` one tier above the
page chrome.

# Terminal density

## Information density is a feature

GridAlpha follows ISA-101 industrial HMI conventions. Density supports
operator situational awareness; sparseness creates cognitive load.
Bloomberg Terminal puts a hundred prices on one screen because the
trader needs to see them simultaneously — not because the designer
ran out of restraint. GridAlpha terminal surfaces aim for the same
property at a more modern scale.

A surface that feels "too busy" to a designer steeped in SaaS
convention is usually the right density for a professional operator.

## Minimums

| Reference viewport | Floor |
| --- | --- |
| Full Nest at 1440 × 900 | **20 data elements visible** in the top fold |
| Trader Nest top fold (the hero + hero-adjacent strip) | **6 interactive elements** (zone watchlist rows, tiles, control buttons) |
| Analytics tab body at 1440 × 900 | **15 data elements** visible before scroll |
| Vault index | **8 case-study cards** visible in the top fold |
| Atlas live mode | The map itself counts as continuous data; the controls and overlays add **≥ 5 data elements** |

A surface that does not hit its floor is too sparse. Add real
information; do not add chrome.

## Padding

| Context | Padding |
| --- | --- |
| Inside a data container (table cells, tile bodies) | **4–8px** vertical, 8–12px horizontal |
| Between tiles in a tile row | **8–12px** |
| Between sections inside a Nest body | **24–32px** vertical (the FLOW rhythm) |
| Between composition modes (HERO → FLOW, FLOW → CONTAINED region) | **32px** or a 1px rule with 24px breathing on either side |
| Card internal padding (`ContainedCard`) | **`S.lg`** (16px). Never 24px+. |

Tight inside data containers, loose between composition modes. The
pattern carries the visual hierarchy without inflating the page.

## What white space is for

White space (or rather dark space — this is a dark platform) **serves
separation**, not decoration. The empty region between a section
eyebrow and the next section is doing structural work. The empty
margin around a hero number is **not** — that's a SaaS-marketing
convention. Hero numbers in GridAlpha sit tight against their unit
suffix and identity line.

A region of empty pixels with no separation rationale is wrong. Fill
it with data, or remove it.

## "Breathing room" is rejected

The SaaS-marketing principle that "every element needs breathing
room" does not apply to GridAlpha. It is a convention for landing
pages and consumer apps where the design's job is to slow the user
down and impress them. The terminal's job is the opposite: surface as
much real data per pixel as the operator can scan.

Tells of a violation:

- Tiles with 32px+ internal padding around one big number
- Sections separated by 64px+ of empty space
- A Nest body that fills less than 70% of viewport vertical with data
- A page that requires scrolling to see a third data element
- A "spacer" `<div>` whose only purpose is to push content down

If you find yourself adding breathing room because a surface "feels
cluttered", the fix is almost always to reorganize via FLOW + eyebrow
sections, not to add empty pixels.

## When density is too high

There is a real failure mode where density becomes illegible: two
numbers without enough horizontal space between them, a row whose
text is too small to read, a chart axis whose ticks collide. These
are typography and grid problems, not density problems. The fix is:

- Cut the typography size only if it's below 11px for body data
- Widen the column or tile only if its content genuinely overflows
- Drop the line-height to 1.2–1.3 (not below 1.0)
- Use the F.mono caps treatment (uppercase + 0.12em letter-spacing)
  to compress label widths

The fix is **never** "add more padding so it has room to breathe".

## Reference surfaces

### 1. TraderNest top fold — `src/components/nest/trader/TraderNest.tsx`

The Trader Nest top fold at 1440 × 900 carries: the HeroLMPBlock
(LMP value + 4 supporting metrics + regime badge + identity line),
the 24h LMP chart with hover tooltip, the ZoneWatchlist (5 zones × 4
columns each = 20 data points), the three tiles (SparkSpread, Bess,
FuelMix) each with 4–6 data points. That's ~50 data elements in the
top fold and ~6 interactive elements (chart hover, watchlist rows,
tile clicks). It meets the ISA-101 density bar comfortably.

### 2. Analytics workbench tabs — `src/components/analytics/tabs/`

Each Analytics tab packs a hero chart, a KPI row, a detail table or
sensitivity matrix, and a context strip into one page. The Price
Intelligence tab surfaces 4 KPIs + 24h overlay (48 data points) +
24h price-components breakdown (72 data points) without scrolling.
The Spark Spread tab renders 10 plant rows × 6 columns simultaneously.
The Battery Arb tab puts a 24h optimal schedule next to a 3×3
sensitivity matrix in the same fold.

These are the right densities. A "cleaner" version with one chart per
page and 20px+ padding everywhere would be a worse product.

# Terminal color

All hex values live in `src/design/tokens.ts`. This reference describes
the philosophy that produced them and the rules for composing them.
Never hardcode a hex value that's already in tokens; never invent a hex
value that isn't.

## Four-tier elevation

The terminal layer uses a warm dark palette with four discrete surface
tiers. Elevation is communicated by surface-color shift, **not by drop
shadow**.

| Token | Hex | Use |
| --- | --- | --- |
| `C.bgBase` | `#111117` | Page canvas. The layer atmospheric vignettes paint on. |
| `C.bgElevated` | `#18181f` | Data card surfaces (`ContainedCard`), inline panels, the AI Assistant inline panel. |
| `C.bgSurface` | `#1f1f28` | Nested cells inside cards, mini-tooltips, form inputs. |
| `C.bgOverlay` | `#27272f` | Floating raised UI: modal panels, dropdowns (`SavedViewsMenu`, `CommandPalette`), side drawers. |

Floating UI sits one tier above the page chrome. Inline UI sits at the
same tier as the page chrome. The four-tier system is enough — never
introduce a fifth tier with an in-between hex.

## Text hierarchy

| Token | Value | Use |
| --- | --- | --- |
| `C.textPrimary` | `#F1F1F3` | Hero numbers, primary headings, the one element the eye lands on first |
| `C.textSecondary` | `rgba(241,241,243,0.60)` | Body prose, secondary metrics, button text, default cell content in tables |
| `C.textMuted` | `rgba(241,241,243,0.35)` | Labels, eyebrows, axis ticks, metadata |
| inline `rgba(241,241,243,0.25)` | (not a token) | Disabled / archived / placeholder. Use sparingly. |

A surface that uses only `textPrimary` and `textMuted` reads as
flattened — introduce `textSecondary` for body prose so the eye has
somewhere to rest between hero and chrome.

## Primary accent

`C.electricBlue` (`#3B82F6`) is the primary accent — a **calm blue-500,
not neon cyan**. The token comment in `tokens.ts` is explicit on this.

Usage rule: **deliberate moments, not continuous decoration**. The
electric-blue accent marks:

- The 1px top-edge of every `ContainedCard` (`rgba(59,130,246,0.20)`,
  brightening to `0.40` on hover) — the active-edge chrome system
- Active selection state and focus rings
- Input carets (`caretColor: C.electricBlue`)
- Hyperlinks and Cmd+P result row hover (`rgba(59,130,246,0.10)`)
- The AI Assistant trigger button background

Variants in tokens: `electricBlueLight` (#60A5FA, hover-lighter),
`electricBlueMuted` (#2563EB, pressed/active), `electricBlueWash`
(rgba 10% alpha, fill background for highlighted regions).

Never use electric blue as a continuous decorative fill across large
surfaces. The platform reads as a calm dark canvas with electric blue
marking edges and moments.

## Secondary accent

`C.falconGold` (`#F59E0B`) is the second accent. It marks:

- **LIVE indicators** (live data badges, real-time status dots)
- **Live data unit suffixes** (`$/MWh`, `MW`, `GW` rendered after a
  HeroNumber)
- **Profitability moments** (positive trades, exceeded targets)
- **Warnings and delays** (the EVENT REPLAY pill in Atlas, stale-data
  badges, time-travel-active indicator)
- **Active selection in dev surfaces** (the ProfileSwitcher current row)

Variants: `falconGoldLight` (#FCD34D, hover-lighter), `falconGoldWash`
(rgba 10% alpha, fill).

Falcon Gold is not a generic warning color — it carries both the "live
right now" and "needs attention" semantics. Both meanings share the
same color because both invite the operator's eye.

## Alerts — the ISA-101 hierarchy

| Token | Hex | Strict meaning |
| --- | --- | --- |
| `C.alertCritical` | `#EF4444` | Critical only. Loss of service, hard threshold breach, must-act-now. Never decorative. |
| `C.alertHigh` | `#F97316` | Elevated severity, between warning and critical. |
| `C.alertWarning` | `#F59E0B` | Warnings, delays, stale data. (Same hex as falconGold by design.) |
| `C.alertInfo` | `#3B82F6` | Informational. Same hex as electricBlue. |
| `C.alertNormal` | `#10B981` | Healthy / live / nominal status. The green pulse. |
| `C.alertDiagnostic` | `#8B5CF6` | Diagnostic / system telemetry. |

**Semantic locks (do not violate):**

- Red is critical only. Never use red as a decorative accent, never as
  a chart color, never as a brand color.
- Falcon Gold / amber is warning only. Never as a decorative accent.
- Green is healthy / live only. Never as a generic success color
  outside operational health.

## Borders

| Token | Value | Use |
| --- | --- | --- |
| `C.borderDefault` | `rgba(255,255,255,0.07)` | Card borders, table row dividers, panel outlines |
| `C.borderStrong` | `rgba(255,255,255,0.12)` | Pulled-forward dividers when a region needs more separation |
| `C.borderActive` | `rgba(59,130,246,0.40)` | Top-edge of hovered or focused `ContainedCard` |
| `C.borderAccent` | `rgba(59,130,246,0.18)` | Bordered region inside the electric-blue tint |
| `C.borderAlert` | `rgba(239,68,68,0.35)` | Critical region outline |

Default border weight is 1px everywhere. Heavier borders are not used;
elevation shifts and accents carry the hierarchy.

## Per-surface accent budget

Max three accent colors per visible viewport, beyond the four-tier
background and the three text tiers. Pick from: electric blue, Falcon
Gold, alertNormal green. Other accents (orange, purple) appear only in
their semantic ISA-101 role and are not stacked together. A surface
that needs more than three accent colors is doing too much.

## Anti-patterns

- **No pure black `#000000`.** The terminal is warm-dark, not OLED-test-pattern dark. Use `C.bgBase`.
- **No pure white `#FFFFFF`** as a text color. Use `C.textPrimary` (`#F1F1F3`).
- **No purple-to-blue gradients** on backgrounds, accents, hero
  surfaces, or anywhere. They read as crypto / Web3 / consumer SaaS.
- **No tech-blue dominance.** Electric blue is the marker; the canvas
  is dark. Inverting that ratio reads as a Bootstrap dashboard.
- **No glassmorphism on data cards.** Backdrop-blur is permitted only
  on the Cmd+P backdrop overlay and the AI Assistant trigger's drop
  shadow — never on a data-bearing surface.
- **No red as a chart color** — even when the chart is showing losses
  or negative spreads. Use the muted falcon-gold or `electricBlueMuted`
  semantic instead.
- **No drop shadows on data cards.** Elevation shifts via surface hex.
  Shadows only appear on raised floating UI (Cmd+P drawer,
  SavedViewsMenu) at alpha ≤ 0.25.

## Reference surfaces

### 1. `HeroLMPBlock.tsx` — `src/components/nest/trader/HeroLMPBlock.tsx`

The four-tier system in one view: page canvas at `C.bgBase`, the
HeroLMPBlock card at `C.bgElevated` with a 1px `borderTop` in
`borderActive`, the inline mini-stats well at `C.bgSurface`. The `$/MWh`
unit suffix renders at `falconGold` 0.65 alpha — the canonical Falcon
Gold live-unit treatment.

### 2. `AnomalyFeed.tsx` — `src/components/nest/trader/AnomalyFeed.tsx`

ISA-101 alert hierarchy in action. Critical rows surface
`alertCritical`, warning rows surface `alertWarning`, info rows surface
`alertInfo`. The σ value next to each anomaly is colored by severity,
not as decoration.

### 3. `SavedViewsMenu.tsx` — `src/components/shared/SavedViewsMenu.tsx`

The "raised floating UI" example. The menu sits on `C.bgOverlay`
(one tier above page chrome) with a `borderTop: 1px borderActive` and
a low-alpha drop shadow (`rgba(0,0,0,0.20)`) that exists only to
separate the dropdown from the chrome behind it — not to imply
elevation on its own.

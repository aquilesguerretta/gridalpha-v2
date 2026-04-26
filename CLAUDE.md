# GridAlpha V2 — Design System Rules

## IDENTITY
This is a professional energy market intelligence terminal.
Visual reference: Bloomberg Terminal × Palantir Gotham × Linear.app
Not: SaaS dashboard, analytics template, Dribbble dark UI shot.

## MANDATORY TOKEN FILE
All colors, spacing, radii, and fonts MUST come from src/design/tokens.ts.
Import: `import { C, F, R, S, T } from '@/design/tokens'`
NEVER hardcode hex values, px values, or font stacks outside tokens.ts.

## TYPOGRAPHY — NON-NEGOTIABLE
- Primary font: Inter (F.sans) for body text and headlines.
- Data font: Geist Mono (F.mono) reserved for data values, prices,
  timestamps, badges, labels, and numeric readouts only.
- 4 sizes maximum per view: 10px labels, 13px secondary, 18-28px primary, 48px display.
- NEVER use Roboto, Arial, system-ui as standalone primary fonts — Inter only.
- NEVER mix font families arbitrarily: Inter for prose, Geist Mono for data.

## EXCEPTION: HeroNumber primitive
src/components/terminal/HeroNumber.tsx is the ONLY terminal component permitted to use F.display (Instrument Serif). Scoped strictly to numeric display (LMP values, spread values, hero metrics). Never for headlines, body text, or labels.

## ONE PRODUCT, TWO SURFACES

GridAlpha has two functional surfaces — landing/auth (editorial) and
terminal (Nest, Atlas, Analytics, Vault). They are the same product
visually. Same color tokens, same fonts, same atmospheric layers, same
chrome philosophy, same motion vocabulary.

The differences between them are functional:
- Terminal is denser (more info per pixel)
- Terminal is interactive (hover, click, brush)
- Terminal updates live

Both surfaces import from `src/design/tokens.ts` AND
`src/design/editorial.ts`. The previous prohibition on editorial
tokens in terminal files is rescinded. Specifically:

- `F.display` (Instrument Serif) is permitted in the terminal layer
  for hero numbers and breaking story headlines. The `HeroNumber`
  primitive remains the canonical use, but `PeregrinePreview` hero
  stories may also use it.
- Atmospheric background layers (radial gradients, dotted grid
  textures) are required in terminal page surfaces, calibrated to
  ~50% of landing page visibility.
- Falcon Gold (#F59E0B) marks LIVE indicators, live data unit
  suffixes ($/MWh), active selections, and positive moments. Not
  just warning regimes.
- Card chrome uses a top-edge active border treatment (1px top
  accent in `C.electricBlue` at 0.20 opacity, brightening on hover)
  instead of generic 1px borders.

Density rules from the original CLAUDE.md still apply — terminal is
denser than landing, and that constraint shapes typography sizes and
spacing.

Instrument Serif is loaded via a Google Fonts `<link>` tag in
`index.html`. Do not add `@fontsource` packages for it.

### Editorial voice in the terminal

The terminal is permitted (and encouraged) to use Instrument Serif
italic gray for short identity lines that give each section its voice.
Pattern:

- HeroLMPBlock identity line: ~26px serif italic
  rgba(255,255,255,0.45)
- Section identity lines (FLOW compositions): ~18px serif italic
  rgba(255,255,255,0.45)
- Each line is short — single word or short declarative phrase, period
  included
- Each line tells the user what the region IS, in the GridAlpha voice

This is not the same as a description or instruction. It is brand
voice — the same voice the landing page speaks ("Energy intelligence
for everyone.", "Three products. One grid.", "Live market
intelligence.").

## COLOR — NON-NEGOTIABLE
- Background system: C.bgBase (#111117) → C.bgElevated (#18181f)
  → C.bgSurface (#1f1f28) → C.bgOverlay.
- NEVER use pure black (#000) or pure neutral gray.
- Primary accent: C.electricBlue (#3B82F6) — calm blue-500, NOT neon cyan.
- Secondary accent: C.falconGold (#F59E0B). The profitability color.
- Status colors: C.alertCritical / alertHigh / alertWarning / alertNormal ONLY.
- NEVER invent a color. If the data needs a color not in tokens.ts, ask first.
- NEVER use purple-to-blue gradients as backgrounds or accents.
- NEVER use glassmorphism (frosted blur) on data cards.

## SHAPE — NON-NEGOTIABLE
- Card border-radius: R.lg (8px). MAXIMUM R.xl (12px) on modals only.
- Button border-radius: R.md (6px). NEVER rounded-full / pill shapes.
- Badge border-radius: R.sm (4px). NEVER pill badges on terminal components.
- NEVER exceed 12px border-radius on any element.

## SPACING — NON-NEGOTIABLE
- All spacing from S tokens: 4, 8, 12, 16, 24, 32, 48px.
- Card internal padding: S.lg (16px). NEVER 24px+ padding on data cards.
- NEVER use uniform spacing — related elements 8-12px, sections 24-32px.

## BORDERS
- Every card: 1px solid C.borderDefault, border-top: 1px solid C.borderAccent
- Hover state: border-top upgrades to C.borderActive
- Selected/active state: border-top upgrades to C.electricBlue at 100% opacity
- NEVER use box-shadow as the primary elevation signal — use border + background.

## MOTION — NON-NEGOTIABLE
- Duration: 150ms for micro, 200ms for panels, 250ms for view transitions.
- Easing: cubic-bezier(0.4, 0, 0.2, 1) — ease-out. ALWAYS.
- NEVER use spring, bounce, or elastic easing.
- NEVER animate layout properties (width, height, top, left).
- Animate ONLY: opacity, transform. Nothing else.
- Every animation must communicate a state change. If it's decorative: delete it.

## LAYOUT-CRITICAL ELEMENTS
Never use Tailwind classes for height, width, padding, or gap on any element
that is a direct child of a CSS Grid area or flex container that owns layout.
Use inline styles with explicit px values. Tailwind layout classes are permitted
only on decorative or content elements that do not participate in grid/flex sizing.

## WHAT THIS PLATFORM IS NOT
- Not a SaaS dashboard (no pill buttons, no gradient cards)
- Not a landing page (no scroll animations, no "coming soon" cards)
- Not a mobile app (no bottom sheets, no FABs, no swipe gestures)
- Not a consumer app (no bouncing, no haptic metaphors, no friendly illustrations)

## CURRENT DESIGN TOKENS (source of truth: src/design/tokens.ts)
- Primary font: Inter for all body text and headlines
- Data font: Geist Mono for prices, timestamps, badges, numbers
- Primary accent: #3B82F6 (blue-500) — NOT neon cyan
- Secondary accent: #F59E0B (Falcon Gold)
- Background base: #111117
- No Tailwind on layout-critical elements
- No hand-rolled SVG charts — Recharts only

## FOUNDRY CONTRACTS — REFERENCE

Quick-scan reference for the contracts FOUNDRY ships in
`feature/full-shell-buildout`. All paths relative to `src/`.

### Type contracts — `lib/types/`

| File | Exports |
| --- | --- |
| `profiles.ts` | `ProfileType` (re-export from `stores/authStore`) |
| `market.ts` | `Regime` (8 states), `PricePoint`, `ZoneSnapshot` |
| `feed.ts` | `AnomalySeverity`, `AnomalyItem` |
| `analytics.ts` | `AnalyticsTab` (6 tabs), `PlantProfitabilityRow`, `BidScheduleHour`, `FuelGanttSegment`, `ReserveMarginPoint`, `ConvergencePoint` |
| `vault.ts` | `CaseCategory`, `CaseSeverity`, `CaseStudyMetric`, `CaseStudyEvent`, `CaseStudy`, `ConceptTier`, `ConceptNode` |

`Regime` values: `normal` `burning` `suppressed` `scarcity` `transition` `discharging` `charging` `idle`.
`AnalyticsTab` values: `intelligence` `price` `spread` `battery` `marginal` `convergence` (`intelligence` consumes live RSS via `hooks/useNewsData`; the others use `analytics-mock`).

### Mock data — `lib/mock/`

| File | Headline exports |
| --- | --- |
| `analyst-mock.ts` | `COMPARISON_SERIES`, `SAVED_QUERIES`, `ANNOTATIONS`, `CORRELATION_MATRIX` (+ `CORRELATION_ZONES`), `SEASONAL_PATTERN`, `ANOMALY_DETECTIONS` |
| `storage-mock.ts` | `BATTERY_ASSETS` (4), `REVENUE_ATTRIBUTION_30D`, `DA_BID_RECOMMENDATIONS`, `CYCLING_TRACKER`, `ANCILLARY_SIGNALS`, `ASSET_HEALTH` |
| `industrial-mock.ts` | `FACILITY_PROFILE`, `STRATEGIES` (5), `TARIFF_COMPARISON`, `DEMAND_RESPONSE_OPPS`, `CARBON_INTENSITY`, `MONTHLY_BILL_PROJECTION` |
| `student-mock.ts` | `TODAY_EXPLAINER`, `STUDENT_CONCEPT_NODES` (11), `INTERVIEW_QUESTIONS`, `JOB_POSTINGS`, `COHORT_MEMBERS`, `SANDBOX_PNL` |
| `developer-mock.ts` | `PROJECT_PIPELINE` (4), `ZONE_REVENUE_HISTORY_24M`, `INTERCONNECTION_QUEUE`, `BINDING_CONSTRAINTS_12M`, `PPA_BENCHMARKS`, `POLICY_TRACKER` |
| `analytics-mock.ts` | `PRICE_INTELLIGENCE_KPIS`, `PRICE_INTELLIGENCE_OVERLAY`, `PRICE_COMPONENTS_BREAKDOWN`, `SPARK_SPREAD_PLANTS` (10), `DISPATCH_FRONTIER_MARKER`, `BATTERY_OPTIMAL_SCHEDULE`, `BATTERY_SENSITIVITY_MATRIX` (+ `BATTERY_SENSITIVITY_ROWS/COLS`), `MARGINAL_FUEL_GANTT_24H`, `RESERVE_MARGIN_24H`, `ZONE_RELIABILITY_SCORES` (8), `CONVERGENCE_24H`, `CONVERGENCE_OPPORTUNITIES` |
| `vault-mock.ts` | `CASE_STUDIES` (8), `ALEXANDRIA_NODES` (18 — foundation 4 / mechanics 8 / advanced 6) |

### Design primitives — `components/terminal/`

`HeroNumber` and `useHoverState` were pre-existing. Below are the 7 FOUNDRY adds.

| Component | Props |
| --- | --- |
| `EditorialIdentity` | `{ children: string; size?: 'hero' \| 'section'; marginTop?; marginBottom? }` — italic gray serif (F.display permitted) |
| `ContainedCard` | `{ children; padding?; minHeight?; style? }` — active-edge card chrome, hover via `useHoverState` |
| `FlowSection` | `{ eyebrow: string; eyebrowColor?: 'blue' \| 'gold'; identity: string; children }` — eyebrow + EditorialIdentity + content, no card chrome |
| `MetricTile` | `{ label: string; value: string \| number; unit?; sub?; regime?: Regime }` — wraps `ContainedCard` + `HeroNumber` (size=56) |
| `DataTable` | `{ columns: ColumnDef[]; rows: any[]; compact? }` — `ColumnDef = { key; label; align?; width?; render? }` |
| `RegimeBadge` | `{ regime: Regime }` — 6×6 dot + 11px caps label, color per `Regime` |
| `StatusDot` | `{ status: 'live' \| 'stale' \| 'offline' \| 'simulated' }` — 6×6 dot, `live` pulses |

### Shared components — `components/shared/`

`ErrorBoundary` and `CardSkeleton` were pre-existing. Below are the 4 FOUNDRY adds.

| Component | Props | Notes |
| --- | --- | --- |
| `AIAssistant` | none | Floating panel 360×480 at right:24/bottom:84, zIndex 9000. Reads `useUIStore.aiAssistantOpen`. Visual only — 3 mock exchanges. |
| `AIAssistantTrigger` | none | 48×48 electric-blue circle at right:24/bottom:84, zIndex 8500. Toggles `useUIStore.toggleAIAssistant`. |
| `CommandPalette` | none | Modal at zIndex 9500, 600×480. Reads `useUIStore.commandPaletteOpen`. Backdrop click and ESC close. |
| `SavedViewsMenu` | `{ onSelect?: (id: string) => void }` | 280px-wide stateless dropdown. 5 mock saved views. Caller positions and shows/hides. |

### UI store — `stores/uiStore.ts`

```ts
useUIStore: {
  aiAssistantOpen: boolean;
  commandPaletteOpen: boolean;
  toggleAIAssistant(): void;
  toggleCommandPalette(): void;
  closeAll(): void;
}
```

Persisted to `sessionStorage` under key `gridalpha-ui`.

### Keyboard shortcuts hook — `hooks/useKeyboardShortcuts.ts`

Mount once at the app shell root.

| Combo | Action |
| --- | --- |
| `Cmd/Ctrl+K` | toggle command palette |
| `Cmd/Ctrl+P` | contextual news drawer (placeholder — currently `console.log`) |
| `Cmd/Ctrl+/` | toggle AI Assistant |
| `Escape` | `closeAll()` |

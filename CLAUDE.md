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
| `SavedViewsMenu` | `{ open; onClose; anchorRef; onSaveCurrentClick }` | CONDUIT replaced the FOUNDRY mock with a real implementation. 320px-wide dropdown reading from `useSavedViewsStore`. See **CONDUIT INFRASTRUCTURE** at the bottom of this file. |

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

## ROUTING ARCHITECTURE — REFERENCE

Owned by ARCHITECT. Do not modify outside this section without
re-coordinating with the agent that owns the spine.

### Route map (`src/main.tsx`)

| Path | Element | Notes |
| --- | --- | --- |
| `/` | `<LandingPage />` | Landing surface — locked. |
| `/login` | `<LoginPage />` | Inside `<AuthLayout />`. |
| `/signup` | `<SignupCredentialsPage />` | Step 1. |
| `/signup/profile` | `<SignupProfilePage />` | Step 2 — writes `selectedProfile`. |
| `/signup/details` | `<SignupDetailsPage />` | Step 3 — profile-specific form. |
| `/signup/success` | `<SignupSuccessPage />` | Hands off to `/nest` with `state.fromAuth`. |
| `/nest` | `<GlobalShell initialView="nest" />` | Profile-routed (see below). |
| `/atlas` | `<GlobalShell initialView="atlas" />` | Mapbox Grid Atlas. |
| `/peregrine` | `<GlobalShell initialView="peregrine" />` | Renders `PeregrineFullPage`. |
| `/analytics` | `<GlobalShell initialView="analytics" />` | Renders `AnalyticsPage`. |
| `/vault` | `<GlobalShell initialView="vault" />` | Renders the `Vault` parent. |
| `/vault/alexandria` | `<GlobalShell initialView="vault" />` | Same shell — `Vault` reads `useParams`. |
| `/vault/:id` | `<GlobalShell initialView="vault" />` | Case-study route — `Vault` reads `useParams`. |
| `*` | `<LandingPage />` | Catch-all fallback. |

### Profile routing (`renderContent` in `GlobalShell`)

`/nest` switches on `useAuthStore().selectedProfile`:

| `selectedProfile` | Component | Source |
| --- | --- | --- |
| `'trader'` | `<TraderNest />` | `src/components/nest/trader/TraderNest.tsx` (locked) |
| `'analyst'` | `<AnalystNest />` | `src/components/nest/analyst/AnalystNest.tsx` (TERMINAL — placeholder for now) |
| `'storage'` | `<StorageNest />` | `src/components/nest/storage/StorageNest.tsx` (TERMINAL — placeholder) |
| `'industrial'` | `<IndustrialNest />` | `src/components/nest/industrial/IndustrialNest.tsx` (TERMINAL — placeholder) |
| `'student'` | `<StudentNest />` | `src/components/nest/student/StudentNest.tsx` (TERMINAL — placeholder) |
| `'developer'` | `<DeveloperNest />` | `src/components/nest/developer/DeveloperNest.tsx` (TERMINAL — placeholder) |
| `'everyone'` / `null` / anything else | `<EveryoneNest />` | `src/components/nest/everyone/EveryoneNest.tsx` (the legacy bento layout — fallback) |

`EveryoneNest` is the extracted former inline `NestView` — preserved
verbatim. It also re-exports the chart primitives (`SparkSpreadChart`,
`SOCGauge`), the window-average helpers (`avg`, `maxWindowAverage`,
`minWindowAverage`, `hourWindowLabel`) and `StatusDot`. GlobalShell's
KPI deep-dive pages (`SpreadFullPage`, `BatteryFullPage`,
`GapFullPage`) re-import them.

### Top nav (`TopBar` in `GlobalShell`, driven by `navItems`)

Five destinations, in order:

| Code | id | Label | Icon |
| --- | --- | --- | --- |
| 01 | `nest` | THE NEST | `<HexagonIcon />` |
| 02 | `atlas` | GRID ATLAS | `<DiamondIcon />` |
| 03 | `peregrine` | PEREGRINE | `<FalconNavIcon />` |
| 04 | `analytics` | ANALYTICS | `<TargetIcon />` |
| 05 | `vault` | VAULT | `<VaultIcon />` |

The bar is hidden on `atlas` (map-first) and on KPI full-pages
(`lmp`, `spread`, `battery`, `gap`, `genmix`). KPI full-pages are
not registered as routes — they are reached by clicking a KPI cell
inside `EveryoneNest`. Pressing `Escape` returns to `nest`.

### Dev switcher (`src/components/dev/ProfileSwitcher.tsx`)

Mounted only when `import.meta.env.DEV === true`. Floating bottom-right
button opens a dropdown with two sections:

- **PROFILE** — clicking writes `selectedProfile` via `useAuthStore.setProfile`. The current `/nest` route re-renders into the matching per-profile Nest.
- **VIEW** — clicking calls `useNavigate()` and routes to `/nest`, `/atlas`, `/peregrine`, `/analytics`, or `/vault`. The active row is derived from `useLocation().pathname`.

### What ARCHITECT owns

- `src/main.tsx` (route registration)
- `src/components/GlobalShell.tsx` (`NavState`, `viewLabels`, `GlobalShellProps`, `navItems`, `FalconNavIcon`, `TopBar`, `renderContent`, profile-routing logic, KPI full-page rendering, ProfileSwitcher mount)
- `src/components/dev/ProfileSwitcher.tsx`
- `src/components/nest/everyone/EveryoneNest.tsx` (the fallback Nest + shared chart primitives + window helpers + StatusDot)
- This section of CLAUDE.md

## AI ASSISTANT — ORACLE INFRASTRUCTURE

Owned by ORACLE. The floating AI Assistant panel — visual shell built
by FOUNDRY in `components/shared/AIAssistant.tsx` — is now wired to
the Anthropic API for real streaming chat with PJM market context.

### Files

| Path | Purpose |
| --- | --- |
| `src/lib/prompts/systemPrompt.ts` | The PJM-tuned system prompt. Sets tone, scope, profile-aware depth, and explicit guardrails (no fabricated prices, no trading advice). |
| `src/services/anthropic.ts` | SDK wrapper. Exposes `streamChat(messages, contextBlock)` — an async generator yielding `{ type: 'text' \| 'done' \| 'error' }` chunks — and `isApiKeyConfigured()`. Uses `dangerouslyAllowBrowser: true` for dev only; flagged to move server-side via the FastAPI backend before production. |
| `src/services/aiContext.ts` | `buildContextBlock({ profile, view, zone })` returns the context block prepended to the system prompt. `viewFromPathname()` derives the current view from the router pathname. Defines a local `ViewKey` until ARCHITECT ships `viewStore`. |
| `src/stores/conversationStore.ts` | Zustand store for chat history + streaming state. Persists only `messages` to `sessionStorage` (key: `gridalpha-conversation`) — streaming state is intentionally not persisted. |
| `src/hooks/useAIChat.ts` | High-level hook the component uses. Returns `{ messages, isStreaming, streamingText, error, send, clear }`. Reads profile from `authStore`, derives view from `useLocation().pathname`, accepts an optional `zone` arg. |
| `src/components/shared/AIAssistant.tsx` | Wired component. Streams text into the panel with a blinking electric-blue cursor, shows a red banner on error, disables input + textarea when no API key is configured, exposes a Clear control once a thread exists. |

### Conversation persistence

`conversationStore` uses Zustand `persist` middleware against
`sessionStorage`. Tab refresh keeps the thread alive; a new tab gets a
fresh conversation. Only `messages` is partialized — `isStreaming`,
`streamingText`, and `error` reset on reload.

### useAIChat signature

```ts
useAIChat(zone?: string | null): {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingText: string;
  error: string | null;
  send(text: string): Promise<void>;
  clear(): void;
}
```

`zone` is optional and defaults to `null` until ARCHITECT ships
`src/stores/viewStore.ts`. Once that lands, the hook can read
`useViewStore.selectedZone` directly without changing its public surface.

### Required environment variable

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Lives in `.env.local` (gitignored). `.env.local.example` documents the
variable. Without it, `isApiKeyConfigured()` returns `false`, the
header shows "Offline", the input disables, and any send attempt yields
an error banner explaining how to fix it.

### Production deployment

The dev wiring uses `dangerouslyAllowBrowser: true` so calls go directly
from the browser to the Anthropic API. **Before production**, route
calls through the FastAPI backend on Railway
(`gridalpha-v2-production.up.railway.app`) so the API key stays
server-side. The TODO is marked at the top of `services/anthropic.ts`.

### Model

Sprint default: `claude-sonnet-4-5`. Do not switch models without
re-coordinating with ORACLE.

## CONDUIT INFRASTRUCTURE — SAVED VIEWS & ANNOTATIONS

CONDUIT owns two cross-cutting infrastructure features that touch every
screen but don't belong to any one profile or destination. Both persist
to **localStorage** under namespaced keys so they survive a tab close;
when the FastAPI wiring sprint lands, they should move server-side.

### Saved Views

Lets a user capture the current view (route + profile) under a name,
restore it later, pin favourites, and share via URL.

**Files (CONDUIT-owned):**

| Path | Purpose |
| --- | --- |
| `src/services/viewSerialization.ts` | `ViewKey` type, `ViewSnapshot` shape, base64url encode/decode, `buildShareableUrl`, `readSnapshotFromUrl`, `viewKeyFromPathname`. |
| `src/stores/savedViewsStore.ts` | Zustand store of `SavedView[]`, persisted to `localStorage` under key `gridalpha-saved-views`. CRUD + pin + reorder. |
| `src/hooks/useSavedViews.ts` | `captureCurrentView`, `saveCurrentAs`, `restoreView`, `buildShareLink`, `copyShareLink`, plus per-view share-link helpers. |
| `src/hooks/useShareableUrl.ts` | Mounts once at the shell root. On load, reads `?v=...`, navigates to the encoded pathname, then strips the param. |
| `src/components/shared/SaveViewModal.tsx` | 480px modal asking the user to name the view. ESC closes, Enter submits. |
| `src/components/shared/SavedViewsMenu.tsx` | 320px dropdown listing pinned + all views. "+ Save current view" header, per-row pin / share / delete actions, empty state. |
| `src/components/shared/SavedViewsTrigger.tsx` | Top-nav bookmark icon button that owns the open/close state of the menu and the save modal. |

**Top-nav integration:** `SavedViewsTrigger` is mounted inside `TopBar`
in `GlobalShell.tsx`, between the `flex: 1` spacer and the LMP readout.
The trigger is hidden along with the rest of the right-side cluster on
map-first views (Atlas), matching the existing `!isMapFirst` guard.

**Shareable URL format:** `<origin><pathname>?v=<base64url(JSON)>`. The
JSON is a `ViewSnapshot { version, view, profile, zone, pathname,
payload, savedAt }`. `payload` is currently always `{}` and reserved
for per-view extra state once feature owners want to capture e.g. the
active analytics tab or scroll position.

**Capture API:**

```ts
import { useSavedViews } from '@/hooks/useSavedViews';

const { saveCurrentAs, restoreView, buildShareLink, copyShareLink } = useSavedViews();
saveCurrentAs('Morning routine');     // -> SavedView
restoreView(viewId);                  // navigates to its pathname
const url = buildShareLink();         // current view as URL string
await copyShareLink();                // writes URL to clipboard
```

**Limitation — zone capture:** `selectedZone` currently lives as React
state inside `GlobalShell` (no global store yet). CONDUIT writes
`zone: null` into every snapshot and zone restoration is a no-op.
When ARCHITECT introduces `src/stores/viewStore.ts` with a
`selectedZone` field, wire it into both `useSavedViews.captureCurrentView`
and `useShareableUrl` — the `ViewSnapshot.zone` slot is already there.

### Annotations

Lets a user drop a numbered note anywhere on a chart and have it persist
across sessions. Generic across chart libraries — coordinates are stored
as 0..1 fractions of the parent container, so Recharts, Mapbox, custom
SVG, or DOM-based timelines all work.

**Files (CONDUIT-owned):**

| Path | Purpose |
| --- | --- |
| `src/lib/types/annotation.ts` | `Annotation`, `AnnotationDraft`. |
| `src/stores/annotationStore.ts` | Single flat list keyed by `chartId`, persisted to `localStorage` under key `gridalpha-annotations`. |
| `src/hooks/useAnnotations.ts` | Per-chart hook returning the sorted slice plus `add`, `update`, `remove`, `clearAll`. |
| `src/components/shared/AnnotationDot.tsx` | 20×20 numbered marker, absolutely positioned at normalized coordinates. |
| `src/components/shared/AnnotationLayer.tsx` | Pointer-pass-through overlay (`position: absolute; inset: 0`). When `enabled`, click drops a new-annotation draft input. |
| `src/components/shared/AnnotationDrawer.tsx` | Right-edge sliding panel listing every annotation for a chart. Inline edit on double-click, per-row delete, footer "+ Add" + "Clear all". |
| `src/components/shared/AnnotatableChart.tsx` | Opt-in wrapper component. Wrap any chart in this and you get the layer + drawer + a floating toolbar for free. |

**chartId convention:** `<screen>:<chart-id>` so cross-chart features
(search, recent, jump-to) can route correctly later.

| Example chartId | Means |
| --- | --- |
| `trader-nest:lmp-24h` | Trader Nest's 24h LMP chart. |
| `analyst-nest:correlation-matrix` | Analyst Nest's correlation heatmap. |
| `vault:storm-elliott-chart` | The Storm Elliott case study chart in Vault. |
| `analytics:price-overlay` | Price Intelligence tab in Analytics. |

**Opt-in usage** (for chart owners — TERMINAL, ATLAS, the Trader Nest
team, etc.):

```tsx
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';

<AnnotatableChart chartId="trader-nest:lmp-24h">
  <LMP24HChart {...props} />
</AnnotatableChart>
```

That's it — the wrapper handles the layer, drawer, and toolbar. The
chart component itself is **never modified**. CONDUIT does not
retrofit any existing chart in this sprint; chart owners opt in when
they're ready.

**Direct (low-level) usage** for callers who want their own toolbar:

```tsx
import { AnnotationLayer } from '@/components/shared/AnnotationLayer';
import { AnnotationDrawer } from '@/components/shared/AnnotationDrawer';
import { useAnnotations } from '@/hooks/useAnnotations';

const chartId = 'analytics:price-overlay';
const { annotations } = useAnnotations(chartId);

<div style={{ position: 'relative' }}>
  <YourChart />
  <AnnotationLayer chartId={chartId} enabled={addMode} />
</div>
<AnnotationDrawer chartId={chartId} open={drawerOpen} onClose={...} />
```

### Persistence model

| Feature | localStorage key | Schema versioning |
| --- | --- | --- |
| Saved views | `gridalpha-saved-views` | Each `ViewSnapshot` carries a `version: 1` field. Future migrations live in `viewSerialization.decodeSnapshot`. |
| Annotations | `gridalpha-annotations` | None yet — add a top-level version field at the store level when the schema first changes. |

Both stores use Zustand's `persist` middleware. There is no migration
path implemented today because v1 is the only schema. When the FastAPI
backend lands (`gridalpha-v2-production.up.railway.app`), a sync layer
should mirror writes to the server and replace the local stores as the
source of truth — the public hook surface (`useSavedViews`,
`useAnnotations`) will not need to change.

### What CONDUIT owns vs. does not own

CONDUIT **may** create or modify any file listed in the two tables
above, plus a marked integration point in `src/components/GlobalShell.tsx`
(the `SavedViewsTrigger` mount and the `useShareableUrl()` call — both
flagged with `// CONDUIT —` comments).

CONDUIT **must not** modify any chart component itself. Annotations
attach via the `AnnotatableChart` wrapper, never by editing chart JSX.
Likewise, CONDUIT does not touch any per-profile Nest, the Atlas, the
Vault, or routing in `main.tsx`.


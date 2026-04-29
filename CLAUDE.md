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

## ALEXANDRIA CURRICULUM — SCRIBE INFRASTRUCTURE

Owned by SCRIBE. The lesson engine that runs Aquiles' curriculum
content inside Vault → Alexandria. Content authoring is iterative;
the engine itself should be stable.

### Lesson type — `src/lib/types/curriculum.ts`

```ts
interface Lesson {
  id: string;                  // matches ConceptNode.id in ALEXANDRIA_NODES
  title: string;
  difficulty: 'foundation' | 'mechanics' | 'advanced';
  readingMinutes: number;
  eyebrow: string;             // e.g. "01 · FOUNDATION"
  identity: string;            // italic-gray-serif identity line
  sections: LessonSection[];   // each is { heading, content }
  diagram: LessonDiagram;      // inline SVG (or placeholder)
  quiz: QuizQuestion[];        // five 4-option questions
  relatedConcepts: string[];   // ConceptNode ids
  nextLessonId: string | null;
}
```

`LessonSection.content` is plain text with `\n\n` paragraph breaks.
`LessonDiagram.type` is `'svg'` (with `svg` markup) or `'placeholder'`.
`QuizOption` has `{ id, text, correct, explanation? }`.

### Curriculum tree — `src/lib/curriculum/`

```
src/lib/curriculum/
  index.ts                              # LESSONS registry + lookup helpers
  lessons/
    what-is-electricity.ts              # id: a-electricity
    the-grid.ts                         # id: a-grid
    supply-and-demand.ts                # id: a-supply-demand
    isos-and-rtos.ts                    # id: a-isos
```

### Adding a new lesson

1. Create `src/lib/curriculum/lessons/<slug>.ts` exporting a `Lesson`.
   The `id` must match a `ConceptNode.id` in `ALEXANDRIA_NODES`.
2. Register the export in `src/lib/curriculum/index.ts`:
   ```ts
   import { newLesson } from './lessons/<slug>';
   export const LESSONS = { ..., [newLesson.id]: newLesson };
   ```
3. Alexandria automatically lights the matching node up as clickable
   and the lesson route `/vault/alexandria/lesson/<id>` starts working.

### Lookup helpers — `src/lib/curriculum/index.ts`

| Helper | Returns |
| --- | --- |
| `getLesson(id)` | `Lesson \| null` — exact-match lookup |
| `listLessons()` | `Lesson[]` |
| `hasLesson(id)` | `boolean` — used by Alexandria to gate clicks |
| `getNextLesson(id)` | `Lesson \| null` — follows `lesson.nextLessonId` |

### Progress store — `src/stores/progressStore.ts`

```ts
useProgressStore: {
  visited: Set<string>;
  completed: Set<string>;       // 3+ correct on the 5-question quiz
  quizAttempts: Record<string, { correct, total, at }[]>;
  markVisited(id), markCompleted(id), recordQuizAttempt(id, c, t);
  reset(), isVisited(id), isCompleted(id), getQuizHistory(id);
}
```

Persisted to `localStorage` under key `gridalpha-progress`. Sets are
flattened to arrays for serialization and rehydrated to `Set` on load
via `partialize` and `onRehydrateStorage`.

### Components — `src/components/vault/`

| Component | Purpose |
| --- | --- |
| `Lesson` | `{ lessonId }` — looks the lesson up, renders header + sections + diagram + quiz + footer; calls `markVisited` on mount; 404 view for unauthored ids. |
| `LessonQuiz` | `{ lessonId, quiz }` — five-question form, submit reveals correct/incorrect with explanations, records the attempt and flips lesson to completed at 3+/5. Retry resets state. |
| `LessonProgress` | none — strip rendered below the concept map; one cell per `ALEXANDRIA_NODES` entry, empty/visited/completed coloring, hover tooltip. |

`Alexandria.tsx` reads `useProgressStore` directly to overlay the
visited (blue ring) and completed (green checkmark) markers on each
SVG node, and routes via `useNavigate` when a node with an authored
lesson is clicked.

### Routing — `src/main.tsx` + `src/components/vault/Vault.tsx`

`/vault/alexandria/lesson/:lessonId` is registered between the
existing `/vault/alexandria` and `/vault/:id` routes. `Vault.tsx`
detects the `LESSON_PREFIX = '/alexandria/lesson/'` substring before
the `/alexandria` branch so the more specific route wins.

### Foundation lessons (current authored set)

| id | title | next |
| --- | --- | --- |
| `a-electricity` | What is electricity? | `a-grid` |
| `a-grid` | The grid | `a-supply-demand` |
| `a-supply-demand` | Supply and demand | `a-isos` |
| `a-isos` | ISOs and RTOs | `null` |

Mechanics (8) and advanced (6) lesson nodes are visible in the
Alexandria graph but route to a "Coming soon" view until authored
in future sprints.

### What SCRIBE owns

- `src/lib/types/curriculum.ts`
- `src/lib/curriculum/` (index + every lesson file)
- `src/stores/progressStore.ts`
- `src/components/vault/Lesson.tsx`
- `src/components/vault/LessonQuiz.tsx`
- `src/components/vault/LessonProgress.tsx`
- `src/components/vault/Alexandria.tsx` (interactivity + progress overlay only)
- `src/components/vault/Vault.tsx` (lesson route detection only)
- `src/main.tsx` (the lesson route line only)
- This section of CLAUDE.md

`ALEXANDRIA_NODES` in `src/lib/mock/vault-mock.ts` is FOUNDRY's
contract. SCRIBE reads it but does not modify it.

## VISUAL COHESION — APPLIED PATTERNS

CHROMA's pass propagated the visual language already proven on
TraderNest and the editorial layer to every other terminal surface.
The patterns below describe what is in place and how to extend it.

### PageAtmosphere primitive

`src/components/terminal/PageAtmosphere.tsx` is the canonical
atmospheric vignette wrapper. Every full-page terminal surface mounts
this at z-index 0; content rides above at z-index 1.

```tsx
import { PageAtmosphere } from '@/components/terminal/PageAtmosphere';

export function MyNest() {
  return (
    <PageAtmosphere>
      <div style={{ padding: S.xl }}>
        {/* content */}
      </div>
    </PageAtmosphere>
  );
}
```

Three variants:

| Variant | Use |
| --- | --- |
| `standard` (default) | Every Nest, VaultIndex, Alexandria, every Analytics tab |
| `hero` | Surfaces with a dominant Instrument Serif title (CaseStudyView) |
| `subtle` | Reserved for surfaces with their own dominant chart (Atlas, deep tabs) |

TraderNest does not use the primitive — it has its own inline
atmospheric layer that pre-dates PageAtmosphere and is locked. New
surfaces should use the primitive; do not copy the inline pattern.

When you build a new full-page surface, wrap with `PageAtmosphere`
rather than re-deriving a custom gradient. Prior versions of the
analytics tabs and vault surfaces shipped with bespoke
`pageVignette()` helpers (blue+gold radials, repeating-radial grain
textures); those have all been removed in favor of the primitive.

### Hierarchy convention — one dominant focal per screen

Every Nest must have one element that the eye lands on first. The
visual reference is TraderNest's `HeroLMPBlock`, which dominates
through Instrument Serif at 96–160px and pushes every other element
into a supporting role.

Per-Nest focal elements:

| Nest | Dominant focal |
| --- | --- |
| TraderNest | HeroLMPBlock (HeroNumber 96–160px) |
| AnalystNest | Dual HeroNumbers comparison (size 80) |
| StorageNest | PortfolioStrip — discharging asset elevated with falcon-gold borderTop 0.40 + inset gold inner glow |
| IndustrialNest | StrategySimulatorCard (minHeight 420) |
| StudentNest | ConceptMap card (SVG height 460 in a 520px card) |
| DeveloperNest | ProjectPipeline strip (4 cards, minHeight 220 each) |

If you add a new section to a Nest, make sure it does not visually
out-weigh the focal element. Lever options: lower minHeight, drop
the eyebrow color saturation, reduce HeroNumber size if it appears.

### Active-edge card chrome system

The 1px top accent on every data card — `rgba(59,130,246,0.20)` at
rest, brightening to `rgba(59,130,246,0.40)` on hover — is delivered
by two channels:

- `.ga-card` class in `src/index.css` for surfaces that use plain divs
- `ContainedCard` primitive in `src/components/terminal/` for React
  composition

Both produce the same visual outcome. Prefer `ContainedCard` for new
work because it also wires up `useHoverState` for hover transitions
and accepts a `style` prop for elevation overrides (see StorageNest's
discharging asset for the pattern).

### Visual changes propagate via primitives

If a future change wants to adjust the atmospheric vignette, the
active-edge accent color, the hero number scale, or any other
foundation, change it in the primitive — not in every consumer. The
five new Nests, the five Analytics tabs, and three Vault surfaces all
read from `PageAtmosphere`; one edit there ripples to every screen.

This is also why bespoke `pageVignette()` helpers and inline
gradient layers are deprecated in this codebase: they break that
single-edit guarantee.

### Top nav refinement notes

The TopBar in `GlobalShell.tsx` uses Tailwind for layout and is
ARCHITECT-owned. CHROMA may adjust visual treatment within the bar
(blur, weight, color, background opacity) but cannot change layout,
NavState, or routing. Structural questions about the wordmark or
the navItem layout should be raised via `// CHROMA-PROPOSAL:`
comments inline.

The bar currently uses `backdropFilter: blur(20px)` which matches
the editorial AuthLayout's translucent header. Active nav items
read at fontWeight 600; inactive at 500.

## TRADE JOURNAL — FORGE INFRASTRUCTURE

The Trade Journal is the Trader Nest's first signature depth feature.
Owned by FORGE; lives entirely inside the Trader Nest as a tab beside
the existing live-data view. No backend yet — all state and
attachments persist to localStorage and survive reloads.

### File tree

```
src/
  lib/
    types/journal.ts                  — JournalEntry, JournalAttachment,
                                        ReviewPrompt, EntryStance
    journal/reviewPromptGenerator.ts  — pure heuristic prompt generator
  stores/journalStore.ts              — Zustand store + persistence
  components/nest/trader/
    TraderNest.tsx                    — adds NEST | JOURNAL tab strip
                                        (only surgical change here)
    JournalTab.tsx                    — wrapper for tab orchestration
    journal/
      JournalView.tsx                 — main 2-column page
      JournalEntry.tsx                — single-entry card + lightbox
      JournalEntryEditor.tsx          — create/edit form
      JournalPnLChart.tsx             — Recharts P&L over time
      JournalReviewPanel.tsx          — weekly review prompts panel
      JournalFilters.tsx              — zone / tag / date / stance bar
```

### Persistence — `useJournalStore`

Persisted to `localStorage` under key `gridalpha-journal` via Zustand's
`persist` middleware. Shape:

```ts
{ entries: JournalEntry[] }
```

Public API:

| Method | Purpose |
| --- | --- |
| `addEntry(input)` | Append a new entry, returns the created `JournalEntry` |
| `updateEntry(id, patch)` | Patch any subset of fields, bumps `updatedAt` |
| `deleteEntry(id)` | Remove by id |
| `attachToEntry(id, file)` | Read a `File` to base64, push onto `attachments` |
| `removeAttachment(eId, aId)` | Remove an attachment |
| `markReviewed(id)` | Set `reviewed=true` and stamp `reviewedAt` |
| `clearAll()` | Reset to empty (escape hatch / dev) |
| `getEntry(id)` / `listEntries()` / `filterEntries(f)` | selectors |

### Attachment limits

Each attachment is hard-capped at **5 MB**. The store throws on
oversized files with a user-readable message; the editor surfaces it
inline. Files are stored as base64 data URLs inside `localStorage`,
so the practical aggregate ceiling is the browser's quota (~5 MB per
origin on most browsers — entries should typically attach 1–2
screenshots, not dozens). On quota exhaustion, the browser will throw
during `setItem`; the editor surfaces a generic upload error.

### Review prompt generator

`generateReviewPrompts(entries, options?)` is a pure function: no
store reads, no side effects, deterministic for a fixed `asOf`
timestamp. Default window is **30 days**. It surfaces four prompt
types:

| Type | Trigger | Question template |
| --- | --- | --- |
| `consistency` | 3+ entries on the same zone with mixed W/L | "You traded {zone} N times in the past {windowDays} days with mixed results (NW / NL). What did the winners share that the losers didn't?" |
| `opportunity` | 5+ entries sharing a tag | "You've logged N entries tagged '{tag}' in the past {windowDays} days. Are you systematically looking for these, or is the market pushing them at you?" |
| `reflection` | An entry unreviewed for 7+ days | "You haven't reviewed your entry from {date}: '{title}'. What did you learn?" |
| `pattern` | 4+ scored entries on a weekday with negative net P&L and more losses than wins | "Your {weekday} trades have been less profitable on average (NL vs NW in the past {windowDays} days). What's the common factor?" |

The thresholds are intentionally conservative — better to surface
fewer high-signal prompts than flood the panel.

### TraderNest tab strip

`TraderNest.tsx` is the only existing file FORGE modified. Added a
two-tab strip (`NEST` | `JOURNAL`) above the existing two-column
content grid. The grid renders only when `tab === 'nest'`; the
`JournalTab` renders only when `tab === 'journal'`. No sub-component
of the locked Trader Nest layout was touched. Tab state is local
React state (intentionally not persisted — every session opens to the
live grid).

### Future signature features

Trade Journal is the first of three planned signature depth features.
The same pattern — persistent, profile-specific tools shipped as new
tabs in their respective Nests — applies to:

- **Industrial Strategy Simulator** — Industrial Nest tab. Take a
  facility profile and simulate procurement / DR / efficiency
  strategies side-by-side.
- **Storage DA Bid Optimizer** — Storage Nest tab. Persistent
  bid-schedule playground with revenue attribution and cycling
  tracker.

Each one will live entirely inside its owning Nest, follow the same
file-tree convention (`/<feature>/<Component>.tsx`, plus a top-level
`<Feature>Tab.tsx` orchestrator), and use the same surgical
TraderNest tab-strip pattern to add itself without reshaping the
locked layouts.

## ALEXANDRIA SUB-TIER 1A — RENDERER INFRASTRUCTURE

Owned by SCRIBE. The "Foundations of Energy" tier is the new top band
of the Alexandria concept map (above the existing Foundation /
Mechanics / Advanced tiers). Six entries, each rendered at three
reading depths (L1 / L2 / L3). Sprint α — V1 of Sub-Tier 1A.

### The renderer-only contract

SCRIBE is a renderer, not an author. The L1 / L2 / L3 prose of every
entry comes from the curriculum author's handoff document and is
rendered verbatim. SCRIBE does not paraphrase, summarise, omit, or
"improve" any sentence. The handoff is the deliverable; the entry
data files are the rendered output.

The Sub-Tier 1A handoff lives at `Alexandria_SubTier_1A_Handoff_FULL.md`
at the repo root (placeholder pointer; the full prose is delivered to
SCRIBE in chat and rendered into the entry files).

The same renderer-only contract applies to all future Alexandria
sub-tier handoffs (1B, 1B.5, 1C, 1D, then Tier 2+).

### Two coexisting curriculum schemas

| Schema | Owns | Files |
| --- | --- | --- |
| `Lesson` | The original 4 foundation lessons (`a-electricity`, `a-grid`, `a-supply-demand`, `a-isos`). Locked. | `src/lib/curriculum/lessons/`, `src/lib/curriculum/index.ts`, `src/components/vault/Lesson.tsx`, `src/components/vault/LessonQuiz.tsx` |
| `CurriculumEntry` | The new 6 Sub-Tier 1A entries (`what-is-energy`, `power-vs-energy`, `forms-of-energy`, `units-and-orders-of-magnitude`, `entropy-and-second-law`, `efficiency`). | `src/lib/curriculum/entries/`, `src/lib/curriculum/entriesIndex.ts`, `src/components/vault/Entry.tsx` and supporting components |

Both schemas live side-by-side in `src/lib/types/curriculum.ts`. The
`Lesson` types remain untouched.

### The three-layer architecture

Every entry has three layer reading-depths:

- **L1 — Intuition** — smart 14-year-old, zero prerequisites. 3+
  audience-tagged examples in cards, optional Smil-style closing
  anchor, optional light-touch retrieval prompt.
- **L2 — Mechanism** — working professional adjacent to topic. One
  worked example with widget placeholder. Mandatory retrieval prompt
  that gates the L3 toggle and the Next-entry CTA.
- **L3 — Practitioner** — engineer, trader, regulator. Full prose
  with primary-source citations.

The L3 layer is the source of truth; L1 and L2 are progressive
distillations. Layer is selected via `?layer=L1|L2|L3`.

### Retrieval prompts (Production Rules 4.2 / 4.2b)

- L1 light-touch: a "Mark complete" button on a closing-reflection
  card. Persists to `progressStore.retrievalAcknowledged` but does
  not gate anything.
- L2 mandatory gate: an optional textarea (the response is for the
  reader and is not stored on the server) plus an "I've engaged with
  this" button. Until acknowledged, the LayerToggle's L3 button and
  the Footer's Next-entry CTA are disabled with a tooltip
  ("Engage with the L2 retrieval prompt to continue.").

### Audience archetype tags

Examples in L1 are tagged with one or more `AudienceArchetype` values
(`Newcomer`, `Trader`, `Engineer`, `Industrial`, `Policy`). For V1 all
readers see all examples; the tags are visual only. V2 personalisation
will surface examples matching the reader's archetype.

The `AudienceTag` component renders each tag as a small coloured pill;
colour mapping by archetype lives in
`src/components/vault/AudienceTag.tsx`.

### Cross-link map

`src/lib/curriculum/crossLinkMap.ts` maps canonical concept terms to
their authoritative entry slug:

```ts
'first law'    → 'what-is-energy'
'carnot'       → 'entropy-and-second-law'
'heat rate'    → 'efficiency'
'capacity factor' → 'power-vs-energy'
'kwh' / 'btu' / 'mmbtu' → 'units-and-orders-of-magnitude'
… etc.
```

`CrossLinkResolver` wraps prose paragraphs and converts matches to
react-router `<Link>` elements. Matching is case-insensitive but the
original casing is preserved in output. Self-links (term resolves to
the current entry) are skipped. To add a new canonical term: append
to the map. Order does not matter — the resolver sorts by length
descending so "second law of thermodynamics" wins over "second law".

### Diagrams (Production Rule 4.9)

Every entry has one canonical diagram that persists across all three
layers, getting progressively annotated. Diagram components live in
`src/lib/curriculum/diagrams/` and accept a `layer: LayerKey` prop.
Each entry's `diagramSpec.componentName` references one of these
components by name; the registry in `Entry.tsx` resolves the lookup.

| Component | Entry |
| --- | --- |
| `EnergyTransformationChain` | what-is-energy |
| `SpeedometerOdometer` | power-vs-energy |
| `FormsOfEnergyNetwork` | forms-of-energy |
| `UnitConversionLadder` | units-and-orders-of-magnitude |
| `HotCoffeeCooling` | entropy-and-second-law |
| `EfficiencyBoundary` | efficiency |

### Widget placeholders

V1 ships static placeholders showing the widget's spec (type,
description, inputs, outputs). The actual interactive React widgets
ship in a later sprint. The `EntryWidgetSpec` data model carries the
full schema so the placeholder card can render it without further
authoring.

### Progress store extension

`useProgressStore` carries five state fields:

- `visited: Set<string>` — Lesson IDs opened (original 4 lessons)
- `completed: Set<string>` — Lessons where quiz passed (3+/5)
- `quizAttempts: Record<string, QuizAttempt[]>`
- **NEW** `visitedLayers: Record<entryId, LayerKey[]>` — per-layer
  visit tracking for the new entries
- **NEW** `retrievalAcknowledged: Record<{entryId}:{layer}, boolean>`

Existing users get safe defaults (`{}`) for the new fields via
`onRehydrateStorage`. Methods: `markLayerVisited(entryId, layer)`,
`acknowledgeRetrieval(entryId, layer)`, `isLayerVisited(...)`,
`isRetrievalAcknowledged(...)`. The L1 / L2 / L3 progress contributes
to the unified 24-cell `LessonProgress` strip.

### Routing

| Path | Renders |
| --- | --- |
| `/vault/alexandria` | Alexandria concept map (4 tiers visible) |
| `/vault/alexandria/lesson/:lessonId` | original Lesson viewer |
| `/vault/alexandria/entry/:entrySlug?layer=L1\|L2\|L3` | new Entry viewer |

`Vault.tsx` checks the entry prefix before the lesson prefix and the
plain `/alexandria` route so the more specific path always wins.
`main.tsx` registers the entry route between the existing
`/lesson/:lessonId` and `/:id` routes.

### Concept map: 4 tiers

`src/lib/mock/vault-mock.ts` adds a sibling export
`FOUNDATIONS_OF_ENERGY_NODES` containing the 6 Sub-Tier 1A
ConceptNodes. The original `ALEXANDRIA_NODES` (18 nodes) is unchanged.

`Alexandria.tsx` mounts a separate `FoundationsOfEnergyMap` SVG
ContainedCard above the existing concept map. The new tier uses
falcon-gold accents to visually distinguish itself from the
electric-blue original 3 tiers. Click navigates to the Entry viewer
(separate from the Lesson route used by ALEXANDRIA_NODES).

### LessonProgress: unified 24-of-24

The progress strip below the concept map counts both Lesson nodes
(18) and Entry nodes (6) — total 24. New-entry cells get a
falcon-gold border accent. Visited / completed semantics:

- Original Lesson: visited if user opened the lesson; completed if
  they passed the quiz.
- New Entry: visited if L1 has been opened; completed if the L2
  retrieval prompt has been acknowledged OR all three layers have
  been visited.

### What SCRIBE owns (Sub-Tier 1A scope)

- `src/lib/types/audience.ts` (NEW)
- `src/lib/types/curriculum.ts` — extended (Lesson types preserved)
- `src/lib/curriculum/entries/*.ts` — the 6 entry data files
- `src/lib/curriculum/entriesIndex.ts`
- `src/lib/curriculum/crossLinkMap.ts`
- `src/lib/curriculum/diagrams/*.tsx` — the 6 diagram components
- `src/stores/progressStore.ts` — extended (Lesson tracking unchanged)
- `src/components/vault/Entry.tsx`
- `src/components/vault/LayerToggle.tsx`
- `src/components/vault/PrerequisiteChain.tsx`
- `src/components/vault/EntryBreadcrumb.tsx`
- `src/components/vault/AudienceTag.tsx`
- `src/components/vault/RetrievalPrompt.tsx`
- `src/components/vault/WidgetPlaceholder.tsx`
- `src/components/vault/WorkedExample.tsx`
- `src/components/vault/PrimarySourceList.tsx`
- `src/components/vault/ClosingAnchor.tsx`
- `src/components/vault/CrossLinkResolver.tsx`
- `src/components/vault/Alexandria.tsx` — Foundations tier mount only
- `src/components/vault/Vault.tsx` — entry route detection only
- `src/components/vault/LessonProgress.tsx` — 24-cell unification
- `src/main.tsx` — the entry route line only
- `src/lib/mock/vault-mock.ts` — `FOUNDATIONS_OF_ENERGY_NODES` sibling export only
- This section of CLAUDE.md

`ALEXANDRIA_NODES` and the existing 4 Lesson files remain locked.

## CHROMA WAVE 2 — VISUAL COHESION MAP

CHROMA owns visual cohesion across the platform. Wave 1 established the
PageAtmosphere primitive and propagated atmospheric vignettes to every
new surface (Nests, Vault, Analytics tabs). Wave 2 layered profile-
specific tints on top of that foundation, swept through everything
shipped after Wave 1 (Trader Journal, AI Assistant, Saved Views,
Annotations, Peregrine, SCRIBE's Lesson surface, the new Sub-Tier 1A
Entry viewer), and applied a hero-hierarchy lock on Analytics tabs and
Peregrine.

### Surfaces with the CHROMA pass applied

| Surface | Wave 1 | Wave 2 | Notes |
| --- | --- | --- | --- |
| TraderNest | ✓ | (locked) | Inline atmospheric vignette — the reference pattern. Do not modify. |
| AnalystNest | ✓ | ✓ | tint="analyst" — cool blue-gray |
| StorageNest | ✓ | ✓ | tint="storage" — subtle teal-blue |
| IndustrialNest | ✓ | ✓ | tint="industrial" — warm sand |
| StudentNest | ✓ | ✓ | tint="student" — subtle green |
| DeveloperNest | ✓ | ✓ | tint="developer" — warm gold |
| VaultIndex | ✓ | (verified) | variant="standard" |
| Alexandria | ✓ | (verified) | variant="standard" — 4-tier concept map (SCRIBE) |
| CaseStudyView | ✓ | ✓ | variant="hero" + WrittenSection paragraph splitting |
| Lesson (SCRIBE) | — | (verified) | variant="hero" + 16px body / line-height 1.7 |
| Entry (SCRIBE Sub-Tier 1A) | — | (deferred per ownership) | SCRIBE-owned — already on editorial standard |
| Analytics tabs (5) | ✓ | ✓ | Each tab has one hero element, marginBottom S.lg → S.xl |
| PeregrineFullPage | — | ✓ | Hero / standard / compact tier in news feed |
| TraderNest > Journal | — | ✓ | Header rhythm aligned with rest of platform |
| AI Assistant | — | (deferred) | ORACLE actively iterating; small audit notes filed |
| SaveViewModal | — | ✓ | Backdrop alpha 0.6 → 0.72, blur 4px → 8px |
| SavedViewsMenu | — | ✓ | bgElevated → bgOverlay, shadow alpha 0.40 → 0.20 |
| AnnotationDrawer | — | ✓ | Same elevation+shadow refinement |

### Profile-specific atmospheric tints

`PageAtmosphere` accepts an optional `tint` prop that overrides the
neutral white-luminance variant. Each tint is a subtle wash layered on
top of the standard vignette, giving each profile Nest a distinctive
emotional temperature without breaking from the unified product.

```tsx
<PageAtmosphere tint="analyst">{/* … */}</PageAtmosphere>
```

| Tint | RGBA core | Reads as |
| --- | --- | --- |
| `analyst` | `rgba(180,200,220,0.020)` | precision, comparison |
| `storage` | `rgba(120,200,220,0.022)` | movement, dispatch |
| `industrial` | `rgba(220,200,180,0.022)` | operations, facility |
| `student` | `rgba(180,220,200,0.020)` | growth, learning |
| `developer` | `rgba(220,200,160,0.022)` | build, capital |

The neutral `variant` prop (`'standard'` / `'hero'` / `'subtle'`) still
exists for surfaces that do not belong to a single profile (Vault,
Analytics tabs, generic Nest fallback).

### Four-tier text hierarchy

Use these tokens, in this order of weight, on every surface:

| Token | Value | When to use |
| --- | --- | --- |
| `C.textPrimary` | `#F1F1F3` | hero numbers, primary destination headings, the one element the eye lands on |
| `C.textSecondary` | `rgba(241,241,243,0.60)` | body prose, secondary metrics, button text |
| `C.textMuted` | `rgba(241,241,243,0.35)` | labels, eyebrows, metadata, axis ticks |
| inline ~0.25 alpha | (not a token) | disabled / archived / placeholder — use sparingly |

If a surface uses only `textPrimary` and `textMuted`, the missing middle
tier flattens the hierarchy. Introduce `textSecondary` for body prose
and the eye gets somewhere to rest between the hero and the chrome.

### Four-tier surface elevation

The token names are anchored at `#111117` rather than the
`#0C0D10`-anchored scheme described in the Wave 2 brief. Treat the
tokens below as the contract:

| Token | Value | Use |
| --- | --- | --- |
| `C.bgBase` | `#111117` | page canvas — the layer PageAtmosphere paints on |
| `C.bgElevated` | `#18181f` | data card surfaces (`ContainedCard`), inline panels |
| `C.bgSurface` | `#1f1f28` | nested cells, mini-tooltip popovers, inputs |
| `C.bgOverlay` | `#27272f` | floating dropdowns, modal panels, side drawers (raised UI) |

Wave 2 standardised SavedViewsMenu and AnnotationDrawer to `bgOverlay`
so floating UI sits one tier above the page. AIAssistant (inline panel
docked at the corner) stays on `bgElevated` because it is part of the
page chrome, not a raised modal.

### Hero hierarchy rule

Every screen must have ONE element that the eye lands on first.
Per-Nest focal elements are documented in the existing "VISUAL
COHESION — APPLIED PATTERNS" section above. Wave 2 added two more
locks:

| Surface | Hero element |
| --- | --- |
| Each Analytics tab | the first major chart card (height bumped, marginBottom S.lg → S.xl) |
| PeregrineFullPage news feed | item index 0 — Instrument Serif title at 32px, summary at 16px line-height 1.6, atmospheric glow over the row |

### How to extend

- New surface added by another agent? Wrap with `<PageAtmosphere>`
  using the appropriate variant (or tint, if it's a per-profile
  surface).
- New floating panel? Use `bgOverlay`, `border: 1px solid borderDefault`,
  `borderTop: 1px solid borderActive`, shadow alpha ≤ 0.25.
- New body prose? `F.sans`, 16px, line-height 1.6-1.7, max-width
  720-780. Anything denser belongs in a label (`F.mono` 10-11px caps).

### Reference: PageAtmosphere primitive

`src/components/terminal/PageAtmosphere.tsx`. Wave 1 added the
`variant` prop. Wave 2 added the additive `tint` prop. Existing
callers using `variant` continue to work unchanged.

### Deferred items

See `docs/wave-3-chroma-audit.md` for the full list of visual-cohesion
deviations CHROMA cannot fix without crossing an ownership boundary,
plus a token-extension proposal for FOUNDRY (elevation shadow tokens
and profile color tokens).

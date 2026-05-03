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

## FORGE WAVE 2 — INDUSTRIAL STRATEGY SIMULATOR

The Industrial Consumer profile's signature feature. Real NPV simulator
with sensitivity analysis, carbon reduction tracking, and ranked
strategy combinations. Lives entirely inside the Industrial Nest as a
new tab beside the existing OVERVIEW. The same surgical-tab-strip
pattern as FORGE Wave 1 (Trader Journal) — one new tab, no reshape of
the locked layouts.

This is also the proof-of-concept for **GridAlpha Simulate** — a future
standalone product that will graduate the simulator out of the Nest
and into its own surface.

### Architecture

| Path | Purpose |
| --- | --- |
| `src/lib/types/simulator.ts` | Type system: `FacilityProfile`, `Strategy`, `StrategyComponent`, `StrategyResult`, `ScenarioResult`, `DispatchHour`, `SensitivityScenario`, `RiskRanking`. |
| `src/lib/mock/simulator-mock.ts` | 4 representative facility profiles (mining, manufacturing, datacenter, agricultural), 4 PJM tariff structures, technology cost assumptions, zone carbon-intensity table, hourly load profile shapes, solar irradiance coefficients. |
| `src/lib/simulator/npv.ts` | Pure NPV / payback math. End-of-year cashflows, year-zero capex. |
| `src/lib/simulator/dispatch.ts` | Heuristic hour-by-hour dispatch. Solar serves load → surplus charges battery → battery discharges if economic → grid covers remainder. Diesel is reserve-only in V1. |
| `src/lib/simulator/scenarios.ts` | `generateStrategies(profile)` — produces up to 11 evaluable strategies based on the facility's existing assets and capital budget. |
| `src/lib/simulator/sensitivity.ts` | The 3 fixed scenarios (base / optimistic / pessimistic) and their multipliers. |
| `src/lib/simulator/runSimulation.ts` | Main entry. Runs 8,760 hours × 11 strategies × 3 scenarios (~290k dispatch calls), computes per-strategy NPV / payback / carbon delta / representative-day dispatch, ranks by base NPV. |
| `src/stores/simulatorStore.ts` | Zustand store. Persists facility profiles + active selection to `localStorage` under `gridalpha-simulator`. **Does not persist results** — they recompute on demand. |
| `src/hooks/useSimulator.ts` | Orchestration hook. Exposes `{ profile, results, isRunning, run, setProfile, selectStrategy, selectScenario, clear }`. `run()` defers the synchronous engine work by one tick so the UI can render the running state. |
| `src/components/nest/industrial/StrategySimulator/SimulatorView.tsx` | Top-level page. Three states: no profile → form; profile + no results → CTA; results → ranking + detail. |
| `src/components/nest/industrial/StrategySimulator/FacilityProfileForm.tsx` | Form: preset dropdown, name, zone, annual MWh slider, tariff kind, energy rate, demand charge, existing solar / battery, capital budget, discount rate. |
| `src/components/nest/industrial/StrategySimulator/StrategyRanking.tsx` | Sorted list. Top row = "RECOMMENDED" in falcon-gold. Click a row to select. |
| `src/components/nest/industrial/StrategySimulator/StrategyDetail.tsx` | Detail panel: header + KPI strip + scenario toggle + Sensitivity / Dispatch / Carbon visuals + components breakdown + ExportMemoButton. |
| `src/components/nest/industrial/StrategySimulator/SensitivityChart.tsx` | Recharts BarChart wrapped in `AnnotatableChart` (chartId `industrial-sim-sensitivity-<id>`). |
| `src/components/nest/industrial/StrategySimulator/HourlyDispatchChart.tsx` | Stacked AreaChart of representative day, wrapped in `AnnotatableChart` (chartId `industrial-sim-dispatch-<id>`). |
| `src/components/nest/industrial/StrategySimulator/CarbonReduction.tsx` | Hero number + cumulative reduction LineChart, with EPA-style equivalences. |
| `src/components/nest/industrial/StrategySimulator/ExportMemoButton.tsx` | Stub. Feature-detects `@/services/pdfExport` at runtime; disabled with "PDF export coming soon" until CONDUIT-2 ships the pipeline. |

### How a simulation runs

1. User opens the Industrial Nest → STRATEGY SIMULATOR tab.
2. If no profile is persisted, `FacilityProfileForm` renders.
3. User picks a preset (or "Custom") and tunes the sliders.
4. On submit, the profile lands in the simulator store (persisted).
5. `useSimulator.run()` defers 50 ms, then calls `runSimulation(profile)`.
6. `runSimulation` calls `generateStrategies(profile)` → for each
   strategy, runs an 8,760-hour dispatch under base/optimistic/pessimistic,
   sums to annual cost, projects 10 years of constant savings,
   discounts to NPV, computes carbon delta vs baseline, and assesses
   risk by comparing the pessimistic to base NPV.
7. Results sort by base NPV descending; the top strategy auto-selects.
8. `StrategyRanking` shows the list; `StrategyDetail` shows the
   scenario toggle and the visual trio for the selected strategy.

Engine completes well under 2 s for default facilities.

### Persistence and state

- `localStorage` key: `gridalpha-simulator`.
- Persisted: `facilityProfiles`, `activeFacilityId`, `selectedScenario`.
- **Not** persisted: `results`, `isRunning`, `selectedStrategyId` —
  these recompute / re-derive on every load. The user sees the
  CTA card after reload and clicks "RUN SIMULATION →" again.

### NPV math

```
NPV = -CapEx + Σᵢ (Annual_Savings_i / (1 + r)^(i+1))     for i = 0..9
```

- `CapEx` paid at year zero, scaled by `scenario.capExMultiplier`.
- `Annual_Savings_i` = `baseline_annual_cost - strategy_annual_cost`.
- `r` = `profile.discountRate` (default 0.08).
- 10-year horizon (configurable in a future iteration).

### Sensitivity multipliers

| Scenario | Grid price | Capex | Solar yield |
| --- | --- | --- | --- |
| Base | 1.00× | 1.00× | 1.00× |
| Optimistic | 0.90× | 0.85× | 1.05× |
| Pessimistic | 1.20× | 1.05× | 0.95× |

### Carbon model

- Grid: zone-specific gCO₂/kWh (e.g. WEST_HUB ~420; AEP ~510; PSEG ~350).
- Solar: 0 gCO₂/kWh operational.
- Battery losses: charged back to grid intensity (`(1 - RTE) × battery_throughput`).
- Diesel: 800 gCO₂/kWh.

### What FORGE owns (Wave 2 scope)

- `src/lib/types/simulator.ts`
- `src/lib/mock/simulator-mock.ts`
- `src/lib/simulator/*` (npv, dispatch, scenarios, sensitivity, runSimulation)
- `src/stores/simulatorStore.ts`
- `src/hooks/useSimulator.ts`
- `src/components/nest/industrial/StrategySimulator/*` (8 components)
- `src/components/nest/industrial/IndustrialNest.tsx` — added a tab strip and replaced the legacy `<StrategySimulatorCard />` placeholder with the new `<SimulatorView />` mounted on the SIMULATOR tab. The Nest's other surfaces (hero, tariff, carbon, demand response, alerts, profile card) are unchanged.
- This section of CLAUDE.md

### Future work

- **PDF memo export** — depends on CONDUIT-2's `src/services/pdfExport.ts`
  pipeline. ExportMemoButton already feature-detects via runtime
  dynamic-import; flipping a single flag enables it.
- **Optimization solver** — replace the heuristic dispatch with an
  actual MILP. The current heuristic biases toward conservative
  battery utilization (proxies the round-trip cost as a fraction of
  grid rate); a proper MILP can extract more arbitrage value.
- **Live PJM data** — the dispatch loop currently reads the static
  tariff and solar coefficients. When the FastAPI backend lands
  (`gridalpha-v2-production.up.railway.app`), the simulator reads
  zone LMP forecasts and zone-specific irradiance forecasts directly.
- **GridAlpha Simulate as standalone** — once feature parity is
  reached, the simulator graduates from Industrial Nest to its own
  destination. The `runSimulation` engine + types are designed to
  ship unchanged when that happens; only the surface and routing
  move.

## CONDUIT WAVE 2 — ANNOTATIONS ROLLOUT

CONDUIT Wave 1 shipped annotation infrastructure (layer, dot, drawer,
`AnnotatableChart` wrapper, `annotationStore`, `useAnnotations`). It
was opt-in and nothing was wrapped. Wave 2 is the wrapping sprint —
every Recharts chart in the platform that benefits from notes is now
wrapped. Twenty new wraps owned by CONDUIT, plus three pre-existing
wraps owned by FORGE inside the Industrial Strategy Simulator.

### Wave 1 contract (unchanged)

`AnnotatableChart` API:

```ts
interface Props {
  chartId: string;
  children: React.ReactNode;
  hideToolbar?: boolean;
  toolbarPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}
```

To opt a chart in: wrap the inner chart container (the one that holds
the `ResponsiveContainer`) — not the surrounding card chrome — so the
toolbar lands inside the visualization area, not over the card title.

### chartId convention

Format: `<surface>:<chart>[:<scope>]`. Scope is the dynamic suffix
(zone, asset, period, case-study id, strategy id) when the same
chart serves multiple data slices. Two pre-existing FORGE-owned ids
use dashes (`industrial-sim-dispatch-{strategyId}`); both forms are
resolvable via `getChartMeta` in the registry.

Examples in the codebase:

- `trader:lmp-24h:WEST_HUB`
- `analytics:price-intel-overlay`
- `vault:case-study:storm-elliott:lmp-24h`
- `industrial:sim-carbon-strategy-3`
- `journal:pnl`

When the chartId changes (zone switch, period filter, etc.) the
wrapper re-mounts and the dots flip to the new id's annotations.

### Registry — `src/lib/annotatableCharts.ts`

Every wrapped chart is listed in `ANNOTATABLE_CHARTS`. The registry is
descriptive (wrapping a chart not in the list still works), but the
list keeps the platform legible and supports tooling like
"show me all annotations across all charts."

```ts
import { ANNOTATABLE_CHARTS, getChartMeta, chartsBySurface } from '@/lib/annotatableCharts';

getChartMeta('storage:asset-revenue:bess-001');
//   → { chartId: 'storage:asset-revenue', surface: 'Storage Nest', ... }
```

Each entry carries `surface`, `description`, `scope`, `hideToolbar`,
and `owner`. `getChartMeta` does longest-prefix match so scoped ids
resolve to their parent registry entry.

### When to use `hideToolbar`

The toolbar is 26px tall and floats with an 8px inset. On charts
≤120px tall it consumes most of the visualization. CONDUIT applies
`hideToolbar` to those — existing dots still render (read-only); users
who need to add notes do so from the larger detailed chart on the
same surface.

Charts shipped with `hideToolbar` in Wave 2:

- `trader:spark-spread:WEST_HUB` (40px sparkline)
- `analyst:seasonal-pattern` (120px line)
- `analyst:anomaly-detection` (120px bars)
- `storage:asset-revenue` (120px horizontal bars)
- `industrial:sim-carbon-{strategyId}` (180px line that sits next
  to a hero number; the toolbar would clash)

### Charts not wrapped (deliberately)

| Component | Reason |
| --- | --- |
| `atlas/GridAtlasView.tsx`, `atlas/GridAtlasMap.tsx` | Mapbox 3D — needs a different annotation layer (out of scope). |
| `analytics/tabs/SparkSpread.tsx` | Brief excludes the Dispatch Frontier custom SVG. |
| `analytics/tabs/MarginalFuel.tsx` | Custom-SVG fuel gantt and reserve plot — not Recharts. |
| `nest/trader/ZoneWatchlist.tsx` | Per-row 30px sparklines — toolbar overhead would dominate. |
| `nest/trader/tiles/BessTile.tsx`, `FuelMixTile.tsx` | No Recharts charts (SOC dial is custom SVG). |
| `nest/student/StudentNest.tsx` | Placeholder content, no charts yet. |
| `peregrine/*` | No Recharts charts in any Peregrine surface. |
| `nest/everyone/EveryoneNest.tsx` | Not in CONDUIT's Wave 2 ownership list. |
| `LMPCard.tsx` (legacy) | Slated for deprecation. |

### How to wrap a new chart in future sprints

Chart owners landing new visualizations should:

1. Wrap the inner chart container (around `ResponsiveContainer`),
   leaving card chrome untouched.
2. Pick a chartId following the `<surface>:<chart>[:<scope>]` pattern.
3. Append a row to `ANNOTATABLE_CHARTS` in
   `src/lib/annotatableCharts.ts` with surface, description, and scope.
4. Pass `hideToolbar` if the chart container is ≤120px tall or if the
   toolbar would land on existing chart chrome.

```tsx
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';

<div style={{ height: 280 }}>
  <AnnotatableChart chartId={`mysurface:my-chart:${zoneId}`}>
    <ResponsiveContainer width="100%" height="100%">
      {/* recharts JSX, unchanged */}
    </ResponsiveContainer>
  </AnnotatableChart>
</div>
```

### Persistence (unchanged from Wave 1)

Annotations persist to `localStorage` under `gridalpha-annotations`
via Zustand's `persist` middleware. They survive tab close. When
the FastAPI backend lands, the persist layer should mirror writes
server-side; the public hook surface (`useAnnotations(chartId)`) will
not need to change.

### Audit doc

The full audit — wrapped vs skipped, layout-impact notes, API
divergence from the Wave 2 brief — lives at
`docs/wave-3-conduit-audit.md`.

## ORACLE WAVE 2 — CONTEXTUAL AI ASSISTANT

Owned by ORACLE. Wave 1 shipped a working chat with PJM market
knowledge. Wave 2 makes the assistant deeply aware of what the user
is looking at — surface, profile, current item, layer, zone — and
lets every response reference the screen the user is on.

### The three context layers

The system prompt that goes to Claude on every send is composed from
three layers:

1. **Surface context** — WHERE the user is. A `SurfaceContext`
   produced by the registered provider for the current surface
   (Trader Nest / Atlas / Vault Entry / etc.). Includes
   `surfaceLabel`, `selectedZone`, `currentItemId`, `currentItemTitle`,
   `currentLayer` (Alexandria entries), `selectedTab` (multi-tab
   surfaces), and a `visibleData` summary describing what is
   rendered on screen.
2. **User context** — WHO the user is. Profile from `authStore`,
   profile-detail bag, the last 3 surfaces visited (sessionStorage),
   and selected zone preference.
3. **Domain context** — WHAT they are asking about. Inferred
   client-side from the response text via cross-link matching against
   SCRIBE's `CROSS_LINK_MAP`; surfaced as the Related-Concepts footer.

### Provider registry pattern

Each surface registers a pure provider in `src/services/contextProviders/`
that takes a `ProviderInput` and returns a `Partial<SurfaceContext>`.
The registry binding lives in `src/services/aiContext.registry.ts`.

```ts
// Adding a provider for a new surface:
// 1. Create the provider:
export const myNewSurfaceContextProvider: ContextProvider = (input) => ({
  surfaceLabel: 'My Surface',
  selectedZone: input.selectedZone,
  visibleData: { description: '…' },
});

// 2. Add a SurfaceKey union member in `aiContext.ts`.
// 3. Update `surfaceFromPathname()` to map the URL pattern to the key.
// 4. Bind the key → provider in `aiContext.registry.ts`.
// 5. Add a label in `labelForSurface()`.
```

The provider must NOT call React hooks, must NOT mutate state, and
must NOT touch network. It reads from the supplied `input` and from
mock-data modules (or future hooks that fetch deterministic data).

### useAIContextSnapshot

The integration point between the AIAssistant and the provider system.
Reads pathname + profile + auth profile-details + caller-supplied zone,
runs the matching provider, and returns an `AIContextSnapshot`.
Memoised on every meaningful input — the snapshot only re-builds when
the user navigates, switches profile, or the zone changes.

```ts
const snapshot = useAIContextSnapshot({
  zone: selectedZone,           // optional
  subContext: { selectedTab },  // optional sub-context override
  surface: 'analytics',         // optional explicit surface override
});
```

### InlineAITrigger primitive

`src/components/shared/InlineAITrigger.tsx` lets any chart, value, or
term opt into "ask AI about this." The wrapper writes a
`PendingTrigger { prompt, subContext, autoSubmit }` to the
conversation store and opens the AIAssistant; the panel consumes the
pending trigger on open and either pre-fills the input or
auto-submits.

```tsx
import { InlineAITrigger } from '@/components/shared/InlineAITrigger';

<InlineAITrigger
  contextPrompt="Why is the spread compressed for this plant?"
  subContext={{ selectedTab: 'spread' }}
  treatment="overlay"   // 'inline' | 'overlay' | 'wrapped'
  autoSubmit={false}
>
  <SparkSpreadCell value={6.42} />
</InlineAITrigger>
```

ORACLE does not retrofit any existing component in this sprint. Other
agents wrap their content when they're ready. Three treatments are
available: `inline` (icon next to content), `overlay` (icon-on-hover
at the corner), `wrapped` (whole region clickable).

### Contextual entry point prompts

`src/lib/prompts/contextualPrompts.ts` exposes
`CONTEXTUAL_PROMPTS` — a stable map of `ContextualPromptId → prompt
text`. The AIAssistant renders the four chips listed in
`QUICK_ACTION_CHIP_IDS` above the input bar when the conversation is
empty. Adding a new prompt is two lines: append to `CONTEXTUAL_PROMPTS`
and `CONTEXTUAL_PROMPT_LABELS`. Add the id to
`QUICK_ACTION_CHIP_IDS` to surface it as a chip.

### Response enrichment

On Vault surfaces (`vault-index`, `vault-alexandria`, `vault-lesson`,
`vault-entry`, `vault-case-study`), each assistant message is
post-processed by `extractRelatedConcepts()`
(`src/services/relatedConcepts.ts`). The extractor scans for
canonical terms in SCRIBE's `CROSS_LINK_MAP` (whole-word, case-
insensitive, longest-match-wins) and renders matches as React-Router
`Link` chips below the message — one tap to jump to the matching
Alexandria entry. The currently-viewed entry is excluded from its
own footer.

### System prompt context injection

`src/lib/prompts/systemPrompt.ts` ships two exports:

- `BASE_SYSTEM_PROMPT` — the role / scope / tone block.
- `buildSystemPrompt(snapshot)` — wraps the base with a CURRENT
  CONTEXT block describing surface, selected zone, current item,
  current layer, selected tab, visible-data description, key
  metrics, alerts, profile, and recent surfaces.

The Wave 2 `useAIChat(snapshot)` calls `buildSystemPrompt` per send;
the result is forwarded as the `system` field of the
`/api/ai/complete` payload. Wave 1 callers that pass no snapshot get
the legacy context-block fallback so existing chat surfaces keep
working without refactor.

### Backend wiring

All requests go through the FastAPI proxy at `/api/ai/complete`
(`app/routers/ai.py`). The proxy holds the `ANTHROPIC_API_KEY`
server-side; the browser never sees it. The proxy is non-streaming
(JSON in → JSON out); the Wave 2 `streamChat` simulates progressive
rendering by emitting word-sized chunks at ~24 chunks/sec. When the
proxy upgrades to SSE, swap the inner loop for a stream reader
without touching the public API.

Sprint default: `claude-sonnet-4-20250514` with 1000 max_tokens.

### Conversation persistence

`conversationStore` persists `messages` and `surfaceContext` to
`sessionStorage` (key `gridalpha-conversation`). The surface context
anchors on the FIRST send — subsequent sends preserve the original
anchor so "started on Trader Nest" stays accurate even after the
user navigates. When the user reopens the panel on a different
surface, a `SurfaceMismatchNotice` offers Continue or Start fresh.

### What ORACLE owns (Wave 2 scope)

- `src/services/aiContext.ts` (extended in Wave 2 — surface context type system + capture entry point)
- `src/services/aiContext.registry.ts` (new — provider binding)
- `src/services/contextProviders/*.ts` (10 files — one per surface, plus vaultContext.ts which exports 5 vault providers)
- `src/services/anthropic.ts` (refactored to call `/api/ai/complete`)
- `src/services/relatedConcepts.ts` (response enrichment)
- `src/lib/prompts/systemPrompt.ts` (extended with `buildSystemPrompt`)
- `src/lib/prompts/contextualPrompts.ts` (new)
- `src/hooks/useAIChat.ts` (extended to accept AIContextSnapshot)
- `src/hooks/useAIContextSnapshot.ts` (new)
- `src/stores/conversationStore.ts` (extended — `surfaceContext`, `pendingTrigger`)
- `src/components/shared/AIAssistant.tsx` (extended — context chip, mismatch notice, related-concepts footer, quick-action chips, pending-trigger consumer)
- `src/components/shared/InlineAITrigger.tsx` (new)
- This section of CLAUDE.md

### Read-only consumers

ORACLE reads from but never modifies: every nest, vault component,
atlas, analytics tab, peregrine surface; every store outside the
conversation store; every mock-data file; SCRIBE's `crossLinkMap.ts`
and curriculum index/entries.

### Known gaps for future waves

- **`viewStore` not yet shipped.** ARCHITECT was scheduled to ship
  `src/stores/viewStore.ts` exposing `selectedZone` and the active
  analytics tab. Until it lands, providers default to sensible values
  (zone falls back to `WEST_HUB` on Trader Nest, `null` elsewhere)
  and `useAIContextSnapshot` accepts an explicit `zone` arg. Wiring
  is a one-line change once `viewStore` ships.
- **Backend streaming.** The FastAPI proxy is one-shot. When SSE
  ships, swap the simulated-stream loop in `services/anthropic.ts`
  for a real stream reader.
- **InlineAITrigger adoption.** The primitive is opt-in. Future
  sprints will land trigger wraps on charts, KPI tiles, and key
  values across the platform.

## CONDUIT-2 — PDF EXPORT PIPELINE

CONDUIT-2 ships V1 of the platform-wide PDF export pipeline. Real
layered PDF documents — proper typography, multi-page pagination,
branded chrome — generated client-side via `@react-pdf/renderer`. No
backend required. The Industrial Strategy Simulator memo is the
first concrete template; Analyst Report, Trader Position Brief, and
Developer Site Report are stubbed for future sprints.

### Architecture

`BasePDFTemplate` defines page setup (Letter portrait, 0.75" margins,
white background) and mounts the fixed `PDFHeader` / `PDFFooter` so
those repeat on every page. Each per-feature template wraps its
content in `BasePDFTemplate` and uses the shared component library.
The `services/pdfExport.ts` entry point wires templates to the
download flow.

```
BasePDFTemplate
├── PDFHeader (fixed)              ← brand wordmark + doc type + date
├── <children>                     ← per-template content
│   ├── PDFEyebrow                 ← F.mono caps electricBlue
│   ├── PDFHeading                 ← Times-Roman 32pt / 18pt / 14pt
│   ├── PDFBody / PDFBulletList    ← body prose, bullets
│   ├── PDFTable                   ← header row + alternating rows
│   ├── PDFMetricCallout           ← large value with tone color
│   └── PDFChartImage              ← PNG data URL with caption
└── PDFFooter (fixed)              ← brand line + Page X of Y
```

### Files (CONDUIT-2-owned)

| Path | Purpose |
| --- | --- |
| `src/services/pdfExport.ts` | Pipeline entry point. Exports `exportStrategyMemo()` and the `PDF_TEMPLATES` registry. Includes `svgStringToPngDataUrl()` helper for chart rasterization. |
| `src/services/pdfTemplates/types.ts` | `PDFDocumentMeta`, `PDFExportOptions`, `PDFExportResult`. |
| `src/services/pdfTemplates/BasePDFTemplate.tsx` | Page setup + fixed chrome. Every template renders inside this. |
| `src/services/pdfTemplates/StrategyMemoTemplate.tsx` | Industrial Strategy Simulator memo — hero, exec summary, ranking, top detail, sensitivity, dispatch, carbon, methodology, disclaimer. |
| `src/services/pdfTemplates/AnalystReportTemplate.tsx` | Stub — throws "not yet implemented". |
| `src/services/pdfTemplates/TraderBriefTemplate.tsx` | Stub — throws "not yet implemented". |
| `src/services/pdfTemplates/DeveloperSiteReportTemplate.tsx` | Stub — throws "not yet implemented". |
| `src/services/pdfTemplates/components/PDFHeader.tsx` | GridAlpha wordmark + document-type/date row, fixed. |
| `src/services/pdfTemplates/components/PDFFooter.tsx` | Brand line + `Page X of Y`, fixed. |
| `src/services/pdfTemplates/components/PDFEyebrow.tsx` | F.mono caps eyebrow (`section` and `hero` variants). |
| `src/services/pdfTemplates/components/PDFHeading.tsx` | Levels 1/2/3 plus `subtitle` italic-gray variant. |
| `src/services/pdfTemplates/components/PDFBody.tsx` | Body prose + `PDFBulletList`. |
| `src/services/pdfTemplates/components/PDFTable.tsx` | Header row, alternating row backgrounds, per-column align/flex. |
| `src/services/pdfTemplates/components/PDFMetricCallout.tsx` | Large value with `neutral` / `positive` / `negative` tone. |
| `src/services/pdfTemplates/components/PDFChartImage.tsx` | PNG/JPEG data URL with caption + dashed-border placeholder. |
| `src/components/shared/PDFExportButton.tsx` | Reusable button — handles loading and error UI in-place. |
| `src/hooks/usePDFExport.ts` | Optional orchestration hook for callers that want shared exporting state. |

### Design standard

| Spec | Value |
| --- | --- |
| Page size | LETTER, portrait |
| Margins | 54pt top/right/left, 72pt bottom (0.75" / 1.0") |
| Background | `#FFFFFF` |
| Body type | Helvetica 11pt @ 1.45 line-height (Inter substitute — see Limitations) |
| Display headings | Times-Roman 32 / 18 / 14pt (Instrument Serif substitute) |
| Mono | Courier (Geist Mono substitute) |
| Body color | `#1F2937` |
| Secondary color | `#71717A` |
| Accent (eyebrows, neutral callouts) | `#3B82F6` (electric blue) |
| Emphasis (positive metrics, top-edge accent) | `#F59E0B` (falcon gold) |
| Negative tone | `#EF4444` |
| Header/footer rule | `#E5E7EB` 1pt |
| Table alt rows | `#F8F9FA` |

### Export API

The Strategy Memo export accepts both calling shapes — the singular-
result form (used by FORGE's `ExportMemoButton`) and the multi-result
array form for full ranking output:

```ts
import { exportStrategyMemo } from '@/services/pdfExport';

// Singular result (FORGE-compatible)
await exportStrategyMemo(profile, results[0]);

// Full result set with options
await exportStrategyMemo(profile, results, 'base', {
  filename: 'morning-pull.pdf',
  meta: { brandLine: 'Acme Energy · Internal' },
  chartImages: { sensitivity: pngDataUrl, dispatch: pngDataUrl },
});
```

Every export returns a `PDFExportResult { success, blob?, filename?, error? }`.
Callers using `await` can ignore the result; richer integrations can
branch on `success`.

### Reusable button

```tsx
import { PDFExportButton } from '@/components/shared/PDFExportButton';
import { exportStrategyMemo } from '@/services/pdfExport';

<PDFExportButton
  onExport={() => exportStrategyMemo(profile, results)}
  label="Export memo"
  size="default"  // or "compact"
/>
```

The button manages `isExporting` and surfaces `result.error` inline.
For multi-button layouts that need shared state, `usePDFExport()`
exposes the same machinery as a hook.

### Charts

V1 supports PNG/JPEG data URLs only. `PDFChartImage` renders the image
inside a fixed-width frame with optional caption; when no `src` is
supplied it renders a dashed-border placeholder so the document
doesn't break.

`svgStringToPngDataUrl(svg, w, h)` rasterizes an SVG markup string via
the browser canvas. Caller flow for a chart-bearing memo:

```ts
const sensSvg = chartContainer.querySelector('svg')?.outerHTML;
const sensPng = sensSvg ? await svgStringToPngDataUrl(sensSvg, 540, 220) : undefined;
await exportStrategyMemo(profile, results, 'base', {
  chartImages: { sensitivity: sensPng },
});
```

True vector-PDF chart rendering (parsing SVG into the
`@react-pdf/renderer` `<Svg>` primitives) is deferred to V2.

### Limitations carried into V1

- **Fonts** — Helvetica / Times-Roman / Courier are used in place of
  Inter / Instrument Serif / Geist Mono. The brief authorized the
  fallback. V2 should `Font.register()` real GridAlpha typefaces from
  TTFs in `public/fonts/`. `BasePDFTemplate` is the single
  registration site.
- **macOS Preview cross-renderer pass** — pending. V1 was verified
  in Chrome's PDF viewer + via programmatic PDF stream inspection
  (decompressed content streams, painted-text extraction from `TJ`
  hex-string operators).
- **FORGE feature-detect bug** — `ExportMemoButton.tsx` builds its
  import specifier at runtime with `@vite-ignore` and the alias never
  resolves. Documented in `docs/wave-3-conduit2-test-results.md` with
  a one-line suggested fix. The pipeline itself is reachable through
  ordinary static imports and the dev-server raw path; the
  feature-detect path is what's broken on the FORGE side.

### What CONDUIT-2 owns

CONDUIT-2 may create or modify any file listed in the table above.
The dependency add (`@react-pdf/renderer`) is the one exception to
the "no new deps" rule, scoped to this sprint only.

CONDUIT-2 must not modify FORGE's simulator code, any FOUNDRY
primitive, any chart component, the backend, or any Nest / Vault /
Atlas / Analytics / Peregrine surface.

### Future templates

Three stubs are in place, each throwing on render so missed
integrations fail loudly during dev:

- `AnalystReportTemplate` — Analyst signature feature
- `TraderBriefTemplate` — Trader Position Brief
- `DeveloperSiteReportTemplate` — Developer Site Report

Each future implementation should:

1. Build its component on top of the shared component library.
2. Export an `exportXxx(...)` function from `services/pdfExport.ts`.
3. Register the function in `PDF_TEMPLATES`.
4. Match the brand chrome — same `BasePDFTemplate`, same colors, same
   typography hierarchy.

### Test results

Full V1 verification log lives at
`docs/wave-3-conduit2-test-results.md`.

## ORACLE WAVE 3 — CURRICULUM GRADING

Owned by ORACLE. Wave 3 makes the Alexandria curriculum interactive:
every retrieval prompt in the Sub-Tier 1A entries is now AI-graded,
each entry has an on-demand AI summary, and a falcon-gold "Recall
Session" CTA on the Vault index walks the student through 3–5 of the
highest-priority prompts in their queue.

### Architecture

| File | Purpose |
| --- | --- |
| `src/lib/types/grading.ts` | Type contract: `RetrievalPromptInstance`, `GradeLevel`, `GradedAnswer`, `RecallQueueItem`, `LessonSummary`, plus `RECALL_PRIORITY_WEIGHTS`. |
| `src/lib/prompts/gradingPrompts.ts` | Pinned `GRADER_SYSTEM_PROMPT` + `buildGradingPrompt(prompt, studentAnswer)` user-message builder. |
| `src/lib/prompts/lessonSummaryPrompts.ts` | Pinned `SUMMARY_SYSTEM_PROMPT` + `buildSummaryPrompt(input)` user-message builder. |
| `src/services/grading/gradeAnswer.ts` | One-shot POST to `/api/ai/complete` with `claude-sonnet-4-20250514`, `max_tokens: 1500`. Returns typed `GradingResult`. Never throws. |
| `src/services/grading/responseParser.ts` | Parses the grader's JSON envelope. Handles fences (`​`​`​`json … ​`​`​`​`), trailing commas, leading prose, and malformed output. Returns a structured error on failure. |
| `src/services/lessonSummary/generateSummary.ts` | One-shot POST for the summary. `max_tokens: 600`. |
| `src/stores/gradingStore.ts` | Zustand store persisted to `localStorage` under `gridalpha-grading`. Holds `gradedAnswers` (per-prompt history) + `lessonSummaries` (cached summaries). Selectors: `getLatestGrade`, `attemptCount`, `buildRecallQueue`. |
| `src/hooks/useGradeAnswer.ts` | Per-prompt orchestration. Returns `{ latestGrade, attempts, isGrading, error, submit, retry, resetHistory }`. |
| `src/hooks/useLessonSummary.ts` | Per-(entrySlug, layer) summary orchestration. Returns `{ summary, isGenerating, error, generate, regenerate }`. |
| `src/components/vault/RetrievalPromptGrader.tsx` | Wraps SCRIBE's `<RetrievalPrompt>` verbatim and adds the grading UI below. |
| `src/components/vault/GradeBadge.tsx` | 6×6 dot + 11px caps label, color-coded per grade. |
| `src/components/vault/FeedbackPanel.tsx` | Renders the `GradedAnswer` — Hit / Missed columns, prose feedback, optional pointer link, "Try again" button. |
| `src/components/vault/LessonSummaryPanel.tsx` | Collapsible AI-summary panel mounted between header and body in `Entry.tsx`. |
| `src/components/vault/RecallSession.tsx` | Full-screen overlay walking the student through 3–5 queued prompts. Reachable from VaultIndex. |
| `src/lib/curriculum/index.ts` | Extended (additive) with `buildRetrievalPromptInstance(entry, layer)` and `listRetrievalPromptInstances()`. Reads SCRIBE's `entriesIndex.ts`; no curriculum content is modified. |
| `src/components/vault/Entry.tsx` | Extended (additive). Wraps L1 + L2 retrieval prompts in `<RetrievalPromptGrader>` via a local `<GradedRetrievalPrompt>` helper. Also mounts `<LessonSummaryPanel>` below the header. |
| `src/components/vault/VaultIndex.tsx` | Extended (additive). Adds the falcon-gold "Recall Session →" CTA next to "Open Alexandria →" and mounts `<RecallSession>` when toggled. |

### The wrap-not-replace pattern

SCRIBE's `RetrievalPrompt` component is **not modified**. The grader is
a new wrapper that takes the SCRIBE component as `children` and renders
it verbatim above its own grading UI. This means:

- SCRIBE owns the question rendering, the L2 acknowledge button, and
  the gating contract with `progressStore`.
- ORACLE owns the textarea, Submit, grade display, attempt history,
  and recall queue.

The two systems coexist on every Sub-Tier 1A entry. Future curriculum
tiers (1B onward) can opt in by adding `retrievalPrompt` strings to
their `EntryLayerContent`; `listRetrievalPromptInstances()` picks them
up automatically.

### The structured JSON response contract

The grader is instructed to emit:

```json
{
  "grade":             "poor" | "partial" | "strong" | "excellent",
  "conceptsHit":       [string, ...],
  "conceptsMissed":    [string, ...],
  "feedback":          "2-4 sentences",
  "pointerToSection":  string | null
}
```

`responseParser.parseGraderResponse(raw)` accepts:
- clean JSON (happy path)
- JSON wrapped in ```json fences
- JSON with trailing commas
- JSON preceded by leading prose (e.g. "Here is the grade: { … }")

…and returns a typed `ParseResult`. On unrecoverable input it returns
`{ ok: false, error: '…' }` so the caller can surface "system error,
please try again" without blowing the panel up.

`expectedConcepts` and `rubric` are derived heuristically from each
entry's `thresholdConcept` and `misconceptionDefeated` rather than
authored per-prompt — the grader uses them as guidance, not a hard
checklist. Future curricula can override by adding explicit
`expectedConcepts: string[]` and `rubric: string` fields to
`EntryLayerContent` (currently optional and absent).

### Lesson summary caching

`useLessonSummary(entrySlug, layer)` caches the generated summary in
`gradingStore.lessonSummaries` keyed `<entrySlug>:<layer>`. First load
triggers a generate; subsequent loads hit the cache. The user can
"Regenerate" to force a refresh. The cache survives reloads.

### Recall queue priority logic

`buildRecallQueue(prompts)` scores each prompt by:

```
priority = base(lastGrade) + daysSinceLastSeen × perDay
```

| Last grade | Base weight |
| --- | --- |
| `poor`       | 8 |
| `partial`    | 4 |
| `strong`     | 1 |
| `excellent`  | 0 |
| (never seen) | 6 (no per-day decay — fresh prompts enter early but below `poor`) |

`perDay = 1`. So a `poor` prompt re-attempted yesterday scores 9, a
`partial` prompt last seen 5 days ago scores 9 too — they tie. An
`excellent` prompt last seen 30 days ago scores 30, surpassing both
— the queue eventually rotates everything, but it weights mistakes
more aggressively than time alone.

The queue is built fresh on every `RecallSession` mount. Within a
session the order is snapshotted so the user doesn't see prompts
shuffle as they grade earlier ones.

### Adding grading to future curriculum tiers (1B onward)

Sub-tier 1B and beyond opt in automatically — `listRetrievalPromptInstances()`
walks every entry registered in `entriesIndex.ts` and emits a
`RetrievalPromptInstance` for every layer that carries a
`retrievalPrompt` string. No additional ORACLE changes needed when
SCRIBE ships new tiers.

If a future tier wants explicit `expectedConcepts` / `rubric` per
prompt, extend `EntryLayerContent` (SCRIBE's contract) to carry the
new fields, and update `buildRetrievalPromptInstance` to read them
when present.

### Future work

- **Per-student learning paths** — the recall queue is global today.
  Future iterations can scope per-user when authentication lands.
- **Spaced repetition schedule** — current priority is linear in
  days. SM-2 / Anki-style scheduling would weight recently-promoted
  cards differently from ones that have been "strong" for months.
- **Instructor dashboard** — the gradedAnswers store has the data to
  power a per-cohort dashboard (which prompts are systemically missed,
  which entries need rework). No instructor surface yet.
- **Backend persistence** — graded answers + summaries currently live
  in `localStorage`. When the FastAPI backend adds user accounts they
  should mirror server-side; the public hook surface (`useGradeAnswer`,
  `useLessonSummary`) won't need to change.
- **Real-time grading streaming** — Wave 3 grading is a one-shot POST.
  When the proxy upgrades to SSE, the grader can stream the feedback
  prose word-by-word for nicer UX.

### What ORACLE owns (Wave 3 scope)

- `src/lib/types/grading.ts`
- `src/lib/prompts/gradingPrompts.ts`
- `src/lib/prompts/lessonSummaryPrompts.ts`
- `src/services/grading/*` (gradeAnswer, responseParser)
- `src/services/lessonSummary/generateSummary.ts`
- `src/stores/gradingStore.ts`
- `src/hooks/useGradeAnswer.ts`
- `src/hooks/useLessonSummary.ts`
- `src/components/vault/GradeBadge.tsx`
- `src/components/vault/FeedbackPanel.tsx`
- `src/components/vault/RetrievalPromptGrader.tsx`
- `src/components/vault/LessonSummaryPanel.tsx`
- `src/components/vault/RecallSession.tsx`
- `src/lib/curriculum/index.ts` (additive `buildRetrievalPromptInstance` + `listRetrievalPromptInstances`)
- `src/components/vault/Entry.tsx` (additive integration only)
- `src/components/vault/VaultIndex.tsx` (additive CTA only)
- This section of CLAUDE.md

### What ORACLE does not modify

- SCRIBE's `RetrievalPrompt` — wrapped, never edited
- SCRIBE's curriculum entry files (`src/lib/curriculum/entries/*`)
- SCRIBE's `entriesIndex.ts` (read only)
- SCRIBE's `progressStore` (read only)
- Wave 1 / Wave 2 ORACLE files (those stay stable)
- Any non-curriculum component, chart, or Nest

## FORGE WAVE 3 — STORAGE DA BID OPTIMIZER

The Storage Operator's signature feature. Generates an optimal hourly
day-ahead bid curve for every battery in the operator's fleet, stacks
ancillary services on idle hours, attributes net revenue across
energy / ancillary / degradation, and exports the whole pack as a
board-ready PDF. Lives entirely inside the Storage Nest as a tab
beside the existing OVERVIEW. Same surgical-tab-strip pattern as
Wave 1 (Trader Journal) and Wave 2 (Industrial Strategy Simulator).

### Architecture

| Path | Purpose |
| --- | --- |
| `src/lib/types/storage.ts` | Type system: `BatteryAsset`, `Fleet`, `BidHour`, `AssetResult`, `FleetResult`, `MarketContext`, `AncillaryService`, `ScenarioName`, `OptimizerConfig`. |
| `src/lib/mock/storage-optimizer-mock.ts` | 3 representative fleets (single-asset 100MW, 4-asset 280MW portfolio, 8-asset 600MW IPP), DA forecast / yesterday's actuals by zone, ancillary MCP curves by service type, default mileage payment, default `MarketContext`. **Sibling to** FOUNDRY's pre-existing `storage-mock.ts` (which exports its own `BatteryAsset` for the OVERVIEW tab) — the two coexist; OVERVIEW reads FOUNDRY's, OPTIMIZER reads this one. |
| `src/lib/storage/socSimulator.ts` | Walks a 24-hour bid plan forward through SOC bookkeeping (charge × RTE adds; discharge subtracts; idle/ancillary unchanged). Returns trajectory + equivalent full cycles + feasibility verdict. |
| `src/lib/storage/degradation.ts` | V1 linear $/MWh-throughput degradation cost. Documented future-work: depth-of-discharge curve, calendar age, temperature derating. |
| `src/lib/storage/ancillary.ts` | Decorates idle hours with ancillary reservations (capacity revenue + V1 deterministic mileage). Mutates the bid curve in place AND returns per-hour breakdown. |
| `src/lib/storage/optimizer.ts` | Heuristic bid generator: pick N lowest-LMP charge hours and N highest-LMP discharge hours (N = duration); validate via SOC sim; rebalance by dropping the weakest discharge hour until feasible. |
| `src/lib/storage/attribution.ts` | Splits net revenue into energy / ancillary / degradation. Energy = Σ(discharge LMP × MW) − Σ(charge LMP × MW / RTE). |
| `src/lib/storage/runOptimization.ts` | Main entry. Runs base / volatility-up / forecast-miss scenarios, ranks assets by base net revenue, computes fleet cycles + performance-vs-optimal benchmark. |
| `src/stores/storageStore.ts` | Zustand store. Persists `fleets`, `activeFleetId`, `selectedScenario` to `localStorage` under `gridalpha-storage-optimizer`. **Does not persist** results (recompute on demand). |
| `src/hooks/useStorageOptimizer.ts` | Orchestration. `run()` defers 50ms then calls `runOptimization`. Engine completes in <100 ms for an 8-asset fleet. |
| `src/components/nest/storage/DABidOptimizer/OptimizerView.tsx` | Top-level page. State machine: no fleet → form; fleet + no results → CTA; running → loading; results → 1fr/2fr grid. |
| `src/components/nest/storage/DABidOptimizer/AssetRegistrationForm.tsx` | Preset-fleet picker + custom single-asset form. |
| `src/components/nest/storage/DABidOptimizer/FleetOverview.tsx` | Sorted asset ranking + scenario revenue strip + performance-vs-optimal gauge. |
| `src/components/nest/storage/DABidOptimizer/AssetDetail.tsx` | Header + 5-card visualization stack + Bid Pack export. |
| `src/components/nest/storage/DABidOptimizer/BidCurveChart.tsx` | 24-hour bar chart colored by action + LMP overlay. Wrapped in `AnnotatableChart` (`storage-bid-curve-<assetId>`). |
| `src/components/nest/storage/DABidOptimizer/SOCTrajectoryChart.tsx` | SOC % over 24 hours with min/max reference lines. Wrapped (`storage-soc-<assetId>`). |
| `src/components/nest/storage/DABidOptimizer/RevenueAttribution.tsx` | Stacked attribution bar + hero net + degradation deduction strip. |
| `src/components/nest/storage/DABidOptimizer/AncillaryStackChart.tsx` | Reserved MW per hour + ancillary MCP overlay. Wrapped (`storage-ancillary-<assetId>`). Empty-state when ancillary disabled. |
| `src/components/nest/storage/DABidOptimizer/PerformanceVsOptimal.tsx` | Gauge showing fleet revenue ÷ theoretical perfect-foresight optimum. |
| `src/components/nest/storage/DABidOptimizer/ExportBidPackButton.tsx` | **Static** import of `exportStorageBidPack` from `@/services/pdfExport`. NO dynamic feature-detect (see "Critical bug avoided" below). |
| `src/services/pdfTemplates/StorageBidPackTemplate.tsx` | CONDUIT-2 PDF extension. Hero → exec summary → per-asset bid schedule + headline metrics + SOC chart (if rasterized) → sensitivity strip → methodology + disclaimer. |
| `src/components/nest/storage/StorageNest.tsx` | Modified to add an `OVERVIEW` / `DA BID OPTIMIZER` tab strip above the existing layout. OVERVIEW renders the locked content unchanged; OPTIMIZER renders `<OptimizerView />`. |

### How an optimization runs

1. User opens Storage Nest → DA BID OPTIMIZER tab.
2. If no fleet is registered, `AssetRegistrationForm` renders. The user
   either picks a preset fleet (3 options) or builds a custom
   single-asset fleet inline.
3. On submit, the fleet lands in the storage store (persisted).
4. `useStorageOptimizer.run()` defers 50 ms, then calls
   `runOptimization(fleet, market)`.
5. `runOptimization` runs three scenarios — base, volatility-up
   (1.5× spread amplification), forecast-miss (LMP rotated forward
   3 hours) — and returns a ranked list of `AssetResult`.
6. Top-ranked asset auto-selects; `FleetOverview` shows the ranking +
   scenario strip + perf-vs-optimal gauge. `AssetDetail` shows the
   five chart panels for the selected asset.
7. Operator can EDIT FLEET, RE-RUN, or CLEAR from the toolbar.
8. Export Bid Pack button at the bottom of `AssetDetail` exports the
   full fleet plan as a PDF.

### Optimizer model — V1 limitations

- **Heuristic, not MILP.** The optimizer picks the N lowest-LMP hours
  to charge and the N highest-LMP hours to discharge (N = duration).
  This is correct for the simple arbitrage case but leaves money on
  the table when mid-merit hours are profitable enough to be worth
  cycling for. A future MILP solver can extract more value.
- **Daily horizon only.** No multi-day optimization, no carry-over
  SOC strategy, no end-of-day terminal value. Each 24-hour plan
  stands alone.
- **No rolling re-optimization mid-day.** Real operators re-bid as
  the RT market clears and forecasts update. V1 is single-shot DA.
- **Linear degradation cost.** $/MWh-throughput, no depth-of-discharge
  curve, no temperature derating, no calendar-age component.
- **Deterministic ancillary utilization.** RegD = 8% of reserved MW
  dispatched, RegA = 4%, Spin = 0%. Real values are statistical and
  time-of-day shaped.
- **No inter-asset coordination.** Each asset is optimized
  independently. A future revision can co-optimize assets in the
  same zone to avoid bidding into self-imposed congestion.

### Sensitivity scenarios

| Scenario | LMP transform | Captures |
| --- | --- | --- |
| Base | unchanged | Best-estimate forecast |
| Volatility-up | peaks +50%, troughs −25% (vs day's median) | High-vol day risk |
| Forecast-miss | rotate curve forward 3 hours | Peak arrives early |

### Performance-vs-optimal benchmark

Theoretical perfect-foresight optimum per asset:

```
optimum = (avg_high_half_LMP − avg_low_half_LMP / RTE) × power_MW × duration_hr
```

Sum across the fleet, divide base-case revenue into it, clamp to [0,1].
Gives the operator a single "how well did we do" number relative to a
loose upper bound. A real LP solver would tighten this benchmark.

### Storage Bid Pack template

Extends CONDUIT-2's PDF infrastructure. Lives at
`src/services/pdfTemplates/StorageBidPackTemplate.tsx`. Export entry
point is `exportStorageBidPack(fleet, result, options?)` in
`src/services/pdfExport.ts`, registered in the `PDF_TEMPLATES` map
under key `storageBidPack`.

The template is structured to mirror `StrategyMemoTemplate`:

- **Hero** — operator name + fleet capacity + base revenue / cycles /
  performance-vs-optimal callouts.
- **Executive summary** — net revenue + ancillary share + cycles +
  perf-vs-optimal as bullet list.
- **Per-asset section (one per asset, page-breaks between)** —
  headline metrics, SOC chart (if rasterized PNG supplied via
  `chartImages.socByAssetId`), full hourly bid schedule table.
- **Sensitivity strip** — base / volatility-up / forecast-miss revenue
  callouts.
- **Methodology** — heuristic optimizer, SOC validation, ancillary
  stacking, degradation model, perf-vs-optimal definition.
- **Disclaimer** — decision-support artifact, not auto-bid execution.

### Critical bug avoided — static import only

Wave 2's `ExportMemoButton.tsx` originally used a dynamic
`import(/* @vite-ignore */ specifier)` pattern to feature-detect
CONDUIT-2's pipeline. The `@/` alias never resolves through that
escape hatch, so the button was permanently disabled even after the
pipeline shipped. The Wave 2 button was subsequently fixed to a
static import.

`ExportBidPackButton.tsx` is **static-import only from day one**:

```ts
import { exportStorageBidPack } from '@/services/pdfExport';
```

No dynamic specifier construction, no `@vite-ignore`, no feature
flag. The dependency exists at build time (verified by `npm run
build`) so the button is always wired.

### What FORGE owns (Wave 3 scope)

- `src/lib/types/storage.ts`
- `src/lib/storage/*` (npv-equivalent: socSimulator, degradation,
  ancillary, optimizer, attribution, runOptimization)
- `src/lib/mock/storage-optimizer-mock.ts` (sibling to FOUNDRY's
  `storage-mock.ts`, which is left untouched)
- `src/stores/storageStore.ts`
- `src/hooks/useStorageOptimizer.ts`
- `src/components/nest/storage/DABidOptimizer/*` (9 components)
- `src/components/nest/storage/StorageNest.tsx` — added a tab strip
  above the existing OVERVIEW layout. The Nest's other surfaces
  (PortfolioStrip, StorageHeroBlock, RevenueAttributionCard,
  DABidOptimizerCard, CyclingTrackerSection, AncillaryServicesSection,
  AssetHealthSection) are unchanged.
- `src/services/pdfTemplates/StorageBidPackTemplate.tsx` (new template,
  consumes CONDUIT-2's primitives only)
- `src/services/pdfExport.ts` — added `exportStorageBidPack` exporter
  function and `storageBidPack` registry entry. `exportStrategyMemo`
  and existing template imports unchanged.
- This section of CLAUDE.md

### Future work

- **Real MILP solver** — replace the heuristic with an actual
  linear-programming optimizer (use `glpk.js` or similar in-browser).
- **Multi-day optimization** — co-optimize 7-14 day horizons with
  carry-over SOC; capture weekend-vs-weekday spread arbitrage.
- **Live PJM DA forecast wire-up** — when the FastAPI backend ships
  zone-level DA forecasts, swap the static `defaultMarketContext()`
  with a live fetch.
- **Real-time bid adjustment** — re-optimize hourly as RT market
  clears and DA forecast updates.
- **Co-asset coordination** — optimize multi-asset fleets in the
  same zone simultaneously to avoid self-congestion.
- **Statistical ancillary utilization** — replace V1's deterministic
  utilization fractions with PJM-published rolling averages by
  time-of-day and service type.

## CONDUIT WAVE 3 — CMD+P CONTEXTUAL INTELLIGENCE

CONDUIT Wave 3 turns the FOUNDRY Cmd+K stub into a real cross-cutting
query: highlight any term anywhere on the platform, press `Cmd/Ctrl+P`,
and a right-edge drawer opens with progressive results from Alexandria,
Vault case studies, Peregrine articles, live PJM data points, and an
AI-generated synthesis paragraph.

Cmd+K opens the same drawer in manual (empty-input) mode. Cmd+P
intercepts the browser print dialog (`preventDefault`) and routes
through the contextual flow.

### Architecture

```
text selection ──► useTextSelection ──► CmdPSelectionIndicator pill
                                              │
                                              │ click
                                              ▼
keyboard ──► useKeyboardShortcuts ──► dispatchCmdPTrigger
                                              │
                                              ▼
                                       window.dispatchEvent('cmdp:trigger')
                                              │
                                              ▼
                                  CommandPalette (mounted in GlobalShell)
                                              │
                                              ▼
                                       useCmdP.openWithSelection
                                              │
                                              ▼
                                       useCmdPStore.open(query)
                                              │
                                              ▼
                                  resolveQuery (parallel fan-out)
                                ┌────┬────┬────┬────┬────┐
                            alex  vault  data  pere  ai-syn
                                └────┴────┴────┴────┴────┘
                                              │ progressive
                                              ▼
                                receivePartialResult per category
                                              │
                                              ▼
                                CmdPDrawer renders sections as they land
```

### Files (CONDUIT Wave 3-owned)

| Path | Purpose |
| --- | --- |
| `src/lib/types/cmdp.ts` | `CmdPQuery`, `CmdPResult`, `CmdPResultSet`, `ResultCategory`, `RESULT_CATEGORIES`, `CATEGORY_LABELS`, `emptyResultSet()`. |
| `src/hooks/useTextSelection.ts` | Debounced (~80 ms) global text-selection observer. Skips selections inside `<input>` / `<textarea>` / `contenteditable`. |
| `src/hooks/useCmdP.ts` | Orchestration: captures `AIContextSnapshot`, subscribes to `useNewsData`, runs `resolveQuery`, threads results back into `useCmdPStore`. Mounted once via `CommandPalette`. |
| `src/stores/cmdpStore.ts` | Zustand store: `isOpen`, `currentQuery`, `results`, `history` (capped at 5). Not persisted — Cmd+P is ephemeral. |
| `src/services/cmdp/queryResolver.ts` | Parallel fan-out across the 5 category resolvers, with per-category abort propagation and progressive `onPartialResult` callback. |
| `src/services/cmdp/alexandriaQuery.ts` | Match selection text against `CROSS_LINK_MAP`; resolve to entry or lesson. |
| `src/services/cmdp/peregrineQuery.ts` | Search live news items by title/summary/category, score by recency × keyword density. |
| `src/services/cmdp/vaultQuery.ts` | Match against case-study title, headline, region, body — weighted by field. |
| `src/services/cmdp/dataPointQuery.ts` | Surface live LMP / spark / battery / reserve values for the selected zone. |
| `src/services/cmdp/aiSynthesisQuery.ts` | One-shot non-streaming call through ORACLE's `streamChat` proxy with a synthesis system prompt. |
| `src/components/shared/CmdPSelectionIndicator.tsx` | Floating "⌘P TO EXPLORE" pill anchored above the selection; portaled to body. |
| `src/components/shared/CmdPDrawer.tsx` | 480 px right-edge drawer; portaled to body; backdrop click + ESC close. |
| `src/components/shared/CmdPResultSection.tsx` | Section header + skeleton + per-category sorted result list. |
| `src/components/shared/CmdPResultItem.tsx` | Per-category row variants (Alexandria entry, case study, Peregrine article, data point, synthesis card). |
| `src/components/shared/CommandPalette.tsx` | (REPLACED) Wrapper that mounts `useCmdP`, the drawer, and the selection indicator. Exports `dispatchCmdPTrigger` for any caller that wants to open Cmd+P programmatically. |
| `src/hooks/useKeyboardShortcuts.ts` | Extended to map Cmd+P / Cmd+K to `dispatchCmdPTrigger`. ESC also closes the cmdp drawer in addition to UI overlays. |

### Result categories and relevance

| Category | Source | Relevance ceiling | Notes |
| --- | --- | --- | --- |
| `ai-synthesis` | ORACLE proxy `/api/ai/complete` | 0.5 (always shown when ready) | Slowest resolver (~1.5–2 s). |
| `live-data-point` | `lib/pjm/mock-data.ts` | 0.7 | Falls back to `WEST_HUB` when no zone selected. |
| `alexandria-entry` | `CROSS_LINK_MAP` + `entriesIndex` + `lessons/index` | 1.0 (exact match) | Exact-equality scores 1.0; partial scores 0.6–0.95. |
| `vault-case-study` | `CASE_STUDIES` mock | 0.85 | Field-weighted: title 1.0, headline 0.7, body 0.25. |
| `peregrine-article` | `useNewsData` items | 0.85 | Recency decay (1.0 → 0.4 over 72 hours). |
| `related-zone` / `related-asset` | (not implemented in V1) | — | Reported empty by the resolver so the drawer skips the section. |

### Drawer ordering

The drawer renders sections in `RESULT_CATEGORIES` order:
`ai-synthesis → live-data-point → alexandria-entry → vault-case-study → peregrine-article → related-zone → related-asset`. Within a section, items
are sorted by `relevance` descending. Empty + not-loading sections are
hidden entirely so the drawer stays compact.

### Adding a new result category

1. Add a new value to `ResultCategory` (and the constant arrays
   `RESULT_CATEGORIES` and `CATEGORY_LABELS`) in `src/lib/types/cmdp.ts`.
2. Build the resolver as a pure async function:
   `(query: CmdPQuery, data: QueryDataSources) => Promise<CmdPResult[]>`.
3. Register it in `RESOLVER_REGISTRY` inside `queryResolver.ts`.
4. Add a render variant to `CmdPResultItem.tsx`.
5. If the resolver needs new live data, extend the
   `QueryDataSources` interface and thread it through `useCmdP`.

### AI synthesis path

Wraps `streamChat()` from `services/anthropic.ts` with
`disableSimulatedStream: true` so the response collapses to one
`text` chunk and a synthesis-tuned `systemPrompt`. Fails gracefully:
network/quota errors render an "AI synthesis unavailable" card in
red instead of breaking the drawer. Depends on the FastAPI
`/api/ai/complete` proxy being available — same dependency as
ORACLE's `AIAssistant`. No new env vars; no new endpoints.

### `dispatchCmdPTrigger` programmatic API

Any future component (chart toolbar, tile action button) can open
the drawer with a pre-filled query without mounting `useCmdP`:

```ts
import { dispatchCmdPTrigger } from '@/components/shared/CommandPalette';
dispatchCmdPTrigger({ rawText: 'spark spread', triggeredFrom: 'manual' });
```

The CommandPalette wrapper listens for the `cmdp:trigger` window
event and dispatches the open through the orchestration hook — so
the snapshot is captured at trigger time, not at registration time.

### Limitations carried into V1

- **Keyword matching only.** No semantic search, no embeddings.
  Future work routes the query through a backend `/api/search/embed`
  service (TBD) and merges semantic neighbors with the existing
  keyword resolvers.
- **Peregrine resolver depends on live news.** When the FastAPI news
  proxy is unreachable (`useNewsData` returns empty), the Peregrine
  section reports zero results. The drawer hides empty sections
  rather than showing an error — the synthesis paragraph still tells
  the user what they need to know.
- **Alexandria match surface is the SCRIBE term map.** Adding a new
  canonical term (e.g. `'spark spread' → 'a-spark-spread'`) requires
  SCRIBE to extend `CROSS_LINK_MAP`. Until then, terms outside the
  map fall back to the AI synthesis result.
- **`related-zone` / `related-asset` are stubs.** The categories
  exist in the type system and the drawer is ready to render them;
  the resolvers are not implemented. They report empty and the
  drawer skips them silently.

### What CONDUIT Wave 3 owns

Every file in the table above. The CommandPalette wrapper preserves
the same export name as the FOUNDRY stub so anything currently
importing `<CommandPalette />` continues to work. CONDUIT Wave 3
must not modify any chart, Nest, destination surface, or other
agent's territory. The keyboard handler integrates only via the
exported `dispatchCmdPTrigger` event — no direct coupling to the
cmdp store or hook.

## ATLAS WAVE 2 — TIME-TRAVEL SCRUBBER

The Grid Atlas is now a time machine. Drag the scrubber back 24
hours and the LMP heatmap animates through the historical state.
Generator outages appear and disappear. Storm Elliott's December
2022 cascade can be replayed on demand.

### Architecture: data → store → hook → map

```
                 ┌─────────────────────────────────┐
                 │  src/lib/types/timeTravel.ts    │
                 │  AtlasSnapshot, NamedEvent,     │
                 │  EventHighlight, TimeTravelMode │
                 └────────────────┬────────────────┘
                                  │
        ┌─────────────────────────┴─────────────────────┐
        │                                               │
┌───────▼─────────────────────┐         ┌──────────────▼──────────────┐
│ historicalSnapshots.ts      │         │ eventLibrary.ts             │
│  • getCurrentSnapshot()     │         │  • NAMED_EVENTS (3 events)  │
│  • getBracketingSnapshots() │         │  • getEvent(id)             │
│  • Reads atlas-historical-  │         │  • getEventBracketing-      │
│    mock.ts (rolling 72h)    │         │    Snapshots(event, ts)     │
└───────────────┬─────────────┘         └─────────────────┬───────────┘
                │                                         │
                └────────────────┬────────────────────────┘
                                 │
                  ┌──────────────▼──────────────┐
                  │   interpolation.ts          │
                  │   interpolateSnapshots(     │
                  │     before, after, t)       │
                  └──────────────┬──────────────┘
                                 │
                  ┌──────────────▼──────────────┐
                  │   timeTravelStore.ts        │
                  │   {mode, currentTimestamp,  │
                  │    activeEventId, …}        │
                  └──────────────┬──────────────┘
                                 │
                  ┌──────────────▼──────────────┐
                  │   useTimeTravelData() hook  │
                  │   → AtlasSnapshot           │
                  └──────────────┬──────────────┘
                                 │
       ┌─────────────────────────┴───────────────────────────┐
       │                                                     │
┌──────▼──────────────────┐                  ┌───────────────▼────────────┐
│ TimeTravelScrubber +    │                  │ GridAtlasView →            │
│ EventReplayMenu +       │                  │   GridAtlasMap             │
│ TimeTravelLegend        │                  │   (hubGeoJson +            │
│ (UI controls)           │                  │    outagesGeoJson driven   │
└─────────────────────────┘                  │    by snapshot)            │
                                             └────────────────────────────┘
```

### The three modes

| Mode | Snapshot source | Scrubber range |
| --- | --- | --- |
| `live`         | `getCurrentSnapshot()` — last frame in the rolling 72h buffer | Slider disabled; `NOW ↻` button is the only affordance |
| `scrubbed`     | bracket pair from `getBracketingSnapshots(timestamp)` + `interpolateSnapshots()` | Active range = `[getHistoricalRangeStart(), getHistoricalRangeEnd()]` (~72h window) |
| `event-replay` | bracket pair from `getEventBracketingSnapshots(event, timestamp)` + `interpolateSnapshots()` | Active range = `[event.startTimestamp, event.endTimestamp]` |

The store auto-enters `scrubbed` from `live` when the user first
drags the slider — no extra click needed. `selectEvent(id)` enters
`event-replay` and seeks to the event's start. `exitToLive()`
resets to current real-time and stops playback.

### The named event library

Three curated events ship in V1, all hand-authored hour-by-hour:

| id | Duration | Notable for |
| --- | --- | --- |
| `storm-elliott-2022`     | 96h | Arctic blast, 24 GW forced-outage cascade, $2,000+/MWh in PSEG/JCPL, Maximum Generation Emergency. The hero replay. |
| `august-heatwave-2022`   | 96h | Sustained heat dome, evening peaks ramp daily, system holds — the "expensive but stable" counter-example. |
| `march-2024-wind-spike`  | 48h | Cold-front winds push COMED/AEP LMPs negative; system wind share peaks at 42%. |

Each has 7-9 `EventHighlight`s with `significance` ∈
{`critical`, `notable`, `context`}. Highlights render as colored
chevrons above the slider track and are clickable to jump.

### Adding a new event

In `src/lib/atlas/eventLibrary.ts`:

```ts
function buildMyEvent(): NamedEvent {
  const start = '2025-07-15T00:00:00Z';
  const startMs = Date.parse(start);
  const snapshots: AtlasSnapshot[] = [];
  for (let h = 0; h < 48; h++) {
    snapshots.push(makeSnapshot(
      new Date(startMs + h * 3_600_000).toISOString(),
      { lmpMult: 1.4, loadMult: 1.1, /* …per-zone overrides… */ },
    ));
  }
  return {
    id: 'my-event-2025',
    name: 'My Event',
    description: 'One-sentence pitch shown in the EventReplayMenu.',
    startTimestamp: snapshots[0].timestamp,
    endTimestamp:   snapshots[snapshots.length - 1].timestamp,
    snapshots,
    highlights: [
      { timestamp: '2025-07-15T08:00:00Z', label: 'Load ramp', significance: 'context' },
      // …
    ],
  };
}

export const NAMED_EVENTS: NamedEvent[] = [
  buildStormElliott(),
  buildAugustHeatwave(),
  buildWindSpike(),
  buildMyEvent(),  // ← append here
];
```

The `makeSnapshot` helper in the same file accepts global
`lmpMult` / `loadMult` plus optional `perZone` overrides, an
`outages` roster, and `transmissionIntensity` / `fuelMixOverrides`
to shape the moment.

### Interpolation rationale

The scrubber moves continuously but the snapshot buffer is
discrete (one frame per simulated hour). Without interpolation,
dragging the slider at 60 fps would step frame-by-frame at
arbitrary boundaries — visible "jumps" in zone color and outage
appearance. `interpolateSnapshots(before, after, fraction)`:

- **Numeric** — LMP, load, congestion, reservoir, loading, shadow
  price, fuel-mix MW: linear blend.
- **Categorical** — `marginalUnit`, `transmission.binding`: snap
  to the nearer source frame at `fraction === 0.5`.
- **Outages** — union both rosters; outages present in only one
  source are kept as long as their interpolated presence ≥ 0.05.

The result: a 10-second drag through 24 hours feels like
continuous motion, not 24 discrete steps.

### What ATLAS owns (Wave 2 scope)

- `src/lib/types/timeTravel.ts` (NEW)
- `src/lib/mock/atlas-historical-mock.ts` (NEW)
- `src/lib/atlas/historicalSnapshots.ts` (NEW)
- `src/lib/atlas/eventLibrary.ts` (NEW)
- `src/lib/atlas/interpolation.ts` (NEW)
- `src/stores/timeTravelStore.ts` (NEW)
- `src/hooks/useTimeTravelData.ts` (NEW)
- `src/components/atlas/TimeTravelScrubber.tsx` (NEW)
- `src/components/atlas/TimeTravelLegend.tsx` (NEW)
- `src/components/atlas/EventReplayMenu.tsx` (NEW)
- `src/components/atlas/GridAtlasView.tsx` (modified — drops
  `buildLMPFrames`, mounts `useTimeTravelData()`, drives
  `hubGeoJson` + new `outagesGeoJson` from the snapshot, replaces
  the legacy timeline pill with `<TimeTravelScrubber />`, adds
  the TIME TRAVEL ACTIVE indicator pill)
- `src/components/atlas/GridAtlasMap.tsx` (modified — adds
  `outagesGeoJson` prop and three new layers: outage halo,
  outage ring, outage label)
- This section of `CLAUDE.md`

### Future work

- **Real PJM historical wire-up.** V1 ships hand-curated mocks.
  When the FastAPI historical endpoint lands at
  `gridalpha-v2-production.up.railway.app/api/atlas/historical`,
  swap the buffer source in `historicalSnapshots.ts`. The
  AtlasSnapshot shape stays unchanged — every consumer (store,
  hook, scrubber, map) keeps working.
- **Replay annotations linked to Vault case studies.** A future
  highlight type could carry a `caseStudyId` so clicking the
  marker also opens the matching CaseStudyView in a side drawer.
- **Multi-day scrubbing ranges.** V1 caps the rolling buffer at
  72h. The store's `rangeStart` / `rangeEnd` already accept
  arbitrary spans — extending to 30d / 1y is a buffer-size
  change in `atlas-historical-mock.ts` and a render optimization
  in the scrubber tick density.
- **Transmission flow lines.** The snapshot already carries
  `transmissionStates[]` with `loadingPct` and `binding`. A
  future map layer could render flow magnitude as line thickness
  and bind highlights as pulsing accents — the data is ready;
  the map render just needs the layer.

## CHROMA WAVE 3 — VISUAL COHESION MAP UPDATE

CHROMA Wave 1 established the PageAtmosphere primitive and the
four-tier text/elevation hierarchies. Wave 2 propagated profile-
specific atmospheric tints, swept through every post-Wave-1
surface, and added the cross-surface audit. Wave 3 carries the
contract forward to surfaces shipped after Wave 2.

### Wave 3 surfaces passed

| Surface | Pass | Notes |
| --- | --- | --- |
| Storage DA Bid Optimizer (FORGE) | ✓ | 3 hardcoded hex literals (cyan / teal) replaced with `C.electricBlueLight` (charge), `C.alertNormal` (ancillary). Discharge stays `C.falconGold`. The 8 sub-components were already on FOUNDRY primitives. OptimizerView's wrapper is intentionally a positioned `<div>` because StorageNest already provides `<PageAtmosphere tint="storage">`. |
| Atlas TimeTravelScrubber (ATLAS) | ✓ | Major de-neon. Neon cyan `#00FFF0` → `C.electricBlue` everywhere. Pill `borderRadius: 22` → `R.xl` (12, the documented max). Backdrop blur 14 → 8px. Shadow alpha 0.45 → 0.20. SIGNIFICANCE_COLOR map raw hex → tokens. "RETURN TO LIVE" green pill → falcon-gold underline-on-hover text-only. |
| Atlas EventReplayMenu (ATLAS) | ✓ | bgOverlay surface, falcon-gold active edge, electric-blue hover border-left, F.mono 12px caps event names → F.sans 15px 500-weight (more reading-friendly). PLAY button neon cyan → `C.electricBlue`. |
| Atlas TimeTravelLegend (ATLAS) | ✓ | Hex green/gold → token references. Secondary line fontSize 9 → 10. |
| Cmd+P drawer outer shell (CONDUIT) | (verified) | Already on the AIAssistant sibling pattern: bgOverlay + active-edge top + low-alpha shadow. No change needed. |
| Cmd+P result section + items (CONDUIT) | ✓ | Section header fontSize 10 → 11 + `1px borderDefault below`. Result rows: blue-tint hover → bgSurface→bgElevated lift. SynthesisCard background hex → `C.electricBlueWash`. Several 9px micro-labels promoted to 10px. |
| CmdPSelectionIndicator (CONDUIT) | ✓ | bgOverlay 0.92 alpha (per spec). Visible opacity 0.96 → 1. Shadow alpha 0.30 → 0.20. |
| RetrievalPromptGrader (ORACLE) | (verified) | Already used FOUNDRY primitives + tokens. |
| GradeBadge (ORACLE) | (verified) | Already correct — color-coded dot + caps label, uses tokens. |
| FeedbackPanel (ORACLE) | ✓ | Feedback prose color `C.textPrimary` → `C.textSecondary`, lineHeight 1.55 → 1.6. The AI's feedback is body prose, not a hero element — sits between the GradeBadge primary attention and the actions tier. |
| LessonSummaryPanel (ORACLE) | (verified) | Already built on ContainedCard with the editorial AI badge pattern. |
| RecallSession (ORACLE) | (verified) | Full-screen overlay matches the AIAssistant slide pattern. F.display italic 22px serif question, ContainedCard surfaces, GradeBadge integration. |

### Cohesion contract — what holds across the platform

After Wave 3, every surface that's been through CHROMA exhibits:

1. **Atmospheric vignette** — every full-page terminal surface
   wraps in `<PageAtmosphere>` (with appropriate variant or tint).
2. **One dominant focal element** — every Nest, every Analytics
   tab, every destination has a single hero. The eye lands somewhere.
3. **Four-tier text hierarchy** — `textPrimary` for hero,
   `textSecondary` for body prose, `textMuted` for labels and
   metadata, ~0.25 alpha for disabled.
4. **Four-tier surface elevation** — `bgBase` canvas, `bgElevated`
   data cards, `bgSurface` nested cells / inputs / inline panels,
   `bgOverlay` for raised modals / dropdowns / drawers.
5. **Active-edge card chrome** — every ContainedCard reads with the
   1px top border accent at 0.20 alpha that brightens to 0.40 on
   hover. Borders carry the hierarchy.
6. **No neon, no pills, no glows** — `C.electricBlue` is calm
   blue-500. `R.xl` (12px) is the border-radius max. Drop-shadows
   sit at alpha ≤ 0.25 wherever CHROMA has reached.
7. **F.mono for labels and data values, F.sans for prose,
   F.display for hero numbers + editorial titles** — never inverted.

### Tip for future agents

When you ship a new surface, the fastest way to land coherent is to
copy the wrapper of the nearest CHROMA-passed surface:

- New Nest tab? Copy from `IndustrialNest` or `StorageNest` — both
  have the canonical tab strip + `<PageAtmosphere tint=...>`.
- New floating panel? Copy from `CmdPDrawer` or `SaveViewModal` —
  both have the right backdrop + bgOverlay surface + active-edge
  top.
- New chart? Wrap in `ContainedCard padding={S.lg}`, lead with
  eyebrow + EditorialIdentity rhythm, use `C.electricBlue` for
  primary lines, `C.falconGold` for the profitability moment, no
  hardcoded hex.
- New row in a list? Use `bgSurface` base, lift to `bgElevated` on
  hover. F.sans 14px 500-weight for the title, F.mono caps for
  any badge.

### Deferred items

See `docs/wave-4-chroma-audit.md` for the full list. Cross-cutting
themes: drop-shadow alpha drift across overlays (a `T.elevation`
token would solve it in one stroke), tabular-nums coverage on
data-dense components, and the read-only Mapbox layer expressions
in GridAtlasMap that still hardcode hex (which would need an
`atlas/mapStyle.ts` constants module to clean up).

### Reference

- Primitive: `src/components/terminal/PageAtmosphere.tsx`
- Tokens: `src/design/tokens.ts`
- Wave 3 audit: `docs/wave-4-chroma-audit.md`
- Wave 2 audit (still mostly open): `docs/wave-3-chroma-audit.md`

## CURSOR WAVE 5 — V2 BACKEND LIVE DATA

The V2 backend (`app/`) now exposes the full set of PJM-backed canonical
endpoints frontend hooks need to swap mock-data.ts imports for live
data. Contract is the source of truth — frontend hooks compile against
it, agents flag any change before either side adjusts.

### Source of truth

- Contract doc: `docs/v2-backend-contract.md`
- Service: `gridalpha-v2-production.up.railway.app`
  (Railway service `gridalpha-v2`, deployed from
  `feature/full-shell-buildout`)
- Smoke test: `scripts/smoke-test.ts`
  (`npx tsx scripts/smoke-test.ts` — exits non-zero on any envelope
  failure; pass `API_BASE=http://localhost:8000` to target a local
  uvicorn).

### Canonical envelope

Every Wave-5 endpoint returns:

```ts
{ meta: { timestamp, ... }, data: ..., summary: string }
```

Frontend hooks should treat `meta.timestamp` (ISO-8601 UTC) and the
optional `meta.data_age_seconds` integer as the freshness contract for
rendering live / stale / simulated affordances. `meta.degraded_mode =
true` indicates a partial response (e.g. fuel-aggregated outage
fallback or capacity from nameplate estimate).

### Endpoints + cache TTLs

| Endpoint | Path | TTL | Notes |
| --- | --- | --- | --- |
| 1 | `GET /api/lmp/current?zone=` | 60s | RT 5-min single-zone |
| 2 | `GET /api/lmp/all-zones` | 60s | Fan-out, reuses Endpoint 1 cache |
| 3 | `GET /api/lmp/24h?zone=` | 5m | Paginated (288 rows ~ 3 PJM pages) |
| 4 | `GET /api/lmp/da-forecast?zone=&date=` | 1h | `date` defaults to tomorrow EPT |
| 5 | `GET /api/lmp/history?zone=&start=&end=&interval=` | 30 days | Verified dataset; max range 168h |
| 6 | `GET /api/spark-spread/current?zone=&heat_rate=` | 60s | LMP + Henry Hub; default 7,500 BTU/kWh |
| 7 | `GET /api/fuel-mix/current` | 5m | Adds pct + carbon intensity overlay |
| 8 | `GET /api/reserve-margin/current?zone=` | 60s | PJM-wide; zone-specific falls back |
| 9 | `GET /api/outages/current` | 5m | Per-unit; degraded_mode falls back to fuel-aggregated |
| 10 | `GET /api/ancillary/current?zone=` | 5m | Reg-A/D + spin + mileage MCPs |
| 11 | `GET /api/lmp/da-forecast/all-zones?date=` | 1h | Fan-out, reuses Endpoint 4 cache |
| 12 | `GET /api/stream` | live | SSE; events: `lmp-update`, `outage`, `heartbeat` |

### Auth

- PJM Data Miner 2 via `PJM_USERNAME` / `PJM_PASSWORD` (ForgeRock SSO,
  cached `tokenId`) or `PJM_SUBSCRIPTION_KEY` (Azure APIM) — Railway
  picks whichever env is set.
- Henry Hub gas spot via `EIA_API_KEY` (existing).
- Anthropic proxy still uses `ANTHROPIC_API_KEY` — `/api/ai/complete`
  is unchanged from V1 and remains the canonical route for ORACLE.

### SSE event reference

```
event: lmp-update
data:  {"zone":"WEST_HUB","lmp_total":35.90,"delta_pct_5min":0.5,"timestamp":"...","data_age_seconds":3}

event: outage
data:  {"generator":"Salem 2","zone":"PSEG","capacity_mw":1170,"event":"start","timestamp":"..."}

event: heartbeat
data:  {"timestamp":"..."}
```

`heartbeat` fires every 30s (plus an initial frame on connect with
`phase:"connected"`). Reconnect on connection drop — the hub is
in-process, so each Railway replica owns its own subscriber set.

### Legacy / canonical route map

The pre-Wave-5 routes are **frozen**. Existing consumers can keep
reading them; new wiring must use the canonical paths above. See
`docs/v2-backend-contract.md` for the full table.

| Frozen | Canonical replacement |
| --- | --- |
| `/api/atlas/generation-fuel` | `/api/fuel-mix/current` |
| `/api/atlas/outages` | `/api/outages/current` |
| `/api/energy/henry-hub` | composed into `/api/spark-spread/current` |
| `/api/atlas/binding-constraints` | (no Wave-5 equivalent yet) |
| `/api/atlas/interface-flows` | (no Wave-5 equivalent yet) |
| `/api/weather/*`, `/api/news/*`, `/api/atlas/substations`, `/api/atlas/gas-pipelines` | unchanged — own contract |

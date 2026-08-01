# GridAlpha V2 — Project Context

Professional PJM electricity market intelligence terminal — Bloomberg ×
Palantir × ISA-101 industrial HMI. Built by Aquiles Guerretta. Six
profiles, four destinations (Nest, Atlas, Analytics, Vault). V2 active
on `feature/full-shell-buildout`. Design vocabulary lives in the
`gridalpha-terminal` skill — that is authoritative when it conflicts
with this file.

## Active skill

`gridalpha-terminal` — auto-loads every session at
`.claude/skills/gridalpha-terminal/`. Load
`references/terminal-antipatterns.md` first; consult typography /
color / composition / motion / density per task.

## Active tooling

- **Tokens MCP** — `tools/gridalpha-tokens-mcp/server.py`. Tools:
  `tokens_search`, `primitive_lookup`, `figma_reference_lookup`.
  Query before generating any design-system code.
- **Auditor** — `node tools/gridalpha-detect/bin/gridalpha-detect.mjs src`.
  Pre-commit hook in `.husky/pre-commit`. P0 blocks; baseline 40 P0 / 22 P2.
- **Visual loop** — `/screenshot-loop` via Playwright MCP in `.mcp.json`.
  Embed `tools/screenshot-loop/brief-template.md` in any UI brief.
- **Brief template** — `docs/brief-template.md`. Canonical shape for
  Wave 7+ briefs.

## Brand tokens (source of truth: `src/design/tokens.ts`)

| Token | Value | Use |
| --- | --- | --- |
| `C.bgBase` → `bgOverlay` | `#111117` → `#27272f` | Four-tier elevation, warm dark |
| `C.electricBlue` | `#3B82F6` | Primary accent (calm blue-500, NOT cyan) |
| `C.falconGold` | `#F59E0B` | Live moments, warnings, profitability |
| `F.mono` | Geist Mono | Terminal data + labels (locked) |
| `F.sans` | Inter | Editorial / landing only |
| `F.display` | Instrument Serif | `HeroNumber` + `EditorialIdentity` only |

## Branch + commit conventions

Work on `feature/full-shell-buildout` only. Never push to `main`.
Commit prefix `<agent>: <subject>` (e.g. `foundry:`). Stage paths
explicitly — never `git add -A` (Wave 6 cross-attribution
prevention).

## Agent roster

- **FOUNDRY** — types / mocks / primitives / shared overlays / skill (`src/lib/types/`, `src/lib/mock/`, `src/components/terminal/`, `src/components/shared/`).
- **ARCHITECT** — routing + GlobalShell + tokens MCP (`src/main.tsx`, `src/components/GlobalShell.tsx`, `tools/gridalpha-tokens-mcp/`).
- **TERMINAL** — five per-profile Nests under `src/components/nest/`.
- **ATLAS** — `src/components/atlas/`, `peregrine/`, `analytics/`, `vault/` destinations + historical fetch.
- **CHROMA** — loading primitives + the `gridalpha-detect` CLI.
- **CONDUIT** — saved views, annotations, Cmd+P, PDF export, Playwright loop.
- **ORACLE** — AI Assistant (`src/services/anthropic.ts` + `useAIChat`), curriculum grading.
- **FORGE** — Trade Journal, Industrial Simulator, Storage Optimizer, live-data hooks (`src/hooks/data/*` + `src/services/api/*`).
- **SCRIBE** — Alexandria curriculum (`src/lib/curriculum/*`, `src/stores/progressStore.ts`).

## Project-specific quirks

- **No Tailwind on layout-critical elements** — inline styles with
  `S` tokens. Enforced by `no-tailwind-on-layout` (P0).
- **PJM feed is hourly** — `rt_unverified_hrl_lmps`. The 5-min feed
  rejects `type=ZONE/HUB`. See `docs/v2-backend-contract.md`.
- **PJM auth via public APIM key** bootstrapped at boot from
  `dataminer2.pjm.com/config/settings.json`. No private subscription
  needed.
- **Env vars in `.env.local`** (gitignored): `VITE_ANTHROPIC_API_KEY`,
  optional `VITE_MOCK_API=true`, `VITE_BACKEND_URL`.
- **F.display lock** — Instrument Serif permitted only in
  `HeroNumber` and `EditorialIdentity`.
- **Gitignored** — `.env.local`, `.claude/settings.local.json`.

## Wave status

| Wave | Status | Notes |
| --- | --- | --- |
| 1–4 | shipped | Trader Nest, Atlas time-travel, AI Assistant, Alexandria, Trade Journal, Industrial Simulator, Storage Optimizer, Cmd+P, PDF export |
| 5 | shipped | V2 backend, live-data hooks, freshness types, loading primitives, real historical fetch |
| 6 | closed | `gridalpha-terminal` skill, tokens MCP, Playwright loop, `gridalpha-detect`, this CLAUDE.md trim + brief template |

Pre-Wave-6 design content moved to the skill references. Per-wave
implementation notes live in tool READMEs and source. Full audit trail:
`docs/claude-md-audit.md`. Wave 6 close summary:
`docs/wave-6-close.md`.

## FOUNDRY WAVE 3 — INFRASTRUCTURE COMPLETE

Wave 6 closes with four tooling pieces plus this trim (3,907 → ~99 lines):
skill at `.claude/skills/gridalpha-terminal/`, MCP server at
`tools/gridalpha-tokens-mcp/`, auditor at `tools/gridalpha-detect/`,
Playwright loop via `/screenshot-loop` + `.mcp.json`. Wave 7+ briefs
follow `docs/brief-template.md`. Future hooks: marketing-surface skill
variant, auditor auto-fix for mechanical P0, screenshot-diff for visual
regression, a "design review" agent that runs the loop end-to-end.

## FORGE WAVE 5 — DEVELOPER UNDERWRITING CALCULATOR

The fourth profile signature feature. Elevates the Developer/IPP Nest
from "scaffolded but light" to "depth-complete" — Form → Run →
ranked IRR/NPV/Breakeven/PPA-verdict + sensitivity tornado + PDF memo,
matching the analytical seriousness of Trader Journal, Industrial
Strategy Simulator, and Storage DA Bid Optimizer.

### Architecture

| Path | Purpose |
| --- | --- |
| `src/lib/underwriting/types.ts` | `ProjectSpec`, `ScenarioSet`, `ScenarioResult`, `CashflowYear`, `UnderwritingResults`, `PPABenchmarkBand`, `SensitivityEntry`. |
| `src/lib/underwriting/finance.ts` | `computeIRR` (Newton's + bisection fallback), `computeNPV`, `computePayback`, `computeAnnualDebtService`, `computeBreakevenLMP`. |
| `src/lib/underwriting/capacityFactor.ts` | Year-1 base CF, monthly seasonality, linear lifetime degradation. |
| `src/lib/underwriting/forwardCurve.ts` | Synthesized LMP curve derived from `ZONE_REVENUE_HISTORY_24M` with 2.5%/yr escalation and long-run blend to $55/MWh. Clamped to $30-80/MWh. |
| `src/lib/underwriting/policyResolver.ts` | IRA-era ITC/PTC schedules + PJM capacity payment × ELCC. |
| `src/lib/underwriting/runUnderwriting.ts` | Main entry. Runs base/upside/downside; builds year-by-year cashflows, IRR/NPV/payback/breakeven, policy attribution, sensitivity tornado. |
| `src/components/nest/developer/UnderwritingCalculator/CalculatorView.tsx` | Orchestrator. Form ↔ Skeleton ↔ Results state machine. |
| `src/components/nest/developer/UnderwritingCalculator/ProjectInputForm.tsx` | Preset picker + 11 input fields. |
| `src/components/nest/developer/UnderwritingCalculator/ScenarioToggles.tsx` | BASE / UPSIDE / DOWNSIDE toggle. |
| `src/components/nest/developer/UnderwritingCalculator/ResultsHero.tsx` | IRR / NPV / Breakeven hero. |
| `src/components/nest/developer/UnderwritingCalculator/CashflowWaterfall.tsx` | Annual stacked-sign bar chart. |
| `src/components/nest/developer/UnderwritingCalculator/RevenueProjectionChart.tsx` | 3-scenario revenue lines. |
| `src/components/nest/developer/UnderwritingCalculator/CapacityFactorChart.tsx` | Monthly bars + lifetime line. |
| `src/components/nest/developer/UnderwritingCalculator/ScenarioComparison.tsx` | 5-row × 3-col scenario table. |
| `src/components/nest/developer/UnderwritingCalculator/PolicyAttribution.tsx` | Base / ITC / PTC / capacity NPV waterfall. |
| `src/components/nest/developer/UnderwritingCalculator/PPABenchmarkOverlay.tsx` | Breakeven vs PPA band gauge. |
| `src/components/nest/developer/UnderwritingCalculator/SensitivityTornado.tsx` | Tornado chart, sorted by absolute IRR impact. |
| `src/components/nest/developer/UnderwritingCalculator/ExportUnderwritingMemoButton.tsx` | Static-import PDF export. |
| `src/services/pdfTemplates/DeveloperSiteReportTemplate.tsx` | 6-page memo (summary, assumptions, cashflows, scenarios, PPA + tornado, methodology). |
| `src/components/nest/developer/DeveloperNest.tsx` | OVERVIEW / UNDERWRITING CALCULATOR tab strip. |
| `src/services/contextProviders/developerNestContext.ts` | ORACLE bridge — references the active project / scenario when the calculator has been run. |

### Calibration smoke test

100 MW Solar / COMED / 2028 COD (ITC-eligible, default capex/debt):
  Base IRR 8.9%, NPV $3.8M, payback 12.2 yr, breakeven $53/MWh.
  Upside 18%, downside −0.1%. In the 8-12% range expected for
  current PJM solar economics — calibration confirmed.

### V1 limitations (acknowledged future work)

- **MACRS 5-yr SL depreciation** — V1 simplification; real MACRS has
  half-year + accelerated convention.
- **Linear CF degradation** — real-world solar/wind CF drops faster
  in years 1-5 then stabilizes.
- **No real PJM forward market data** — when the forward-market hook
  ships (after Cursor/V2 backend phase), `runUnderwriting(spec, { liveAnnualLMP })`
  threads it through automatically.
- **No partial transmission line loss adjustment** for projects
  located far from load centers.
- **No zero-emission credit pricing** for nuclear projects — Hybrid
  with nuclear baseload isn't modeled.
- **Capacity payment auction integration** — V1 uses static
  $/MW-yr per zone; live PJM RPM auction results are the obvious
  upgrade path.

### What FORGE Wave 5 owns

- `src/lib/underwriting/*` (6 files)
- `src/components/nest/developer/UnderwritingCalculator/*` (12 components)
- `src/services/pdfTemplates/DeveloperSiteReportTemplate.tsx` (full
  implementation; was a 14-line stub)
- `src/services/pdfExport.ts` — added `exportUnderwritingMemo` +
  `underwritingMemo` registry entry. Existing exporters unchanged.
- `src/components/nest/developer/DeveloperNest.tsx` — surgical tab-
  strip addition above the existing OVERVIEW layout.
- `src/lib/mock/developer-mock.ts` — added `TECH_BASE_CAPACITY_FACTOR`,
  `ZONE_CF_MULTIPLIER`, `TECH_MONTHLY_CF_SHAPE`, `TECH_CF_DEGRADATION`,
  `UNDERWRITING_DEFAULTS`, `CAPACITY_PAYMENT_PER_MW_YEAR`. Existing
  exports unchanged.
- `src/services/contextProviders/developerNestContext.ts` — extended
  with module-level `setUnderwritingState()` bridge; CalculatorView
  writes its state in, the provider reads it on each AI synthesis.
- This section of CLAUDE.md

## FORGE WAVE 6 — ANALYST QUERY BUILDER + REPORT DRAFTING

The fifth profile signature feature. Elevates the Analyst Nest from
"comparison view + saved-query rail" to a depth-complete query
authoring and research-publishing surface. Structurally different
from the prior four waves: Query Builder → Saved Library →
Report Drafting → Publish, not Form → Run → Results → Export.

### Architecture

| Path | Purpose |
| --- | --- |
| `src/lib/analyst/types.ts` | `QueryAST`, `SavedQuery`, `QueryResult`, `Report`, `ReportSection`, `ReportTemplate`, `ScheduleKind`. |
| `src/lib/analyst/queryAST.ts` | `buildAST`, `emptyAST`, `serializeAST` / `deserializeAST`, `describeAST` (one-line plan preview). |
| `src/lib/analyst/queryExecutor.ts` | Pure function from AST → result. V1 runs against shape-matched synthetic data; future Cursor backend wave swaps `runLiveQuery`. |
| `src/lib/analyst/queryScheduler.ts` | `isDue`, `dueQueries`, `nextRunIn` — cron-style schedules (hourly / daily-8am / weekly-monday / monthly-1st). |
| `src/lib/analyst/reportRenderer.ts` | Thin façade over CONDUIT-2's `exportAnalystReport`. Returns `{ filename, shareUrl }`. |
| `src/stores/analystStore.ts` | Zustand + `persist` (localStorage). Owns `savedQueries[]` and `reports[]`. |
| `src/components/nest/analyst/QueryBuilder/*` | 7 components — composer, dimension/aggregation/filter pickers, results table + chart, saved-library, save modal, scheduled-runner, top-level `QueryBuilderView`. |
| `src/components/nest/analyst/ReportDrafting/*` | 7 components — editor, section block dispatcher, commentary/query-result/heading variants, preview, publish button, template library, top-level `ReportDraftingView`. |
| `src/services/pdfTemplates/AnalystReportTemplate.tsx` | Built from a 17-line stub. Renders Report (title, subtitle, sections) as a newspaper-style PDF. |
| `src/services/pdfExport.ts` | Added `exportAnalystReport` + `analystReport` registry entry. Existing exporters untouched. |
| `src/lib/mock/analyst-mock.ts` | Added `REPORT_TEMPLATES` — three seed templates (Weekly PJM Review, Storm Postmortem, Monthly Capacity Outlook). |
| `src/services/contextProviders/analystNestContext.ts` | Extended with `setAnalystQueryState` / `setAnalystReportState` module-level bridges so ORACLE references the active query or report. |
| `src/components/nest/analyst/AnalystNest.tsx` | Surgical addition: OVERVIEW / QUERY BUILDER / REPORT DRAFTING tab strip above the existing layout. |

### Calibration smoke test

```
PLAN  : top 5 of LMP for COMED, grouped by hour-of-day, over last 30 days
ROWS  : 5
RANGE : min $32.11, mean $35.34, max $40.37
SOURCE: mock
```

Scheduler verdict on a fresh `daily-8am` saved query (`lastRunAt: null`):
- DUE NOW: true
- NEXT RUN: in 15h (tomorrow 8 AM local)

Filter-zero edge: query "top 5 negative-LMP hours" correctly returns
zero rows against the synthetic data (the seeded LMP series doesn't
go negative — surfaces in the summary line as "No rows match the
query.").

### V1 limitations (acknowledged future work)

- **Query language is composer-only**, not SQL. A future revision
  can layer a SQL-like expression mini-language on top of the AST
  for power users; the AST itself is the single source of truth.
- **Persistence is localStorage**, not a backend. A future Cursor
  wave can swap the `persist` adapter for `/api/analyst/queries` /
  `/api/analyst/reports` endpoints without touching consumers.
- **Query result caching is per-saved-query** (`lastResult`) — no
  fleet-wide LRU yet. Hot queries re-fetch on every schedule tick.
- **Report charts embed as tables in PDF** because we don't yet
  rasterize SVG → PNG inside the pdf pipeline. Editor + preview
  show real charts.
- **Single-user, single-client reports.** No collaboration model;
  no real-time co-editing. The shareable URL is a
  `localstorage://` placeholder rather than an actual upload.
- **Live data path uses the mock executor** because Cursor hasn't
  shipped `/api/analyst/query` yet. When it does, swap the body of
  `runLiveQuery` and the rest of the surface picks it up.

### What FORGE Wave 6 owns

- `src/lib/analyst/*` (5 files)
- `src/stores/analystStore.ts`
- `src/components/nest/analyst/QueryBuilder/*` (8 files)
- `src/components/nest/analyst/ReportDrafting/*` (7 files)
- `src/services/pdfTemplates/AnalystReportTemplate.tsx` (built from stub)
- `src/services/pdfExport.ts` (added `exportAnalystReport`)
- `src/lib/mock/analyst-mock.ts` (added `REPORT_TEMPLATES`)
- `src/services/contextProviders/analystNestContext.ts` (extended)
- `src/components/nest/analyst/AnalystNest.tsx` (tab strip)
- This section of CLAUDE.md

## FORGE WAVE 7 — STUDENT SANDBOX TRADING

Strategy C closes here. The Student Nest gets paper-trading and a
lightweight hypothetical-project sandbox — a pedagogical mirror of the
Trader Journal and Developer Underwriting Calculator that lets a
student make decisions without capital at risk. Sixth and final
profile depth-shipped.

### Architecture

| Path | Purpose |
| --- | --- |
| `src/lib/sandbox/types.ts` | `Position`, `PositionAnnotation`, `PositionPnL`, `HypotheticalProject`, `ProjectPerformanceSnapshot`, `PortfolioSummary`. |
| `src/lib/sandbox/positionState.ts` | `buildPosition`, `computeSettleAt`, `isPositionDueToSettle`, `applyClosePosition`. Zustand+persist `useSandboxStore` with positions + projects, attach-annotation, link-journal-entry, record-performance bridges. |
| `src/lib/sandbox/markToMarket.ts` | `computePositionPnL`, `computeClosedPositionPnL`, `fetchRealizedLMP` (Wave 5 useLMPHistory under the hood), `markPosition`, `summarizePortfolio`, `cumulativePnLSeries`. |
| `src/components/nest/student/SandboxTrading/*` | 8 files — entry form, library, mark-to-market display, portfolio overview, performance history, annotations panel, journal promoter, orchestrator view. |
| `src/components/nest/student/ProjectSandbox/*` | 4 files — lightweight underwriting form, library, performance tracker, orchestrator view. Reuses FORGE Wave 6 `runUnderwriting` with default-fill assumptions. |
| `src/services/contextProviders/studentNestContext.ts` | Extended with `setSandboxState` / `setProjectPortfolioState` module-level bridges. ORACLE references the active portfolio + selected position/project on every synthesis. |
| `src/components/nest/student/StudentNest.tsx` | Surgical tab-strip addition: OVERVIEW / SANDBOX TRADING / PROJECT SANDBOX. `SandboxSection` "Continue trading" CTA wired to switch tabs. |

### Calibration smoke test

Seeded 4 mixed positions across COMED / PSEG / RECO / WEST_HUB:

| Zone | Side | Size | Entry | Exit | Hold | PnL |
| --- | --- | --- | --- | --- | --- | --- |
| COMED | LONG | 50 MW | $32.50 | $38.20 | 4 h | **+$1,140** |
| PSEG | SHORT | 30 MW | $62.10 | $58.40 | 2 h | **+$222** |
| RECO | LONG | 75 MW | $48.00 | $41.80 | 3 h | **−$1,395** |
| WEST_HUB | LONG | 100 MW | $35.40 | open | 1 h | mark-to-market |

Cumulative realized PnL: **−$33**. Win rate **67%** (2/3). Best
trade +$1,140, worst −$1,395, average hold 3.0 h. The RECO loss
crosses the ±$1,000 significance threshold so the Performance
History chart renders a Falcon Gold reference dot the student can
click to inspect.

### V1 limitations (acknowledged future work)

- **Auto-settle is opportunistic**, not a background ticker. The
  MarkToMarketEngine on each card fires the realized-LMP fetch on
  mount and closes the position if the hold has elapsed. A user who
  never returns to the tab keeps positions in `open` status
  indefinitely — fine for a pedagogical sandbox.
- **Single-user, single-portfolio.** No leaderboard, no cohort
  benchmarking. The cohort progress data already rendered in the
  Overview tab is unrelated.
- **Project performance uses a 7-day trailing LMP proxy** instead of
  a full-year backfill. The upstream `/api/lmp/history` endpoint
  caps at 168 h. A future wave can chunk a year's worth of bars and
  swap the proxy.
- **IRR delta in ProjectPerformanceTracker is first-order** —
  (realized − projected revenue) / equity / life. Not exact but
  pedagogically correct (positive realized → IRR up).
- **No real PJM forward market data.** Hypothetical-project forward
  curve inherits the FORGE Wave 6 limitation; same upgrade path
  (when Cursor/V2 ships `liveAnnualLMP`, `runUnderwriting` threads
  it automatically).
- **Persistence is localStorage**, not a backend. Mirrors every
  other FORGE store; same swap path when Cursor ships
  `/api/sandbox/{positions,projects}`.

### What FORGE Wave 7 owns

- `src/lib/sandbox/*` (3 files)
- `src/components/nest/student/SandboxTrading/*` (8 files)
- `src/components/nest/student/ProjectSandbox/*` (4 files)
- `src/services/contextProviders/studentNestContext.ts` (extended)
- `src/components/nest/student/StudentNest.tsx` (tab strip + CTA wiring)
- This section of CLAUDE.md

### Strategy C status — closed

Every profile has a depth tab beside its overview. Every recruiter
demo walks through six distinct analytical workflows running on the
same live PJM data feed.

| Profile | Depth feature | Wave |
| --- | --- | --- |
| Trader | Journal (P&L, attachments, weekly review) | 2 |
| Industrial | Strategy Simulator (8,760-hr dispatch + NPV) | 3 |
| Storage | DA Bid Optimizer (bid algorithm + risk grid) | 4 |
| Developer | Underwriting Calculator (IRR / NPV / tornado) | 5 |
| Analyst | Saved Queries + Report Drafting | 6 |
| Student | Sandbox Trading + Project Sandbox | 7 ← this wave |

## FOUNDRY WAVE 10A — INFRASTRUCTURE TYPE CONTRACTS

**Status:** closed.

**File paths:**
- `src/lib/types/infrastructure.ts` — `IsoMarket`, `LodLevel`, `AssetStatus`, `FuelType`, `GenerationUnit`, `TransmissionSegment`, `BatteryAsset`, `LineStringGeometry`.
- `src/lib/mock/infrastructure-mock.ts` — `MOCK_GENERATION_UNITS` (12), `MOCK_TRANSMISSION_SEGMENTS` (15), `MOCK_BATTERY_ASSETS` (8).

**Consumer waves:** Wave 10 (ATLAS), Wave 7 (CURSOR), Wave 11 (CURSOR multi-ISO), Wave 12 (FORGE ISO selector), Wave 13 (FORGE simulates).

**Boundary:** `GenerationUnit` excludes batteries — `BatteryAsset` is the separate contract. The Wave 10A `BatteryAsset` is also distinct from the PJM-optimizer `BatteryAsset` in `src/lib/types/storage.ts` (geospatial fleet vs. power/SOC optimizer domain). `ZoneSnapshot` in `market.ts` is NOT modified; the `iso` field is a Wave 12 change.

## ATLAS WAVE 5 — ATLAS ALL-US INFRASTRUCTURE

**Status:** closed in mock mode. Live-wire follow-up phase 9b deferred
until CURSOR Wave 7 is healthy. Smoke probe at close-time:
`/api/infra/generation-units` → 500, `/api/infra/transmission-segments`
→ 404, `/api/infra/batteries` → 500. No additional ATLAS work
required for the live flip; only `.env.local` change (set
`VITE_MOCK_API=` empty / unset) + smoke screenshots.

National-scale infrastructure layer added on top of the existing
PJM-focused Atlas. ~15K EIA generators (clustered), all 115 kV+
transmission (LOD-aware geometry), all batteries (point dots).
Bbox-driven viewport fetches with 250ms debounce; LOD computed
from zoom (`<=4 low / 5-7 mid / >=8 high`). Existing PJM-focused
systems are preserved verbatim — both layer families render
side-by-side via independent left-rail toggles.

### Architecture

```
   GridAtlasMap.onMoveEnd
        │ debounce 250ms
        ▼
   onViewportChange({ bbox, lod, zoom })
        │
        ▼
   GridAtlasView.setViewport
        │
        ▼ (cacheKey = JSON.stringify(query))
   useGenerationUnits(query)  →  fetchGenerationUnits  →  /api/infra/generation-units
   useTransmissionSegments(query) → fetchTransmissionSegments → /api/infra/transmission-segments
   useBatteryAssets(query)    →  fetchBatteryAssets   →  /api/infra/batteries
        │
        ▼ (request-id stale guard)
   GridAtlasView GeoJSON adapters (memoized on data)
        │
        ▼
   GridAtlasMap <Source> + <Layer> renders
```

### New layer files

- `colorRamps.ts` — `voltageColorExpression` (numeric `voltage_kv`
  step), `fuelColorExpression` (lowercase `fuel` match, token-driven),
  `lmpHeatExpression` (preserved), `clusterColorExpression`
  (point_count step, token-driven), plus `legacy*` expressions for
  the PJM-only static GeoJSON layers (byte-identical to the old
  inline definitions).
- `generationLayers.ts` — `allUsGenClusterLayer`,
  `allUsGenClusterCountLayer`, `allUsGenCircleLayer`. Cluster up to
  zoom 8 with three-step radius/color tiers. Individual dot color
  encodes fuel via `fuelColorExpression`; radius interpolates on
  `capacityMw`.
- `transmissionLayers.ts` — `allUsTxGlowLayer`, `allUsTxCoreLayer`.
  Width interpolation: exponential-1.5 zoom × linear voltage_kv
  (115 kV thin / 765 kV trunk lines pop at high zoom).
- `batteryLayers.ts` — `allUsBatteryCircleLayer`. Distinct visual
  category from generation: 1.5 px stroke (vs 0.5 on gen circles),
  `C.fuelBattery` purple fill, status-keyed stroke
  (operating=white, planned/uc=falconGold, retired/cancelled=red,
  standby=textMuted).

### New panel

- `panels/AssetDetailPanel.tsx` — top-right (top: 64, right: 12,
  width: 320, max-height calc(100vh - 160px) with internal scroll).
  Discriminated union on `kind: 'generation' | 'battery'` so
  battery-only fields (energy MWh, duration hr) render only for
  batteries. Status colored per FOUNDRY's `AssetStatus` palette
  (operating electric blue, planned/uc falcon gold, retired/cancelled
  alert red, standby muted). ESC + ✕ close.

### New hooks (one-time authorized boundary blur into FORGE territory)

- `src/hooks/data/useGenerationUnits.ts`
- `src/hooks/data/useTransmissionSegments.ts`
- `src/hooks/data/useBatteryAssets.ts`

All three follow FORGE's `useLMP.ts` style — compact, single-purpose,
return shape `{ data, loading, live, count, truncated, … }`. They
diverge from `useEnvelopeQuery` because viewport-scoped queries can
race during a pan; the request-id stale guard ensures whichever
fetch is the most recent wins, not whichever happens to finish last.
Cancellation propagates through `AbortController`.

### New services

- `src/services/api/generation.ts` — `fetchGenerationUnits(query, signal?)`
- `src/services/api/transmission.ts` — `fetchTransmissionSegments(query, signal?)`
- `src/services/api/batteries.ts` — `fetchBatteryAssets(query, signal?)`

Each routes through `BASE_URL + /api/infra/{kind}` when MOCK_MODE is
false; under MOCK_MODE returns FOUNDRY's Wave 10a fixtures clipped
to the requested bbox + filtered. Battery service returns server-side
`totalMw` / `totalMwh` aggregates so the intel panel doesn't recompute
them client-side.

### Modified

- `GridAtlasMap.tsx` — color ramp imports replace inline expressions
  (Phase 1, byte-identical); three new sources + their layer specs
  added (Phases 3-5); `interactiveLayerIds` extended for the two new
  point layers; `onClick` branches on layer id to dispatch to the
  matching detail-panel handler; `onMoveEnd` extended with debounced
  `onViewportChange` fan-out (Phase 6); `onMapLoad` fires an initial
  `onViewportChange` so saved-camera returns refresh too.
- `GridAtlasView.tsx` — three layer toggles in the layers panel
  (ALL-US GENERATION, ALL-US TRANSMISSION, BATTERY STORAGE); three
  Wave 5 hooks + GeoJSON adapters; viewport state seeded with CONUS
  / 'low' / 5.5 so first paint demos the layers; intel panel extended
  with a "NATIONAL · VIEWPORT" section (top fuels by capacity, battery
  totals, transmission km, truncation hint, LOD readout); asset detail
  panel mounted at the bottom of the JSX.

### Preserved

All PJM-focused systems render unchanged when their toggles are on:
20-zone centroid hub LMP system, 97-plant `power-plants.geojson`
clustering, `transmission-lines.geojson` static layer, gas pipelines
+ termini, substations, snapshot-driven outage overlay, weather,
earthquakes, time-travel scrubber. Color expressions for those layers
moved to `legacy*Expression` exports in `colorRamps.ts` — paint
output is byte-identical.

### LOD ladder (must match backend)

| Zoom | LOD | Backend behavior |
| --- | --- | --- |
| ≤ 4 | `low`  | Simplified geometry, voltage ≥ 345 kV only |
| 5-7 | `mid`  | Partial simplification, voltage ≥ 138 kV |
| ≥ 8 | `high` | Native precision, all voltages |

The MOCK_MODE branch applies the same voltage floor client-side over
the fixtures; geometry simplification is inert (mock segments are
already 2-point LineStrings).

### Live-wire phase 9b checklist (when CURSOR Wave 7 lands)

1. Confirm endpoints respond:
   ```
   curl -s "$BASE/api/infra/generation-units?bbox=-125,24,-66,49&iso=PJM&limit=5"
   curl -s "$BASE/api/infra/transmission-segments?bbox=-125,24,-66,49&lod=low&limit=5"
   curl -s "$BASE/api/infra/batteries?bbox=-125,24,-66,49&limit=5"
   ```
   Each must return shape `{ data, live, fetchedAt, count, truncated, [aggregates] }`.
2. Unset `VITE_MOCK_API` in `.env.local` (or set to anything other
   than the literal string `'true'` — see `services/api/client.ts`).
3. Run `npx tsc --noEmit` (must pass) and `npm run build` (must
   pass — but note pre-existing TERMINAL Recharts formatter errors
   in `src/components/nest/student/*` are NOT ATLAS Wave 5).
4. `/screenshot-loop` at 1440x900 / 1920x1080 / 3440x1440 capturing:
   continental zoom-out (clusters), PJM zoom (gen + tx visible),
   CAISO close-up (battery cluster), generator click → asset detail.
5. `node tools/gridalpha-detect/bin/gridalpha-detect.mjs ./src` —
   ATLAS Wave 5 baseline at close: 0 P0 in ATLAS-owned files.

### Future polish

- Click-outside dismissal on `AssetDetailPanel` (currently ESC + ✕).
- Click-into-cluster fly handler so clicking a cluster bubble zooms
  the camera in instead of being inert.
- Fuel filter panel extension to include batteries as a 9th category
  with capacity floor (mentioned in the brief; deferred — out of
  scope for this wave's hour budget).
- Dedicated outage layers file (`outageLayers.ts`) — currently the
  three outage layer specs live inline in `GridAtlasMap.tsx`.
- `legacy*Expression` retirement when the legacy GeoJSON files at
  `public/data/*.geojson` are migrated to FOUNDRY's typed schemas
  (separate sprint).

## FOUNDRY — ALEXANDRIA WAVE 1

**Status:** fechada.

**Arquivos:**
- `src/lib/types/alexandria.ts` — CurriculumTrack, CurriculumLanguage,
  CurriculumLevel, ActivityKind, SubmercadoTag, BlockPriority,
  AulaDifficulty, CurriculumBlock, CurriculumTrilha, CurriculumModule,
  CurriculumAula, LessonVideo, LessonActivity, LessonReference, Badge,
  UserBadgeProgress, Certificate, UserProgress.
- `src/lib/data/alexandria-blocks.ts` — ALEXANDRIA_BLOCKS (17) + 3 helpers.

**Fronteira:** arquivo próprio. Não estende nem importa
`src/lib/types/curriculum.ts`, que pertence ao Vault legado e segue travado.

**Pendências registradas:** blocos 2, 3, 8, 9, 11 com prioridade
'confirmar' e carga horária null. Bloco 11 tem título derivado de
evidência circunstancial, não confirmado em cabeçalho literal.

**Consumidores:** LYCEUM (todas as waves).

## LYCEUM — ALEXANDRIA WAVE 1

**Status:** fechada.

**Arquivos:** 10 primitivos SVG em `public/alexandria/svg/`
(6 em `nos-trilha/`, 4 em `anotacao/`) + harness de teste em `_test/`.

**Técnica:** revelação por `stroke-dashoffset` em path com
`pathLength="1"`. Cor via `currentColor`, definida pelo componente pai.
`pathLength="1"` normaliza o comprimento para 1 unidade, então a
animação não depende de medição em runtime e vale em qualquer viewport.

**Veredito do bracket:** precisa revisão. As duas pontas estão
alinhadas em x=16 — isso passa. O arco do meio, porém, está invertido
em relação a uma chave tipográfica: com `sweep=1` ele empurra para
**dentro** (x=6,71), deixando a haste (x=4) como ponto mais externo.
Numa chave `{` real a cúspide central é o ponto mais externo. Trocar o
flag do arco do meio para `sweep=0` leva a cúspide para x=1,29 e bate
com o glifo de referência. **Não aplicado** — geometria é decisão de
design. Preview medido e fotografado no fechamento da wave.

**Exceções (2, ambas propositais):**
- `dot-active.svg` — fill sólido, sem stroke, sem `pathLength`.
- `leader-line.svg` — o círculo de ancoragem é elemento separado, sem
  `pathLength`; só o path anima.

**Harness:** `window.alxSetPhase(1|0.5|0)` congela a animação num
offset exato para captura determinística; `window.alxAudit()` lê
fill/stroke/pathLength como autorados no arquivo bruto, separando
elemento desenhado de elemento sólido, e sinaliza desvios sem corrigir.
Precisa ser servido por HTTP — `file://` bloqueia o fetch, e o
carregamento é inline porque com `<img>` o `currentColor` não resolve.

## LYCEUM — ALEXANDRIA WAVE 2

**Status:** fechada.

**Tokens:** `src/design/alexandria-tokens.ts` — A (cor), AF (família),
AT (escala tipográfica), AS (espaçamento), AR (raio), AE (movimento),
ALAYOUT (larguras do shell). Sistema separado do terminal; os dois
nunca se importam. Extras: A2 (segundo nível de cor que o handoff usa
mas não nomeia), ATEXTURA (fibra de papel), AFONT_HREF.

**Shell:** `src/components/alexandria/shell/` — AlexandriaShell,
AlexandriaHeader, RailRight, RailLeft, AlexandriaFooter.

**Rota:** `/alexandria` → AlexandriaHome (placeholder).

**Invariantes:** header navy full-bleed · rail direito sempre navy 300px
· rail esquerdo opcional sempre creme 232px · canvas creme · rodapé navy
com faixa de blueprint. Raio zero. Sem box-shadow. Sem Tailwind.

**Procedência:** todo valor de cor tem citação de linha no handoff em
`docs/alexandria/design-handoff/.../Alexandria Sistema.dc.html`. O
handoff não tem arquivo de tokens — zero custom properties, zero
`:root`, zero `var()`. Fonte canônica: folha de tokens L936-987 +
folha de cor semântica L1145-1152.

**Valores marcados TODO:**
- `ALAYOUT.headerHeight` — o handoff não elege uma altura. Três valores
  literais concorrentes: 70px (L281, L497, L748, L1647), 74px (L54),
  78px (L1165, L1481). Está em 70px por ser o modal (4 de 7) e o valor
  das telas de produto interno. É decisão, não extração.
- `ALAYOUT.footerHeight` — não existe no handoff. Nenhum `height` /
  `min-height` / `max-height` em nenhum rodapé; os dois rodapés reais
  são dimensionados por conteúdo. String vazia é deliberada;
  AlexandriaFooter usa padding, como o handoff.

**Divergências brief × handoff (implementado conforme o BRIEF):**
- `AT` diverge da escala canônica do handoff (L993-1002) em cinco dos
  oito papéis: h1 32/33px, h2 22/24px, rótulo .18/.20em, h3 15/18px,
  dado 14/13px. Mantidos os valores do brief; conflito documentado no
  próprio arquivo de tokens.
- Campo de busca sem caixa. Quatro dos cinco campos do handoff têm
  container de quatro lados; o quinto (⌘K, L2038) é só fio embaixo — e
  é esse o padrão que o brief manda seguir.
- Faixa de blueprint no rodapé. O handoff descreve em prosa (L1084) mas
  nenhum rodapé de produto carrega background-image.
- Playfair Display excluída. O handoff carrega três famílias (L13) e
  usa Playfair 36 vezes — é o defeito conhecido. O shell injeta só
  Cinzel + Lora, porque `index.html` não é território desta wave.

**Decisão fora do handoff:** medida máxima de prancha (1120px, centrada)
no canvas. O handoff só tem frames fixos de 1440px, onde o canvas mede
~908px depois dos dois rails; sem o teto, em 3440px os blocos esticavam
para ~3000px.

**Gates:** `tsc --noEmit` exit 0. `gridalpha-detect` sobre
`src/components/alexandria`, `src/design/alexandria-tokens.ts`,
`src/pages/alexandria` — "No findings. Surface is clean." (0 P0/P1/P2).

## ARCHITECT — PORTAL BR WAVE 1

**Status:** fechada. Estrutural — estética final pendente de wave visual.

**Rotas:** `/br` → PortalBR · `/us` → plataforma americana ·
`/alexandria` inalterada (produto próprio, fora do prefixo de mercado
porque tem trilhas universal/brasil/usa).

**Decisão de arquitetura:** mercado é segmento de URL, não estado em
store. Link compartilhável, bookmark funciona, sem hidratação.

**Arquivos:** src/pages/br/PortalBR.tsx · src/components/br/ (4) ·
src/lib/data/br-destinos.ts (5 destinos, 1 disponível).

**Pendente:** tokens próprios do portal BR — cores estão locais com
TODO até a wave visual.

### Notas de implementação

**`/us` é redirect, não página.** `<Navigate to="/" replace />` para a
LandingPage, que é a superfície de entrada americana existente. O par
natural de um portal é outro portal, não um destino interno como
`/nest`. Quando o portal US ganhar página própria, só este element
muda — `SeletorMercado` não.

**Scroll.** O repo tem dois idiomas para páginas fora do GlobalShell,
porque `index.css` trava `html, body, #root` em 100vh / overflow hidden:
a LandingPage sequestra e restaura o overflow do documento num
`useEffect`; o AlexandriaShell monta um quadro de 100vh e rola por
dentro. PortalBR segue o AlexandriaShell — não muta estado global, então
não há cleanup a falhar. Efeito colateral conhecido: screenshot
`fullPage` não captura a página inteira, porque o scroll é do `<main>`,
não do documento.

**Tipografia não declarada.** Nenhum `fontFamily` nos seis arquivos. O
portal herda `--font-sans` do `index.css`. Declarar agora seria adivinhar
a wave visual; herdar é a única posição honesta. Também mantém os
arquivos fora do alcance de `no-inter-no-system`.

**Cor sem importação.** Cada arquivo carrega o próprio objeto `BR` com
`// TODO: substituir por tokens do portal BR quando a wave visual
chegar`. Duplicação deliberada — o portal terá tokens próprios, e
importar de `tokens.ts` ou `alexandria-tokens.ts` agora criaria
acoplamento que alguém teria que desfazer. Fios derivam da tinta
(`rgba(242,242,240,α)`), não de branco puro.

**Hierarquia da grade sem span calculado.** Destinos são separados por
status e renderizados em duas grades `auto-fit`. Com um único destino
aberto, `auto-fit` colapsa as trilhas vazias e o card ocupa a largura
inteira — vira o elemento dominante sozinho. Derivado dos dados: se um
segundo destino abrir, a composição acompanha.

**Orçamento de altura do hero.** Descoberto na verificação visual: com
a reserva da gravura em 4/3 + 300px, o hero consumia os 900px inteiros e
nenhum destino aparecia no primeiro paint. Corrigido para 16/10 + 248px.
Isto é a restrição estrutural que a wave visual herda — a gravura tem
esse envelope, não o que ela quiser.

**Decisão fora do brief:** medida máxima de prancha 1200px (a Alexandria
usa 1120px). Mais ar porque aqui há grade de quatro colunas, não página
de monografia. Sem o teto, em 3440px a grade estica e o portal vira
landing page de SaaS.

**Gates:** `tsc --noEmit` exit 0. `gridalpha-detect` sobre
`src/pages/br`, `src/components/br`, `src/lib/data/br-destinos.ts` —
"No findings. Surface is clean." (0 P0/P1/P2). Verificado em 1440x900 e
1920x1080: zero erro de console, zero overflow horizontal, caminho
`/br` → Alexandria → shell montado com `?trilha=brasil` preservado, e
`/us` → `/` com a landing americana intacta.

**Herdado, não resolvido:** `AlexandriaHome` ainda não lê `?trilha=`.
O parâmetro chega correto na URL e fica inerte até LYCEUM consumir —
contrato à frente da implementação, de propósito.

## FOUNDRY — ALEXANDRIA WAVE 2

**Status:** fechada.

**Arquivos:**
- `src/lib/types/alexandria.ts` (283 linhas) — acrescenta `InstrumentKind`,
  `InstrumentField`, `InstrumentOutput`, `Instrument`; campo `instruments`
  em `CurriculumAula`; campo `totalAulas` em `CurriculumModule`;
  `totalAulas` nullable + `totalAulasPartial` em `CurriculumTrilha`.
- `src/lib/data/alexandria-trilhas.ts` (153 linhas, NOVO) —
  `ALEXANDRIA_TRILHAS` (3), `ALEXANDRIA_MODULES` (17), 4 helpers.
- `src/lib/data/alexandria-blocks.ts` — **não modificado**, só lido.

### Contagem real de aula, extraída dos HTML

Três sinais independentes, todos concordando. `.aula` é classe
compartilhada — aparato (filosofia, mapa, caso, quiz, glossário,
checklist) usa a mesma classe que aula real, então a contagem bruta
superestima.

| Módulo | Bloco | `.aula` bruto | `Aula NN` | `§` aparato | Hero | Instrumentos |
| --- | --- | --- | --- | --- | --- | --- |
| 01 Física de Energia | `bloco-01` | 19 | **9** | 10 | "Nove aulas" | 7 |
| 02 Rede Elétrica | `bloco-02` | 20 | **10** | 10 | "Dez aulas" | 9 |
| 03 Tecnologias de Geração | `bloco-03` | 20 | **10** | 10 | "Dez aulas" | 9 |

**Blocos 04-17 ficam `totalAulas: null`** — não têm HTML, e estimar
seria inventar. Trilha 1 fecha com 29 aulas confirmadas em 3 de 5
módulos (`totalAulasPartial: true`); trilhas 2 e 3 ficam
`totalAulas: null`, porque nenhum dos seus 12 módulos tem fonte.

### Procedência dos títulos de trilha

O `GridAlpha_Curriculo_Definitivo.docx` **não está no repositório**.
Todas as seis menções a "Nível" nos três HTML são ao Nível 1.

- **Nível 1 — literal confirmado.** `Nível 1 — Fundamentos Universais`
  no rodapé dos Módulos 02 e 03; `Nível 1 · Fundamentos Universais ·
  Módulo NN` no hero dos três.
- **Nível 2 — não confirmado.** Herdado do brief.
- **Nível 3 — não confirmado.** O brief o declara literal, mas não há
  ocorrência em fonte disponível. Mesmo estado do Nível 2, apesar de o
  brief tratar os dois como casos diferentes.

Reconfirmar 2 e 3 quando a fonte primária entrar no repo.

### Instrumento como dado — três generalizações sobre o brief

Os 25 instrumentos dos três módulos provaram que o contrato do brief,
derivado só do Módulo 01, não expressa a maioria deles. Cada mudança é
superconjunto estrito do que o brief especifica; nenhuma inventa
categoria que a fonte não mostre.

1. **`InstrumentKind` de 3 → 9 membros.** Os três do brief cobrem os 7
   instrumentos do Módulo 01. Os Módulos 02-03 acrescentam seis
   prefixos. Frequência no currículo: calculadora 8, simulador 8,
   comparador 2, explorador 2, controles 1, laboratorio 1,
   cadeia-de-transformacao 1, dimensionador 1, quebra-cabeca 1.
2. **`outputs: InstrumentOutput[]`** no lugar de `outputLabel` +
   `outputUnit`. Só ~7 dos 25 têm saída única (`.instrument-output`);
   19 têm saída múltipla (`.sim-readouts` com 4 readouts,
   `.case-data-grid` com 6 células). `Controles · Triângulo de
   potência`, do próprio Módulo 01, tem zero saídas — desenha diagrama.
3. **`formula: string | null`.** `Explorador · Camadas da rede` é
   consulta pura, sem fórmula a exibir.

**Não precisou de extensão:** as pills de preset (`.pill-row`, 4
ocorrências) são select de escolha única renderizado como botões —
mapeiam em `kind: 'select'` + `options`. O `.verdict` (15 ocorrências)
é saída qualitativa — vira `InstrumentOutput` com `unit: null`.

### Outros desvios do brief

- **`CurriculumTrilha.totalAulas` virou `number | null` + flag
  `totalAulasPartial`.** O brief prescreve somar os conhecidos e deixar
  `0` nas trilhas sem fonte. `0` renderiza como "0 aulas" para o aluno,
  que é afirmação falsa; `null` é o idioma que a Wave 1 já usa para
  "fonte não declara" (`estimatedHoursMin`). A flag torna a parcialidade
  legível por máquina em vez de só por comentário.
- **`CurriculumModule.totalAulas` é campo novo** — a Wave 1 não o tinha,
  e o brief da Wave 2 depende dele.
- **Módulos são derivados de `ALEXANDRIA_BLOCKS`, não escritos à mão.**
  Título de módulo vem do bloco, então nunca diverge. Só as três
  contagens de aula são dado digitado.
- **4 helpers** em vez de nenhum — mesma convenção dos 3 de
  `alexandria-blocks.ts`.

**Pendente para LYCEUM:** os 25 instrumentos estão tipados mas não
populados. `CurriculumAula` também segue sem dado real — a Wave 2 ship
estrutura e contagem, não conteúdo.

**Gates:** `tsc --noEmit` exit 0. `gridalpha-detect` sobre os três
arquivos — "No findings. Surface is clean." Árvore inteira: 0 P0, 0 P1,
27 P2 — idêntico ao fechamento da Wave 1, delta zero.

**Consumidores:** LYCEUM (todas as waves).

## FOUNDRY — ALEXANDRIA WAVE 3

**Status:** fechada. Só dado semente — **zero tipo novo**. A inspeção não
revelou lacuna de contrato: `Badge`, `UserBadgeProgress` e `UserProgress`
da Wave 1 expressam tudo que a fonte mostra.

**Arquivos:**
- `src/lib/data/alexandria-badges.ts` (190 linhas, NOVO) —
  `ALEXANDRIA_BADGES` (13), `BLOCOS_COM_CONTEUDO`, 2 helpers.
- `src/lib/data/alexandria-progress-mock.ts` (101 linhas, NOVO) —
  `MOCK_USER_PROGRESS`, `MOCK_BADGE_PROGRESS` (13, cobertura 1:1).

### Procedência de cada badge

**(A) Referência visual — 4.** Fonte:
`docs/alexandria/design-handoff/.../project/Alexandria Sistema.dc.html`,
painel "Conquistas". Nome, critério e EXP literais da tela.

| Badge | EXP | Linha | Conteúdo por trás |
| --- | --- | --- | --- |
| Anatomista de Faturas | 25 | L1912-14 | Bloco 10 — sem HTML |
| Cartógrafo do SIN | 20 | L1918-20 | Atlas de submercados — não existe |
| Leitor de Mercado | 30 | L1924-26 | Bloco 09 — sem HTML |
| Guardião do Fator de Potência | 25 | L1930-32 | Bloco 01 ✓ |

**(B) Checklist real dos Módulos 01-03 — 9**, três por bloco. Critério é
texto verbatim de `.checklist-item`, com linha citada no arquivo.

| Badge | Bloco | Item / linha |
| --- | --- | --- |
| Tradutor de kW e kWh | 01 | item 1, L2497 |
| Leitor de Fator de Carga | 01 | item 5, L2501 |
| Aluno de Ohm | 01 | item 6, L2502 |
| Desenhista da Cadeia | 02 | item 1, L2765 |
| Fronteira do ONS | 02 | item 11, L2775 |
| Os Dez Segundos | 02 | item 15, L2779 |
| Matriz em Duas Lentes | 03 | item 1, L2467 |
| Aferidor de Fator de Capacidade | 03 | item 2, L2468 |
| Vacina do LCOE | 03 | item 16, L2482 |

Checklists inspecionados: 16 itens no Módulo 01, 18 no 02, 18 no 03.

**Procedência dupla:** `badge-guardiao-fp` é o único badge nas duas fontes
— o limiar de 0,92 da referência é corroborado pelo checklist do Módulo 01,
L2507 ("...por que abaixo de 0,92 pode virar cobrança").

**Extração × atribuição:** nome e critério são extração literal. `category` e
o `expReward` das entradas (B) são atribuição — o checklist não declara nem
categoria nem pontuação; EXP fica na faixa 20/25/30 observada na referência.
Distribuição resultante: conteudo 3, exploracao 1, dominio 9 — o checklist é
lista de domínio, então o viés é da fonte.

**Escala:** a referência mostra "12 de 31 badges". Estes 13 são os que têm
fonte hoje; os demais entram quando os Blocos 04-17 ganharem HTML.

### Honestidade do progresso

- **2 conquistados de 13**, ambos do Módulo 01 — único bloco com conteúdo
  completo no cenário. Nenhum badge (A) é conquistado: três dependem de
  conteúdo inexistente, e `badge-guardiao-fp` aparece bloqueado na própria
  tela de referência.
- **`badge-lei-de-ohm` fica bloqueado com o Módulo 01 concluído.** Modelo
  adotado: concluir a aula torna o badge *disponível*; conquistar exige a
  ação de domínio. Sem isso, 12/29 aulas obrigaria 3 conquistas.
- **`aulasTotal: 29` é lido de `getTrilhaByLevel(1)`**, não digitado.
  `badgesTotal` e `badgesEarned` também são derivados — o mock não pode
  divergir dos catálogos.
- **`byLevel[1] = 41`** é 12/29 medido contra as aulas CONFIRMADAS, não
  contra o Nível 1 inteiro — Módulos 04-05 têm `totalAulas: null`, então o
  denominador real é desconhecido e este número **sobe-estima**. Níveis 2 e 3
  em 0 significam "nada disponível", não "aluno não estudou".
- **`bySubmercado` todo zerado, inclusive os totais.** Submercado é ensinado
  (~40 menções na prosa dos três módulos), mas `CurriculumAula` não tem
  nenhum registro — a Wave 2 shipou estrutura, não conteúdo. Sem inventário
  de aula não há o que contar por submercado, e qualquer total seria
  inventado. O widget de cobertura regional renderiza vazio até as aulas
  existirem com `submercados` preenchido.
- **`exp: 480` é valor de demonstração** — nenhuma fonte declara EXP por
  aula. Decomposto no arquivo: 50 dos dois badges (valores reais do
  catálogo) + 430 atribuídos às 12 aulas.
- **Datas de conquista são fixas**, não relativas a "hoje".

**Pontuação preservada verbatim:** critérios do Módulo 01 e da referência
terminam em ponto, os dos Módulos 02-03 não. A diferença é da fonte — não
"corrigir".

**Gates:** `tsc --noEmit` exit 0. `gridalpha-detect` sobre os dois arquivos —
"No findings. Surface is clean." Árvore inteira: 0 P0, 0 P1, 27 P2 — delta
zero vs. Waves 1 e 2. Smoke test em runtime: 13 ids únicos, zero `badgeId`
órfão, cobertura 1:1 badge↔progresso, e as seis invariantes de coerência
(earnedAt vs status, derivações, percentual) passando.

**Consumidores:** LYCEUM — os cinco slots do `RailRight`.

## LYCEUM — ALEXANDRIA WAVE 3

**Status:** fechada.

**Rotas** (`AlexandriaRouter`, montado em `/alexandria/*`):
`/` hub · `/trilha/:trilhaId` caminho de expedição ·
`/trilha/:trilhaId/modulo/:moduloId` lista de aula ·
`/trilha/:trilhaId/modulo/:moduloId/aula/:aulaNumero` placeholder do viewer.

**Arquivos:** `src/components/alexandria/navigation/` — TrilhasHub,
TrilhaCard, CaminhoExpedicao, ModuloNode, ModuloAulaList.
`src/pages/alexandria/` — AlexandriaRouter, AlexandriaHome.
`src/main.tsx` — uma linha: `/alexandria` → `/alexandria/*`.

**`?trilha=` fechado.** O contrato que o ARCHITECT abriu na Portal BR
Wave 1 e deixou inerte agora é lido. O parâmetro indica TRACK — mercado
de entrada —, não trilha exata: sugere destaque (fio terracota de 3px à
esquerda + rótulo) e **nunca filtra**. As três trilhas ficam sempre
visíveis. Valor inválido, ausente ou `usa` (nenhuma trilha tem esse
track hoje — a Trilha 3 é `brasil`) cai em null e o hub não destaca nada.

**Cinco estados de módulo, com os primitivos da Wave 1:**

| Estado | Primitivo |
| --- | --- |
| concluído | `check-mark` (oliva) |
| em andamento | `ring-track` + `ring-progress` parcial |
| desbloqueado | `ring-track` + `dot-active` |
| bloqueado | `lock-body` + `lock-shackle` |
| em produção | `ring-track` tracejado, sem ponto, sem número |

`em-producao` e `bloqueado` distinguem-se por **forma**, não só por cor:
cadeado sólido fechado ("existe, não é sua vez") contra contorno
tracejado não preenchido ("ainda não foi gravado").

**Progressão:** módulo em produção NÃO tranca a fila. Não existe, então
não pode ser pré-requisito — sem isso um módulo sem HTML congelaria a
trilha inteira.

**Contagem nunca inventada.** `ring-progress` usa `dashoffset = 1 −
fração` (`pathLength="1"`, verificado em 0.6 para 4/10). Módulo com
`totalAulas: null` mostra estado de produção, sem lista fake. Trilha 1
diz "29 aulas confirmadas · 3 de 5 módulos com fonte" porque
`totalAulasPartial` é true e o número é piso, não total.

**Consumo dos primitivos:** fetch + inline com cache de módulo, nunca
`<img>` — com `<img>` o CSS do pai não alcança o path e `currentColor`
não resolve. Uma trilha de 7 módulos faz 2-3 fetches, não 7.

### Pendências e decisões

- **FOUNDRY Wave 3 fechou durante esta wave.** O dado inline que existia
  aqui foi removido; `MOCK_USER_PROGRESS`, `MOCK_BADGE_PROGRESS` e
  `ALEXANDRIA_BADGES` vêm de `src/lib/data/`. O inline divergia em dois
  pontos e a FOUNDRY estava certa nos dois: `aulasCompleted` era 13 (o
  correto é 12) e `bySubmercado` tinha totais **inventados** (2/6 e 1/4),
  quando o certo é zerar os quatro — sem inventário de aula não existe
  aula para contar por submercado. Era violação da regra da própria wave.
- **`AULAS_CONCLUIDAS_POR_MODULO` fica em `AlexandriaRouter.tsx`.**
  `UserProgress` é agregado e não carrega repartição por módulo, que o
  estado de nó precisa. Reproduz a decomposição que o arquivo da FOUNDRY
  declara em prosa (9 + 3 + 0 = 12), com trava em DEV que avisa se a soma
  sair de sincronia com o agregado.
- **Cobertura por submercado é painel de leitura, não filtro.** Filtrar
  exige `submercados[]` no nível da AULA, e `CurriculumAula` não tem dado
  real. Um controle que parece filtrar e não filtra é pior que um painel
  honesto. Vira filtro quando a aula existir.
- **Papel milimetrado é de LINHAS, não de pontos.** A proibição da Wave
  2 é sobre textura de papel; o canvas segue com fibra irregular.
- **A rota entra por fade, não por dashoffset** — `stroke-dasharray` já
  está ocupado desenhando o tracejado, e os dois usos brigam pela mesma
  propriedade.

**Gates:** `tsc -b` — 0 erros em arquivos Alexandria (restam os erros
pré-existentes de Recharts em `nest/student/*`, não desta wave).
`gridalpha-detect` sobre `src/components/alexandria`,
`src/design/alexandria-tokens.ts`, `src/pages/alexandria` — "No findings.
Surface is clean." (13 arquivos, 0 P0/P1/P2).

**Nota de gate:** `tsc --noEmit` sobre o tsconfig raiz **não** typecheca
os arquivos da app — passou limpo com um `navigate` não declarado em
`ModuloRoute`, que só o `tsc -b` do `npm run build` pegou. O gate real
desta árvore é `tsc -b`.

## ARCHITECT — PORTAL BR WAVE 2 · JAGUAR

**Status:** fechada. Hero e índice de destinos vestidos com o sistema
Jaguar (claro, tinta sobre papel). Faixa de independência, rodapé e
itens de nav seguem ABERTOS por decisão de design — não preenchidos.

**Arquivos novos:** `src/design/jaguar-tokens.ts` (literal da folha de
tokens, incluindo a grafia `acenteOcre`) · `src/lib/geo/brasil-outline.ts`
(gerado — paths projetados + provenance) · `public/br/brasil-outline.geojson`
· `public/br/submercados.geojson`.

**Modificados:** PortalHero (sequência de scroll), DestinoCard (dois
estados + PlantaBaixa exportada), PortalBR (reskin + overlay em breve),
SeletorMercado (só cor), FaixaIndependencia (→ placeholder null).

### Fonte de GeoJSON — decisão central da wave

- **Contorno:** IBGE, API de malhas territoriais v3, `qualidade=minima`,
  capturado 2026-07-26. Payload integral em `public/br/brasil-outline.geojson`
  com provenance; nenhum vértice alterado.
- **Submercados:** o ONS NÃO publica fronteira geográfica de submercado
  no portal de dados abertos (único match de busca é dataset tabular de
  programação diária; o servidor SIG não respondeu). Caminho adotado sem
  geometria inventada: malha por UF do IBGE (`intrarregiao=UF`) dissolvida
  por `turf.union` segundo a classificação oficial CCEE/ONS — SE/CO inclui
  AC e RO (subsistema Acre-Rondônia); DF entra pelo recorte Centro-Oeste.
  **RR não pertence a submercado nenhum** na definição CCEE documentada e
  fica no contorno sem preenchimento. Se a integração pós-Linhão de
  Tucuruí mudar isso, é mudança de uma linha no conversor (cod 14 →
  norte) — pendência de verificação com fonte primária.
- Conversão Web Mercator em build-time (turf só no scratchpad, nada de
  dependência nova no repo). Regeneração documentada no header do
  arquivo gerado.

### Polígono real × círculo-marcador — decidido no render

Polígono real venceu. As quatro regiões são legíveis, RR aparece como
lacuna honesta, e AC/RO dentro do SE/CO educa em vez de confundir.
Correção pós-verificação: mesma tinta na mesma opacidade fundia os
quatro submercados numa mancha única — resolvido com opacidade
escalonada por região (0.34/0.18/0.26/0.12) + fio interno hairline nas
fronteiras dissolvidas. O tracinho a leste do rótulo SE-CO é anel
interno real do contorno IBGE, não artefato — dado real fica.

### Hero

Palco sticky sobre pista de 280vh dentro do `<main>` que rola (o
documento não rola — idioma AlexandriaShell). Janelas: contorno 0-25%,
regiões 20-50% escalonadas, intercâmbios 45-75%, número 70-100%.
Conectores entre centroides são ESQUEMÁTICOS (diagrama de intercâmbio
S↔SE/CO, SE/CO↔NE, SE/CO↔N, N↔NE), não traçado físico de linha — a
regra de geometria real cobre contorno e fronteira; isso está declarado
em comentário. Número é MOCK (138,72) marcado "valor ilustrativo" em
texto visível. `prefers-reduced-motion` colapsa a pista e nasce no
estado final.

### Clique-zoom e o Terminal Brasil que não existe

View Transitions API nativa com checagem de suporte (`'startViewTransition'
in document`) + `flushSync`; sem GSAP. Sem suporte, o DOM atualiza sem
animação. Como o Terminal Brasil não existe e `main.tsx` está fora da
posse desta wave, clique em região (e em card em breve) abre um estado
"em breve" NA PRÓPRIA PÁGINA — painel `role="dialog"` com a planta
baixa do destino; região vem identificada ("abrirá contextualizado por
esta região"). **Inferência do implementador**, não especificação: quando
o Terminal Brasil abrir, o overlay vira navegação real para
`/terminal-brasil?regiao=<sigla>`. ESC, backdrop e ✕ fecham.

### Índice de destinos

Cinco cards de mesma moldura (grade uniforme — o peso igual é da spec;
a hierarquia mora dentro do card). Alexandria: prévia com cores literais
da spec §3 (`#F2E9D6`/`#0D2340` hardcoded — importar alexandria-tokens
segue proibido) e conteúdo genuíno do hub. Em breve: planta baixa por
destino em traço ocre, `pathLength=1` + dashoffset, desenhando ao entrar
em viewport (IntersectionObserver, uma vez). Verificado ponta a ponta:
card Alexandria navega com view transition e o hub monta com "sugerida
pelo seu portal" na Trilha 2 — o `?trilha=` da LYCEUM Wave 3 reagindo.

### Pendentes confirmados intocados

- `FaixaIndependencia.tsx` rende **null** — a copy de negação da Wave 1
  (que estava commitada e no ar) foi removida porque a spec §4 a declara
  rejeitada. Nenhuma copy nova inventada.
- Rodapé mínimo (marca + ano) com TODO — esboço papelSunken/citação de
  fontes volta à mesa junto com a faixa.
- Itens de nav: só o seletor Brasil/EUA, recolorido. Nenhum item criado.

### Divergência doc 39 × doc 40

A spec de página declara o padrão disponível/em-breve confirmado por
protótipo; a folha de tokens o lista como aberto. O brief da wave travou
a versão da spec (§3) e foi a implementada. Nota: a §1 da spec diz
"Alexandria + 3 em breve", mas a §3 lista 4 em breve e "cinco cards" —
seguido o detalhe da §3, que bate com o catálogo (5 destinos).

### Notas técnicas

- `@font-face` de Geist Sans injetado pelo PortalBR — o arquivo
  `Geist-Variable.woff2` já existia órfão em `public/fonts`; index.html
  segue fora da posse. `JF.sans` cai para Inter se a fonte falhar.
- `startViewTransition` com aba oculta/ocluída adia o callback (rAF
  throttled) — irrelevante para usuário com aba visível; descoberto
  porque a verificação roda em janela de automação.
- Gate real de tipo é `tsc -b` (nota da LYCEUM Wave 3 confirmada);
  restam só os erros pré-existentes de Recharts em `nest/student/*`.

### Revisão adversarial pós-implementação

Workflow de 14 agentes (4 dimensões → refutação por achado): 10 achados
brutos, 9 confirmados, todos corrigidos no commit `review fixes`:
scroller `<main>` focável (teclado puro não rolava nada — documento
travado), gestão de foco do diálogo (entra/prende/restaura — ciclo
verificado no browser), `comTransicao` pula VT sob reduced-motion (o
kill-switch CSS desmonta junto com a página na navegação), seletor
reduced-motion cobre `-old`/`-group` do painel, clique modificado
devolvido ao browser, `<article>`+botão esticado no card em breve
(h3 dentro de button achatava a navegação por cabeçalho), contraste:
tintaMuted 10px → tintaSecundaria e ocre-como-texto → badge
`acenteOcreWash`+fio. O único refutado: a copy rejeitada só existia em
COMENTÁRIO da FaixaIndependencia — parafraseado mesmo assim.

**Pendência de token para a wave visual:** o ocre #C17D1F não passa AA
como texto pequeno sobre os papéis (2,9–3,1:1). Se o design quiser
rótulo ocre, precisa de um tom escuro dedicado (ex.: ~#8A5A16 ≈ 5,4:1)
na folha de tokens — decisão de design, não tomada aqui.

**Gates:** `tsc -b` — 0 erros em arquivos da wave. `gridalpha-detect`
sobre `src/pages/br`, `src/components/br`, `src/design/jaguar-tokens.ts`,
`src/lib/geo` — "No findings. Surface is clean." Verificado em 1440x900
e 1920x1080: sequência de scroll nos cinco pontos-chave, overlay de
região, dois estados do índice, caminho card → Alexandria com trilha
destacada, ciclo de foco do diálogo, zero erro de console, zero
overflow horizontal.

## LYCEUM — ALEXANDRIA WAVE 4

**Status:** conteúdo fechado; **gravuras pendentes** (ver abaixo).

**Arquivos:** `src/lib/data/alexandria-modulo-01-content.ts` (578) ·
`alexandria-instrument-calculators.ts` (213) ·
`src/components/alexandria/viewer/` — AulaViewer (144), InstrumentPanel
(395), ApostilaPanel (187), ExercicioBlock (115), VideoArea (68).

### Shape real dos tipos, lido na Fase 1

`src/lib/types/alexandria.ts` inalterado desde a FOUNDRY Wave 2 (`d565a51`).

- `Instrument` — `id · kind · title · formula: string | null · fields[] ·
  outputs[] · note: string | null`. `InstrumentKind` tem 9 membros.
- `InstrumentField` — `id · label · unit: string | null · kind:
  'number'|'range'|'select' · defaultValue: number | string · min? · max? ·
  step? · options?`.
- `InstrumentOutput` — `id · label · unit: string | null`.
- `CurriculumAula` — 17 campos; **não tem campo de corpo de texto**.
- `LessonActivity` — `id · kind · prompt · points · config:
  Record<string, unknown>`. Sem campo de gabarito: o gabarito vai em
  `config`, que o contrato deixa solto de propósito.
- `LessonReference` — `id · title · source · kind · url · sizeBytes ·
  publishedAt`.

### Extração — parsing determinístico, não transcrição

19 seções `.aula` no HTML; nove são aula, dez são aparato. Resultado:
**9 aulas · 135 blocos de corpo · 7 instrumentos · 8 exercícios.**

| Aula | Instrumento | Exercícios | Blocos |
| --- | --- | --- | --- |
| 01 | inst-01 | Ex 01 | 21 |
| 02 | inst-02 | Ex 02 | 17 |
| 03 | — | — | 16 |
| 04 | inst-03 | Ex 03 | 11 |
| 05 | inst-04 | Ex 04, Ex 07 | 15 |
| 06 | — | — | 14 |
| 07 | inst-05 | Ex 05 | 18 |
| 08 | inst-06 | Ex 06 | 9 |
| 09 | — | — | 14 |

**São 8 exercícios, não 6.** Dois tags fogem da forma canônica:
`Ex · 07 · 3 níveis · Aula 05` (aponta a Aula 05) e
`Ex · 08 · Síntese · Diagnóstico inicial` (não aponta aula — fica em
`MODULO_01_SINTESE`). A prosa do § Drill já dizia "seis dos oito".

**O sétimo instrumento** é `LAB · 01`, no aparato § Lab, fora de qualquer
aula — por isso não aparece no viewer. INST 01-06 estão nas aulas.

### O que a fonte não declara

`video: null` nas nove — não existe vídeo nenhum no HTML. Estado real.
`durationMinutes: null` e `difficulty: null` nas nove — o hero declara
4-6 h para o MÓDULO (de onde saiu `estimatedHours` do bloco) e o § MAP
lista as nove aulas sem tempo nem nível. `submercados`, `competencies`,
`illustrations`, `references` ficam vazios.

**Extensão de tipo, a única:** `CurriculumAula.durationMinutes` e
`.difficulty` passam a aceitar `null`. Sem isso não dá para construir
aula válida sem inventar. Mesmo idioma que `estimatedHoursMin` e
`totalAulas` já usam. Ninguém consumia os dois campos.

O corpo de texto ficou em `MODULO_01_CORPO`, **ao lado** de
`CurriculumAula` e não dentro: o contrato não tem campo de corpo, e
acrescentar um não era estritamente necessário. Candidato a `body`.

### Cálculo portado, não rederivado

Os sete vêm do `<script>` do HTML (L2720-3070). Prova de fidelidade: o
HTML traz as saídas já renderizadas com os defaults — é o que o script
produz no load. **16 de 16 valores conferem.**

**Duas coisas sinalizadas, não corrigidas:**
1. `lab-b-reativo` / `lab-b-total` — o script calcula
   `(0,92−0,84)×100000×0,4 = R$ 3.200`; o markup estático traz
   `R$ 1.800`, que corresponde a coeficiente 0,225. O estático é resíduo
   de uma mudança de coeficiente; como `updateB()` roda no load, o aluno
   vê 3.200. A porta segue o script.
2. INST 02 (Lei de Ohm) — no original os handlers de V e de I limpam
   `R.value` quando o próprio campo é esvaziado; o de R não limpa nada.
   O efeito colateral não foi portado (a função aqui é pura); o
   resultado do cálculo é idêntico.

Também preservado: o `|| 1` de INST 04 e 06 em "horas", que faz campo
vazio virar 1 em vez de estado de espera.

### Viewer

`VideoArea` usa contorno tracejado terracota — o mesmo idioma do nó de
módulo em produção. Abas Referência / Apostila / Notas / Transcrição; só
a Apostila tem conteúdo, as outras três dizem o que falta e por quê.
`InstrumentPanel` é um componente para os nove `kind`; quando `formula`
é null e `outputs` é vazio, desenha diagrama em vez de imprimir número —
o caso do INST 05, que na fonte tem zero `.instrument-output`.

### Pendências

- **Gravuras não convertidas.** Fase 0 do brief revisado: 106 arquivos,
  **260 MB**, ainda em `.gitignore` (linhas 42-43), **0 rastreados**.
  A conversão `pngquant --quality=65-90` e o povoamento de
  `illustrations` não foram feitos — próxima wave.
- **Screenshots não capturados** nesta sessão: o Playwright estava
  travado por outra sessão e o painel Browser não compõe frames.
  Verificação foi funcional (valores computados lidos do DOM).

**Gates:** `tsc -b` — 0 erros em Alexandria. `gridalpha-detect` sobre os
20 arquivos — "No findings. Surface is clean."

## ARCHITECT — PORTAL BR WAVE 3 · HERO IMERSIVO E RODAPÉ

**Status:** fechada. Escala tipográfica formal (`JT`), mapa como
protagonista físico da sequência, ocre com função, rodapé real.
`FaixaIndependencia` segue TODO — intocada.

### Tipografia — antes/depois (auditado no render da Wave 2)

| Papel | Antes | Depois (JT) |
| --- | --- | --- |
| nav / seletor | 11px | 13px `JT.nav` |
| rótulo mono (eyebrow, badges, FONTES…) | 10px | 13px `JT.rotulo` (tracking 0.18-0.20em → 0.14em) |
| headline h1 | 40px | 56px `JT.h1` |
| h2 overlay | 22px | 26px `JT.h2` |
| h3 card | 16px | 18px `JT.h3` |
| corpo (hero §, card, overlay) | 15 / 13 / 12px | 17px `JT.corpo` (notas 14px) |
| PLD agregado | 52px | 84px `JT.dadoDestaque` |
| dado regional (novo) | — | 20 unidades SVG ≈ 20px `JT.dadoRegional` |

Exceção deliberada: a miniatura da prévia Alexandria (8-9px) é retrato
em escala de outro produto, não interface do portal.

### Hero — cinco fases, pista de 340vh

Contorno 0-25 · submercados 20-50 · intercâmbios 45-75 · **75-95: mapa
cresce de 58% para ~93% do palco e recentraliza (translateX 14vw→0,
scale 1→1.58), texto esmaece, rótulos regionais sigla+PLD ilustrativo
ancoram nos centroides com leader line** · 90-100: barra compacta
reintegra headline + PLD agregado. O agregado É a referência SE/CO —
mesmo número do rótulo regional, promovido a figura; barra com fio
ocre de 3px.

**Decisão `animation-timeline: view()` vs JS:** JS da Wave 2 estendido.
Cobertura de scroll-driven animations ainda parcial fora do Chromium
para `view()`+`animation-range`, e o decisivo: a sequência dirige
ESTADO React (contadores, rótulos, interpolações SVG), não só CSS —
duas linhas do tempo dessincronizariam a cena.

**Escape:** botão "Pular apresentação ↓" — primeiro focável da seção,
some após o assentamento (p≥0.98), rola o `<main>` para o fim da
pista. Verificado: clique leva scroll além da runway.

**Reduced-motion:** composição ESTÁTICA própria em fluxo (seção
`position: static`, sem wrapper de 340vh) — eyebrow, headline,
parágrafo com opacidade 1, mapa grande com rótulos, PLD. NÃO é o
estado final da animação (que tem texto esmaecido — seria perda de
conteúdo, não redução de movimento). Verificado com emulação:
scroll livre, zero prisão, botão de pular ausente.

### Ocre com intenção — e o limite honesto

Aplicado: nav ativo com fio ocre 2px (estado redundante em cor de
texto + aria-current) · eyebrow com traço ocre líder · fio ocre 3px na
barra de PLD · nós de centroide ocre com hairline de tinta · leader
lines e ticks dos rótulos regionais · intercâmbios 1.4→1.8, opacidade
cheia. **Ocre como TEXTO segue impossível com a folha atual:** #C17D1F
fica em ~2,7-2,9:1 sobre os papéis — falha AA em qualquer tamanho. A
intenção literal do brief (eyebrow em texto ocre) virou traço+tinta.
Sinal registrado: se "mais cor" ainda parecer pouco, a próxima rodada
precisa de tom ocre escuro na folha de tokens (≈#8A5A16 passa 4,5:1)
ou de referência visual nova — não de mais ajuste cego.

### Rodapé real

`papelSunken`, textura de rede hairline (malha + diagonal de tinta a
5%, data-uri), FONTES · ONS · ANEEL · CCEE · EPE em Geist Mono 13px,
marca + Portal Brasil + ano, e linha de proveniência do que está
renderizado hoje: "Geografia IBGE · dados de mercado ilustrativos".
Desacoplado da faixa de independência.

### Retestes de regressão (os dois riscos da wave)

- **Teclado:** ordem de Tab verificada — seletor → `<main>` focável →
  "Pular apresentação" → cards. Escape ativado por teclado leva além
  da pista. Nota de ambiente: PageDown programático não rola nem o
  portal NEM a landing americana (scroller de documento, intocada) na
  janela de automação ocluída — mesma classe do throttling de rAF/VT
  documentado na Wave 2; artefato de ambiente, não regressão.
- **Reduced-motion:** emulado via Playwright — seção estática em
  fluxo, `scrollHeight` livre, conteúdo integral visível.

**Gates:** `tsc -b` 0 erros nos arquivos da wave (restam os
pré-existentes de Recharts em `nest/student/*`). `gridalpha-detect`
sobre a superfície BR — "No findings. Surface is clean." (o único P1
intermediário foi falso positivo de spread de token, resolvido com o
literal `tabular-nums` redundante). 1440×900 e 1920×1080: sequência em
0/50/85/100%, rodapé, zero overflow horizontal, zero erro de console.

## LYCEUM — ALEXANDRIA WAVE 5

**Status:** conversão e mapeamento fechados. **Render pendente** — o
viewer não tem slot de imagem (ver abaixo).

### Conversão

106 gravuras, `pngquant --quality=65-90 --speed=1 --strip`.
**260 MB → 42 MB, redução de 84%.** Os 106 nomes seguem idênticos, zero
renomeado, zero falha. Maior arquivo final: `ins-08-sala-conselho`, 852 KB.

Método: conversão para staging primeiro, com validação de nome,
assinatura PNG e tamanho mínimo nos 106 antes de trocar no lugar — se
algum tivesse falhado, a pasta original não teria sido tocada. Nada de
estado misto.

**Backup:** `C:\Users\aquil\alexandria-gravuras-original-backup`
(fora do repo e fora do OneDrive, para não disparar upload de 260 MB).
Verificado por hash MD5: 106/106, zero divergência.

`pngquant 2.17.0` instalado isolado no scratchpad; `package.json` e
lockfile do repo intocados. Entrada de `gravuras/` removida do
`.gitignore` (linhas 42-43) — os 106 estão rastreados.

**Verificação de decodificação:** as 106 carregadas no browser com
`naturalWidth > 0` em todas. Dimensões preservadas, 1024–1536 px. É a
prova que importa numa conversão com perda — nenhuma corrompeu.

### Mapeamento do Bloco 1

Cruzado por **conteúdo real** das nove aulas extraídas na Wave 4, não
pelo documento antigo (`alexandria-gravuras-chatgpt.md` não está no
repo). Método: frequência de termo por aula, seguida de leitura das
frases reais nos casos de julgamento — frequência sozinha dá falso
positivo, e deu em dois casos.

| Aula | Gravura | Razão |
| --- | --- | --- |
| 01 Energia × Potência | — | "motor" só como exemplo genérico de 15 kW |
| 02 As sete unidades | `fis-04-triangulo-potencia` | seção dedicada "kVA e kVAr"; enuncia o triângulo retângulo literalmente |
| 03 Corrente alternada e frequência | `fis-01-dinamo-cc`, `fis-02-alternador-ca`, `fis-06-medidor-frequencia` | o contraste CC×CA **é** o assunto; 60 Hz também |
| 04 Tensão, corrente e perdas | `fis-03-transformador-elevador` | seção "A solução: trocar corrente por tensão" |
| 05 Demanda e fator de carga | — | 1 hit incidental |
| 06 Tensão como categoria econômica | — | 1 hit incidental |
| 07 Triângulo de potência e FP | — | o INST 05 desenha o triângulo ao vivo; gravura estática seria redundante (decisão do war room, vendo renderizado) |
| 08 Capacidade instalada | — | zero hits |
| 09 Qualidade de energia | — | "frequência" aparece como parâmetro de qualidade, não como o medidor |

**3 aulas com gravura, 6 sem. 5 das 6 `fis-` usadas.**

`fis-05-motor-inducao` **não foi mapeada**. Aparece uma única vez em
todo o módulo, na Aula 07, dentro de uma lista de equipamentos indutivos
("motores, transformadores, compressores, fornos a arco, bobinas de
solda"). Menção em lista não faz do motor o assunto. Fica para quando
existir aula que o trate.

`fis-04` ficou **só na Aula 02**, que apresenta o triângulo pela primeira
vez. Chegou a ser mapeada também na 07, mas com o render na tela ficou
claro que ali é redundante — o INST 05 já desenha o triângulo ao vivo e
dinâmico. Decisão do war room olhando os dois estados renderizados.

`fis-05-motor-inducao` foi renderizada em teste ao lado do triângulo na
Aula 07, onde cai logo acima do parágrafo "Em equipamentos indutivos —
motores, transformadores...". O par lia bem, mas a decisão foi manter
fora: uma menção dentro de lista de cinco equipamentos não faz do motor
o assunto.

### As outras 100

`red-` 8, `ger-` 24, `ins-` 8, `mat-` 8, `mer-` 6, `tar-` 9, `geo-` 10,
`his-` 11, `orn-` 15, `ar-` 1. Todas convertidas, **deliberadamente não
mapeadas** — não existe aula extraída dos Módulos 02-17 para cruzar.
`orn-` (15) nunca mapeia para aula: é mobília de interface, referenciada
direto por componente quando esse componente existir.

Nota da biblioteca: a numeração de `tar-` pula o 05 (vai de `tar-04` a
`tar-06`). É como a biblioteca chegou; a contagem de 106 não muda.

### Slot de gravura — construído nesta wave

O brief da Wave 5 partia de que "o viewer já tem o slot de imagem
construído desde a Wave 4". **Não tinha** — a Wave 4 foi interrompida
antes dessa parte. Posse estendida a `AulaViewer` e `ApostilaPanel`
(arquivos da própria LYCEUM) por decisão do war room, e o slot foi feito.

`Prancha` renderiza `illustrations` na aba Apostila, logo após o lead:
`objectFit: contain` (nunca esticada), fundo transparente sobre o papel,
fio de 1px em cima e embaixo. Gravura sozinha é limitada a 420px e
centrada — as imagens são quadradas ou 3:2, e deixar a caixa ir a
1056px ilhava a figura no meio de vazio. **Array vazio não reserva
slot**: sem `figure`, sem placeholder, sem buraco.

Legenda derivada do nome do arquivo, com mapa de acento — nome de
arquivo é ASCII, então `dinamo` precisa virar `dínamo`. É correção
ortográfica da mesma palavra, não rótulo inventado; o mapa precisa
crescer conforme mais gravuras forem mapeadas.

**Verificado por `naturalWidth` na tela**, não só presença de tag:
Aula 03 três gravuras em grade 341×220, todas `nat>0`; Aulas 04 e 07 uma
cada, `nat 1024×1024`; Aula 08 zero `figure`, layout intacto.

**Gates:** `tsc -b` — 0 erros em Alexandria. `gridalpha-detect` — "No
findings. Surface is clean."

## ARCHITECT — PORTAL BR WAVE 4 · AUDITORIA LIVRE

**Status:** fechada. Autorização aberta do Aquiles ("faça todas as
melhorias que quiser"). Auditoria da página inteira + revisão
adversarial de 20 agentes (16 achados, 16 confirmados, todos
corrigidos).

**Token novo:** `acenteOcreEscuro #8A5A16` — fecha a pendência das
Waves 2-3. Ocre como TEXTO passa AA em papelBase (5,09), papelRaised
(5,42) e papelOverlay (4,86); em papelSunken (4,35) só texto grande.
Autorizado pela liberdade da wave; documentado no próprio token.

**Onde o ocre-texto entrou:** eyebrow, PLD 84px, valores regionais do
mapa (com halo de papel via paint-order — as etiquetas caem dentro do
fill da própria região), rótulo Região do diálogo, badges (só sobre
papelRaised — sobre papelOverlay fica em 4,43 e usa tinta).

**Faixa de independência PREENCHIDA (afirmativa).** Copy do
implementador em commit isolado (`wave 4 faixa independencia
afirmativa`) para veto por revert limpo: "A análise é o produto" /
"Todo dado tem origem citada" / "A remuneração vem de quem lê".
Nenhuma negação como espinha, nenhuma promessa de economia.

**Rodapé completo:** três colunas (marca+tagline · destinos navegáveis
— Alexandria via view transition, em-breve abrem o overlay · mercados)
+ FONTES ONS·ANEEL·CCEE·EPE + proveniência honesta + ano. **Achado
crítico da revisão: a textura de rede nunca tinha renderizado** — o
`%23` pré-codificado passava por encodeURIComponent de novo. Nenhuma
verificação visual anterior pegou porque a ausência de uma textura a
5% é invisível em screenshot; só a leitura do computed style provou.
Todo texto pequeno do rodapé usa tintaPrimaria (tinta a 60% sobre
papelSunken = 4,28:1, reprovada).

**Outros acréscimos:** document.title próprio com restauração ·
lang="pt-BR" no root · faixa de fatos reais entre hero e destinos ·
contagem "1 aberto · 4 em construção" · fio de progresso da sequência
· legenda de hover com nome da região (aria-hidden — os polígonos já
falam por aria-label) · entrada dos cards por viewport · disclaimer
de PLD junto dos rótulos regionais (78%), não só na barra (90%) ·
resgate de foco do botão Pular no limiar do assentamento · outline de
foco em acenteOcreEscuro (≥3:1) · prévia Alexandria atualizada para o
hub vivo ("Currículo") · mapa nunca deixa rótulo cair abaixo de 13px
(crescimento 1.65, estático 770px, sigla 14u).

**Gates:** `tsc -b` 0 erros nos arquivos da wave · `gridalpha-detect`
"No findings. Surface is clean." · textura verificada por computed
style (sem `%2523`) · zero overflow · zero erro de console.

## LYCEUM — ALEXANDRIA WAVE 6

**Status:** fechada. Wave curta de roteamento — libera as waves de
Perfil, Atlas e Glossário para rodarem em paralelo sem disputar
`AlexandriaRouter.tsx`.

### Auditoria da Fase 1 — o que estava lá antes

Auditado por clique real e leitura de DOM, não por inspeção de código.

**Logo:** já era o asset real desde a Wave 2 — `AlexandriaHeader` renderiza
`/alexandria/marca/rosa-sm-on-navy.png`, carrega (`naturalWidth 1024`) e
desenha em 30×30. A Fase 2 do brief virou no-op: não havia glifo Unicode
nem SVG placeholder para trocar. O único `<svg>` inline do header é a
lupa da busca.

**Nav:** os quatro itens estavam **mortos**. O header disparava
`onNavegar?.(id)`, `AlexandriaShell` repassava a prop, e nenhum
consumidor jamais a passava — então o clique era no-op. Confirmado:
clicar em Biblioteca, Trilhas, Atlas e Glossário não mudava a URL em
nenhum dos quatro. "Biblioteca" aparecia aceso por padrão fixo
(`itemAtivo = 'biblioteca'`), não por rota.

**Rotas, na ordem:** `index` (hub) · `trilha/:trilhaId` ·
`trilha/:trilhaId/modulo/:moduloId` ·
`trilha/:trilhaId/modulo/:moduloId/aula/:aulaNumero` · `*` → hub.
Nenhuma de perfil, atlas ou glossário.

### O que existe agora

**Três rotas novas:** `/perfil`, `/atlas`, `/glossario`, cada uma com seu
stub montado no `AlexandriaShell`.

**Os stubs não contêm conteúdo real** — sem progresso no perfil, sem mapa
no atlas, sem verbete no glossário. Usam o mesmo registro de `VideoArea`
e do nó de módulo em produção: contorno tracejado em terracota, com
frase específica do que vai existir e da dependência que falta. O bloco
visual é repetido nos três em vez de extraído para um quarto arquivo —
cada stub será substituído por uma wave diferente e precisa poder sumir
sem quebrar os outros.

**Nav viva.** Cada item carrega destino absoluto e o header navega
sozinho via `useNavigate`. `onNavegar` continua como override do
chamador. `AlexandriaShell` não está na posse desta wave, então threading
de prop por sete instâncias de shell estava fora de questão — e o header
autossuficiente é o design melhor de qualquer forma.

Estado ativo derivado da rota, com `itemAtivo` explícito vencendo:

| Rota | Item aceso |
| --- | --- |
| `/alexandria` | Biblioteca |
| `/alexandria/trilha/*` | Trilhas |
| `/alexandria/atlas` | Atlas |
| `/alexandria/glossario` | Glossário |
| `/alexandria/perfil` | nenhum — tem rota, não tem item de nav |

`aria-current="page"` no item ativo: o estado deixa de ser só cor e fio.

### Duas coisas registradas, não resolvidas

- **Biblioteca e Trilhas apontam para o mesmo lugar**, como o brief pede
  (Trilhas → hub; Biblioteca estava morta → hub raiz). A consequência
  visível é que clicar em Trilhas acende Biblioteca. É coerente — Trilhas
  significa "você está dentro de uma trilha", e clicar devolve ao índice —
  mas não é limpo. Resolver exige decisão de arquitetura de informação:
  ou Biblioteca vira superfície própria, ou um dos dois sai.
- **O logo pesa 1.342 KB para renderizar em 30×30.** A conversão da Wave 5
  cobriu `gravuras/`, não `marca/` — os quatro PNG de marca seguem em
  ~1,4 MB cada. `public/alexandria/marca/` é somente-leitura nesta wave.
  Mesmo tratamento `pngquant` resolveria.

**Gates:** `tsc -b` — 0 erros em Alexandria. `gridalpha-detect` sobre 21
arquivos — "No findings. Surface is clean." Quatro cliques reais
verificados, mais o retorno de dentro de uma aula.

## LYCEUM — ALEXANDRIA WAVE 7

**Status:** fechada. A entrada de `/alexandria` deixa de cair direto no
hub: agora é hero + hub na mesma página, um scroll só.

### Auditoria da Fase 1 — o fluxo real antes

`main.tsx` monta `/alexandria/*` → `AlexandriaHome` → `AlexandriaRouter`
→ `index` → `HubRoute` → `AlexandriaShell` > `TrilhasHub`.

`AlexandriaHome` **não era a página do hub** — desde a Wave 3 é delegador
puro de todas as rotas. Sem parâmetro caía no hub; com `?trilha=` lia o
track, resolvia a trilha sugerida e repassava ao router, que a entregava
ao hub. Nenhum hero em lugar nenhum.

### Desvio do brief, com motivo

A Fase 3 pede "`AlexandriaHome` renderiza Hero + `TrilhasHub`", partindo
de que o arquivo era a página do hub. Renderizar o hero ali sem mais nada
o faria aparecer também em `/atlas`, `/perfil` e dentro de cada aula.

O lugar estrutural do hero é o `HubRoute`, dentro de
`AlexandriaRouter.tsx` — que esta wave não pode tocar. Então
`AlexandriaHome` passa a interceptar o índice e servir a entrada; todo o
resto segue para o router intocado. Verificado: `/atlas`, `/perfil` e
aula 3 não têm hero.

Sem `<Routes>` aninhado de propósito — com o pai casando `/alexandria/*`,
resolução relativa dentro de splat é o caso que o React Router avisa que
muda na v7. A decisão é por `pathname`.

**Registrado, não resolvido:** o `index` e o catch-all do
`AlexandriaRouter` continuam apontando para o `HubRoute`, que agora só é
alcançável como fallback de endereço desconhecido — e esse fallback mostra
o hub **sem** hero. Unificar é uma linha no router, quando ele estiver
liberado.

### Hero

`src/components/alexandria/landing/AlexandriaLandingHero.tsx`. Eyebrow,
título em `AT.display`, subtítulo, três estatísticas, CTA e gravura.

**Gravura escolhida: `orn-13-mapa-dobrado`**, decidida vendo seis
candidatas renderizadas lado a lado. É a única que é o Brasil
especificamente — litoral e território reconhecíveis —, é um mapa (a
metáfora do atlas) e é horizontal, que é o que a faixa do hero pede.
Astrolábio e sextante são náuticos; teodolito e compasso são instrumento
genérico e verticais; o pergaminho está literalmente em branco.

**Estática, nunca interativa.** O mapa vivo é a feature Atlas, que ainda
não existe — desenhar um aqui competiria com ela em vez de apontar para ela.

**Estatística toda derivada** de `ALEXANDRIA_BLOCKS.length` (17),
`ALEXANDRIA_TRILHAS.length` (3) e da soma dos `totalAulas` não-nulos (29).
Nenhum número digitado solto: se o currículo crescer, o hero acompanha.
Contagem de gravuras ficou de fora justamente por não ser derivável de
módulo de dado nenhum — seria `106` hardcoded.

### Bug encontrado e corrigido no CTA

`elemento.scrollIntoView({ behavior: 'smooth' })` **não funciona quando o
scroller é container aninhado** — e o scroller aqui é o `<main>` do shell,
não o documento. Medido nas três variantes:

| chamada | resultado |
| --- | --- |
| `scrollIntoView({behavior:'auto'})` | 477 px |
| `scrollIntoView({behavior:'smooth'})` | **0** |
| `main.scrollTo({behavior:'smooth'})` | 477 px |

Corrigido chamando `scrollTo` no `<main>`, achado por `closest('main')`.

**Limitação de ambiente registrada:** com `smooth`, o clique sintético do
Playwright move 26 px e congela — assinatura de rAF estrangulado na janela
de automação ocluída, mesma classe que o ARCHITECT documentou para View
Transitions e PageDown. O caminho `auto` (exercitado via
`prefers-reduced-motion`) chega aos 476 px sempre, o que prova alvo e
mecanismo. Mantido `smooth` para usuário real em vez de enfiar um timer
defensivo na produção para contornar artefato de automação.

**Gates:** `tsc -b` — 0 erros em Alexandria. `gridalpha-detect` — "No
findings. Surface is clean." Verificado em 1440×900 e 1920×1080.

## LYCEUM — ALEXANDRIA WAVE 8

**Status:** fechada. `/glossario` deixou de ser stub — os verbetes reais
do § Lex do Módulo 01 estão na página, com busca e âncora termo → aula.

**Arquivos:** `src/lib/data/alexandria-glossario.ts` (NOVO) ·
`src/components/alexandria/glossario/GlossarioView.tsx` (NOVO) ·
`src/components/alexandria/glossario/GlossaryTermCard.tsx` (NOVO) ·
`src/pages/alexandria/GlossarioStub.tsx` (corpo substituído; nome de
arquivo fica — é o contrato de rota da Wave 6) ·
`src/lib/types/alexandria.ts` (+`GlossaryTerm`, nada mais tocado).

### Extração — 38 termos, não 28

O § Lex tem **38** `details.glossary-item`; a prosa da própria seção diz
«Vinte e oito termos». Divergência da fonte, registrada no header do
arquivo de dados e não corrigida — a contagem real do markup vence a
prosa. Termo, etiqueta (`.unit`) e definição são literais, com HTML
inline (`<b>`) e entidades preservados; a definição renderiza com
`dangerouslySetInnerHTML`, mesmo idioma dos blocos de apostila.

**Extensão de tipo, a única além do contrato do brief:** `GlossaryTerm`
ganhou `unit: string` — a etiqueta de categoria do `.unit` da fonte
("Corrente", "Instituição", "Contrato"). É dado real; descartá-lo seria
perda. Documentado no próprio tipo.

### Cruzamento termo → aula

Contra o corpo REAL das nove aulas (`MODULO_01_CORPO` + lead + título),
método das Waves 4-5: varredura por padrão + leitura das frases nos
casos de julgamento. Regras: palavra do termo, não símbolo de unidade
('Volt' não mapeia toda aula que escreve 'V'); sentido do verbete, não
colisão de string. **Excluídos após leitura:** 'oferta e demanda'
(aula 03 — sentido sistêmico, não o conceito tarifário), 'diretor de
energia' (aula 06 — cargo), 'mercado livre potencial' e 'ineficiência'
(falso positivo de substring), 'motores mais eficientes' (aula 06 —
adjetivo incidental).

**35 de 38 termos ancorados**, 73 âncoras termo→aula no total:

| Aula | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Termos | 7 | 14 | 6 | 6 | 8 | 8 | 13 | 2 | 9 |

**CCEE, CUSD e PLD ficam com `aulaIds: []`** — definidos no § Lex, mas o
corpo do Módulo 01 não os usa. O card diz isso ao aluno em vez de
esconder a linha; é o mesmo idioma de honestidade das contagens null.

### Página

Layout de dicionário de monografia: coluna do termo (Lora versalete) +
coluna da definição, fio de 1px entre verbetes, marcador de letra em
Cinzel terracota, tudo visível — glossário impresso na prancha, não
sanfona. Busca sem caixa (fio embaixo, padrão ⌘K do handoff),
acento-insensível, cobrindo termo, categoria e definição. Âncora de aula
é botão terracota sublinhado com número + título real da aula; a rota é
derivada do catálogo (`getModuleById` → `trilhaId`), nunca digitada.

### Verificação e ambiente

Clique real confirmado: FP → Aula 7 monta com "Aula 7 de 9" e o viewer
completo; busca "fator de pot" filtra para os 5 verbetes corretos; zero
erro de console; zero overflow horizontal; 38 verbetes no DOM.

Notas de ambiente (mesma família das waves anteriores): o painel
Browser oculto não compõe frames — screenshot e clique sintético falham
sem ser defeito da página. O Playwright MCP estava travado pela sessão
paralela. Fallback que funcionou: `playwright-core` isolado no
scratchpad dirigindo o Chrome local headless — screenshots capturados e
o MESMO clique navegando para a Aula 7. Servidor próprio da sessão em
porta dedicada via entrada nova no `.claude/launch.json`
(`--port 5199 --strictPort`), porque o 5173 pertencia a outra janela.

**Gates:** `tsc -b` — 0 erros em Alexandria (seguem só os pré-existentes
de Recharts em `nest/student/*`). `gridalpha-detect` sobre os 5 arquivos
da wave — "No findings. Surface is clean."

## LYCEUM — ALEXANDRIA WAVE 10

**Status:** fechada. O rodapé deixa de ser uma faixa de três frases e
vira a **cartela do atlas** — quatro seções, como a caixa de legenda no
canto de uma carta náutica. Fecha a pendência das 15 gravuras `orn-`,
convertidas na Wave 5 e nunca ligadas a componente nenhum.

**Posse:** `src/components/alexandria/shell/AlexandriaFooter.tsx`
(único arquivo de produto modificado) + uma entrada nova em
`.claude/launch.json`. Header, rails e rotas intocados.

### A restrição que decidiu a composição inteira

`AlexandriaShell` é `height: 100vh` + `overflow: hidden`, e o rodapé
fica **fora** do `<main>` que rola, com `flex: none`. Isto não é rodapé
de fim de página: é **faixa permanente**. Cada pixel de altura aqui é um
pixel a menos de canvas de leitura, em toda tela do produto, o tempo
inteiro.

Foi por isso que a composição é densa e baixa em vez de arejada, e por
isso que `loading="lazy"` não só não economiza como **quebra** (abaixo).
A regra de densidade e a restrição estrutural apontam para o mesmo
lugar, o que é conveniente — mas a segunda não é negociável.

**Medição de fechamento (1440×900 e 1920×1080):**

| Peça | Altura |
| --- | --- |
| Rodapé total | **211px** — 24% da tela em 900px, 20% em 1080px |
| Grade das 4 seções | 119px |
| Régua de fecho | 28px |
| Padding (26 × 2) | 52px |

Por seção: Marca 56 · **Navegação 119** · Fontes 97 · Astrolábio 56.

**A altura restante está travada pela Navegação**, que é a única coluna
com quatro linhas empilhadas. Se ela virasse linha única o piso cairia
para ~97px (Fontes) e o rodapé para ~180px. Não foi mexido: o Aquiles
declarou navegação fora de escopo desta wave, junto com o problema
Trilhas→Biblioteca herdado da Wave 6.

Se um dia o rodapé precisar crescer, o caminho **não** é aumentar o
padding: é mover `<AlexandriaFooter/>` para dentro do `<main>` no Shell,
e aí ele rola com o conteúdo. Uma linha, em arquivo de outra posse.

### Escolha de gravura — medida, não opinada

As seis candidatas foram **decodificadas** (palette + `tRNS`, unfilter
de scanline) antes de qualquer decisão visual. Todas 1536×1024, alpha 0
nos quatro cantos, tinta média entre `#ab9b82` e `#d2c5aa`.

Isso deu o achado que orientou tudo: **a coleção `orn-` foi desenhada
para campo escuro.** Contraste de 6,7:1 a 10,7:1 contra o navy do
rodapé, e só 1,4:1 a 2,3:1 contra o creme. O rodapé navy é o campo
certo para ela — num canvas creme essas gravuras sumiriam.

| Seção | Gravura | Razão |
| --- | --- | --- |
| Ambientação | `orn-15-astrolabio` | Único radialmente simétrico — ancora a ponta da cartela sem apontar para lugar nenhum, que é o que ambientação deve fazer. |
| Navegação (acento) | `orn-11-sextante` | Ver abaixo. |
| Navegação (link Atlas) | `orn-13-mapa-dobrado` | O objeto é literalmente o destino. |
| Fontes primárias | `orn-01-pilha-livros` | Ver abaixo. |

**`orn-01-pilha-livros` sobre `orn-04-estante-arquivo`:** (1) são quatro
volumes empilhados para quatro fontes primárias — a rima é numérica, não
forçada; (2) a massa é horizontal e baixa, que é a proporção desta
faixa, enquanto a estante é objeto alto e estreito e encolheria a nada;
(3) "fonte primária" é o documento publicado — o livro **é** a fonte, o
gaveteiro é o continente, um nível acima do que a seção nomeia.

**`orn-11-sextante` sobre `orn-05-compasso`:** (1) sextante é o
instrumento de **navegar** — mede o ângulo do astro para achar posição;
compasso é de traçar em prancheta, pertence ao desenho; (2) densidade de
traço medida no arquivo — o compasso tem **0,9%** de pixels opacos
contra **15,5%** do sextante, e a 24px sobre navy ele viraria fiapo
invisível; (3) o compasso é altíssimo e estreito, o sextante é compacto
e encosta bem numa coluna de links.

`orn-04` e `orn-05` ficam disponíveis — foram avaliadas e preteridas,
não descartadas.

### Três bugs que só a medição revelou

Nenhum destes aparece em leitura de código, e dois deles são invisíveis
em screenshot.

1. **`loading="lazy"` impedia três das quatro gravuras de carregar.**
   O rodapé nasce dentro da viewport, num container que não rola, então
   o observer de lazy loading nunca dispara. `currentSrc` vazio e
   `naturalWidth` 0 **indefinidamente**, com os quatro arquivos
   respondendo 200 e os elementos medindo dentro da tela. Só o mapa
   escapou, por timing. Removido. Ficam `decoding="async"` +
   `fetchPriority="low"`, que tiram do caminho crítico sem impedir que
   a imagem chegue.
2. **`width: auto` colapsava a caixa para 0** antes de a imagem ter
   dimensão intrínseca — e um elemento de área zero não dispara lazy,
   o que fechava o ciclo do bug 1. Caixa agora reservada pela razão
   real `1536/1024`.
3. **O separador `·` da régua estava em cor de fio** — 1,70:1, reprova
   AA como texto, e é anunciado por leitor de tela sem significar nada.
   Virou fio de 1px de verdade, que é o idioma do sistema
   ("profundidade vem de fio, nunca de sombra").

### Textura de blueprint — verificada por rede, não por disco

Pedido explícito do Aquiles, por causa do bug do Portal BR Wave 3
(`%23` duplamente codificado, textura nunca renderizou apesar do arquivo
estar certo, e nenhuma verificação visual pegou porque a ausência de uma
textura a 5% é invisível em screenshot).

Verificado aqui por `getComputedStyle` **mais requisição de rede**:
`background-image` resolve para URL absoluta, retorna **200 · 87.996
bytes · image/png**, sem dupla codificação. O vetor do Portal não se
aplica — a banda é PNG externo, não data-URI. Conferida de passagem a
fibra do canvas (essa **é** data-URI, no Shell): codificada uma vez só,
também limpa.

### Correções de escala pedidas em revisão

- Rótulos de seção **10px/0.18em → 8px/0.13em**. A 10px disputavam peso
  visual com os títulos do rail direito — rodapé competindo com
  conteúdo é inversão de hierarquia.
- **Grade de estatística removida** (3 trilhas / 17 módulos / 29 aulas).
  O mesmo número já vive no hero da Wave 7, e era ela que inflava a
  altura da coluna de marca. Sobrevivem `TOTAL_MODULOS` e
  `MODULOS_COM_FONTE`, com papel diferente: a régua de fecho não conta
  catálogo, declara **estado de extração** ("3 de 17 módulos
  verificados") — proveniência do que está no ar, não vitrine.
- Gravuras para acento de canto: astrolábio 92→40, livros 44→26,
  sextante 40→24, mapa 30→16.
- Grade rebalanceada `1.15fr → 0.75fr` na coluna 1: sem a estatística,
  450px para wordmark + tagline abria exatamente o vazio de landing
  page que a identidade proíbe.

### Procedência assimétrica das fontes primárias

Registrada no arquivo em vez de silenciada. Três das quatro razões
sociais aparecem por extenso em fonte do próprio repositório; a da
ANEEL **não aparece uma única vez**.

| Sigla | Procedência |
| --- | --- |
| ONS | `alexandria-modulo-01-content.ts` L230 + 5× nos HTML dos módulos |
| CCEE | 3× nos HTML dos módulos |
| EPE | 1× nos HTML dos módulos |
| **ANEEL** | **nenhuma.** A sigla ocorre 12+ vezes; a forma por extenso, zero. Marcada no código como razão social pública, não extração. |

### Pendências registradas

- **Peso: as quatro gravuras somam ~1,8 MB e carregam em toda tela**,
  porque a faixa é permanente. São 1536×1024 servindo caixas de 16 a
  40px de altura. A correção é converter os `orn-` para tamanho de
  exibição — trabalho de wave de asset, `public/alexandria/gravuras/` é
  somente-leitura aqui. Mesma classe da pendência do logo de 1.342 KB
  da Wave 6, e maior que ela.
- **`NAV_RODAPE` é duplicação deliberada.** `NAV_PADRAO` não é exportado
  por `AlexandriaHeader`, e o header está fora da posse desta wave. O
  tipo `AlexandriaNavItem` vem importado, então a forma não pode
  divergir sem o compilador reclamar. Quem abrir o header de novo:
  exportar `NAV_PADRAO` e deletar a constante daqui.
- Navegação vertical governando a altura (ver acima) — fora de escopo
  por decisão do Aquiles, junto com Trilhas→Biblioteca.

**Nota de ambiente** (mesma família das waves anteriores): o painel
Browser oculto não compõe frames, e o Playwright MCP estava travado pela
sessão paralela. Fallback idêntico ao que a Wave 7 encontrou de forma
independente — `playwright-core` isolado no scratchpad dirigindo o
Chrome local. O chromium do `ms-playwright` falha com `spawn UNKNOWN`
sob o sandbox do shell; o Chrome do sistema funciona. Servidor próprio
em porta dedicada (`--port 5210 --strictPort`, entrada nova no
`.claude/launch.json`), porque 5173 e 5199 pertenciam às outras janelas.

**Gates:** `tsc -b` — 0 erros em Alexandria (seguem só os pré-existentes
de Recharts em `nest/student/*`). `gridalpha-detect` — "No findings.
Surface is clean." 1440×900 e 1920×1080: 4 seções, 4 gravuras com
`naturalWidth` 1536, zero erro de console, zero overflow horizontal,
zero reprova de contraste AA, raio zero e nenhuma `box-shadow` em toda
a subárvore.

## LYCEUM — ALEXANDRIA WAVE 15

**Status:** fechada. A Biblioteca ganhou superfície própria e a colisão
de nav que a Wave 6 deixou registrada como pendência está desfeita.

**Arquivos:** `src/pages/alexandria/BibliotecaView.tsx` (NOVO) ·
`src/components/alexandria/biblioteca/FonteInstitucionalCard.tsx`
(NOVO) · `AlexandriaRouter.tsx` (uma rota) · `AlexandriaHeader.tsx`
(destino + estado ativo) · `AlexandriaHome.tsx` (uma string de
`navAtivo` — ver abaixo).

### Auditoria da Fase 1 — os três achados

1. **Biblioteca e Trilhas apontavam os dois para `/alexandria`.** Bate
   com o achado da Wave 6, sem desvio.
2. **`ativoPorRota` devolvia `'biblioteca'` para o hub**, então clicar
   em Trilhas navegava para o hub e acendia Biblioteca. Era esse o
   sintoma.
3. **`references: []` nas NOVE aulas** (L362, 389, 410, 437, 471, 492,
   519, 546, 567 de `alexandria-modulo-01-content.ts`). Vazio,
   confirmado por leitura. A Wave 4 já tinha registrado o motivo: «o
   § Ref é do módulo, não da aula».

**Consequência aplicada:** não existe seção "Documentos por aula" na
página, e nenhum documento de aula foi inventado. O estado ausente é
declarado em contorno tracejado terracota — mesmo registro do
`VideoArea` e do nó de módulo em produção.

### O terceiro estado que o brief não previu

O brief presumia binário: `references` populado (mostra documentos) ou
vazio (fecha só com as quatro institucionais). A fonte tem um terceiro
caso — o **§ Ref do Módulo 01** (`alexandria_modulo01.html` L2683-2706)
traz **oito referências reais** com órgão, título, descrição e domínio.
É bibliografia do MÓDULO, não da aula, então não é o caso que a regra
proíbe: nada ali é invenção, é extração literal do mesmo § Ref de onde
saíram os domínios dos quatro cards.

Incluí como segunda seção porque quatro cards sozinhos numa prancha de
1120px produzem exatamente o modo de falha que a identidade nomeia — a
tela "limpa" de landing page, contra o alvo de 40-60 elementos. Vai em
commit único, e não isolado como a faixa de independência da ARCHITECT
(Portal BR Wave 4): lá o commit separado protegia copy inventada, e
aqui não há invenção a proteger. **Para vetar:** remover
`ReferenciaModulo`, `BIBLIOGRAFIA_MODULO_01` e a `<section>`
"Bibliografia · Módulo 01"; o resto da página fica de pé sozinho.

### A correção que precisou sair da posse declarada

`AlexandriaHome.tsx` passava `navAtivo="biblioteca"` (L91), e
declaração explícita **vence** `ativoPorRota` no header. Sem trocar
essa string, a correção de nav não teria efeito nenhum na rota que mais
importa: `/alexandria` continuaria acendendo Biblioteca, e clicar em
Trilhas continuaria acendendo Biblioteca — o defeito inteiro da wave.

O brief listava o arquivo como "hub · nunca modificar". Modifiquei
**uma string**, sem tocar composição, hero ou `TrilhasHub`, depois de
confirmar que a Wave 7 fechou (`e7d3714`), que o arquivo estava limpo
no working tree, e que o brief da Wave 15 não a lista entre as janelas
paralelas. É a Fase 3 da própria wave — "corrigir nav" — e não havia
como entregá-la de outro jeito.

### Semântica nova da nav

| Rota | Item aceso |
| --- | --- |
| `/alexandria` (entrada + hub) | **Trilhas** |
| `/alexandria/biblioteca` | Biblioteca |
| `/alexandria/trilha/*` | Trilhas |
| `/alexandria/atlas` | Atlas |
| `/alexandria/glossario` | Glossário |
| `/alexandria/perfil` | nenhum (tem rota, não tem item) |

O hub passou a pertencer a Trilhas, que é o que ele de fato lista.
Nenhum par colide.

### Conteúdo

Quatro cards institucionais com sigla, razão social, o que a
instituição publica e o domínio oficial — `publica` e `dominio`
literais do § Ref; nenhuma URL adivinhada. Razão social com a
procedência que a Wave 10 auditou para o rodapé: ONS, CCEE e EPE têm a
forma por extenso escrita em fonte do repositório, a da ANEEL **não
aparece em lugar nenhum** e vai marcada como tal no pé do card.

Ajuste de composição feito olhando o render: o marcador de procedência
estava ao lado da sigla, quebrava em duas linhas só na ANEEL e
empurrava o nome para baixo, desalinhando as quatro razões sociais numa
grade que existe para comparação. Foi para o pé do card, com fio
separador — as quatro siglas e os quatro nomes voltaram a bater.

### Verificação

Clique real nos quatro itens do header, estado lido por
`aria-current` e não por cor. Sete estados conferidos, **zero falha**:
entrada → Trilhas · Biblioteca → Biblioteca · Trilhas → Trilhas ·
Biblioteca de novo → Biblioteca · Glossário → Glossário · Atlas →
Atlas · dentro de trilha → Trilhas. Zero erro de console, zero overflow
horizontal, 4 cards, 11 links externos, **todos** com `rel` contendo
`noopener`.

Nota de ambiente, terceira wave seguida: o painel Browser oculto não
compõe frames e o Playwright MCP fica travado pela sessão paralela —
verificação por `playwright-core` isolado no scratchpad dirigindo o
Chrome local. `fullPage: true` não captura a página inteira porque o
scroller é o `<main>`, não o documento (o ARCHITECT registrou isso na
Portal BR Wave 1); as capturas de baixo saem rolando o container.

**Gates:** `tsc -b` — 0 erros em Alexandria (seguem só os
pré-existentes de Recharts em `nest/student/*`). `gridalpha-detect`
sobre os cinco arquivos — "No findings. Surface is clean."

## LYCEUM — ALEXANDRIA WAVE 14

**Status:** fechada, com pendência registrada. Escopo entregue foi menor
que o pedido, por decisão do war room — ver "o que fica pendente".

### A medição inverteu o diagnóstico

O brief parte de que os estados vazios do rail estão "pequenos e em
itálico, ilegíveis contra o peso dos rótulos". Medido no computado, antes
de tocar em qualquer coisa:

| elemento | tamanho | estilo |
| --- | --- | --- |
| rótulo de seção | 11px | normal, ouro `#CBAA6E` |
| placeholder (estado vazio) | **14px** | itálico, `#8CA0B8` |
| conteúdo populado | **11-12px** | normal |
| corpo da Apostila (critério) | 16px | normal |

**O placeholder já era o maior texto do rail**, não o menor. A hierarquia
não quebrava por tamanho — quebrava por peso ótico: o rótulo é Cinzel
caixa-alta com tracking .18em em ouro, que grita; o conteúdo era itálico
na tinta mais fraca da paleta navy, que sussurra. Subir o corpo não
resolveria, e ainda deixaria o estado VAZIO maior que o POPULADO — o
contrário do que a tela precisa dizer.

### O que mudou em `RailRight.tsx`

As duas propriedades que de fato causavam o problema:

1. **Itálico saiu.** A regra do produto reserva itálico para ênfase
   editorial — o lead da Apostila. Dado de estado é informação funcional
   e vai em romano.
2. **Contraste subiu** de `tintaMetadadoNavy` (`#8CA0B8`, sem rótulo de
   token no handoff) para `tintaSobreNavySuave` (`#A9B6C8`, declarado
   `on-navy-muted` com 6.9:1). Passa a ser tinta secundária, não metadado.

Tamanho mantido em `AT.dado` (14px). O brief pede "nunca abaixo do corpo
da Apostila", que mede 16px — mas a Apostila é superfície de leitura com
medida de 68ch e o rail é chrome de 300px; aplicar piso de leitura ao
chrome brigaria com a regra de densidade (40-60 elementos por tela). 14px
já é o topo da escala de dado e 27% maior que o rótulo.

Rótulo de seção intocado, como mandado.

### O que fica pendente

**O conteúdo populado segue em 11-12px.** Ele não é montado por
`RailRight` — os cinco componentes `Slot*` vivem em
`src/pages/alexandria/AlexandriaRouter.tsx` e chegam ao rail como
`ReactNode` já estilizado. Estilo inline de filho não é sobrescritível
pelo pai, então não há como corrigir isso de dentro do `RailRight`, e o
router está fora da posse desta wave.

Sobra também um itálico funcional em `SlotReferencias` ("Documentos de
apoio aparecem junto com a aula"), pelo mesmo motivo.

A fronteira ficou registrada no cabeçalho do `RailRight.tsx` para quem
pegar isso depois: **este arquivo é dono do chassi e do estado vazio; a
tipografia do conteúdo populado é do router.**

**Gates:** `tsc -b` — 0 erros em Alexandria. `gridalpha-detect` — "No
findings. Surface is clean." Rail fotografado nos três estados (vazio,
trilha ativa, aula com conquistas) em 1440×900.

## LYCEUM — ALEXANDRIA WAVE 17

**Status:** fechada. **Veredito: resolveu** — não bateu no mesmo teto
que o Portal BR (onde ajuste de código parou de produzir diferença
perceptível e a resposta foi referência visual nova, não mais pixel).
Aqui cada uma das quatro direções testadas produziu ganho visível e
cumulativo. Zero token novo — as quatro mudanças usam só valores já
declarados em `A`/`A2`/`AT`/`AS`/`AR`/`AE`.

**Arquivo:** `src/components/alexandria/shell/AlexandriaHeader.tsx`
(único modificado).

### O que estava genérico

O header funcionava desde a Wave 6 — logo real, nav real — mas lia como
qualquer app escuro moderno com paleta trocada. Não era bug de dado, era
ausência de caráter dentro do próprio vocabulário já definido.

### As quatro direções testadas, uma de cada vez

1. **Rosa dos ventos como brasão, não ícone.** A auditoria da Fase 1
   revelou que `public/alexandria/marca/` já tinha o ativo que faltava:
   `rosa-lg-on-navy.png` (mesma resolução 1024×1024 de `rosa-sm`, mas
   composição inteiramente diferente — moldura circular gravada, coroa
   de flores nos quatro cantos, anel pontilhado). O header usava
   `rosa-sm` (estrela nua de 4 pontas) em 30px. Trocado para `rosa-lg`
   em 46px. **Não construí frame nenhum — o ativo somente-leitura já
   era o brasão**, só não estava sendo usado.
2. **Moldura de frontispício.** Fio duplo (dois traços de 1px com opacidade
   50% no segundo, 3px de distância) no topo e na base do header —
   masthead de jornal do século XIX. Cor: `A2.ouroSobreNavy`, não
   `A.terracota` — a identidade declara terracota como cor de ESTADO
   (em andamento/crítico), nunca decorativa, e este traço não marca
   estado nenhum. Substituiu o `borderBottom` de fio único que existia.
3. **Separador de nav ornamental.** Ponto médio (`·`) em `AT.rotulo`
   entre os itens, cor `A.fioSobreNavy`, no lugar do espaço em branco
   puro que existia. Testado e confirmado por zoom 3x — visível mas
   contido, sem competir com o texto dos itens.
4. **Busca sem ícone de lupa.** O SVG de lupa era a peça mais
   "assinatura de app moderno" do header — universal em qualquer
   produto web. Removido; um rótulo `Buscar` em `AT.rotulo` (Cinzel)
   faz o mesmo trabalho de anunciar a função, como campo de índice
   impresso. Fio embaixo preservado, nenhuma caixa de quatro lados.

### O que NÃO funcionou / não foi tentado

Nenhuma das quatro direções foi descartada — todas sobreviveram ao
julgamento por render real. Uma variante testada e revertida: fio duplo
só no topo (sem duplicar a base) — funcionava, mas o header pareceu
"aberto" de um lado só; dobrar os dois lados fechou a moldura.

### Verificação

Clique real confirma que a nav segue funcionando com o `<span>` de
separador envolvendo cada botão: Biblioteca → Trilhas → Glossário →
Atlas, quatro transições corretas, `aria-current` correto em cada uma.
Zero erro de console, zero overflow horizontal em 1440×900 e 1920×1080,
nas três páginas testadas (hub, biblioteca, glossário). Altura do
header confirmada em 70px — `ALAYOUT.headerHeight` intocado.

**Gates:** `tsc -b` — 0 erros em Alexandria (seguem só os
pré-existentes de Recharts em `nest/student/*`). `gridalpha-detect`
sobre o arquivo — "No findings. Surface is clean." Nenhum token de cor
ou fonte novo — os 18 tokens usados no arquivo já existiam em
`alexandria-tokens.ts` antes desta wave, confirmado por grep.

## LYCEUM — ALEXANDRIA WAVE 16

**Status:** fechada. Dois dos três invariantes que a Wave 2 travou como
"nunca modificar" — rail direito sempre presente e sempre 300px, rodapé
como faixa permanente fora do scroll — se provaram errados vendo
renderizado em toda página do sistema, e mudam de verdade nesta wave.

### Auditoria da Fase 1 — o que estava lá antes

Medido, não presumido:

- `AlexandriaFooter` **de fato** fora do `<main>`, irmã da linha
  rail-esquerdo/canvas/rail-direito, com `flex: 0 0 auto` computado (o
  `flex: 'none'` do próprio arquivo). Confirma o relatório da Wave 10.
- Canvas com só o rail direito (300px, sem rail esquerdo): **1140px**.
  Canvas com os dois rails: **908px**. Números reais, não estimados —
  são o que a Fase 2 precisava bater depois do colapso.

### Rail retrátil — a mecânica, decidida vendo renderizado

Dois estados: **colapsado** (padrão de entrada em toda página) e
**expandido**. A decisão de mecânica:

A faixa colapsada (`LARGURA_COLAPSADA`, 64px, **constante nos dois
estados**) é a ÚNICA peça que o flexbox da linha enxerga. O painel
completo (300px, as cinco seções) é `position: absolute` dentro da
linha — sai do cálculo de flex — e desliza por cima como overlay/drawer
via `transform` quando expandido, em vez de empurrar o canvas.

**Por quê overlay em vez de largura animada:** animar o próprio
flex-basis do rail obriga o browser a recalcular o layout do canvas A
CADA FRAME da transição. Com overlay, só `transform` anima (composto,
sem reflow), e o flex-basis da faixa fina nunca muda — o canvas não
recalcula nada, nem durante a animação, nem em repouso.

**Medido no fechamento, não assumido:**

| estado | canvas (sem rail esq.) | canvas (com rail esq.) |
| --- | --- | --- |
| colapsado | 1376px | 1144px |
| expandido | 1376px | 1144px |

Zero diferença entre os dois estados — confirma que o canvas nunca
recalcula durante o toggle. Contra a linha de base pré-wave (1140 / 908
com rail fixo em 300px), o colapso reclama os ~236px de verdade: reflow
real de flexbox, não `display: none` deixando vão.

Um único `RailToggle` (novo arquivo), posicionado por `absolute` acima
dos dois estados (z-index mais alto) — o mesmo clique abre e fecha; não
existem dois botões. Reaproveita `ring-track` + `ring-progress` da Wave 1
como selo circular preenchido pela porcentagem real de
`MOCK_USER_PROGRESS`, sem número impresso — mesma técnica de fetch +
inline de `ModuloNode`, cache próprio (os dois arquivos não se importam).

Fecha por clique no selo, ESC, ou clique fora (backdrop montado só
quando expandido — confirmado que não intercepta clique nenhum no canvas
quando colapsado).

**Transição** usa `AE.hover` + `AE.easing`, nunca bounce. Sob
`prefers-reduced-motion`, `transition-duration` mede `0s` por computed
style, e o painel abre em menos de 50ms após o clique — funcional,
instantâneo, sem deslizar.

### Rodapé em fluxo

`AlexandriaFooter` move para dentro do `<main>`, última posição, depois
de todo conteúdo de página. Fica **fora** do wrapper de 1120px de
propósito: o rodapé nasceu como banda navy full-bleed da shell inteira,
e o wrapper de 1120px é medida de prancha de leitura. Confinar a 1120px
trocaria banda full-bleed por rodapé de artigo. Continua full-bleed —
só que da largura do canvas agora, não mais da shell inteira.

`AlexandriaFooter.tsx` não foi tocado (fora da posse: "você só move onde
ele mora no DOM") — o `flex: 'none'` que já existia lá dentro fica
inofensivo na nova posição, porque `flex` só tem efeito como filho
direto de container `display: flex`, e `<main>` é bloco comum.

**Confirmado por medição em quatro páginas**, não como uma linha só:

| página | scrollHeight | clientHeight | rodapé visível sem rolar? |
| --- | --- | --- | --- |
| Biblioteca | 1774 | 830 | não |
| Aula (módulo 01, aula 3) | 2534 | 830 | não |

Rolado até o fim, o rodapé entra corretamente na tela (medido: topo em
689px, dentro dos limites do `<main>`).

**Observação registrada, não corrigida:** em página muito curta
(`/perfil`), `<main>` é esticado por flexbox (`align-items: stretch` da
linha) à altura da linha inteira, e sobra vazio creme abaixo do rodapé
quando conteúdo + rodapé somam menos que a viewport. Não é regressão —
é o comportamento correto de fluxo normal, a página termina onde o
conteúdo termina, sem forçar o rodapé a colar no fim da tela como antes
fazia. Fica documentado para decisão futura se o vazio incomodar.

**Gates:** `tsc -b` — 0 erros em Alexandria. `gridalpha-detect` sobre
`src/components/alexandria/shell` — "No findings. Surface is clean."
Testado em quatro páginas (Biblioteca, Glossário, dentro de trilha com
rail esquerdo, dentro de aula): rail nasce colapsado, expande ao
clicar, canvas reclama largura real, rodapé só aparece no fim do
scroll. `prefers-reduced-motion` testado por `emulateMedia` — toggle
não anima, continua funcional.

## LYCEUM — REVISÃO DIRETA PÓS-WAVE 16 (rail flutuante + rodapé menor)

**Status:** fechada. Não é wave numerada — pedido direto do Aquiles em
cima do que a Wave 16 tinha acabado de fechar, então registrado aqui em
vez de inventar um número de wave que nenhum brief emitiu.

**Pedido:** "o rodape tem que ser menor e a sidebar tem que sumir
completamente nao ficar so um sidebar faz ser um botao, pode ser uma
bussola, tem um png no files, ao clicar tem uma animacao abrindo a
sidebar, ela tem que ser flutuante e abre e fecha".

### Sidebar — de faixa fina pra botão puro

A Wave 16 tinha deixado uma faixa colapsada de 64px sempre em fluxo —
funcionava como retrátil, mas ainda era "um sidebar", só que fino. Saiu
por completo: `RailRight.tsx` não tem mais nenhum elemento em fluxo.
Tudo o que resta (botão, backdrop, painel) é `position: absolute`, fora
do cálculo de flex. O canvas reclama a largura **inteira** sempre —
1440px em página sem rail esquerdo, medido, não 1376px como na Wave 16.

O botão usa `icon-compass-simple-on-cream.png`, achado em
`public/alexandria/icones/` — verificado por decodificação de pixel
antes de usar (1024×1024, RGBA de verdade, canto com alpha 0). Carrega
o próprio disco creme: a bússola só existe em variante "on-cream", e
sem disco próprio ficaria ilegível flutuando sobre o navy do painel
aberto. Tamanho do ícone medido no render: 26px reduzia o desenho a uma
cruz genérica; 32px é o piso onde ainda lê como bússola.

O painel (300px, cinco seções) agora é genuinamente flutuante — inset
de 16px nos quatro lados, borda completa, não mais encostado nas bordas
da tela. A agulha da bússola gira 90° ao abrir — a "animação abrindo a
sidebar" que o pedido menciona é o próprio slide do painel; a rotação
do ícone é o mesmo gesto, não uma segunda animação por cima.

**Artefato de ambiente, não bug:** testes com espera curta (400-600ms)
numa janela de automação ocluída mostravam o `transform` da transição
travado no valor antigo, apesar do estilo inline já correto — mesma
classe que a Wave 7 (scroll do CTA) e o ARCHITECT (View Transitions) já
documentaram. Confirmado como artefato, não bug real: com espera de 3s
a transição completa na posição certa (1124px); com
`prefers-reduced-motion` (sem depender de `requestAnimationFrame`), o
toggle é instantâneo e correto em vários ciclos, nas quatro páginas
testadas (Biblioteca, Glossário, trilha com rail esquerdo, aula).
Produção mantida com a transição normal.

### Rodapé — 211px → 164px

Medido em 1440×900, página Biblioteca. Maior alavanca: a navegação virou
linha única em vez de coluna de 4 links empilhados — a própria Wave 10
já tinha identificado isso como o maior driver de altura da faixa e
deixado fora de escopo por decisão do Aquiles na época ("se ela virasse
linha única o piso cairia para ~97px"). Dentro de escopo agora, no
pedido explícito de encolher.

Resto do corte: padding do rodapé 26/26 → 16/20px (único consumidor do
token, seguro mudar na fonte); gravuras de acento reduzidas (astrolábio
40→26, livros 26→18, sextante 24→18 — mapa ficou em 16, já no piso de
legibilidade que a Wave 10 mediu); gap de grade 32→24px; régua de fecho
com margem/padding superiores cortados; wordmark 15→13px.

Não mexido: raio continua zero, fio como único recurso de separação,
identidade das quatro colunas, contraste de texto nenhum (rótulo de
seção ficou nos mesmos 8px / 6,8:1 que a Wave 10 já tinha medido).

**Gates:** `tsc -b` — 0 erros em Alexandria. `gridalpha-detect` sobre
`src/components/alexandria` + `src/design/alexandria-tokens.ts` — "No
findings. Surface is clean." Testado em quatro páginas: zero `<aside>`
em fluxo, canvas com largura idêntica colapsado/expandido, painel some
completamente da tela ao fechar (por clique de novo, ESC, ou clique
fora), rodapé só aparece ao fim do scroll real.

## LYCEUM — ALEXANDRIA WAVE 18 — EXTRAÇÃO DO MÓDULO 02

**Status:** dado fechado e verificado. **A interface ainda não consome** —
ver "pendência de fiação" abaixo. Escopo da wave era dado, não interface,
e o arquivo que faria a ligação está fora da posse declarada.

**Arquivos:** `src/lib/data/alexandria-modulo-02-content.ts` (NOVO, 685
linhas) · `alexandria-instrument-calculators.ts` (+9 calculadores; os 7 do
Módulo 01 intocados).

### Contagem real, por três sinais independentes

| medida | bruto | real |
| --- | --- | --- |
| seções `.aula` | 20 | **10 aulas** + 10 de aparato |
| `div.exercise` | 10 | **10** — a prosa diz "Oito" |
| instrumentos | 9 | **9, todos vinculados a aula** |

O hero declara "Dez aulas"; a contagem de subseções por aula
(5,5,5,4,4,4,3,6,4,6) confere com a numeração x.y da própria fonte.
**156 blocos de apostila** nas dez aulas.

**Os 9 instrumentos são todos de aula — confirmado, não presumido.** Não
existe `LAB` solto como o `lab-01` do Módulo 01. A **Aula 06** é a única
sem instrumento.

| Aula | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| blocos | 19 | 17 | 13 | 12 | 15 | 13 | 16 | 18 | 12 | 21 |
| instrumento | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| exercícios | — | 2 | — | — | 1 | 1 | — | 2 | — | 2 |

### Divergência da fonte, registrada e não corrigida

**A prosa do § Ex diz «Oito exercícios»; o markup tem DEZ.** Os dois
últimos (`Ex · 09`, `Ex · 10`) usam `exercise-label` em vez de
`exercise-header > exercise-tag`, e não apontam aula nenhuma. São
exercícios reais e completos, com gabarito — não resíduo. Foram para
`MODULO_02_EXERCICIOS_SOLTOS`, mesmo tratamento que o
`MODULO_01_SINTESE` recebeu na Wave 4. Terceira wave seguida em que a
prosa subestima o markup (Módulo 01: "seis dos oito"; glossário: 28 × 38).

### Quirks da fonte, sinalizados e não corrigidos

1. **A numeração `INST · NN` não bate com o prefixo dos ids internos.**
   INST · 04 usa `i08-*`, INST · 05 usa `i04-*`, INST · 06 usa `i09-*`,
   INST · 07 usa `i05-*`, INST · 08 usa `i06-*`, INST · 09 usa `i07-*`.
   Resíduo de reordenação das aulas. Os ids internos são o que o script
   referencia, então são eles que valem no cálculo.
2. **O INST · 07 tem DUAS saídas de veredito** — um `.readout` rotulado
   "Veredito" (`i05-status`, texto curto) e um `.verdict` separado
   (`i05-verdict`, texto longo). Não é duplicata acidental: carregam
   conteúdo diferente. Preservados os dois.
3. **`|| 1` no INST · 06** (bateria): potência vazia vira 1 MW em vez de
   estado de espera. Mesmo padrão dos INST 04/06 do Módulo 01.
4. **Colisão de id evitada:** o Módulo 01 já ocupa `inst-01`..`inst-06` +
   `lab-01` no registro de calculadoras. O Módulo 02 entrou namespaçado
   como `m02-inst-01`..`m02-inst-09` — sem o prefixo, nove sobrescreveriam
   seis. A fonte numera instrumentos por módulo, reiniciando do 01.

**Campos:** a fonte pareia cada controle numérico com um `<input
type="range">` gêmeo de id `<algo>-range`, ligados ao mesmo valor pelo
script. São UM campo lógico — fica o `number`, que carrega
value/min/max/step, e o `kind` vira `range` porque o deslizador existe.

### Prova de fidelidade dos 9 cálculos

Portados do `<script>`, não rederivados. Confrontados contra uma
**reimplementação independente** do original, com os defaults da fonte:
**24 de 24 valores conferem, zero divergência.** Validação cruzada:
`i09-h` dá 4,0 h para 20 MW / 80 MWh — exatamente o número que o gabarito
do Ex · 09 declara.

### Mapa de gravura — 5 de 8, decidido por leitura de frase

Mesma disciplina da Wave 5: frequência não é veredito.

| Gravura | Aula | Razão |
| --- | --- | --- |
| `red-07-poste-distribuicao` | 01 | §1.1 ensina as quatro camadas; "Distribuição … capilariza até cada unidade consumidora" com a escada de tensões MT/BT |
| `red-04-cabo-condutor-corte` | 02 | §2.4 "Os cinco limites de uma linha" — "corrente alta aquece o condutor; cabo quente dilata, cede em direção ao solo" |
| `red-05-transformador-subestacao` | 03 | §3.1/3.2 — "o ativo mais caro e de maior prazo de reposição da subestação" |
| `red-06-disjuntor-alta-tensao` | 03 | §3.2 — "o único equipamento capaz de interromper corrente de curto-circuito" |
| `red-08-quadro-disjuntores` | 03 | §3.5 "Ponto de conexão" — "transformador, cabine e proteção são do cliente" |

**Três NÃO mapeadas:** `red-01-torre-cara-de-gato`,
`red-02-torre-estaiada` e `red-03-cadeia-isoladores`. O único hit
substantivo das três é a mesma frase da Aula 02 — *"torres mais altas,
cadeias de isoladores maiores, faixas de servidão mais largas"* —, uma
**enumeração de itens de custo** em que nenhum é o assunto. O outro hit
("sem derrubar uma única torre") é figura retórica sobre cibersegurança.
É o padrão `fis-05` da Wave 5, idêntico. O módulo nunca trata tipologia
de torre nem cadeia de isoladores como assunto. Mesma proporção do
Módulo 01 (5 das 6 `fis-` usadas).

### PENDÊNCIA DE FIAÇÃO — o dado não chega na tela

**Nada consome `alexandria-modulo-02-content.ts` ainda.** Verificado por
grep e provado por clique real: `AlexandriaRouter.tsx` L274 chama
`getAulaModulo01` fixo, então uma aula do Módulo 02 cai no estado "Aula
ainda não extraída", e a lista de aulas mostra "Aula N de 10" genérico
(o próprio rodapé dela diz "Os títulos de aula chegam com o viewer").

A correção é trocar uma linha do router para escolher o catálogo pelo
`moduleId`. **Não foi feita**: o brief desta wave declara "esta wave é
dado, não interface" e "NUNCA MODIFICAR … qualquer componente". Fica
registrado para a wave que abrir o router.

### Correção à premissa do brief

O brief pede verificar "Trilha 2 → Módulo 1". A realidade do catálogo:
"Como Funciona uma Rede Elétrica" é `bloco-02`, **level 1** — logo é o
**Módulo 2 da Trilha 1** (Fundamentos Universais), não o Módulo 1 da
Trilha 2. Rota real:
`/alexandria/trilha/trilha-fundamentos-universais/modulo/modulo-02`.
Confirmado por clique antes de reportar, como o brief mandou.

### `LAB · 01` do Módulo 01 — decisão adiada, registrada

Segue sem lugar na interface. É o sétimo instrumento do Módulo 01, vive
no aparato § Lab (fora de qualquer aula), e por isso o viewer nunca o
alcança. O cálculo está portado e testado desde a Wave 4; falta decidir
ONDE ele aparece. Não é esquecimento — é decisão de produto pendente.

**Gates:** `tsc -b` — 0 erros em Alexandria (seguem só os pré-existentes
de Recharts em `nest/student/*`). `gridalpha-detect` sobre os dois
arquivos — "No findings. Surface is clean." Zero erro de console em
1440×900 e 1920×1080.

## CURSOR WAVE 8 — INFRASTRUCTURE DATA LOADED

**Status:** fechada. A Wave 7 shipou schema, scripts e endpoints sem executar
nada contra produção. Esta wave executou: migration aplicada, três ingests
rodados, três endpoints servindo dado real.

**Banco:** serviço `PostGIS 17` no projeto Railway `rare-victory` / ambiente
`production`. PostGIS 3.7.0dev sobre PostgreSQL 17.9, GEOS 3.15, PROJ 9.9.
`DATABASE_URL` no serviço `gridalpha-v2` aponta para o proxy público
(`switchyard.proxy.rlwy.net`), então dá para operar da máquina local.

### Contagens finais

| Tabela | Linhas | Fonte | Tempo |
| --- | --- | --- | --- |
| `generation_units` | 34.347 | EIA 860, 2025 Early Release | 91 s |
| `battery_assets` | 1.609 | EIA 860M, `june_generator2026.xlsx` | 23 s |
| `transmission_segments` | 37.947 | HIFLD FeatureServer, ≥115 kV | 204 s |

Migration `0001_postgis_infrastructure` conferida contra a especificação:
colunas e precisões exatas, geometria `POINT`/`LINESTRING` em SRID 4326, os
cinco índices GIST, e a constraint `CHECK` de ISO com onze valores nas três
tabelas. Zero divergência. Zero geometria nula, zero SRID errado, zero
segmento abaixo de 115 kV.

### As duas faixas do brief estavam calibradas errado

Não é problema de filtro nem de fonte — as duas divergências têm explicação
medida.

**Geração: 34.347, não 12–15 mil.** A faixa do brief é de nível de PLANTA; o
860 Schedule 3_1 é de nível de GERADOR. O arquivo de plantas da mesma safra
tem 16.900 registros, e uma usina de ciclo combinado entra com várias linhas.
Somam-se 5.565 aposentados e 2.015 planejados, que o script ingere de
propósito — `status` e `retirement_date` existem para isso, e o Endpoint 13
filtra `operating` por padrão.

**Baterias: 1.609, não 3–5 mil.** É a contagem real do 860M de junho/2026:
1.097 operando, 306 em construção, 154 planejadas, 52 aposentadas. A aba
`Canceled or Postponed` fica fora por decisão do Aquiles — projeto cancelado
não pertence a um mapa de ativos.

**Transmissão: 37.947 linhas de 38.353 upserts.** A fonte tem 38.298 feições
com `VOLTAGE >= 115`; `MultiLineString` dividido em partes sobe para 38.353, e
406 colidem porque o HIFLD reusa `ID` entre feições. A tabela é a contagem
autoritativa.

### Quatro mudanças de fonte externa desde a Wave 7

Os scripts nunca tinham sido executados, então os defeitos só apareceram
agora. Nenhum exigiu mudança de schema.

- **A EIA renomeou o arquivo anual** de `f860YYYY.zip` para `eia860YYYY.zip`,
  e passou a publicar também `eia860YYYYER.zip`. O regex antigo não casava com
  nada e o script morria em `resolve_latest_860_zip()`.
- **Duas linhas de banner antes do cabeçalho** nos dois workbooks da EIA. O
  script pegava a primeira linha, `_col_map` devolvia `{}` e TODA aba era
  descartada com um `warning` — zero linhas, sem erro.
- **`Latitude`/`Longitude` não existem em `3_1_Generator`.** Vivem em
  `2___Plant`, chaveadas por código de planta. Sem o join, todo gerador caía
  no `continue`. Este é o defeito que sozinho já garantiria tabela vazia.
- **O 860M escreve o mês por extenso** (`june_generator2026.xlsx`) e chama a
  coluna de `Plant State`. O regex de três letras acertava só "may", então o
  script sempre pegava um arquivo de maio no `/archive/` em vez do corrente.

Nenhum dos três precisa de `EIA_API_KEY` — são downloads bulk sem
autenticação. A chave existe no ambiente do serviço, mas é das rotas de Henry
Hub.

### Dois defeitos próprios, achados executando

**`ST_Simplify` devolve NULL quando colapsa a linha.** As tolerâncias são
~111 m (`geom_mid`) e ~1,1 km (`geom_low`); segmento mais curto que isso
colapsa, e as colunas são `NOT NULL`. O ingest morreu em 20.010 linhas numa
linha de 0,13 km. Resolvido com `COALESCE(ST_Simplify(g, tol), g)` — cai para
a geometria real em vez de inventar stub degenerado. Schema intocado.

**`executemany` do psycopg2 faz uma ida e volta por linha.** Medido em ~3,4
linhas/s pelo proxy público: 34 mil linhas dariam quase 3 horas, e o
`pg_stat_activity` confirmou o diagnóstico (`idle in transaction` /
`Client/ClientRead`, `query_age` de 0,12 s — servidor ocioso esperando o
cliente). Trocado por `execute_batch`; o mesmo ingest passou a levar 91 s.

Também entrou `orderByFields` na paginação do HIFLD: `resultOffset` sem
ordenação explícita não é estável no ArcGIS, e uma lacuna seria silenciosa.

### Compressão LOD — 10,3×, confirmada

Medida com a variável isolada: mesmo bbox, `voltage_min_kv=345` e
`limit=10000` nos três LODs, então as 2.876 linhas são idênticas e só a coluna
de geometria muda.

| LOD | Payload | Vértices |
| --- | --- | --- |
| `high` | 9.023.881 B | 302.283 |
| `mid` | 1.685.929 B | 44.274 |
| `low` | 878.236 B | 15.800 |

**10,3× de payload e 19,1× de vértices** entre `high` e `low`. No padrão do
contrato, com cada LOD no seu piso de tensão, a razão vai a 13,9× — e esse
número subestima, porque o `high` trunca no teto de 10.000 linhas.

### Divergência de path — registrada, não corrigida

`src/services/api/transmission.ts` chama `/api/infra/transmission-segments`;
a rota é `/api/infra/transmission`. É o 404 que o ATLAS Wave 5 registrou como
endpoint ausente — não está ausente, o path é que diverge. `src/services/api/`
é posse do ATLAS, então o backend ficou intocado. **A Atlas não renderiza
transmissão enquanto os dois lados não concordarem**, mesmo com o banco cheio.

### O que a Wave 8 modificou

- `app/scripts/ingest_eia_860.py` — regex do arquivo, varredura de cabeçalho,
  join com `2___Plant`, `execute_batch`.
- `app/scripts/ingest_eia_860m.py` — varredura de cabeçalho, `Plant State`,
  `Energy Source Code`, mês por extenso, `execute_batch`.
- `app/scripts/ingest_hifld_transmission.py` — `COALESCE` no `ST_Simplify`,
  `orderByFields`, `execute_batch`.
- `docs/v2-backend-contract.md` — seção de procedência dos dados.
- Esta seção do CLAUDE.md.

Endpoint PJM, V1 e schema commitado: intocados. Migration rodada uma vez só.

## LYCEUM — FIAÇÃO DO MÓDULO 02 (pós-Wave 18)

**Status:** fechada. Fecha a pendência que a Wave 18 registrou: o dado
existia e não chegava na tela. Não é wave numerada — é a tarefa derivada
que a própria Wave 18 abriu, então fica registrada aqui.

**Arquivo novo:** `src/lib/data/alexandria-curriculo.ts` — resolvedor
único de conteúdo de aula.

### Eram TRÊS consumidores com o Módulo 01 fixo, não um

A Wave 18 diagnosticou o `AlexandriaRouter.tsx`. Auditando antes de
mexer, apareceram mais dois:

| arquivo | o que fixava |
| --- | --- |
| `AlexandriaRouter.tsx` L274 | `getAulaModulo01(...)` |
| `AulaViewer.tsx` L36-37 | `MODULO_01_CORPO` / `MODULO_01_LEAD` |
| `ModuloAulaList.tsx` | nem consultava — imprimia "Aula N de T" |

Corrigir só o router deixaria a aula do Módulo 02 abrir com **corpo
vazio**. Por isso a solução não foi um `if` no router e sim um índice
central: `getAula`, `getAulaDoModulo`, `getCorpoAula`, `getLeadAula`.
**Acrescentar o Módulo 03 agora é editar três linhas de import e três de
agregação em UM arquivo — nenhum componente muda.** Era esse o
acoplamento que precisava sumir, e ele estava triplicado.

Trava em DEV avisa se um módulo novo entrar com id de aula repetido — o
spread de agregação é silencioso e apagaria o corpo do anterior.

### Bug real encontrado na verificação: instrumento nascia NaN

Com a fiação pronta, o INST 02 abria com `Corrente total ∞`, `Perdas
NaN`, `Perda relativa NaN`. Só passava a calcular depois que o aluno
mexia num controle.

**Causa:** `InstrumentPanel.tsx` semeava o estado inicial com
`if (typeof f.defaultValue === 'number')`. Todo campo `kind:'select'`
entrega **string** (`'500'` kV, `'2'` circuitos), então ficava de fora, e
a calculadora recebia `undefined`.

**Por que nunca apareceu antes:** o Módulo 01 não tem nenhum select nos
seus sete instrumentos. O Módulo 02 tem seis. O buraco existia desde a
Wave 4 e só um módulo com select podia expô-lo.

**Correção, em três partes:**
1. `EntradaInstrumento = number | string` no contrato das calculadoras —
   honesto, porque `InstrumentField.defaultValue` já é `number | string`
   no contrato da FOUNDRY. O compilador então apontou todos os pontos que
   liam entrada crua; cada um passou por `n()` ou pelo novo `nOu()`.
2. `nOu(v, fallback)` reproduz o `parseFloat(x) || <fallback>` dos
   originais, onde **zero também cai no fallback** — preservado por
   fidelidade, não por acordo. Os `|| 1` sinalizados nas Waves 4 e 18
   continuam se comportando como na fonte.
3. `setCampo` guarda número quando o valor é numérico e a **string crua**
   quando não é. `Number(bruto)` cego quebraria os selects CATEGÓRICOS do
   Módulo 02 — Explorador de camadas (`ger`/`tra`/`dis`/`con`) e Cadeia
   por perfil (`a2`/`a4`/`bt`) virariam NaN ao primeiro clique.

### Cópia que passaria a mentir

Quatro textos afirmavam "Módulo 01" ou "as nove aulas" e apareceriam
numa página do Módulo 02: as abas Referência e Transcrição do
`AulaViewer`, o rodapé do `VideoArea` e o estado "ainda não extraída" do
router. Generalizados sem inventar — o router agora deriva o número de
`TOTAL_AULAS_EXTRAIDAS` e `MODULOS_COM_CONTEUDO`, nunca digitado.

O rodapé da `ModuloAulaList` também era mentira nova: dizia "Os títulos
de aula chegam com o viewer" numa lista que já os tem. Passou a declarar
o estado real por contagem (`comTitulo === total`).

### Verificação por clique real

- **Lista do Módulo 02:** as 10 aulas com título e subtítulo reais.
- **INST 02 no primeiro paint, sem tocar em nada:** 1.215,47 A · 39 MW ·
  3,9% — **os mesmos valores da prova de fidelidade da Wave 18**. Zero
  NaN. Trocando para 138 kV: 4.403,89 A e veredito "Inviável", que é
  literalmente o que o texto da aula manda o aluno testar.
  Confirmação do diagnóstico: antes da correção a perda relativa a 138 kV
  dava 744,74% — exatamente o **dobro** de 372,37%, porque o campo
  "circuitos em paralelo" não estava semeado e caía de 2 para 1.
- **Select categórico** (Explorador, Aula 01): sem NaN no primeiro paint,
  muda ao trocar de camada.
- **Aula 03:** as 3 gravuras `red-` com `naturalWidth` 1024.
- **Regressão Módulo 01:** INST 01 dá 50 kWh (10 kW × 5 h), e as 3
  gravuras `fis-` da Aula 03 seguem carregando.

Zero erro de console, zero overflow horizontal, 1440×900 e 1920×1080.

### Registrado, não resolvido

**As saídas dos instrumentos do Módulo 02 aparecem sem unidade** —
"1.215,47" em vez de "1.215,47 A". A extração da Wave 18 pôs
`unit: null` nos readouts porque a fonte concatena a unidade no
JavaScript (`fb(I,0) + " A"`), não no markup. Não é invenção nem defeito
da fiação: é dado que a fonte não expõe em atributo. Recuperá-lo exige
parsear as concatenações do script — trabalho de extração, não de
interface.

**Gates:** `tsc -b` 0 erros em Alexandria · `gridalpha-detect` sobre 36
arquivos — "No findings. Surface is clean."


## LYCEUM — ALEXANDRIA WAVE 19 — MÓDULO 03

**Status:** fechada. Extração, cálculos e fiação. Os três tipos de
instrumento que estreiam aqui couberam no modelo existente — **nenhum
componente foi tocado**, e nenhuma mecânica de interação foi inventada.

**Arquivos:** `alexandria-modulo-03-content.ts` (NOVO, 620 linhas) ·
`alexandria-instrument-calculators.ts` (+9) ·
`alexandria-curriculo.ts` (registro).

### Contagem real, por três sinais

20 `.aula` brutos = **10 aulas** + 10 de aparato; o hero declara "Dez
aulas". **89 blocos de apostila** — bem menos que os 156 do Módulo 02,
porque o Módulo 03 tem 1-3 subseções por aula contra 3-6: argumenta por
tecnologia, não por mecanismo. `video: null`, `difficulty: null` e
`durationMinutes: null` nas dez, **medidos** (zero `<video>`, `<iframe>`,
youtube, vimeo; zero marcador de nível), não herdados dos outros módulos.

| Aula | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| blocos | 10 | 11 | 7 | 10 | 7 | 10 | 9 | 8 | 9 | 8 |
| instrumentos | 2 | 1 | 1 | — | 1 | 1 | — | — | 1 | 2 |
| exercícios | 2 | 1 | — | 1 | 1 | 1 | — | 1 | 1 | 1 |
| gravuras | — | — | 2 | 2 | 3 | 3 | 1 | 1 | 1 | — |

**Prosa e markup CONCORDAM pela primeira vez:** o § Ex diz "Dez
exercícios" e há dez `div.exercise`, todos com `exercise-tag`. Nos
Módulos 01 e 02 a prosa subestimava o markup.

Duas tags fogem do padrão. `Ex · 03 · Aulas 02–03` é **plural** — um
`Aula (\d+)` ingênuo captaria só o "02" e perderia o vínculo com a 03.
Fica na primeira aula nomeada, com a tag inteira preservada em
`config.tag`; duplicar criaria exercício repetido e dobraria os pontos.
`Ex · 10 · Síntese` não aponta aula e vai para
`MODULO_03_EXERCICIOS_SOLTOS`.

### Veredito dos três tipos estreantes: TODOS INTERATIVOS

O brief autorizava renderizar como leitura estática o que não coubesse.
**Não foi preciso em nenhum** — a marcação real foi inspecionada antes
de qualquer extração:

| Tipo | Marcação real | Veredito |
| --- | --- | --- |
| `comparador` (INST 04, 08) | campo numérico + `sim-readouts`; o 08 ainda tem `pill-row` de 5 tecnologias | **Interativo.** Cabe direto; pill já mapeia em `select` desde o Módulo 02 |
| `dimensionador` (INST 07) | 3 campos numéricos + 4 readouts | **Interativo.** Cabe direto |
| `quebra-cabeca` (INST 09) | `src-toggle-row` com 4 `src-check` (`data-src`) | **Interativo.** São QUATRO chaves booleanas independentes — não arrastar, ordenar nem parear. Cada uma vira `select` de duas opções, primitivo que o painel já renderiza |

O `quebra-cabeca` era o único candidato real a não caber. Não coube por
sorte: coube porque a interação da fonte é seleção múltipla, e seleção
múltipla se expressa com o primitivo existente sem estender nada.

### Mapa de gravura — 13 de 24, e três falsos positivos capturados

O brief alertou que "turbina" é ambíguo. **Confirmado: aparece 11+ vezes
nas Aulas 02, 03, 04, 06 e 08** — hidráulica, eólica, a gás e a vapor
nuclear. Mapear pela palavra teria colado gravura de Francis na aula de
eólica. A varredura foi por equipamento específico, com a frase lida.

**Três falsos positivos que só a leitura pegou:**
- **`ger-03-turbina-francis-corte`** — a única ocorrência de "Francis" no
  módulo inteiro é **"São Francisco"**, o rio. Não é a turbina.
- **`ger-16-pa-aerogerador-corte`** — o hit na Aula 03 é **"(Xingu, PA)"**,
  a sigla do Pará.
- **`ger-24-celula-litio-corte` na Aula 02** — "a bateria que veio antes
  do lítio" é contraste retórico sobre reservatórios, não o assunto.
  Mapeada só na Aula 09 (Armazenamento).

| Aula | Gravuras | Razão |
| --- | --- | --- |
| 03 Fio d'água | `ger-06`, `ger-07` | 7 hits de "fio d'água"; "PCH (Pequenas Centrais Hidrelétricas, até 30 MW)" explícito |
| 04 Eólica | `ger-14`, `ger-17` | "o Nordeste onshore compete com o offshore do Mar do Norte"; passagem dedicada ao offshore (Lei 15.097/2025) |
| 05 Solar | `ger-18`, `ger-20`, `ger-21` | "o custo do módulo fotovoltaico caiu ~90%"; UFV e MMGD são metade do título |
| 06 Térmicas a gás | `ger-08`, `ger-09`, `ger-13` | §6.1 "uma turbina a gás — essencialmente um motor de avião estacionário"; GNL com 6 hits |
| 07 Biomassa | `ger-22` | 3 hits de bagaço na aula dedicada |
| 08 Nuclear | `ger-11` | §8.1 "O parque real: dois reatores e um canteiro de 39 anos" |
| 09 Armazenamento | `ger-24` | "eficiência de ciclo completo de 85-90% para lítio"; "fronteira lítio LFP × sódio" |

**Onze NÃO mapeadas** (`ger-01`, `02`, `03`, `04`, `05`, `10`, `12`,
`15`, `16`, `19`, `23`). Motivo estrutural, não descuido: **o Módulo 03
ensina economia e papel sistêmico, não interna de equipamento.** Termos
medidos no módulo inteiro: `Kaplan` 0 · `casa de força` 0 ·
`eletrolisador` 0 · `contenção` 0 · `torre de resfriamento` 0 ·
`célula fotovoltaica` 0 · `silício` 0 · `gravidade aliviada` 0 ·
`barragem` 0. `vertedouro` e `nacele` existem só no § Lex (glossário),
fora de qualquer aula.

### Prova de fidelidade: 27 de 27

Os nove portados do `<script>`, confrontados contra reimplementação
independente com os defaults da fonte. **Zero divergência.** Validações
cruzadas: o Quebra-cabeça com hidro sozinha dá razão 32,26% (< 40 → "Time
de um jogador", exatamente o que a aula narra); o LCOE solar dá 88,5% de
capital ("custo quase todo de capital"); o Dimensionador dá 400 MWh e
54,55 MWh perdidos a 88% de eficiência.

**SINALIZADO, não corrigido** (INST 08): no original, clicar numa pill
**também reescreve o campo de FC** com o do preset (`fcEl.value = pr.fc`).
Efeito colateral que função pura não reproduz. Aqui o FC do usuário
permanece e o preset entra só como fallback de campo vazio — o que
`parseFloat(fcEl.value) || p.fc` já fazia. Consequência: trocar de
tecnologia sem mexer no FC compara as duas no MESMO fator de capacidade,
que é justamente o "teste-chave" que a nota do instrumento pede.

### Registro no resolvedor: um bloco de import + três spreads

A previsão da fiação do Módulo 02 se sustentou. `git status` após a Fase 4
mostrou **um único arquivo modificado** (`alexandria-curriculo.ts`).
Nenhum componente tocado — o desacoplamento se pagou na primeira vez que
foi exercido.

### Verificação por clique real

- Aula 06: 3 gravuras `ger-` com `naturalWidth` 1536; Simulador da pilha
  de CVU com "CMO didático 150 · Hidro reservatório", batendo com a
  fidelidade.
- Comparador, Dimensionador e Quebra-cabeça: os três renderizam
  **interativos**, sem `NaN` no primeiro paint.
- Regressão: Módulo 01 INST 01 dá 50 kWh; Módulo 02 INST 02 renderiza
  com os quatro campos.
- Zero erro de console, zero overflow horizontal, 1440×900 e 1920×1080.

**Nota de progressão, não defeito:** o Módulo 03 aparece **trancado** na
trilha ("10 aulas · conclua o módulo anterior"), porque o progresso mock
tem o Módulo 02 em 3/10. É a regra da Wave 3 funcionando. As aulas abrem
por URL direta, e é assim que foram verificadas.

### Registrado, não resolvido

**Saídas que são índice aparecem como número cru.** "Vale do portfólio: 7"
deveria ler "Agosto"; o mesmo vale para o mês do INST 03 e a hora do
INST 05. A causa é o contrato: `ResultadoInstrumento.valores` é
`Record<string, number>`, então um rótulo textual derivado (o `MESES[m]`
do original) não tem onde caber. Não é invenção nem defeito da porta —
é a mesma classe da pendência de unidades registrada na Wave 18, e a
correção é de contrato, não de extração.

**Gates:** `tsc -b` 0 erros em Alexandria · `gridalpha-detect` "No
findings. Surface is clean."

## CURSOR WAVE 9 — IDENTIDADE DE PLATAFORMA

**Status:** fechada, com a Fase 4 (Google OAuth) **pausada por falta de
credencial** — não por falta de tempo. Uma conta por pessoa no nível da
plataforma inteira, não por produto. Alexandria, Portal Brasil e o futuro
terminal americano leem esta base; nenhum deles guarda usuário próprio
depois desta wave.

**Migration:** `0002_identity` aplicada em produção (PostgreSQL 17.9).
Aditiva — as três tabelas das Waves 7/8 seguem em 34.347 / 37.947 / 1.609,
conferidas antes e depois.

### Os três achados da Fase 1

1. **`GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`: ausentes.** As 25
   variáveis do serviço `gridalpha-v2` são as de sempre — PJM, EIA,
   Tomorrow, Anthropic, Mapbox, `DATABASE_URL`, `RAILWAY_*`. Fase 4
   parada, sem placeholder fingindo funcionar.
2. **Nenhuma biblioteca de hash instalada** — nem `bcrypt`, nem `argon2`,
   nem `passlib`, e o `requirements.txt` não listava nenhuma. Escolhido
   **`argon2-cffi`** (Argon2id): primeira recomendação atual do OWASP e
   sem o truncamento em 72 bytes do bcrypt. Junto entraram `PyJWT` e
   `email-validator`, as três com wheel puro para Python 3.14 — o build
   do Railway não compila nada.
3. **`JWT_SECRET`: ausente.** Gerados 64 bytes (86 caracteres base64url)
   e setados direto no Railway por `railway variable set --stdin`: o
   valor foi do gerador para o ambiente sem passar por arquivo, por
   log, nem pelo chat. Verificado presente, sem espaço nas pontas.

### Portabilidade — decisão deliberada, não acidente do deploy de hoje

**A decisão de domínio final ainda não existe.** Hoje frontend e backend
dividem a mesma origem no Railway; a intenção declarada é migrar para VPS
própria, possivelmente com domínios separados. Três escolhas deixam essa
mudança barata, e estão assim de propósito:

- **O token é JWT assinado de verdade, não sessão opaca de servidor.**
  Validar é conferir assinatura, então não há estado guardado no processo
  — sobrevive a várias instâncias atrás de load balancer sem store
  compartilhado.
- **O endpoint aceita o token por cookie `httpOnly` OU por header
  `Authorization: Bearer`.** Cookie serve a mesma origem hoje; o header
  é o que funciona sem fricção se domínio separado ou app nativo
  entrarem depois. Com os dois presentes, o header vence — explícito
  ganha de ambiente.
- **`sameSite`, `secure`, domínio, nome e TTL do cookie vêm de variável
  de ambiente**, com default afinado para o cenário de hoje
  (`lax` / `secure` / host-only / 30 dias). Mudar topologia é mudar
  variável, não reescrever código.

O token cru só aparece no corpo da resposta quando o cliente pede com
`X-Auth-Transport: bearer`. Navegador recebe o token no cookie httpOnly
e em lugar nenhum além dele, então não sobra nada no payload que um XSS
pudesse levar; cliente nativo ou cross-domain faz opt-in e lê.

### Catálogo canônico de `product_id`

Definido no backend, em `app/db/models/product_access.py`:

```
alexandria · terminal-brasil · energy-brief ·
conta-de-luz-express · diagnostico-energetico · us-terminal
```

**Nota de reconciliação, registrada e não resolvida:** essa lista precisa
ficar em sincronia CONCEITUAL com `src/lib/data/br-destinos.ts`, que é
território do ARCHITECT. Os cinco destinos brasileiros do frontend batem
um a um com os cinco primeiros ids daqui; `us-terminal` não tem par no
catálogo BR porque o portal americano ainda não existe. O backend **não
importa** do arquivo do frontend — atravessar essa fronteira seria pior
que a duplicação. Reconciliar não é responsabilidade desta wave; quem
abrir o catálogo dos dois lados de novo, alinha lá.

Para reduzir a chance de deriva, `GET /api/products/me` **serve o
catálogo** junto da lista de ativados, para o frontend ler em vez de
manter uma terceira cópia.

A validação de pertencimento é na camada de API, não `CHECK` no banco —
assim o catálogo cresce sem migration.

### Quatro desvios do brief, todos deliberados

1. **Models em `app/db/models/`, não `app/models/`.** O brief pede
   `app/models/user.py`; a convenção do repositório é `app/db/models/`,
   que é onde `infrastructure.py` vive e de onde `migrations/env.py` já
   importa. Criar a segunda casa exigiria um import extra no `env.py`
   que ninguém lembraria de manter. Nomes de arquivo preservados.
2. **A FK carrega `ON DELETE CASCADE`**, que o SQL literal do brief não
   tem. Sem isso, qualquer caminho futuro de exclusão de conta quebra na
   constraint, e uma linha de `product_access` que sobrevive ao usuário
   é órfã sem significado. Provado no smoke: apagar as contas de teste
   limpou as ativações.
3. **Identidade não usa o envelope `{meta, data, summary}`** das
   Endpoints 1–15. Aquele envelope existe para carregar frescor de dado
   (`timestamp`, `data_age_seconds`), que não quer dizer nada num login.
   O domínio inteiro fica numa forma só em vez de rachar no meio.
4. **Produto fora do catálogo responde 404, não 422.** Segmento de
   caminho que não nomeia recurso nenhum é recurso ausente, não campo
   malformado. As Endpoints 13–15 usam 422 porque lá o inválido é
   query param.

### Verificação — 82 asserções, 0 falhas

Três rodadas: duas com o app em processo contra o banco de produção, e
uma terceira por HTTPS real contra
`gridalpha-v2-production.up.railway.app` depois do deploy.

**Auth, 33 PASS / 0 FAIL:** flags do cookie (`HttpOnly`, `Secure`,
`SameSite=lax`, `Path=/`, sem `Domain`), duplicata recusada em 409
inclusive com o email em CAIXA ALTA, login errado e email inexistente
devolvendo a MESMA mensagem (`invalid email or password` — senão o
endpoint vira oráculo de quais endereços existem), round-trip completo
por `Authorization: Bearer`, assinatura adulterada em 401, e 401 depois
do logout.

**Produtos, 25 PASS / 0 FAIL:** conta nova nasce com zero produtos,
ativar duas vezes deixa UMA linha com o `activatedAt` original,
`alreadyActive` distingue primeiro clique de repetição, conta não vê
produto de outra conta, os dois endpoints em 401 sem sessão, e produto
inventado em 404 sem gravar nada.

**Deploy publicado, 24 PASS / 0 FAIL:** o fluxo inteiro do brief por
HTTPS de fora — signup, cookie de sessão com as flags certas, `/me`
autenticado, ativar `alexandria`, repetir sem duplicar, confirmar em
`/api/products/me`, Bearer por header sem cookie nenhum, e 401 depois
do logout. Prova o que o teste em processo não prova: que `argon2-cffi`
e `PyJWT` instalaram no build do Railway e que o `JWT_SECRET` do
ambiente é lido pelo container. `/api/infra/batteries` conferido na
mesma rodada — as Waves 7/8 seguem servindo dado real.

Um achado veio de falha do próprio teste: o fixture usava `.test`, e o
`email-validator` recusa TLD reservado. Comportamento correto — o
fixture é que estava errado.

**Limpeza:** as contas de teste foram removidas. `users` e
`product_access` voltaram a zero linhas; as três tabelas das Waves 7/8
seguem intactas.

### Pendências registradas

- **Google OAuth.** Schema já preparado: `users.google_id` existe com
  UNIQUE, e o `CHECK users_has_auth_method` aceita linha com
  `password_hash` nulo. Quando as credenciais entrarem, a resolução do
  callback tem que ser: procura `google_id`; não achando, procura o
  EMAIL e **vincula** `google_id` à conta existente; só criando conta
  nova se nenhum dos dois casar. Nunca segunda conta para um endereço
  que já existe por outro método.
- **Logout não revoga token.** Limpa o cookie do navegador e mais nada —
  é o preço da validação sem estado. Um Bearer já emitido vale até
  expirar. Revogação de verdade pede denylist ou access token curto com
  refresh; nenhum dos dois é desta wave.
- **Renovação deslizante é só do transporte por cookie.** Quem usa
  Bearer reautentica no vencimento, porque não existe endpoint de
  refresh — e emitir token novo num header de resposta inventaria
  contrato que ninguém consome ainda.
- **Sem gate de pagamento**, por decisão explícita. Ativar é gratuito e
  automático no clique até o lançamento acontecer de verdade.

**Variáveis novas no Railway:** só `JWT_SECRET` (já setada). As cinco de
cookie e a de TTL são opcionais — o default cobre o deploy de hoje.

## CURSOR WAVE 10 — ATLAS MUNDIAL DE ENERGIA (OWID)

**Status:** fechada. Base de dado real para o globo do Atlas mundial da
Alexandria — um perfil de energia por país, real, com fonte citada por
campo. Migration aditiva, roteador novo, zero linha tocada nas Waves 7-9.

**Fonte:** [Our World in Data — energy dataset](https://github.com/owid/energy-data).
A URL do codebook no brief (`owid-public.owid.io/.../owid-energy-codebook.csv`)
dá 404 — o codebook só existe no espelho do GitHub,
`raw.githubusercontent.com/owid/energy-data/master/owid-energy-codebook.csv`.
A URL do JSON de dados do brief está correta.

### Fase 1 — dois achados reais, medidos antes de qualquer schema

**12 campos escolhidos**, não as 130 colunas do dataset (o brief dizia 134;
o OWID revisou o dataset desde então — reportado como medido, não corrigido
pra bater com o brief): `population`, `electricity_generation`,
`renewables_share_elec`, `carbon_intensity_elec`, `energy_per_capita`,
`fossil_share_elec`, `nuclear_share_elec`, `hydro_share_elec`,
`wind_share_elec`, `solar_share_elec`, `biofuel_share_elec`,
`other_renewables_share_elec_exc_biofuel`. Justificativa e citação completa
por campo em `docs/v2-backend-contract.md` § "World energy atlas (Wave 10)"
e em `app/db/models/country_energy.py::FIELD_DEFINITIONS`, copiadas literais
do codebook — nenhuma citação inventada.

**Ano de referência: 2023, não o mais recente do dataset.** Os campos de
eletricidade (Ember) chegam a 2024 pra maioria dos 188 países soberanos, mas
`energy_per_capita` (EIA/Energy Institute) só completa 100% do conjunto
soberano em 2023 — uma defasagem real de um ano. Contagem de países com os
12 campos simultaneamente preenchidos: **161/188 (86%) em 2023** contra
**55/188 (29%) em 2024**. 2023 é o ano mais recente com dado completo pra
maioria, e é isso que ficou no `year` de toda linha — nenhum campo é
retroalimentado de um ano diferente pra "completar" a linha, o que
misturaria vintage dentro do mesmo snapshot.

### Contagem: 188 países, não ~195

314 entidades no dataset, 220 com `iso_code`. Critério aplicado: Estado-
membro da ONU ou observador permanente (Palestina presente; Vaticano
ausente — o OWID não tem dado de energia dele, soberano ou não). Excluídas
32 entidades com `iso_code` que não são soberanas: Porto Rico, Hong Kong,
Macau, Bermudas, Guam, Guiana Francesa, Groenlândia, Gibraltar, Taiwan (não
é membro da ONU desde 1971), Saara Ocidental, Antártida e mais 21 — lista
completa com motivo em
`app/scripts/ingest_owid_energy.py::NON_SOVEREIGN_ISO3`. O gap real de 7
para 195 vem principalmente de Taiwan e de territórios do Pacífico/Caribe
que o dataset também rastreia com código ISO.

### Schema — aditivo, migration `0003_country_energy`

`country_energy_profile` (`iso_code` UNIQUE, `country_name`, `year`, os 12
campos, `updated_at`) + `country_energy_field_source` (`field_name` PK,
`source_citation`, `unit` — um registro por campo ingerido, nunca
inventado). Todos os 12 campos de métrica são NULLABLE — honestidade de
null em vez de zero inventado, mesmo idioma que a Alexandria já usa em
conteúdo de currículo, aplicado aqui a dado de mercado. 27 dos 188 países
têm pelo menos um campo null em 2023 — a maior causa isolada é
`other_renewables_share_elec_exc_biofuel` (26 países, inclusive economias
grandes como Brasil, Canadá, China e Índia — o Ember não decompõe essa
categoria quase-zero pra todo país).

### Ingestão — `app/scripts/ingest_owid_energy.py`

188 linhas em `country_energy_profile`, 12 em `country_energy_field_source`.
Upsert por `iso_code`/`field_name` — reexecutar é idempotente.

### Endpoints — `app/routers/atlas_world.py`

`GET /api/atlas/world/countries` (lista os 188, perfil resumido) e
`GET /api/atlas/world/countries/{iso}` (perfil completo + `fieldSources` com
unidade e citação por campo). Envelope canônico `{meta, data, summary}` —
mesma convenção dos endpoints de infraestrutura (Waves 7-9), não a de auth,
porque isto é dado de referência de mercado. Sem bbox, sem paginação — ~188
linhas cabem inteiras. `404` pra ISO fora do conjunto ingerido, `422` pra
ISO malformado (não tem 3 letras).

### Smoke test — local (TestClient contra o banco real) e produção (HTTPS)

Ambos batendo 200 com os mesmos números: 188 países, Brasil 88,995%
renovável / 60,159% hidro / 96,26 gCO₂/kWh, França 65,195% nuclear, EUA
59,106% fóssil, Japão 70,169% fóssil — todos plausíveis contra conhecimento
real de cada matriz elétrica. `fieldSources` com 12 entradas em cada
resposta de país, todas com `unit` e `sourceCitation` preenchidos.
Verificação de regressão: `GET /api/infra/batteries` (Wave 8) segue 200
depois do deploy — nenhuma tabela ou rota das Waves 7-9 foi tocada.

**Gates:** migration `0003_country_energy` aplicada sobre `0002_identity`
sem tocar as tabelas de infraestrutura/identidade. Deploy no Railway
(`gridalpha-v2-production`) verificado por HTTPS real depois do push.

## ARCHITECT — IDENTIDADE DE PLATAFORMA WAVE 1

**Status:** fechada. Consumidor frontend da Wave 9 do backend — contexto
de autenticação compartilhado, telas de entrar/criar conta, perfil de
plataforma e ativação real no clique. Construído contra a API de
verdade desde a primeira linha; nenhum mock em nenhuma fase.

### Achado da Fase 1 — o `/login` legado nunca chamou API

Auditoria antes de nomear rota. A confirmação é mais forte que "não é
conta de plataforma":

| Rota legada | O que realmente faz |
| --- | --- |
| `/login` | Valida formato e **navega direto para `/nest`**. `// TODO: Replace with Supabase auth post-VPS migration`. Zero fetch. |
| `/signup` → `/signup/success` | Grava `{name, email}` e `ProfileType` (trader / analyst / storage / …) em zustand + sessionStorage. Nenhuma senha sai do browser. |

`authStore` não tem senha, sessão nem id — é **seleção de arquétipo do
terminal americano**, que decide qual Nest o `GlobalShell` monta. O nome
"auth" ali é herança, não função. Ortogonal a esta wave: aquilo escolhe
QUAL TERMINAL você vê; isto estabelece QUEM VOCÊ É.

**Rotas finais:** `/entrar` · `/criar-conta` · `/conta`. Legado
intocado.

### A decisão que a medição mudou — caminho relativo, não `BASE_URL`

O cookie de sessão é `SameSite=lax` (lido do `Set-Cookie` real de
produção). Cookie `lax` **não viaja em fetch cross-site** — provado no
browser antes de escrever tela nenhuma:

| Chamada | Por URL absoluta do Railway | Por caminho relativo |
| --- | --- | --- |
| `POST /api/auth/login` | 200, devolve o usuário | 200, devolve o usuário |
| `GET /api/auth/me` em seguida | **401 `not authenticated`** | **200, mesmo email** |

Com URL absoluta a sessão morreria em todo o desenvolvimento local: o
login "funciona" e nada persiste. Caminho relativo serve os dois
ambientes sem `if (dev)` — em dev o `server.proxy['/api']` que já
existia no `vite.config.ts` encaminha e o browser vê mesma origem; em
produção front e back já dividem origem. Se a topologia virar domínios
separados (a Wave 9 registra que está indeciso), a correção é
`SESSION_COOKIE_SAMESITE=none` no backend — não reescrita aqui.

CORS confirmado credenciado: `access-control-allow-credentials: true`
com a origem ecoada exata, não `*`.

### `credentials: 'include'` — primeiro uso no projeto

Grep em todo o `src/`: a única ocorrência de `credentials:` era
`'omit'` no `services/api/client.ts`, que serve dado público de
mercado. `authApi.ts` também **não** passa pelo `fetchEnvelope`:
identidade devolve JSON plano, não o envelope `{meta, data, summary}`
das Endpoints 1-15, e validar envelope onde não há envelope seria
aplicar o contrato errado.

### Anti-enumeração — provada, não só implementada

Teste real no browser, dois cenários distintos:

| Cenário | Mensagem exibida |
| --- | --- |
| Email que não existe | `Email ou senha inválidos.` |
| Email real + senha errada | `Email ou senha inválidos.` |

Strings idênticas. Existe um único `if (err.status === 401)` no
código — nenhum ramo distingue as causas. O 409 do cadastro É
específico de propósito: a assimetria é do backend, e a razão é real
(no login, diferenciar entrega quais emails existem; no cadastro, a
pessoa precisa saber que já tem conta). Verificado com o email em
CAIXA ALTA, confirmando a normalização case-insensitive.

### Defeito que só a verificação pegou

Sem `noValidate`, `type="email"` aciona a validação nativa do browser,
que **bloqueia o submit** e mostra bolha `Please include an '@'…` — em
inglês, numa página inteiramente em português — e a nossa validação
nunca era alcançada (`submitDisparou: false`, medido). Corrigido nos
dois formulários; os erros agora aparecem em português ancorados nos
campos por `aria-describedby`.

### Prova de ponta a ponta, com conta nova

Fluxo por clique real, `fluxo.completo.w1@gridalpha.com`:

| Passo | Resultado |
| --- | --- |
| Criar conta pela tela | → `/conta`, nome renderizado, `0 DE 6 ATIVADOS` |
| Sair da conta | → `/br`; `/conta` depois disso expulsa para `/entrar` |
| Entrar de novo | → `/conta` |
| Clicar Alexandria no Portal | rede: **`POST /api/products/alexandria/activate`**, navega para `/alexandria?trilha=brasil` |
| Dentro de `/alexandria/trilha/…/aula/3` | `GET /api/auth/me` → 200, `products: ["alexandria"]` |
| Voltar a `/conta` | `1 DE 6 ATIVADOS`, badge ATIVADO, "Ativado em 29 de julho de 2026" |

**Reconhecimento no fundo da árvore, por leitura do CONTEXTO REACT** (não
só do cookie): sonda temporária em `AlexandriaHome` confirmou
`user: fluxo.completo.w1@gridalpha.com, loading: false` em `/alexandria`,
`/alexandria/trilha/…/aula/3` e `/alexandria/glossario`. Sonda revertida
com `git checkout`; grep confirma zero resíduo.

### O que a Alexandria ainda NÃO faz

Ela **não consome** o `AuthContext` — o provedor envolve `/alexandria/*`
e o usuário é reconhecido lá dentro, mas nenhum componente dela lê isso
ainda. Perfil da Alexandria, progresso por conta e gate de ativação são
**wave do LYCEUM**, depois desta. Nada em `src/components/alexandria/`
nem no `AlexandriaRouter.tsx` foi tocado.

### Registrado, não resolvido

- **Editar dados e recuperar senha não existem** — os endpoints não
  foram construídos. Declarado em texto nas telas, em vez de botão ou
  link morto.
- **Sem Google OAuth** — `/api/auth/google/*` ausentes; o contrato
  proíbe placeholder que finge funcionar.
- **Logout não revoga o token** (limitação stateless da Wave 9): limpa
  o cookie do navegador e nada mais.
- **`us-terminal` não tem rótulo em `br-destinos.ts`** — o perfil deriva
  "Terminal Estados Unidos" do id em vez de esconder o produto.
- **Duas contas de teste ficaram no banco** — `architect.wave1@` e
  `fluxo.completo.w1@`, ambas `@gridalpha.com`. Não há endpoint de
  exclusão no contrato.
- **`Failed to load resource: 401` no console** das telas de entrar e
  criar conta: é o log automático do browser para qualquer 401, não
  exceção. O código trata (`setUser(null)`, sem UI de falha).

**Desvio mínimo de posse:** `ContaShell.tsx`, quarto arquivo em
`src/pages/conta/`, com o chassi comum das três telas — a alternativa
era triplicar o layout.

**Gates:** `tsc -b` 0 erros nos arquivos da wave · `gridalpha-detect`
"No findings. Surface is clean." · zero overflow horizontal em 1440×900
e 1920×1080 nas três telas.

### Fase extra — porta de entrada e conta antes do arquétipo

A wave construiu `/entrar`, `/criar-conta` e `/conta` sem linkar de
lugar nenhum. Fechado em duas frentes:

**Portal Brasil** — `AcessoConta` no header, três estados: enquanto
`/api/auth/me` não respondeu NÃO diz "Entrar" (seria mentira de ~200ms
piscando para quem tem sessão); sem sessão mostra "Entrar" levando o
destino atual; com sessão mostra "Conta · <primeiro nome>". Achado
visual corrigido: o botão nasceu com fio ocre de 2px embaixo, que é o
vocabulário do mercado ATIVO no `SeletorMercado` ao lado — virou caixa
de fio de 1px, o idioma de ação, e o ocre voltou a significar só "você
está aqui".

**Landing americana** — `Sign in` → `/entrar`. `Access Terminal`
continua indo para `/signup`, que deixou de ser formulário e virou
`SignupGate`: sem sessão manda para `/criar-conta` e volta; com sessão
segue direto para `/signup/profile`. Identidade primeiro, arquétipo
depois — e um caminho só de "entrar" no header.

**A lógica de arquétipo não foi tocada.** `SignupProfilePage`,
`SignupDetailsPage` e `SignupSuccessPage` estão byte-idênticas.

**Achado que definiu a implementação:** as três usam `email !== ''`
como GUARDA DE SEQUÊNCIA (`Profile` L43, `Details` L812, `Success`
L16) — o email nunca é renderizado, só prova "passou pela etapa 1". Um
gate que apenas navegasse deixaria o store vazio, as três devolveriam
para `/signup`, e `/signup` mandaria de volta: laço infinito. O gate
semeia o store com nome e email REAIS da conta, e os guards seguem
funcionando sem editar nenhuma das três.

A tela substituída pedia nome, email e senha, validava a senha com no
mínimo 8 caracteres e a **descartava** — `setCredentials` gravava só
nome e email. `SignupCredentialsPage.tsx` permanece no repo porque
`ProgressDots` mora lá e é importado pelas outras duas; o componente
fica sem consumidor, com o motivo declarado no cabeçalho. Efeito
colateral favorável: "STEP 2 OF 3 · PROFILE" ficou correto — a etapa 1
continua existindo, mudou de lugar para `/criar-conta`.

`/login` legado continua de pé como rota (não quebra link antigo), mas
não é mais alcançável pelo header.


## LYCEUM — ALEXANDRIA WAVE 23 — PERFIL REAL

**Status:** fechada. Primeira superfície da Alexandria que consome o
`AuthContext` da plataforma. Identidade é real; **progresso segue mock**,
e a tela diz isso.

**Arquivo:** `src/pages/alexandria/PerfilStub.tsx` (único modificado — o
nome do arquivo fica, é o contrato de rota da Wave 6 e o router não é
posse desta wave).

### Auditoria da Fase 1 — shape real, não presumido

`useAuth()` devolve `{ user, loading, login, signup, logout,
activateProduct(productId), myProducts(signal?) }`. `PlatformUser` traz
`id · email · name · authMethods · createdAt · updatedAt`.
`ProductsResponse` traz `products[{productId, activatedAt}]` **e**
`catalog[]` — o catálogo vem do servidor justamente para o front não
manter segunda cópia.

**O mecanismo de "sem sessão → /entrar com destino" já existia** e foi
reaproveitado, não reinventado: `PerfilPlataforma.tsx` usa
`<Navigate to="/entrar" replace state={{ de: location.pathname }} />`, e
`EntrarView`/`CriarContaView` leem `location.state.de` (com fallback
`/conta`) e navegam para lá no sucesso. Por isso entrar pelo Perfil da
Alexandria devolve ao Perfil da Alexandria.

### Guarda de rota

`loading === true` mostra "Verificando sua sessão…" montando o shell
inteiro — nunca redireciona. Redirecionar enquanto `/api/auth/me` não
respondeu expulsaria quem TEM sessão válida a cada carga. Só com
`loading === false && !user` o `Navigate` dispara.

### Ativação automática — provada por rede

Estar na página já é intenção de uso, então não há botão "ativar
Alexandria". Mas a ativação **só dispara quando necessário**:
`myProducts()` é consultado primeiro e, se `alexandria` já está lá,
`activateProduct` não é chamado. A rota é idempotente no backend, mas
idempotente não é motivo para gastar escrita a cada visita.

Medido no browser com **conta nova**:

| Momento | Rede observada | activate |
| --- | --- | --- |
| primeira visita | `GET /api/products/me` ×2, `POST /api/products/alexandria/activate` | **1 vez** |
| recarga | `GET /api/products/me` | **0 vezes** |

Os dois GET na primeira visita são o StrictMode do dev invocando o efeito
duas vezes; o POST saiu uma vez só. Em produção o StrictMode não roda.

### Composição — três seções, e o que cada uma pode afirmar

- **Identidade** — nome, email, membro desde (`user.createdAt`) e
  Alexandria ativada em. Peso igual entre as linhas: são fatos do mesmo
  nível sobre a mesma conta. Data formatada igual ao `/conta`, para os
  dois lados da mesma conta não escreverem a mesma data de jeitos
  diferentes. Link "Gerenciar conta →" e ação "Sair da conta".
- **Progresso na Alexandria** — quatro números e as insígnias
  conquistadas, exatamente o que `MOCK_USER_PROGRESS` /
  `ALEXANDRIA_BADGES` já entregam desde a FOUNDRY Wave 3.
- **Certificado** — bloqueado, com a razão real: a Trilha 1 tem 29 aulas
  confirmadas em 3 de 5 módulos, e emitir certificado sobre denominador
  desconhecido seria certificar o que ninguém mediu.

**Sair devolve a `/alexandria`**, não ao portal: quem estava aqui estava
lendo a Alexandria.

### PROGRESSO SEGUE MOCK — declarado na tela, não só aqui

A seção de progresso carrega bloco em contorno tracejado terracota, o
mesmo registro de "conteúdo em produção" do sistema inteiro:

> **Ainda não é o seu progresso** — Os números acima são de demonstração,
> iguais para toda conta. A Alexandria ainda não registra aula concluída
> por usuário — sua identidade é real, seu percurso ainda não.

**Isso precisa de wave do Cursor**, com endpoint de progresso por conta.
Não foi simulado com `localStorage` de propósito: persistência local não
é sincronização — é ilusão presa a um aparelho, e contradiz a própria
ideia de conta que atravessa dispositivo. Grep de fechamento: zero uso de
`localStorage`/`sessionStorage` no arquivo (a única ocorrência da palavra
é o comentário que explica por que não usar).

**O Perfil da Alexandria não lista outro produto nem assinatura** —
isso é o `/conta` de plataforma, alcançável pelo link. Confirmado por
grep e por leitura do texto renderizado.

### Verificação por clique real

Conta NOVA criada na verificação (`lyceum.w23.<timestamp>@gridalpha.com`),
porque conta existente já teria `alexandria` ativada e não provaria o
primeiro disparo.

| Passo | Resultado |
| --- | --- |
| deslogado → `/alexandria/perfil` | redireciona para `/entrar` |
| criar conta a partir dali | volta para **`/alexandria/perfil`**, não `/conta` |
| identidade na tela | nome e email da conta usada, não mock |
| recarga | `activate` não dispara de novo |
| "Gerenciar conta" | chega em `/conta` |
| "Sair da conta" | vai para `/alexandria`; revisitar `/perfil` volta a `/entrar` |

Zero overflow horizontal em 1440×900 e 1920×1080. Os 401 no console são o
log automático do browser para `/api/auth/me` sem sessão — estado normal,
tratado pelo contexto, sem UI de falha (mesma nota da ARCHITECT Wave 1).

**Conta de teste deixada no banco** — não há endpoint de exclusão no
contrato, mesma pendência que a ARCHITECT registrou.

**Gates:** `tsc -b` 0 erros em Alexandria · `gridalpha-detect` "No
findings. Surface is clean."

## LYCEUM — ALEXANDRIA WAVE 24 — MÓDULO 04

**Status:** fechada. Extração, cálculos e fiação. Primeira wave em que a
FONTE mudou de vocabulário — nenhum seletor das três extrações
anteriores funciona aqui — e primeira sem gravura nenhuma, por contrato.

**Arquivos:** `alexandria-modulo-04-content.ts` (NOVO, 605 linhas) ·
`alexandria-instrument-calculators.ts` (+7) · `alexandria-curriculo.ts`
(registro) · `alexandria-trilhas.ts` (uma linha — ver abaixo).

**Arquivo da fonte:** `alexandria_modulo04.html`, nome conferido no
disco antes de abrir. Limpo, sem o sufixo `__1_` que o brief alertou.
180.140 bytes sem o `<script>`.

### A fonte mudou de vocabulário

Contagens dos seletores das Waves 4/18/19, medidas neste arquivo:

| seletor | ocorrências |
| --- | --- |
| `class="aula"` | **0** |
| `aula-marker` | **0** |
| `div.exercise` | **0** |
| `exercise-tag` | **0** |
| `glossary-item` | **0** |
| `checklist-item` | **0** |

O vocabulário aqui é abreviado: `sec-id` delimita seção, `lede` é o
lead, `inst` o instrumento, `box` a nota, `lv` um explicador em três
níveis, `det-bd` o corpo de exercício em `<details>`. Nenhum regex
anterior serve — a estrutura foi remapeada do zero antes de extrair.

### Contagem real — prosa e markup CONCORDAM, pela primeira vez

| sinal | prosa da fonte | markup |
| --- | --- | --- |
| aulas | §MAP "Sete aulas" | 7 seções `Aula NN` |
| exercícios | §Ex "Nove exercícios" | 9 `<details>` |
| glossário | §Lex "Cinquenta e oito termos" | 58 `.term` |

Nos Módulos 01 e 02 a prosa subestimava o markup ("seis dos oito",
"Oito" contra dez); no glossário da Wave 8 dizia 28 contra 38 reais.
Aqui não houve divergência a registrar. 17 seções = 7 aulas + 10 de
aparato (§00 §MAP §Caso §Erros §Ex §Quiz §Voz §Final §Lex §Ref).

| Aula | Título | blocos | inst | saídas |
| --- | --- | --- | --- | --- |
| 01 | Ordem de mérito como formador de preço | 14 | ✓ | 2 |
| 02 | PLD: o preço do curto prazo | 18 | ✓ | 3 |
| 03 | Energia × capacidade e o *missing money* | 20 | ✓ | 4 |
| 04 | Leilões: como o regulador descobre o preço | 15 | ✓ | 4 |
| 05 | PPA: onde mora a economia real | 17 | ✓ | 2 |
| 06 | Hedge: travando exposição ao PLD | 14 | ✓ | 4 |
| 07 | Portfólio de contratação | 16 | ✓ | 3 |

**114 blocos de apostila.** Tabela em 4 aulas (02, 04, 05, 07).

### Instrumento — tipo confirmado na marcação, não presumido

**Sete, um por aula, nenhum solto no aparato** — diferente do Módulo 01,
que tinha o `LAB · 01` fora de qualquer aula e até hoje sem lugar na
interface.

Seis se declaram `Simulador`. O sétimo é **"Mesa de hedge · swap
simples"**, e "mesa de hedge" NÃO é membro de `InstrumentKind` (que tem
nove). `src/lib/types/alexandria.ts` é somente-leitura nesta wave, e a
mecânica do INST 06 é idêntica à dos outros seis — campos numéricos →
readouts → veredito. Entrou como `kind: 'simulador'` com o **título
literal preservado**. Verificado na tela: o painel renderiza `title`, e
"MESA DE HEDGE · SWAP SIMPLES" é o que o aluno lê. O `kind` é taxonomia
interna; nada se perdeu.

**Campos:** a fonte pareia cada controle numérico com um `<input
type="range">` gêmeo — mesmo padrão do Módulo 02. São UM campo lógico.
Os ids extraídos carregam sufixo `-n` porque é o `<input type="number">`
que tem value/min/max/step. 24 campos ao todo.

### As seis saídas que não couberam no contrato

A fonte declara 28 readouts, 4 por instrumento, perfeitamente regular.
**22 entram.** Seis ficam de fora porque a fonte as renderiza como
TEXTO e `ResultadoInstrumento.valores` é `Record<string, number>`:

| id | rótulo | o que a fonte imprime |
| --- | --- | --- |
| `i1-m` | Usina marginal | nome ('Gás', 'Hidráulica') |
| `i1-lim` | Limite aplicado | categoria ('piso R$ 57,31') |
| `i2-mes` | Mês crítico | mês ('Set') |
| `i5-lo` | Mês mais barato | composto ('Fev · R$ 3,2 mi') |
| `i5-w` | Mês mais caro | composto |
| `i7-w` | Pior mês | composto |

Emitir índice numérico cru sob o rótulo "Mês crítico" seria pior que
omitir — é literalmente o defeito que a Wave 19 registrou ("Vale do
portfólio: 7" deveria ler "Agosto"). A informação **não se perde**: o
veredito literal da fonte já a carrega ("Pico em Set a R$ 158/MWh",
verificado na tela). Estender o tipo para `number | string` quebraria
`InstrumentPanel.tsx` (que tipa `valores: Record<string, number>` na
L312 e é NUNCA MODIFICAR), então a correção é de contrato, não de
extração — mesma pendência da Wave 19, agora com número.

### Prova de fidelidade — 29 de 29

Os sete portados do `<script>`, confrontados contra **reimplementação
independente** do original com os defaults da fonte: 22 valores
numéricos + os 7 vereditos (nenhum com `NaN`, `undefined` ou
`[object`). **Zero divergência.**

Validações cruzadas: o INST 01 forma **R$ 250/MWh**, que é o CVU do gás
— a usina marginal com os defaults — e o veredito cai na faixa "Sistema
em atenção" (`price<=400`). O INST 04 dá preço de corte **R$ 230**
contra preço médio por lance **R$ 186**, exatamente a diferença que a
Aula 04 ensina. O INST 02 põe o pico em **Set**, coerente com o máximo
da curva de sazonalidade.

Constantes literais, com a citação regulatória que o próprio script
traz: `PLD_MIN` 57,31 · teto horário 1.611,04 · teto estrutural 785,27
(ANEEL Despacho 3.850/2025). Os formatadores do original
(`num`/`brl`/`brl2`/`mi`) foram portados junto, para o veredito sair
com o mesmo texto — incluindo a escala mil/mi/bi.

### Sem gravura, e sem buraco

`bloco-04` tem `illustrationPrefix: null` no catálogo da FOUNDRY e não
existe pasta correspondente. **`illustrations: []` nas sete aulas.**
Nenhuma gravura `orn-` foi usada para preencher: `orn-` é mobília de
interface (Tier B), e misturar as duas coisas quebraria a separação que
a Wave 5 firmou.

Verificado nas SETE aulas com o rodapé excluído do seletor (a revisão
pós-Wave 16 moveu `AlexandriaFooter` para dentro do `<main>`, então
`main img` captura as quatro `orn-` da cartela): **zero gravura de aula,
zero `<figure>` vazio, zero placeholder.** A `Prancha` da Wave 5 não
reserva slot com array vazio, e isso se confirmou.

### Os nove exercícios são TODOS soltos

Nos Módulos 01-03 a tag apontava a aula (`Ex · 04 · Aula 05`). Aqui o
`<summary>` traz só `NN · Título`, e a varredura por `/[Aa]ula\s*\d+/`
no enunciado **e** no gabarito dos nove devolve **zero** ocorrência. A
fonte não declara o vínculo, então ele não foi inventado: os nove vão
para `MODULO_04_EXERCICIOS_SOLTOS` e as sete aulas ficam com
`activities: []`. Primeira vez que 100% dos exercícios de um módulo são
soltos.

### O explicador em três níveis

`div.lv` é peça pedagógica nova: o mesmo conceito em "Criança de 12
anos" / "Executivo" / "Especialista". `AulaBloco` tem seis kinds
(`titulo · paragrafo · formula · nota · lista · tabela`) e nenhum de
abas; criar um exigiria tocar contrato que esta wave só pode ler. Vira
UMA `nota` com os três rotulados dentro, texto integral preservado.
Verificado renderizando.

### `video: null` — medido, não herdado

Zero `<video>`, zero `<iframe>`, zero youtube, zero vimeo, zero `.mp4`
no arquivo inteiro.

### Duas armadilhas de parsing desta fonte

1. **O `<script>` contém strings HTML** (`'<div class="vl">'`) que
   envenenam qualquer regex de conteúdo — a primeira varredura de
   `.vl` devolveu código JS, não markup. Removido antes de parsear.
2. **As divs aninham** (`box` dentro de aula, `inst` dentro de aula), e
   regex não-guloso fecha no lugar errado. Walker com contagem de
   profundidade, e o bloco `.inst` excluído do corpo — senão o
   `inst-intro` entrava como parágrafo de apostila.

### Registro no resolvedor + Trilha 1

A previsão das três waves anteriores se sustentou pela terceira vez:
**um bloco de `import` e três spreads**, em UM arquivo. Nenhum
componente tocado — `AulaViewer`, `InstrumentPanel`, `ModuloAulaList` e
`AlexandriaRouter` intactos.

**Trilha 1 passa de 29 aulas em 3 de 5 módulos para 36 em 4 de 5**
(verificado na tela: "36 aulas confirmadas"). `totalAulasPartial`
continua `true`, corretamente — o `bloco-05` segue sem HTML.

`alexandria-trilhas.ts` não consta da posse declarada, mas `totalAulas`
e `totalAulasPartial` são DERIVADOS de `AULAS_POR_BLOCO`, que vive nele;
a Fase 4 pede a atualização explicitamente e não há outro caminho.
Acrescentado `'bloco-04': 7` mais a nota de que o Módulo 04 não entra na
coluna de `.aula` bruto da tabela, porque não usa essa marcação.

### Verificação por clique real

Aula 1 abre com **"AULA 1 DE 7"**, corpo completo, e o INST 01 no
primeiro paint em **Preço formado 250 · Déficit 0 MW** — os mesmos
valores da prova de fidelidade, **zero NaN**. Aula 6 mostra "MESA DE
HEDGE · SWAP SIMPLES" com as quatro saídas (−400.000 / 2.500.000 /
2.900.000 / 290) batendo. Aula 7 fecha em "AULA 7 DE 7".

Regressão: M01 aula 3 com as 3 gravuras `fis-`, M02 aula 2 com 1, M03
aula 6 com as 3 `ger-`, todas com `naturalWidth > 0`; nenhum NaN em
nenhuma. Zero overflow horizontal em 1440×900 e 1920×1080.

**Nota de progressão, não defeito:** o Módulo 04 aparece **trancado** na
trilha ("7 aulas · conclua o módulo anterior") porque o progresso mock
tem o Módulo 02 em 3/10 — é a regra da Wave 3 funcionando, idêntico ao
que a Wave 19 registrou. As aulas abrem por URL direta, e foi assim que
foram verificadas.

Os 401 no console são `/api/auth/me` sem sessão — estado normal tratado
pelo contexto, mesma nota das Waves 23 e ARCHITECT 1.

**Gates:** `tsc -b` 0 erros em Alexandria (seguem só os pré-existentes
de Recharts em `nest/student/*`) · `gridalpha-detect` "No findings.
Surface is clean."

## LYCEUM — ALEXANDRIA WAVE 26 — ACESSO AO PERFIL NO HEADER

**Status:** fechada. Wave curta: a Wave 23 construiu `/alexandria/perfil`
inteiro e nenhuma superfície linkava para lá — só dava para chegar
digitando a URL. Esta wave é a porta.

**Arquivo:** `src/components/alexandria/shell/AlexandriaHeader.tsx`
(único modificado). Zero token novo.

### Auditoria da Fase 1

**Wave 22 não estava em voo.** `AlexandriaHeader.tsx` limpo no working
tree, remoto sincronizado 0/0. O último commit a tocá-lo é
`af6b8c8 "alexandria header maior + recolhe ao rolar"` — posição 37 do
log, já integrado, de sessão anterior. Nenhum commit "wave 22" existe.

**Shape confirmado por leitura, não presumido.** `useAuth()` devolve
`{ user, loading, login, signup, logout, activateProduct, myProducts }`.
`PlatformUser` é `{ id, email, name, authMethods, createdAt, updatedAt }`
— **sem campo de imagem**. O próprio `AuthContextValue` documenta o
`loading`: "ninguém deve concluir 'não logado' — só 'ainda não sabemos'".

**`AuthProvider` cobre `/alexandria/*`** (`main.tsx` L30-92, rota na
L78), então `useAuth` — o consumidor que lança fora do provedor — é o
correto aqui, e não `useAuthOpcional`.

### Três estados, vocabulário replicado do Portal

Nada foi inventado: o tratamento é o do `AcessoConta` do Portal Brasil
(ARCHITECT · Identidade Wave 1), com os tokens trocados de Jaguar para
os da Alexandria.

| estado | tratamento |
| --- | --- |
| `loading` | espaço reservado de 32px, sem fio e sem letra — não afirma nada |
| sem sessão | "Entrar" em **caixa de fio**, levando `location.state.de` |
| com sessão | **círculo** com a inicial, levando a `/alexandria/perfil` |

**Caixa de fio e nunca fio-embaixo**, pela razão que o Portal declara e
que vale igual aqui: fio embaixo é o vocabulário de item de nav ATIVO
(a nav deste mesmo header usa fio terracota para isso), então usá-lo
faria "Entrar" ler como estado — "você está em Entrar" — em vez de ação.

### Sem foto, e não é omissão

`PlatformUser` não tem campo de imagem. Um `<img>` apontando para nada
renderiza ícone de quebrado, então é **sempre inicial**. Nome em branco
cai em `—`, que é a marca de campo sem valor do sistema, não uma letra
inventada.

### Zero token novo

O círculo usa `AR.circulo` — é a única exceção de raio que a identidade
concede (círculo pleno: anel de progresso, avatar). Desenhado com **fio
de 1px**, não com disco preenchido, porque neste sistema profundidade
vem de fio. Em **ouro** (`A2.ouroSobreNavy`, declarado 7,6:1 sobre
navy), não terracota: terracota é cor de estado e a Wave 17 já registrou
que ela nunca é decorativa. É o mesmo ouro do fio duplo de frontispício
logo acima.

Busca e acesso ficam num container só, para o `space-between` do header
continuar distribuindo TRÊS blocos (marca · nav · direita) — soltos
seriam quatro e a nav sairia do centro.

### Verificação por clique real

Conta nova criada na verificação, porque conta existente não provaria o
caminho de volta.

| passo | resultado |
| --- | --- |
| deslogado em `/alexandria` | "Entrar" visível · **raio 0px** · borda `#35506E` · texto `#F2E9D6` |
| clique em Entrar | → `/entrar` |
| criar conta a partir dali | → **volta para `/alexandria`**, não `/conta` |
| logado | círculo `href=/alexandria/perfil` · texto **"L"** · **raio 50%** · fio e cor `#CBAA6E` |
| clique no círculo | → `/alexandria/perfil`, perfil montado |

**O estado `loading` foi provado, não assumido:** com `/api/auth/me`
interceptado e atrasado em 2s, o header **nunca** mostrou "Entrar" —
quatro amostras ao longo do atraso, todas negativas — e o círculo
apareceu assim que `/me` respondeu. É a disciplina que o Portal firmou,
agora medida.

Zero erro de página. 1440×900.

### Registrado, não corrigido — e é dívida da própria Wave 24

`TrilhasHub.tsx` L30 traz a contagem **digitada à mão**: "Dezessete
módulos catalogados do Currículo Definitivo. Três deles têm conteúdo
escrito e navegável; os outros catorze estão em produção."

Com o Módulo 04 extraído na Wave 24 são **quatro** com conteúdo e
**treze** em produção — a frase virou afirmação falsa na tela, visível
no hub. É correção de uma linha, mas `TrilhasHub.tsx` não está na posse
desta wave, e a copy deveria ser derivada de `MODULOS_COM_CONTEUDO`
(que o resolvedor já exporta) em vez de digitada — senão volta a
divergir no Módulo 05.

**Conta de teste deixada no banco** — não há endpoint de exclusão no
contrato, mesma pendência das Waves 23 e ARCHITECT 1.

**Gates:** `tsc -b` 0 erros em Alexandria · `gridalpha-detect` "No
findings. Surface is clean."


## LYCEUM — ALEXANDRIA WAVE 25 — MÓDULO 05 · TRILHA 1 COMPLETA

**Status:** fechada. **A Trilha 1 fechou** — Fundamentos Universais é a
primeira trilha do currículo do zero à fluência, com os cinco módulos
extraídos e nenhum em `null`. 42 aulas.

**Arquivos:** `alexandria-modulo-05-content.ts` (NOVO, 545 linhas) ·
`alexandria-instrument-calculators.ts` (+6) · `alexandria-curriculo.ts`
(registro) · `alexandria-trilhas.ts` (`AULAS_POR_BLOCO['bloco-05']`).

### Vocabulário de classe — medido, não presumido

A hipótese do brief (Módulos 5-6 compartilham o vocabulário novo do 4)
estava certa, mas foi **verificada antes de escolher extrator**:

| seletor | Módulos 01-03 | Módulo 05 |
| --- | --- | --- |
| `class="aula"`, `aula-marker`, `exercise-tag`, `glossary-item`, `instrument-title`, `checklist-item`, `class="lead"` | usados | **todos ZERO** |
| `sec-id` · `lede` · `inst` · `lv` · `det-bd` | zero | 16 · 16 · 6 · 6 · 15 |

Uma divergência interna ao vocabulário novo: o callout do Módulo 04 é
`class="box"`; aqui é `box gd`. Uma varredura exata por `class="box"`
daria zero e perderia os oito.

### Contagem real

16 seções `sec-id` = **6 aulas** + 10 de aparato (§00, §MAP, §Caso,
§Erros, §Ex, §Quiz, §Voz, §Final, §Lex, §Ref). **126 blocos de apostila.**
Validação independente: os títulos extraídos batem 1:1 com os `<h3>` da
fonte em todas as seis (3, 5, 4, 6, 7, 5).

| Aula | 01 | 02 | 03 | 04 | 05 | 06 |
| --- | --- | --- | --- | --- | --- | --- |
| blocos | 17 | 19 | 19 | 24 | 27 | 20 |
| instrumento | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Um instrumento por aula, seis no total** — nenhum solto no aparato.
`video: null` medido (zero `<video>`, `<iframe>`, youtube, vimeo, `.mp4`).
`difficulty: null` — as ocorrências de "nível" são prosa ("achar seu
nível", "por nível de tensão", "custo nivelado"), nenhuma é marcador.
`illustrations: []` nas seis: `bloco-05` tem `illustrationPrefix: null`
desde a FOUNDRY Wave 1.

### OS TRÊS PRECEDENTES DA WAVE 24 SE REPETIRAM — todos

**1. `kind` fora de `InstrumentKind` — duas vezes numa wave só.**
`Termômetro` (Inst 04) e `Mapa` (Inst 06) não são membros do tipo, que
é somente-leitura aqui. Título literal preservado na tela (o aluno lê
"TERMÔMETRO · RISCO DE CAPTURA"), mapeamento interno decidido pela
MECÂNICA e não pelo nome:

| Fonte | Mecânica real | Mapeado para |
| --- | --- | --- |
| `Termômetro` | 8 chaves booleanas com peso + 1 campo numérico → índice | `quebra-cabeca` |
| `Mapa` | 3 campos numéricos → posição + veredito | `simulador` |

Com "Mesa de hedge" (Wave 24), são **três ocorrências em duas waves**.
O vocabulário de instrumento da fonte cresce mais rápido que o enum —
vale considerar, numa wave de contrato, se `InstrumentKind` deve virar
união aberta ou ganhar um campo `kindLabel` separado do `kind` interno.

**2. Saída inerentemente textual — quatro delas, em três instrumentos.**
`i2-b` (grau ótimo: 'Contábil'/'Funcional'/'Jurídica'/'Societária'),
`i4-r` (reprodutibilidade: 'não'/'parcial'/'sim'), `i6-q` (quadrante) e
`i6-r` (risco dominante). `ResultadoInstrumento.valores` é
`Record<string, number>`, então ficam fora — o veredito literal já as
carrega em prosa. **Terceira wave seguida** com este padrão (Wave 19:
mês; Wave 24: seis saídas; agora quatro). Não é mais ocorrência
isolada: é limitação conhecida do contrato, e a correção é de contrato.

**3. Exercício sem vínculo a aula — testado explicitamente.** Os dez
foram varridos em resumo, enunciado E gabarito. Nove não mencionam aula
nenhuma. O décimo tem "Aula 06" no fecho do gabarito ("é precisamente o
caminho híbrido descrito na Aula 06") — referência de conteúdo em prosa,
não tag de posse: a tag dele é `10 · Onde plotar o sistema`, sem aula,
igual às outras nove. Os dez vão para `MODULO_05_EXERCICIOS_SOLTOS`.
A prosa do §Ex diz "Dez exercícios" e concorda com o markup.

### Prova de fidelidade: 27 de 27

Os seis portados do `<script>`, confrontados contra reimplementação
independente. **Zero divergência.** Validação cruzada notável: o INST 06
com os defaults (85, 45) devolve distância **0,00** — os valores padrão
são exatamente a posição do Brasil no mapa de dois eixos, e a coerência
cai em 84,45/100 ("configuração coerente"). O INST 04 com os sinais 0 e 2
marcados dá opacidade 42 e reprodutibilidade "não", como o original.

Os oito sinais do Termômetro vivem no `<script>`, não no markup — a
`sig-grid` nasce vazia e é populada por JS. Extraídos de lá com os pesos
literais (22+20+20+12+12+6+5+3 = 100).

### `totalAulasPartial` — correção à premissa do brief

O brief pede "`totalAulasPartial` sai de true para false". **Não existe
campo para editar:** ele é DERIVADO em `alexandria-trilhas.ts` L125 —
`modules.some((m) => m.totalAulas === null)`. Acrescentar
`'bloco-05': 6` ao `AULAS_POR_BLOCO` faz o valor virar `false` sozinho.

Auditoria dos consumidores, feita ANTES de mudar o valor:

| componente | consome? |
| --- | --- |
| `CaminhoExpedicao.tsx` | não consome `totalAulas` |
| `AlexandriaHome.tsx` | não consome |
| `TrilhasHub.tsx` | conta módulos com fonte; não ramifica em `partial` |
| `TrilhaCard.tsx` | **único que ramifica** — com `false`, a ressalva "· N de M módulos com fonte" simplesmente não renderiza |

Comportamento com `false` é exatamente o desejado. **Nenhum componente
precisou mudar**, e nenhum dos sete da lista de proibição foi tocado.

### Verificação por clique real

- **Hub:** "42 aulas confirmadas" (9+10+10+7+6), **sem a ressalva de
  parcial** — confirmado por leitura de DOM. Trilhas 2 e 3 seguem em
  "Conteúdo em produção", corretamente.
- **Trilha 1:** os cinco módulos com contagem real; o Módulo 5 mostra
  "6 aulas".
- **Módulo 05:** Aulas 1, 4 e 6 abrem com conteúdo real, `figure` = 0
  (illustrations vazio), zero NaN. O Termômetro renderiza com os 8
  alternadores Presente/Ausente e os pesos visíveis no rótulo.
- **Regressão:** Módulo 01 aula 3 (3 gravuras `fis-`, naturalWidth
  1024/1536/1024), Módulo 02 aula 3 (3 `red-`), Módulo 03 aula 6 (3
  `ger-`, 1536) e Módulo 04 aula 1 (zero figura, como deve ser).
- Zero erro de console fora dos 401 de `/api/auth/me` sem sessão, zero
  overflow horizontal em 1440×900 e 1920×1080.

**Gates:** `tsc -b` 0 erros em Alexandria · `gridalpha-detect` "No
findings. Surface is clean."

## LYCEUM — ALEXANDRIA WAVE 27 — ATLAS MUNDIAL, CAMADA GLOBAL

**Status:** fechada. `/alexandria/atlas` deixou de ser stub — é o globo
3D com os 188 países reais da CURSOR Wave 10, cada um com perfil
energético verdadeiro e fonte citada por campo. Primeira superfície 3D
do produto. **Camada Brasil (quatro submercados sobre a mesma esfera) é
wave separada, ainda não construída** — declarado na própria página em
contorno tracejado.

**Arquivos:** `src/lib/atlas/worldApi.ts` (NOVO) ·
`src/components/alexandria/atlas/` — AtlasGlobo, PaisTooltip,
PaisPerfil (NOVOS) · `src/pages/alexandria/AtlasStub.tsx` (corpo
substituído; nome fica — contrato de rota da Wave 6) ·
`public/alexandria/geo/world-110m.json` (TopoJSON baixado) · entrada
5247 no `.claude/launch.json`.

### Fase 0 — o que a fonte oficial ensinou

Estudado o repositório real (`vasturiano/react-globe.gl`): README +
código de quatro exemplos (`choropleth-countries`,
`custom-globe-styling`, `hollow-globe`, `countries-population`).
Vocabulário confirmado antes de qualquer linha: `polygonsData` (GeoJSON
features), `polygonCapColor` / `polygonStrokeColor` / `polygonSideColor`
/ `polygonAltitude`, `onPolygonHover(poligono, anterior)`,
`onPolygonClick`, `pointOfView({lat,lng,altitude}, ms)` via ref (SEM
callback de término — o fim se marca por timer da mesma duração),
`showAtmosphere` (default TRUE, `lightskyblue` — precisou ser desligada
explicitamente), `globeMaterial` (Material Three para esfera sem textura
de imagem), `width`/`height` numéricos (default = janela; o wrapper é
medido por ResizeObserver). Os exemplos usam `topojson-client` para
TopoJSON → features. Nenhuma divergência entre brief e documentação.
`polygonLabel` (tooltip embutido) existe e NÃO foi usado — o
`PaisTooltip` próprio dá Cinzel/Lora e ancoragem ao cursor.

### Biblioteca — versão, peso e a decisão de lazy

`react-globe.gl@2.38.0` → `globe.gl@2.46.1` → `three-globe@2.45.2` +
`topojson-client@3.1.0` + `d3-geo@3.1.1` (centroide/bounds esféricos —
trata o antimeridiano que quebraria EUA/Rússia/Fiji). O peer `three`
deduplica no `three@0.183.1` que o projeto já tinha.

**Peso marginal medido** (esbuild, react/react-dom/three
externalizados): **601 KB raw / 193 KB gzip** — acima do teto de ~500 KB
raw do brief SE entrasse no bundle compartilhado. E entraria: o app não
tinha nenhum lazy-loading (auditado). Decisão do implementador, dentro
da posse: `AtlasStub.tsx` importa `AtlasGlobo` via `React.lazy`, o que
separa o stack inteiro num chunk próprio. **Provado no build real:**
`AtlasGlobo-*.js` = 1.838 KB raw / 521 KB gzip (inclui o `three`, que o
entry não carrega eager — Rollup não duplica módulo), buscado SÓ quando
`/alexandria/atlas` abre; `polygonCapColor` tem 0 ocorrências no bundle
de entrada e 3 no chunk. Veto limpo: `npm uninstall react-globe.gl
topojson-client d3-geo` + revert do stub.

### TopoJSON — medição e a tabela derivada

`public/alexandria/geo/world-110m.json` é cópia **byte-idêntica** (MD5
`0aa0a436…`, conferido) de `unpkg.com/world-atlas@2.0.2/countries-110m.json`
— a distribuição TopoJSON canônica da Natural Earth 110m. Medido:
**177 geometrias, id ISO NUMÉRICO, nenhuma propriedade alpha-3** (só
`name`). O brief esperava alpha-3 no arquivo — não existe nesta
distribuição; reportado como medido.

Tratamento: tabela `N3_ISO` (numérico → [alpha-3, alpha-2]) com 174
entradas **derivadas das propriedades do GeoJSON NE 110m**, não
digitadas. O defeito `-99` da NE foi medido: França e Noruega têm
`ISO_A3 = -99` (resolvido via `ADM0_A3`); a Noruega nem `ISO_N3` tem.
Duas correções manuais, ambas atribuição ISO 3166-1 padrão e
documentadas no arquivo: `250 → FRA/FR` e `578 → NOR/NO`. O
`world-atlas` em si é limpo (França 250, Noruega 578); só Kosovo,
Chipre do Norte e Somalilândia ficam sem id — corretamente, não têm
código ISO.

**Alpha-2 existe porque foi medido que precisava:** o
`Intl.DisplayNames` do Chrome NÃO resolve código numérico M49 para país
(`.of('076')` devolve `'076'`); só alpha-2 (`'BR'` → `'Brasil'`). O
nome pt-BR de cada país vem do CLDR do browser via alpha-2 — dado
padrão da plataforma, não tradução inventada — com fallback para o nome
do backend e depois o do TopoJSON.

### Contagem TopoJSON × backend — divergência medida e exibida

| | contagem | tratamento |
| --- | --- | --- |
| fronteiras 1:110m | 177 | todas desenhadas |
| com perfil no globo | 166 | junção por alpha-3, índice `Map` O(1) |
| território sem dado | 11 (TWN GRL ESH PRI NCL FLK ATF ATA + 3 sem ISO) | desenhado; hover e perfil declaram ausência honesta, número nenhum inventado |
| perfil sem geometria | 22 micro-Estados insulares (SGP MLT BHR MDV…) | têm dado, não têm polígono nesta escala — limitação real do 110m, declarada na página |

A Antártida fica desenhada por decisão: é geografia real e o atlas de
1890 a mostra; vira o mesmo estado sem-dado. Todas as seis contagens da
régua de legenda são DERIVADAS da junção em runtime — nenhuma digitada.

### Estética — decisões olhando renderizado

- **Traço: sépia venceu o creme.** Testados os dois por screenshot. O
  creme (#F2E9D6) lê como wireframe de dark-mode — contraste clínico. O
  ouro-sépia (`A2.ouroSobreNavy` #CBAA6E) é o mesmo vocabulário do fio
  duplo de frontispício da Wave 17 e lê como latão gravado.
- **Atmosfera DESLIGADA, provado por medição de cena:** o mesh de
  atmosfera existe com `visible: false` (traversal da cena Three). Fundo
  em `A.tintaSobreCreme` (#2A2620) — quente escuro, nunca preto puro.
  Zero estrela, zero gradiente decorativo, zero neon.
- **Luz de gabinete, calibrada por pixel.** A cena nasce com ambiente π
  e direcional 1,88 (medido via `globo.lights()`), que desenha brilho
  lateral de render de estúdio. Diagnóstico por pixel-diff de PNG:
  direcional 0 dá oceano perfeitamente uniforme ([9,28,53] em três
  pontos); 1,88 dá gradiente real ([14,35,63]→[8,26,49]). Ficou 0,4 +
  ambiente 3,4 — modelagem de esfera sob luz difusa, não estúdio. (O
  primeiro julgamento a olho estava errado — o pixel-diff corrigiu.)
- **Fade de hover: rAF + bezier próprio.** `polygonsTransitionDuration`
  anima altitude, não cor; o preenchimento terracota (0,38 máx) anima em
  180ms com a MESMA `cubic-bezier(0.65, 0, 0.35, 1)` de `AE.easing`,
  avaliada em JS por bisseção — canvas WebGL está fora do alcance de
  transition CSS.
- Terra com dado leva lavagem creme 0,10; sem dado, 0,04 — a diferença
  é legível sem gritar. Sem auto-rotação: globo de gabinete não gira
  sozinho.

### Voo de câmera e perfil

Clique → `pointOfView` ao centroide (`geoCentroid`; altitude
proporcional ao `geoBounds`, clamp [0,5, 1,6]) em **1200ms
(`AE.desenhoLongo`, o teto travado)** → **só então** o perfil abre, por
timer de mesma duração + 50ms. Provado por clique real: aos 600ms do
voo o painel NÃO existe no DOM; aos 1250ms existe, com a câmera pousada
no centroide (Brasil: −10,7/−53,2). Retorno simétrico: painel fecha no
clique, câmera voa de volta 1200ms e pousa exatamente no repouso
(8/−35/2,3 — lido do `pointOfView()`).

Perfil: painel HTML de papel sobre a lateral direita da prancha — o
globo continua globo ao lado. Matriz em barras HTML, renovável,
carbono, per capita, geração, população — cada número com "Fonte:
nomes" extraído do `fieldSources` real, unidade vinda do codebook, e o
bloco "Fontes completas, campo a campo" com as citações integrais
(12 campos). País sem dado abre em ausência honesta com explicação e
retorno.

### Verificação por clique real

- Os três países do smoke do backend, com câmera girada até cada um:
  **BRASIL** Hidráulica 60,2% / renovável 89,0% / 96 gCO₂ · **FRANÇA**
  Nuclear 65,2% · **ESTADOS UNIDOS** Fóssil 59,1% — os três batendo o
  smoke da Wave 10, nomes em pt-BR via Intl.
- Giro por ARRASTO REAL de mouse: pov lng −35 → 54,3.
- Groenlândia (polígono sem dado): "Sem dado disponível — fora do
  conjunto de 188 países soberanos com perfil OWID."
- O null real do BRA (`otherRenewablesExcBiofuelPct`) renderiza "sem
  dado" na barra — honestidade de null exercitada de ponta a ponta.
- Screenshots 1440×900 e 1920×1080: repouso, hover ativo, perfil
  aberto. Zero overflow horizontal nos dois; zero erro de console além
  do 401 conhecido de `/api/auth/me` sem sessão.

### Registrado, não resolvido

- **`npm run build` completo segue bloqueado** pelos erros
  pré-existentes de Recharts em `nest/student/*` (não desta wave; o
  mesmo estado que a ATLAS Wave 5 registrou). A prova de chunk foi por
  `npx vite build` direto.
- O harness de verificação expõe `window.__atlasGlobo` **só em DEV**
  (guardado por `import.meta.env.DEV`) — mesmo espírito do
  `window.alxSetPhase` da Wave 1; zero resíduo em produção.
- Micro-Estados com perfil e sem polígono não são alcançáveis pelo
  globo; uma lista/busca de países é extensão natural de wave futura.

**Nota de ambiente** (quarta wave seguida): painel Browser oculto não
compõe frames; verificação por `playwright-core` no scratchpad
dirigindo o Chrome do sistema com `--enable-unsafe-swiftshader` (WebGL
por software funciona — canvas real, screenshot real). Servidor próprio
na porta 5247 (`--strictPort`), entrada nova no `.claude/launch.json`.

**Gates:** `tsc -b` — 0 erros em Alexandria (seguem só os
pré-existentes de Recharts) · `gridalpha-detect` sobre os 10 arquivos
da wave — "No findings. Surface is clean."

## LYCEUM — ALEXANDRIA WAVE 28 — REFINAMENTO VISUAL DO ATLAS

**Status:** fechada. O globo deixou de ser caixa escura numa moldura e
virou o frontispício do atlas: esfera navy em canvas transparente
repousando nas mãos da gravura de Atlas, sobre o papel creme. Zoom-out
com piso travado no enquadramento do frontispício; mergulho da Wave 27
preservado sem regressão; citação de fonte consolidada no perfil.

**Arquivos:** `AtlasGlobo.tsx` · `PaisPerfil.tsx` · `AtlasStub.tsx` +
`public/alexandria/gravuras/grav-atlas-segurando-o-globo.png` (estava
UNTRACKED no repo — entrou no commit da Fase 3 sem modificação de
pixel; 2,8 MB, candidato à mesma conversão pngquant dos demais).

### Fundo transparente da gravura — o preview mente, o alpha não

O preview da imagem mostra um campo escuro de vinheta que parece fundo
opaco. Decodificação de pixel: **81,1% dos pixels com alpha 0** —
cantos, bordas e o vão entre as mãos todos transparentes; o "fundo
escuro" é RGB residual sob alpha 0 que compositores de preview
renderizam. A premissa do brief estava certa; o olho, errado. Mesma
lição da luz da Wave 27: julgamento visual se confere por medição.

### Composição escolhida: (a) monumental

As duas variantes do brief renderizadas e comparadas:

- **(b) esfera encaixada no vão (raio = vão/2): REPROVADA.** Com o
  centro na linha das mãos, o hemisfério inferior ENGOLE cabeça,
  braços e mãos — vira esfera esmagando um torso decapitado.
- **(a) monumental (raio = 0,62·vão): ESCOLHIDA.** O centro sobe
  `dy = √(r² − (vão/2)²)` acima da linha das mãos e as palmas tocam o
  arco inferior da esfera — Atlas genuinamente a segura.

A composição é PARAMÉTRICA, não pixel-ajustada: âncoras medidas na
gravura (mãos a x=28,1%/73,9%, y≈8,7%, vão=45,8% da largura) +
geometria de corda. Knobs finais: `larguraFig 0,73 · raioPorVao 0,62`.
Em 1440×900 o topo da esfera corta 142px no limite do palco (a escala
monumental do brief); em 1920×1080 ela cabe inteira (topo a −5px).

### Altitude de repouso: computada por ótica, não constante

O tamanho da esfera em px é função da altura do canvas e da altitude
(fov 50°, confirmado: `asin(R/d)/tan(25°)` reproduz o K=0,344 medido na
Wave 27 em 0,1%). A composição resolve a equação inversa: dado o raio
do encaixe, deriva `altRepouso = 100/sin(atan(2·r·tan25°/canvasH))/100 − 1`.
Resultado: **4,949** nas duas viewports de teste — propriedade medida,
não coincidência: `canvasH = 2(h − centroY)` é invariante em `h` porque
a figura ancora na base do palco, então o piso depende só da LARGURA da
prancha (1056 nos dois casos).

O canvas desce até a BASE do palco (o excesso acima é cortado pelo
overflow) — sem isso o mergulho ficava confinado numa faixa com creme
morto embaixo, defeito achado no render da própria Fase 3.

### Piso de zoom-out: mecanismo nativo, nomeado

**`OrbitControls.maxDistance`** — `three/examples/jsm/controls/
OrbitControls.js` L133 (default `Infinity`), clamp interno em
`_clampDistance` (L1074). O globe.gl inicializa em `globeR*100`
(`globe.gl.mjs` L549) — era por isso que dava para afastar até a
esfera virar ponto (altitude 33 medida). Reescrito para
`(1 + altRepouso) · 100 = 594,9`, reaplicado em resize.

**`minDistance` INTOCADO** — globe.gl o põe rente à superfície
(`globeR + near·1,1`, L548), e é ELE que permite o mergulho de hoje.

Provas por interação real: roda do mouse 14 voltas para trás →
altitude 4,949 → 4,949 (travada no frontispício, não menor); botão
"voltar ao globo" pousa nos mesmos 4,949; roda para FRENTE chega a
altitude **0,0357** — câmera na superfície, olhando de dentro — o
mergulho não regrediu.

### Fade do frontispício

Dirigido pela câmera, não por estado React: listener no evento
`change` dos OrbitControls (cobre roda E o tween do `pointOfView`) lê
a altitude e escreve `opacity` direto no `<img>`, com transição
`AE.estado`/`AE.easing` suavizando. Mapa: 1 no repouso → 0 quando a
altitude cruza 1,7 (acima do pouso mais fundo do voo, 1,6 — a figura
some ANTES do mergulho terminar). Medido: repouso 1 · aos 700ms do voo
0,45 caindo · perfil aberto 0 · retorno 1. A figura nunca aparece com
perfil aberto porque perfil implica altitude ≤ 1,6 < 1,7.

### Citação consolidada — agrupada por igualdade real

Diff das 12 citações do endpoint real ANTES de mexer: **9 campos
byte-idênticos** (os 7 da matriz + geração total + participação
renovável — Ember ×2 + Energy Institute); carbono, per capita e
população genuinamente divergem. A consolidação é computada em RUNTIME
por país (igualdade de string, nunca suposição): as 7 linhas da matriz
perdem a citação individual SÓ se todas forem idênticas; o rodapé do
painel declara "Fonte de matriz de geração, participação renovável,
geração total: …" com os campos cobertos derivados; os 3 divergentes
mantêm linha própria. Antes: 12 linhas de fonte; depois: 4.

### Verificação (1440×900 e 1920×1080)

Canvas sem retângulo em nenhum zoom (provado no pior caso: altitude 33
pré-piso, esfera-ponto sobre papel puro) · zoom-out por roda travado
exatamente no repouso · retorno pousa no mesmo enquadramento · mergulho
por roda até a superfície · figura esmaece no voo e reaparece ·
perfil com 4 linhas de fonte (3 divergentes + 1 consolidada) · legenda
e introdução legíveis · quatro estados fotografados nas duas viewports.

**Gates:** `tsc -b` — 0 erros em Alexandria (seguem só os
pré-existentes de Recharts) · `gridalpha-detect` sobre os 10 arquivos —
"No findings. Surface is clean."

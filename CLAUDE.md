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
| 07 Triângulo de potência e FP | `fis-04-triangulo-potencia` | assunto literal do subtítulo, mais o INST 05 |
| 08 Capacidade instalada | — | zero hits |
| 09 Qualidade de energia | — | "frequência" aparece como parâmetro de qualidade, não como o medidor |

**4 aulas com gravura, 5 sem. 5 das 6 `fis-` usadas.**

`fis-05-motor-inducao` **não foi mapeada**. Aparece uma única vez em
todo o módulo, na Aula 07, dentro de uma lista de equipamentos indutivos
("motores, transformadores, compressores, fornos a arco, bobinas de
solda"). Menção em lista não faz do motor o assunto. Fica para quando
existir aula que o trate.

`fis-04` aparece em duas aulas: a 02 introduz o triângulo, a 07 opera
com ele. Reuso é legítimo.

### As outras 100

`red-` 8, `ger-` 24, `ins-` 8, `mat-` 8, `mer-` 6, `tar-` 9, `geo-` 10,
`his-` 11, `orn-` 15, `ar-` 1. Todas convertidas, **deliberadamente não
mapeadas** — não existe aula extraída dos Módulos 02-17 para cruzar.
`orn-` (15) nunca mapeia para aula: é mobília de interface, referenciada
direto por componente quando esse componente existir.

Nota da biblioteca: a numeração de `tar-` pula o 05 (vai de `tar-04` a
`tar-06`). É como a biblioteca chegou; a contagem de 106 não muda.

### Pendência — o viewer não renderiza gravura

O brief da Wave 5 parte de que "o viewer já tem o slot de imagem
construído desde a Wave 4". **Não tem.** A Wave 4 foi interrompida antes
dessa parte, e o próprio fechamento dela registrou `illustrations` como
vazio e pendente. Verificado nesta wave: `0` elementos `<img>` no DOM,
tanto na Aula 03 (3 gravuras mapeadas) quanto na Aula 08 (nenhuma).

A posse da Wave 5 proíbe tocar componente, então o slot não foi
construído. `illustrations` está populado e correto; falta quem o leia.

**Gates:** `tsc -b` — 0 erros em Alexandria. `gridalpha-detect` — "No
findings. Surface is clean."

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

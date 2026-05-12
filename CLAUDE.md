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

Wave 6 closes with four pieces of infrastructure plus this file trim.

- **Skill** — `.claude/skills/gridalpha-terminal/`
- **MCP server** — `tools/gridalpha-tokens-mcp/`
- **Auditor** — `tools/gridalpha-detect/`
- **Playwright loop** — `/screenshot-loop` via `.mcp.json`
- **Brief template** — `docs/brief-template.md`
- **CLAUDE.md trim** — this file, under 100 lines, from 3,907

Future hooks: skill variants for marketing surfaces, auditor auto-fix
for mechanical P0 fixes, screenshot-diff for visual regression, a
"design review" agent that runs the full loop. Wave 7+ briefs follow
`docs/brief-template.md`.

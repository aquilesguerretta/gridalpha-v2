# Wave 2 Conduit Audit — Annotation Rollout

This document records what CONDUIT wrapped in Wave 2, what was deliberately
skipped, and what to know for future sprints. Every wrapped chart is also
listed in `src/lib/annotatableCharts.ts` (the runtime registry).

## API actually shipped (vs brief)

The Wave 2 brief described an `AnnotatableChart` API with optional
`enableAnnotations` flag and a callback for create/click. The real
shipped API (Wave 1, locked) is narrower:

```ts
interface Props {
  chartId: string;
  children: React.ReactNode;
  hideToolbar?: boolean;
  toolbarPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}
```

There is no `enableAnnotations` boolean — the choice is "wrap or don't
wrap." There is no callback — chart owners read annotations through
`useAnnotations(chartId)` if they need them. CONDUIT did not modify
the wrapper to add the brief's missing knobs because:

1. The Wave 1 contract was explicitly locked in the Wave 2 brief.
2. `hideToolbar` is functionally equivalent for the small-chart case
   that motivated `enableAnnotations` (read-only dot rendering, no UI).

## Wrapped charts

Twenty Recharts charts wrapped by CONDUIT in Wave 2, plus three
already-wrapped charts owned by FORGE in the Industrial Strategy
Simulator. See `src/lib/annotatableCharts.ts` for the canonical list.

| chartId | Surface | hideToolbar | Owner |
| --- | --- | --- | --- |
| `trader:hero-lmp:WEST_HUB` | Trader Nest | — | CONDUIT |
| `trader:lmp-24h:WEST_HUB` | Trader Nest | — | CONDUIT |
| `trader:spark-spread:WEST_HUB` | Trader Nest | yes | CONDUIT |
| `analyst:comparison-pseg-westhub` | Analyst Nest | — | CONDUIT |
| `analyst:seasonal-pattern` | Analyst Nest | yes | CONDUIT |
| `analyst:anomaly-detection` | Analyst Nest | yes | CONDUIT |
| `storage:asset-revenue` | Storage Nest | yes | CONDUIT |
| `storage:revenue-attribution-30d` | Storage Nest | — | CONDUIT |
| `storage:da-bid-optimizer` | Storage Nest | — | CONDUIT |
| `industrial:bill-projection-12mo` | Industrial Nest | — | CONDUIT |
| `industrial:sim-carbon-{strategyId}` | Industrial Nest | yes | CONDUIT |
| `industrial-sim-dispatch-{strategyId}` | Industrial Nest | — | FORGE |
| `industrial-sim-sensitivity-{strategyId}` | Industrial Nest | — | FORGE |
| `developer:zone-revenue-24m` | Developer Nest | — | CONDUIT |
| `developer:binding-constraints-12mo` | Developer Nest | — | CONDUIT |
| `analytics:price-intel-overlay` | Analytics | — | CONDUIT |
| `analytics:price-intel-components` | Analytics | — | CONDUIT |
| `analytics:battery-schedule` | Analytics | — | CONDUIT |
| `analytics:convergence-overlay` | Analytics | — | CONDUIT |
| `analytics:convergence-spread` | Analytics | — | CONDUIT |
| `journal:pnl` | Trader Journal | — | CONDUIT |
| `vault:case-study:{studyId}:lmp-24h` | Vault | — | CONDUIT |

`hideToolbar` was applied wherever the chart was ≤120px tall. The
toolbar is 26px tall and floats with an 8px inset, leaving too little
room on small sparklines. With `hideToolbar`, existing dots still
render (read-only); users who need to add notes do so from the
larger detailed chart on the same surface.

## Charts deliberately not wrapped

| Component | Reason |
| --- | --- |
| `nest/everyone/EveryoneNest.tsx` | Not in CONDUIT's Wave 2 ownership list. |
| `nest/trader/ZoneWatchlist.tsx` | 5 per-row sparklines at ~30px each — wrapping each would clutter the watchlist with toolbars; `hideToolbar` would just spam silent overlay layers. |
| `nest/trader/AnomalyFeed.tsx` | No chart — list-of-cards layout. |
| `nest/trader/PeregrinePreview.tsx` | No chart. |
| `nest/trader/tiles/BessTile.tsx` | No Recharts chart — only a custom-SVG SOC dial gauge. |
| `nest/trader/tiles/FuelMixTile.tsx` | No chart — color-coded numeric grid. |
| `nest/student/StudentNest.tsx` | Placeholder content, no charts. |
| `analytics/tabs/SparkSpread.tsx` | Brief explicitly excluded the Dispatch Frontier SVG. No Recharts in the tab. |
| `analytics/tabs/MarginalFuel.tsx` | Custom-SVG fuel gantt and reserve plot — not Recharts. |
| `peregrine/*` | No Recharts charts in any Peregrine surface. |
| `atlas/GridAtlasView.tsx`, `atlas/GridAtlasMap.tsx` | Mapbox 3D surfaces — out of scope (need a different annotation layer). |
| `vault/Lesson.tsx`, `vault/Entry.tsx` | Curriculum prose; the diagrams that exist are decorative SVG. |

## chartId conventions

CONDUIT uses **colon-separated** identifiers throughout:
`<surface>:<chart>[:<scope>]`. The two FORGE-owned simulator charts
use **dash-separated** ids (`industrial-sim-dispatch-{strategyId}`)
because they predate the convention. The registry's `getChartMeta`
helper accepts either form.

Per-instance scope examples:

- `trader:lmp-24h:WEST_HUB` — when a different zone renders, the
  trailing segment changes and the wrapper re-mounts (verified — the
  chartId flows through to `useAnnotations` which keys on it).
- `vault:case-study:storm-elliott:lmp-24h` — case study id in the
  middle, chart id at the end.
- `industrial:sim-carbon-strategy-3` — strategy id appended.

## Layout impact (verified zero-regression intent)

`AnnotatableChart` renders an outer
`<div style={{ position: 'relative', width: '100%', height: '100%' }}>`.
Every wrapped site already had a parent that set explicit dimensions
(either a `<div style={{ height: N }}>` shell or a flex/grid cell with
`flex: 1; minHeight: N`), so the wrapper inherits the correct size.

Two sites have stricter parent geometries that are worth re-checking
visually after merge:

- **Storage `storage:asset-revenue`** — the wrapper sits inside a row
  with `display: flex; gap: S.xxl` and the chart parent has
  `height: 120; flex: 1; minWidth: 240`. The wrapper passes through
  `width: 100%; height: 100%` cleanly.
- **Developer `developer:zone-revenue-24m`** — the wrapper is the
  left cell of a `gridTemplateColumns: '1fr 200px'` grid; the chart
  parent has `height: 220`. Same deal.

Neither was visually verified on every viewport in this sprint;
chart owners should confirm during the next pass.

## How to wrap a new chart

For chart owners landing new visualizations:

```tsx
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';

// Wrap the inner chart container, not the surrounding card.
<div style={{ height: 280 }}>
  <AnnotatableChart chartId="myprofile:my-chart-name">
    <ResponsiveContainer width="100%" height="100%">
      {/* recharts chart */}
    </ResponsiveContainer>
  </AnnotatableChart>
</div>
```

If the chart is ≤120px tall or has its own corner controls that
would clash with the wrapper's toolbar, pass `hideToolbar`.

If multiple chart instances share data shape but render different
slices, suffix the chartId with the slice key:

```tsx
<AnnotatableChart chartId={`mysurface:my-chart:${zoneId}`}>
```

After adding a new chart, add a row to `src/lib/annotatableCharts.ts`
so the platform-wide registry stays accurate.

## Persistence model (unchanged from Wave 1)

Annotations persist to `localStorage` under `gridalpha-annotations`.
They survive tab close. When the FastAPI backend lands, the persist
layer should mirror writes server-side. The hook surface
(`useAnnotations(chartId)`) does not need to change.

## Build status

- `npx tsc --noEmit`: clean
- `npm run build`: clean
- 21 commits pushed to `feature/full-shell-buildout`, all prefixed
  `conduit:`.

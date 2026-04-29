// CONDUIT Wave 2 — registry of every chart wrapped with `AnnotatableChart`.
//
// Used for analytics, debugging, and any future "show me all annotated
// charts across the platform" feature. The registry is descriptive, not
// load-bearing — wrapping a chart that isn't listed here still works.
// Listing every chart here just keeps the platform legible.
//
// chartId convention: `<surface>:<chart>:<scope?>` where scope is the
// dynamic suffix (zone id, asset id, period, case-study id, strategy id)
// when the same chart instance can serve multiple data slices.
//
// Two FORGE-owned charts (industrial-sim-dispatch / industrial-sim-sensitivity)
// use dashes instead of colons because they pre-date the convention. Both
// are listed below as-is to keep the registry honest.

export interface AnnotatableChartMeta {
  /** Canonical chartId or chartId prefix. If `scope` is set, the wrapped
   *  component appends a scope-suffixed segment (e.g. zone id) at runtime. */
  chartId: string;
  /** Which surface mounts the chart, for grouping in tooling. */
  surface:
    | 'Trader Nest'
    | 'Analyst Nest'
    | 'Storage Nest'
    | 'Industrial Nest'
    | 'Student Nest'
    | 'Developer Nest'
    | 'Analytics'
    | 'Peregrine'
    | 'Vault'
    | 'Trader Journal';
  /** Short human description for the chartId. */
  description: string;
  /** Whether the registered id is the full id or a prefix that gets a
   *  per-instance suffix appended at runtime. */
  scope?: 'global' | 'per-zone' | 'per-asset' | 'per-period' | 'per-case-study' | 'per-strategy';
  /** When true, the wrapped chart hides the corner toolbar (read-only
   *  dot rendering only). */
  hideToolbar?: boolean;
  /** Owning agent — useful when CONDUIT and other agents both register charts. */
  owner?: 'CONDUIT' | 'FORGE';
}

/**
 * Every annotatable chart in the platform. Order = order of wrap rollout.
 * Entries with scope `per-*` register a chartId prefix; the rendered
 * chartId is `<chartId>:<scopeValue>` (or `<chartId>-<scopeValue>` for
 * the two pre-existing dash-style ids). Use `getChartMeta(chartId)` to
 * resolve either form.
 */
export const ANNOTATABLE_CHARTS: AnnotatableChartMeta[] = [
  // ── Trader Nest ────────────────────────────────────────────────
  { chartId: 'trader:hero-lmp', surface: 'Trader Nest', description: 'Hero LMP sparkline above the live readout', scope: 'per-zone', owner: 'CONDUIT' },
  { chartId: 'trader:lmp-24h', surface: 'Trader Nest', description: '24-hour LMP composed chart for the active zone', scope: 'per-zone', owner: 'CONDUIT' },
  { chartId: 'trader:spark-spread', surface: 'Trader Nest', description: 'Spark spread tile sparkline', scope: 'per-zone', hideToolbar: true, owner: 'CONDUIT' },

  // ── Analyst Nest ───────────────────────────────────────────────
  { chartId: 'analyst:comparison-pseg-westhub', surface: 'Analyst Nest', description: 'PSEG vs WEST HUB 90-day comparison line chart', scope: 'global', owner: 'CONDUIT' },
  { chartId: 'analyst:seasonal-pattern', surface: 'Analyst Nest', description: 'Seasonal pattern line chart (12-month rhythm)', scope: 'global', hideToolbar: true, owner: 'CONDUIT' },
  { chartId: 'analyst:anomaly-detection', surface: 'Analyst Nest', description: 'σ-deviation bar chart (per-zone signed bars)', scope: 'global', hideToolbar: true, owner: 'CONDUIT' },

  // ── Storage Nest ───────────────────────────────────────────────
  { chartId: 'storage:asset-revenue', surface: 'Storage Nest', description: 'Per-asset revenue strip (vertical bar)', scope: 'global', hideToolbar: true, owner: 'CONDUIT' },
  { chartId: 'storage:revenue-attribution-30d', surface: 'Storage Nest', description: '30-day stacked-area attribution by source', scope: 'global', owner: 'CONDUIT' },
  { chartId: 'storage:da-bid-optimizer', surface: 'Storage Nest', description: 'Day-ahead optimal bid charge/discharge bars', scope: 'global', owner: 'CONDUIT' },

  // ── Industrial Nest ────────────────────────────────────────────
  { chartId: 'industrial:bill-projection-12mo', surface: 'Industrial Nest', description: '12-month bill projection bar chart', scope: 'global', owner: 'CONDUIT' },
  { chartId: 'industrial:sim-carbon', surface: 'Industrial Nest', description: 'Simulator: cumulative carbon reduction line chart', scope: 'per-strategy', hideToolbar: true, owner: 'CONDUIT' },
  { chartId: 'industrial-sim-dispatch', surface: 'Industrial Nest', description: 'Simulator: hourly dispatch stacked area (FORGE-owned)', scope: 'per-strategy', owner: 'FORGE' },
  { chartId: 'industrial-sim-sensitivity', surface: 'Industrial Nest', description: 'Simulator: NPV sensitivity tornado bars (FORGE-owned)', scope: 'per-strategy', owner: 'FORGE' },

  // ── Student Nest ───────────────────────────────────────────────
  // (no Recharts charts in this sprint — placeholder content only)

  // ── Developer Nest ─────────────────────────────────────────────
  { chartId: 'developer:zone-revenue-24m', surface: 'Developer Nest', description: '24-month zone revenue simulation cumulative line', scope: 'global', owner: 'CONDUIT' },
  { chartId: 'developer:binding-constraints-12mo', surface: 'Developer Nest', description: '12-month constraint frequency horizontal bars', scope: 'global', owner: 'CONDUIT' },

  // ── Analytics ──────────────────────────────────────────────────
  { chartId: 'analytics:price-intel-overlay', surface: 'Analytics', description: 'Price Intelligence — PSEG/WEST_HUB 24h overlay', scope: 'global', owner: 'CONDUIT' },
  { chartId: 'analytics:price-intel-components', surface: 'Analytics', description: 'Price Intelligence — energy/congestion/loss stack', scope: 'global', owner: 'CONDUIT' },
  { chartId: 'analytics:battery-schedule', surface: 'Analytics', description: 'Battery Arb — optimal 24h charge/discharge bars', scope: 'global', owner: 'CONDUIT' },
  { chartId: 'analytics:convergence-overlay', surface: 'Analytics', description: 'Convergence — DA vs RT 24h overlay', scope: 'global', owner: 'CONDUIT' },
  { chartId: 'analytics:convergence-spread', surface: 'Analytics', description: 'Convergence — RT − DA spread bars', scope: 'global', owner: 'CONDUIT' },

  // ── Trader Journal ─────────────────────────────────────────────
  { chartId: 'journal:pnl', surface: 'Trader Journal', description: 'Cumulative P&L line chart of all scored entries', scope: 'global', owner: 'CONDUIT' },

  // ── Peregrine ──────────────────────────────────────────────────
  // (no Recharts charts in PeregrineFullPage as of Wave 2)

  // ── Vault ──────────────────────────────────────────────────────
  { chartId: 'vault:case-study', surface: 'Vault', description: 'Annotated 24h LMP chart inside a case study', scope: 'per-case-study', owner: 'CONDUIT' },
];

/**
 * Resolve metadata for a chartId. Accepts either the literal id from the
 * registry (`'analytics:convergence-overlay'`) or a runtime-scoped id that
 * has a suffix (`'storage:asset-revenue:bess-001'`,
 * `'industrial-sim-dispatch-strategy-1'`).
 */
export function getChartMeta(chartId: string): AnnotatableChartMeta | undefined {
  // Prefer exact match; fall back to longest prefix match.
  const exact = ANNOTATABLE_CHARTS.find((c) => c.chartId === chartId);
  if (exact) return exact;
  const matches = ANNOTATABLE_CHARTS.filter(
    (c) => chartId.startsWith(`${c.chartId}:`) || chartId.startsWith(`${c.chartId}-`),
  );
  if (matches.length === 0) return undefined;
  matches.sort((a, b) => b.chartId.length - a.chartId.length);
  return matches[0];
}

/** Group registry entries by surface for tooling. */
export function chartsBySurface(): Record<string, AnnotatableChartMeta[]> {
  const out: Record<string, AnnotatableChartMeta[]> = {};
  for (const c of ANNOTATABLE_CHARTS) {
    (out[c.surface] ??= []).push(c);
  }
  return out;
}

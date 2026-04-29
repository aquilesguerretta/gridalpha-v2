// CONDUIT Wave 2 — registry of every chart wrapped with `AnnotatableChart`.
//
// Used for analytics, debugging, and any future "show me all annotated
// charts across the platform" feature. The registry is descriptive, not
// load-bearing — wrapping a chart that isn't listed here still works.
// Listing every chart here just keeps the platform legible.
//
// chartId convention: `<surface>:<chart>:<scope?>` where scope is the
// dynamic suffix (zone id, asset id, period, case-study id) when the
// same chart instance can serve multiple data slices.

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
  scope?: 'global' | 'per-zone' | 'per-asset' | 'per-period' | 'per-case-study';
}

/**
 * Every annotatable chart in the platform. Order = order of wrap rollout.
 * Entries with scope `per-*` register a chartId prefix; the rendered
 * chartId is `<chartId>:<scopeValue>`. Use `getChartMeta(chartId)` to
 * resolve either form.
 */
export const ANNOTATABLE_CHARTS: AnnotatableChartMeta[] = [
  // ── Trader Nest ────────────────────────────────────────────────
  { chartId: 'trader:hero-lmp', surface: 'Trader Nest', description: 'Hero LMP sparkline above the live readout', scope: 'per-zone' },
  { chartId: 'trader:lmp-24h', surface: 'Trader Nest', description: '24-hour LMP composed chart for the active zone', scope: 'per-zone' },
  { chartId: 'trader:spark-spread', surface: 'Trader Nest', description: 'Spark spread tile sparkline', scope: 'per-zone' },

  // ── Analyst Nest ───────────────────────────────────────────────
  { chartId: 'analyst:zone-correlation', surface: 'Analyst Nest', description: 'Zone correlation heatmap / matrix', scope: 'global' },
  { chartId: 'analyst:comparison-series', surface: 'Analyst Nest', description: 'Multi-series comparison chart', scope: 'global' },

  // ── Storage Nest ───────────────────────────────────────────────
  { chartId: 'storage:asset-revenue', surface: 'Storage Nest', description: 'Per-asset revenue attribution chart', scope: 'per-asset' },
  { chartId: 'storage:cycling-tracker', surface: 'Storage Nest', description: 'Cycle/revenue tracker line chart', scope: 'global' },

  // ── Industrial Nest ────────────────────────────────────────────
  { chartId: 'industrial:bill-projection', surface: 'Industrial Nest', description: 'Monthly bill projection chart', scope: 'global' },
  { chartId: 'industrial:carbon-intensity', surface: 'Industrial Nest', description: 'Carbon intensity timeline', scope: 'global' },

  // ── Student Nest ───────────────────────────────────────────────
  { chartId: 'student:sandbox-pnl', surface: 'Student Nest', description: 'Sandbox P&L chart', scope: 'global' },

  // ── Developer Nest ─────────────────────────────────────────────
  { chartId: 'developer:zone-revenue', surface: 'Developer Nest', description: 'Per-zone 24-month revenue history', scope: 'per-zone' },
  { chartId: 'developer:binding-constraints', surface: 'Developer Nest', description: '12-month binding constraints series', scope: 'global' },

  // ── Analytics ──────────────────────────────────────────────────
  { chartId: 'analytics:price-intel-overlay', surface: 'Analytics', description: 'Price Intelligence — overlay chart', scope: 'global' },
  { chartId: 'analytics:price-intel-components', surface: 'Analytics', description: 'Price Intelligence — components breakdown', scope: 'global' },
  { chartId: 'analytics:battery-schedule', surface: 'Analytics', description: 'Battery Arb — optimal dispatch schedule', scope: 'global' },
  { chartId: 'analytics:battery-sensitivity', surface: 'Analytics', description: 'Battery Arb — sensitivity matrix', scope: 'global' },
  { chartId: 'analytics:marginal-fuel-reserve', surface: 'Analytics', description: 'Marginal Fuel — 24h reserve margin', scope: 'global' },
  { chartId: 'analytics:convergence', surface: 'Analytics', description: 'Convergence — 24h DA/RT divergence', scope: 'global' },

  // ── Trader Journal ─────────────────────────────────────────────
  { chartId: 'journal:pnl', surface: 'Trader Journal', description: 'Cumulative P&L over the selected period', scope: 'per-period' },

  // ── Peregrine ──────────────────────────────────────────────────
  { chartId: 'peregrine:hero', surface: 'Peregrine', description: 'Peregrine hero story sparkline', scope: 'global' },

  // ── Vault ──────────────────────────────────────────────────────
  { chartId: 'vault:case-study', surface: 'Vault', description: 'Charts embedded in a case study writeup', scope: 'per-case-study' },
];

/**
 * Resolve metadata for a chartId. Accepts either the literal id from the
 * registry (`'analytics:convergence'`) or a runtime-scoped id that has
 * a suffix (`'storage:asset-revenue:bess-001'`).
 */
export function getChartMeta(chartId: string): AnnotatableChartMeta | undefined {
  // Prefer exact match; fall back to longest prefix match so that
  // `trader:lmp-24h` wins over `trader:lmp` for `trader:lmp-24h:WEST_HUB`.
  const exact = ANNOTATABLE_CHARTS.find((c) => c.chartId === chartId);
  if (exact) return exact;
  const matches = ANNOTATABLE_CHARTS.filter((c) => chartId.startsWith(`${c.chartId}:`));
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

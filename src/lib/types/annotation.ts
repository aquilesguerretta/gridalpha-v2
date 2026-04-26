// CONDUIT — annotation types.
// A note dropped on a chart at a specific normalized coordinate. Generic
// across chart kinds — Recharts, Mapbox, Vault timelines — because the
// AnnotationLayer wrapper sits over any container and stores positions
// as 0..1 fractions of the container's width/height.

export interface Annotation {
  id: string;
  /** A stable string identifying the chart this annotation lives on.
   *  Pattern: "<screen>:<chart-id>", e.g. "trader-nest:lmp-24h",
   *  "vault:storm-elliott-chart". */
  chartId: string;
  /** X coordinate within the chart, 0..1 normalized. */
  xNormalized: number;
  /** Y coordinate within the chart, 0..1 normalized. */
  yNormalized: number;
  /** The note body. */
  text: string;
  /** ISO timestamp at creation. */
  createdAt: string;
  /** ISO timestamp of last edit. */
  updatedAt: string;
  /** Sequential number within this chart, assigned at creation time and
   *  rendered inside the marker. Stable across renames or text edits. */
  sequence: number;
}

export interface AnnotationDraft {
  chartId: string;
  xNormalized: number;
  yNormalized: number;
  text: string;
}

// src/lib/shared/formatters.ts
// Pure formatting and coordinate math utilities.
// No component imports. No side effects.

/** Format an ISO UTC timestamp to "HH:mm UTC" display string. */
export function formatTimeUTC(isoString: string): string {
  try {
    const d  = new Date(isoString);
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm} UTC`;
  } catch {
    return "--:--";
  }
}

/** Map a price value to an SVG Y coordinate within a chart. */
export function priceToY(
  price:    number,
  priceMin: number,
  priceMax: number,
  chartH:   number,
  padding = 20,
): number {
  return (
    chartH -
    padding -
    ((price - priceMin) / (priceMax - priceMin)) * (chartH - padding * 2)
  );
}

/** Map a data index to an SVG X coordinate within a chart. */
export function indexToX(index: number, total: number, chartW: number): number {
  return (index / (total - 1)) * chartW;
}

/** Build a polyline `points` string from a values array within SVG bounds. */
export function buildSparklinePoints(
  values:   number[],
  width  = 200,
  height = 40,
): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
}

/** Format a dollar value for display: "$48.32" */
export function formatPrice(value: number, decimals = 2): string {
  return `$${value.toFixed(decimals)}`;
}

/** Format a percentage for display: "+2.4%" */
export function formatDelta(delta: number, decimals = 1): string {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(decimals)}%`;
}

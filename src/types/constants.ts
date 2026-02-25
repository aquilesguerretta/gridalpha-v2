/**
 * GridAlpha V2 — Runtime constants.
 *
 * All values are `as const` so they can be used as literal types.
 */

/** FPS threshold below which the renderer drops to a lower LOD. */
export const PERF_DOWNGRADE_FPS = 30 as const;

/** FPS threshold above which the renderer promotes to a higher LOD. */
export const PERF_UPGRADE_FPS = 45 as const;

/** Sustained duration (ms) below PERF_DOWNGRADE_FPS before downgrade fires. */
export const PERF_DOWNGRADE_DURATION_MS = 5_000 as const;

/** Sustained duration (ms) above PERF_UPGRADE_FPS before upgrade fires. */
export const PERF_UPGRADE_DURATION_MS = 3_000 as const;

/** Milliseconds without a fresh frame before data is marked STALE. */
export const STALE_DATA_THRESHOLD_MS = 30_000 as const;

/** Opacity applied to spatial elements while reconnecting. */
export const RECONNECT_OPACITY = 0.5 as const;

/** Hours of history retained in the client-side ring buffer. */
export const RING_BUFFER_HOURS = 48 as const;

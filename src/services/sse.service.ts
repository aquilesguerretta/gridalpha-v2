/**
 * GridAlpha V2 — Server-Sent Events (SSE) service scaffold.
 *
 * Typed EventSource wrapper that streams {@link LiveDataFrame} objects.
 * Does NOT connect to a real endpoint yet — wired up in a later sprint.
 */

import type { LiveDataFrame } from "../types/index";

/**
 * Opens an SSE connection to `url`, parses each event as a
 * {@link LiveDataFrame}, and forwards it to `onMessage`.
 *
 * @param url       Full SSE endpoint URL.
 * @param onMessage Callback invoked with every parsed frame.
 * @param onError   Optional callback for connection-level errors.
 * @returns         A cleanup function that closes the underlying EventSource.
 */
export function createSSEConnection(
  url: string,
  onMessage: (frame: LiveDataFrame) => void,
  onError?: (err: Event) => void,
): () => void {
  const source = new EventSource(url);

  source.onmessage = (event: MessageEvent<string>) => {
    try {
      const frame: LiveDataFrame = JSON.parse(event.data) as LiveDataFrame;

      // Surface data-quality degradation early in the console.
      if (frame.data_quality === "STALE") {
        console.warn(
          `[SSE] zone=${frame.zone_id} data_quality=STALE — upstream may be delayed`,
        );
      }
      if (frame.data_quality === "RECONNECTING") {
        console.warn(
          `[SSE] zone=${frame.zone_id} data_quality=RECONNECTING — attempting recovery`,
        );
      }

      onMessage(frame);
    } catch (parseErr) {
      console.error("[SSE] Failed to parse incoming frame:", parseErr);
    }
  };

  source.onerror = (err: Event) => {
    console.error("[SSE] Connection error:", err);
    onError?.(err);
  };

  /** Closes the EventSource and frees resources. */
  return () => {
    source.close();
  };
}

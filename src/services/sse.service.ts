/**
 * GridAlpha V2 — Server-Sent Events (SSE) service + polling bridge.
 *
 * {@link createSSEConnection} — typed EventSource wrapper (future SSE endpoint).
 * {@link startPollingBridge} — polls the V1 REST API and emits LiveDataFrames.
 */

import type { LiveDataFrame } from "../types/index";

// ── V1 backend base URL ─────────────────────────────────────────

const BASE_URL = "https://gridalpha-production.up.railway.app";

// ── raw V1 /lmp row shape ───────────────────────────────────────

interface V1LmpRow {
  zone_name: string;
  lmp_total: number;
  energy_component: number;
  congestion_component: number;
  loss_component: number;
  timestamp: string;
  timestamp_utc: string;
}

interface V1LmpResponse {
  meta: {
    api_version: string;
    is_demo: boolean;
    data_quality: string;
    [key: string]: unknown;
  };
  data: V1LmpRow[];
  summary: Record<string, unknown>;
}

// ── mapper: V1 row → LiveDataFrame ──────────────────────────────

function mapRowToFrame(row: V1LmpRow, quality: string): LiveDataFrame {
  return {
    timestamp_utc: row.timestamp_utc,
    zone_id: row.zone_name,
    lmp_total: row.lmp_total,
    congestion: row.congestion_component,
    gen_mix: {},
    load_forecast_mw: 0,
    actual_load_mw: 0,
    is_interpolated: false,
    data_quality: quality === "LIVE" ? "LIVE" : "STALE",
    alert_payload: null,
  };
}

// ── polling bridge ──────────────────────────────────────────────

const POLL_INTERVAL_MS = 30_000;
const LIVE_URL = `${BASE_URL}/lmp?zone=PJM-RTO&snapshot=false&hours=1`;
const DEMO_URL = `${BASE_URL}/lmp?demo=true`;

/**
 * Polls the V1 /lmp endpoint every 30 s, maps each row to a
 * {@link LiveDataFrame}, and forwards it to `onFrame`.
 *
 * Falls back to `?demo=true` when the live response returns an
 * empty data array (common outside PJM market hours).
 *
 * @returns A cleanup function that stops the polling interval.
 */
export function startPollingBridge(
  onFrame: (frame: LiveDataFrame) => void,
): () => void {
  let stopped = false;

  async function poll(): Promise<void> {
    if (stopped) return;

    try {
      // Try live first
      let res = await fetch(LIVE_URL);
      let body = (await res.json()) as V1LmpResponse;

      // Fallback to demo when live is empty
      if (!body.data || body.data.length === 0) {
        console.warn("[Poll] Live data empty — falling back to demo endpoint");
        res = await fetch(DEMO_URL);
        body = (await res.json()) as V1LmpResponse;
      }

      const quality = body.meta?.data_quality ?? "LIVE";

      // Find PJM-RTO aggregate row; fall back to first row
      const rtoRow =
        body.data.find((r) => r.zone_name === "PJM-RTO") ?? body.data[0];

      if (rtoRow) {
        const frame = mapRowToFrame(rtoRow, quality);
        onFrame(frame);
        console.log(
          `[Poll] ${frame.zone_id} LMP=$${frame.lmp_total} quality=${frame.data_quality}`,
        );
      }
    } catch (err) {
      console.error("[Poll] Fetch failed:", (err as Error).message);

      // Emit a RECONNECTING sentinel so the UI can show status
      onFrame({
        timestamp_utc: new Date().toISOString(),
        zone_id: "PJM-RTO",
        lmp_total: 0,
        congestion: 0,
        gen_mix: {},
        load_forecast_mw: 0,
        actual_load_mw: 0,
        is_interpolated: false,
        data_quality: "RECONNECTING",
        alert_payload: null,
      });
    }
  }

  // Fire immediately, then every POLL_INTERVAL_MS
  void poll();
  const handle = setInterval(() => void poll(), POLL_INTERVAL_MS);

  return () => {
    stopped = true;
    clearInterval(handle);
  };
}

// ── SSE wrapper (retained for future SSE endpoint) ──────────────

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

  return () => {
    source.close();
  };
}

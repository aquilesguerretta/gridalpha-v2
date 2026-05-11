// FORGE Wave 4 — useLMPStream(): SSE consumer with reconnect.
// Wraps the single shared EventSource at `services/api/stream.ts`. Each
// hook instance is a thin React layer over the same underlying source
// — subscribing/unsubscribing on mount/unmount, and reflecting
// connection status into a state variable so the UI can render the
// "LIVE" affordance.

import { useCallback, useEffect, useState } from 'react';
import type {
  HeartbeatStreamUpdate,
  LMPStreamUpdate,
  OutageStreamUpdate,
} from '@/lib/types/api';
import {
  streamStatus,
  subscribeHeartbeat,
  subscribeLMP,
  subscribeOutages,
  subscribeStatus,
  type StreamConnectionStatus,
} from '@/services/api/stream';

export interface UseLMPStreamApi {
  /** Current connection status. */
  connectionStatus: StreamConnectionStatus;
  /** Most recent LMP update across all subscribed zones. */
  lastLMPUpdate: LMPStreamUpdate | null;
  /** Most recent outage event. */
  lastOutage: OutageStreamUpdate | null;
  /** Most recent heartbeat (UTC ISO timestamp). */
  lastHeartbeatAt: string | null;
  /** Register a per-zone listener for `lmp-update` events. */
  subscribe(zone: string, cb: (u: LMPStreamUpdate) => void): () => void;
  /** Register a listener for outage events. */
  subscribeOutages(cb: (u: OutageStreamUpdate) => void): () => void;
}

/**
 * Page-level stream consumer. Mount once at a high-level component
 * (the Trader Nest's ZoneWatchlist mounts this in practice). The
 * returned `subscribe` / `subscribeOutages` callbacks register
 * additional listeners; the unsubscribe function returned by each
 * call cleans up the registration.
 */
export function useLMPStream(): UseLMPStreamApi {
  const [connectionStatus, setConnectionStatus] = useState<
    StreamConnectionStatus
  >(() => streamStatus());
  const [lastLMPUpdate, setLastLMPUpdate] = useState<LMPStreamUpdate | null>(
    null,
  );
  const [lastOutage, setLastOutage] = useState<OutageStreamUpdate | null>(null);
  const [lastHeartbeatAt, setLastHeartbeatAt] = useState<string | null>(null);

  useEffect(() => {
    const unsubStatus = subscribeStatus(setConnectionStatus);
    const unsubHeartbeat = subscribeHeartbeat((u: HeartbeatStreamUpdate) => {
      setLastHeartbeatAt(u.timestamp);
    });
    return () => {
      unsubStatus();
      unsubHeartbeat();
    };
  }, []);

  const subscribe = useCallback(
    (zone: string, cb: (u: LMPStreamUpdate) => void): (() => void) => {
      const wrapped = (u: LMPStreamUpdate) => {
        setLastLMPUpdate(u);
        cb(u);
      };
      return subscribeLMP(zone, wrapped);
    },
    [],
  );

  const subscribeOutagesPublic = useCallback(
    (cb: (u: OutageStreamUpdate) => void): (() => void) => {
      const wrapped = (u: OutageStreamUpdate) => {
        setLastOutage(u);
        cb(u);
      };
      return subscribeOutages(wrapped);
    },
    [],
  );

  return {
    connectionStatus,
    lastLMPUpdate,
    lastOutage,
    lastHeartbeatAt,
    subscribe,
    subscribeOutages: subscribeOutagesPublic,
  };
}

// ATLAS Wave 3 — useAtlasHistorical.
//
// Mounted once at the GridAtlasView root. Watches `activeEventId`
// on the time-travel store; when it changes, fires the multi-zone
// /api/lmp/history fetch, reports per-zone progress, builds
// AtlasSnapshot[] from the response, and pushes them into the
// store via `setEventSnapshots`.
//
// MOCK_MODE fallback (Phase 9) routes to `atlas-historical-mock.ts`
// so offline dev still gets working time-travel.

import { useEffect, useRef } from 'react';
import { useTimeTravelStore } from '@/stores/timeTravelStore';
import { getEvent } from '@/lib/atlas/eventLibrary';
import { fetchHistoricalWindow } from '@/services/api/atlasHistory';
import { buildSnapshotsFromWindow } from '@/lib/atlas/snapshotBuilder';
import { MOCK_MODE } from '@/services/api/client';
import { loadMockEventSnapshots } from '@/lib/atlas/mockFallback';

/**
 * Mounts the event-loading machinery for the time-travel surface.
 * Returns nothing — all side effects flow through the store.
 *
 * Usage: call once at the root of GridAtlasView (Phase 10 wiring).
 */
export function useAtlasHistorical(): void {
  const activeEventId = useTimeTravelStore((s) => s.activeEventId);

  // Latest abort controller so a fast event-switch cancels in-flight fetches.
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Tear down any prior fetch.
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (!activeEventId) return;

    const event = getEvent(activeEventId);
    if (!event) return;

    const controller = new AbortController();
    abortRef.current = controller;

    const store = useTimeTravelStore.getState();
    store.setLoadingEvent(true);
    store.setLoadingProgress(0);
    store.setLoadError(null);

    // MOCK_MODE — short-circuit to the Wave 2 curated mocks. Awaits one
    // microtask so the loading spinner is at least visible to the user.
    if (MOCK_MODE) {
      let cancelled = false;
      (async () => {
        useTimeTravelStore.getState().setLoadingProgress(0.5);
        await new Promise((r) => setTimeout(r, 300));
        if (cancelled) return;
        const snapshots = loadMockEventSnapshots(activeEventId);
        useTimeTravelStore.getState().setLoadingProgress(1);
        useTimeTravelStore.getState().setEventSnapshots(snapshots);
        useTimeTravelStore.getState().setLoadingEvent(false);
      })().catch((err) => {
        useTimeTravelStore.getState().setLoadError(
          err instanceof Error ? err.message : 'mock load failed',
        );
        useTimeTravelStore.getState().setLoadingEvent(false);
      });
      return () => {
        cancelled = true;
        controller.abort();
      };
    }

    // Live fetch.
    fetchHistoricalWindow(event.startTimestamp, event.endTimestamp, {
      interval: '5min',
      signal: controller.signal,
      onProgress: (done, total) => {
        // Active-event guard — if the user switched events between the
        // fetch firing and a zone returning, skip progress writes.
        const stateNow = useTimeTravelStore.getState();
        if (stateNow.activeEventId !== activeEventId) return;
        stateNow.setLoadingProgress(done / total);
      },
    })
      .then((window) => {
        // Active-event guard for the final result too.
        const stateNow = useTimeTravelStore.getState();
        if (stateNow.activeEventId !== activeEventId) return;

        const snapshots = buildSnapshotsFromWindow(window);
        if (snapshots.length === 0) {
          stateNow.setLoadError(
            `No history returned for ${event.name}. Falling back to live view.`,
          );
          stateNow.setLoadingEvent(false);
          return;
        }
        stateNow.setEventSnapshots(snapshots);
        stateNow.setLoadingEvent(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        const stateNow = useTimeTravelStore.getState();
        if (stateNow.activeEventId !== activeEventId) return;
        stateNow.setLoadError(
          err instanceof Error ? err.message : 'historical fetch failed',
        );
        stateNow.setLoadingEvent(false);
      });

    return () => {
      controller.abort();
    };
  }, [activeEventId]);
}

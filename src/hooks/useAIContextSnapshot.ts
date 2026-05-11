// ORACLE Wave 2 — capture a fresh AIContextSnapshot for the current view.
//
// This hook is the integration point between the AIAssistant component and
// the context provider system. It reads the live router pathname, the
// current auth profile, and a caller-provided zone (or null), then runs
// the matching surface provider to produce a snapshot.
//
// Usage:
//   const snapshot = useAIContextSnapshot({ zone: selectedZone });
//   // pass `snapshot` to useAIChat() and to the system prompt builder.

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTimeTravelStore } from '@/stores/timeTravelStore';
import {
  captureContextSnapshot,
  surfaceFromPathname,
  type AIContextSnapshot,
  type SurfaceContext,
  type SurfaceKey,
} from '@/services/aiContext';

const RECENT_LIMIT = 3;
const RECENT_KEY = 'gridalpha-ai-recent-surfaces';

interface SnapshotOptions {
  /** PJM zone the surface considers "selected". */
  zone?: string | null;
  /** Optional sub-context override merged into the surface snapshot. */
  subContext?: Partial<SurfaceContext>;
  /**
   * Optional explicit surface override. Useful when the AIAssistant is
   * invoked from a non-router context (e.g. an iframe), or when an
   * InlineAITrigger wants to claim a different surface than the URL says.
   */
  surface?: SurfaceKey;
}

/**
 * Returns a memoised AIContextSnapshot for the current view. Re-runs
 * whenever the pathname, profile, or zone changes — so opening the panel,
 * navigating, then reopening produces a fresh snapshot each time.
 */
export function useAIContextSnapshot(
  options: SnapshotOptions = {},
): AIContextSnapshot {
  const location = useLocation();
  const profile = useAuthStore((s) => s.selectedProfile);
  const profileDetails = useAuthStore((s) => s.profileDetails);
  // Wave 4 — subscribe to the time-travel store's mode + active event so
  // the snapshot recomputes when ATLAS enters / exits a replay. The
  // atlas provider reads `useTimeTravelStore.getState()` imperatively;
  // these selectors are purely for memo invalidation.
  const ttMode = useTimeTravelStore((s) => s.mode);
  const ttActiveEventId = useTimeTravelStore((s) => s.activeEventId);

  const { zone = null, subContext, surface: surfaceOverride } = options;

  return useMemo(() => {
    const surface =
      surfaceOverride ?? surfaceFromPathname(location.pathname, profile);

    // Recent-surfaces tracking — read the running list from sessionStorage,
    // append the current surface, dedupe-then-trim. We do the write inside
    // the memo so it stays in sync with the snapshot.
    const recentSurfaces = readRecentSurfaces();
    const updatedRecent = pushRecent(recentSurfaces, surface);
    if (updatedRecent.join('|') !== recentSurfaces.join('|')) {
      writeRecentSurfaces(updatedRecent);
    }

    // Decode URL search params into a flat record for the provider.
    const sp = new URLSearchParams(location.search);
    const searchParams: Record<string, string> = {};
    sp.forEach((v, k) => {
      searchParams[k] = v;
    });

    return captureContextSnapshot({
      surface,
      pathname: location.pathname,
      searchParams,
      profile,
      profileDetails: profileDetails ?? undefined,
      selectedZone: zone,
      subContext,
      recentSurfaces: updatedRecent,
    });
  }, [
    location.pathname,
    location.search,
    profile,
    profileDetails,
    zone,
    subContext,
    surfaceOverride,
    // Wave 4 — recompute when the Atlas time-travel state changes.
    ttMode,
    ttActiveEventId,
  ]);
}

// ─── recent-surfaces session storage ─────────────────────────────────

function readRecentSurfaces(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function writeRecentSurfaces(value: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(RECENT_KEY, JSON.stringify(value));
  } catch {
    /* sessionStorage quota or disabled — non-fatal */
  }
}

function pushRecent(existing: string[], surface: string): string[] {
  const next = [...existing.filter((s) => s !== surface), surface];
  return next.slice(-RECENT_LIMIT);
}

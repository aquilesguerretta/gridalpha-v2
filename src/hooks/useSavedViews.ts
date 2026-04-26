import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSavedViewsStore } from '@/stores/savedViewsStore';
import { useAuthStore } from '@/stores/authStore';
import {
  buildShareableUrl,
  viewKeyFromPathname,
} from '@/services/viewSerialization';
import type { ViewSnapshot } from '@/services/viewSerialization';

// CONDUIT — high-level hook for capturing/restoring saved views and
// producing shareable URLs.
//
// View identity is derived from the route pathname (matching the pattern
// used by `dev/ProfileSwitcher`). Profile is read from `authStore`. Zone
// is not currently captured because it lives as React state inside
// `GlobalShell` and there is no global zone store yet — when ARCHITECT
// introduces a viewStore, wire `zone` here. For now `zone` is null in
// every snapshot and zone restoration is a no-op.

export function useSavedViews() {
  const views = useSavedViewsStore((s) => s.views);
  const saveView = useSavedViewsStore((s) => s.saveView);
  const deleteView = useSavedViewsStore((s) => s.deleteView);
  const renameView = useSavedViewsStore((s) => s.renameView);
  const togglePin = useSavedViewsStore((s) => s.togglePin);

  const navigate = useNavigate();
  const location = useLocation();
  const profile = useAuthStore((s) => s.selectedProfile);

  /** Capture the current view state into a snapshot. */
  const captureCurrentView = useCallback((): ViewSnapshot => {
    return {
      version: 1,
      view: viewKeyFromPathname(location.pathname),
      profile,
      zone: null,
      pathname: location.pathname,
      payload: {},
      savedAt: new Date().toISOString(),
    };
  }, [profile, location.pathname]);

  /** Save the current view with a name. */
  const saveCurrentAs = useCallback(
    (name: string) => {
      const snapshot = captureCurrentView();
      return saveView(name, snapshot);
    },
    [captureCurrentView, saveView],
  );

  /** Restore a saved view — navigates to its pathname. */
  const restoreView = useCallback(
    (id: string) => {
      const target = views.find((v) => v.id === id);
      if (!target) return;
      navigate(target.snapshot.pathname);
      // Zone restoration intentionally omitted — see file header.
    },
    [views, navigate],
  );

  /** Build a shareable URL for the current view. */
  const buildShareLink = useCallback((): string => {
    const snapshot = captureCurrentView();
    return buildShareableUrl(snapshot, window.location.origin);
  }, [captureCurrentView]);

  /** Copy the current view's share link to clipboard. */
  const copyShareLink = useCallback(async () => {
    const url = buildShareLink();
    await navigator.clipboard.writeText(url);
  }, [buildShareLink]);

  /** Build a share link for a specific saved view. */
  const buildShareLinkFor = useCallback((id: string): string | null => {
    const target = views.find((v) => v.id === id);
    if (!target) return null;
    return buildShareableUrl(target.snapshot, window.location.origin);
  }, [views]);

  /** Copy the share link of a specific saved view. */
  const copyShareLinkFor = useCallback(async (id: string) => {
    const url = buildShareLinkFor(id);
    if (!url) return;
    await navigator.clipboard.writeText(url);
  }, [buildShareLinkFor]);

  return {
    views,
    captureCurrentView,
    saveCurrentAs,
    restoreView,
    deleteView,
    renameView,
    togglePin,
    buildShareLink,
    copyShareLink,
    buildShareLinkFor,
    copyShareLinkFor,
  };
}

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { readSnapshotFromUrl } from '@/services/viewSerialization';

// CONDUIT — on app mount, check the URL for a `?v=...` parameter and
// restore the encoded view if present. After restoration the param is
// stripped from the URL so it doesn't pollute future navigations or
// bookmarks.
//
// Profile restoration is intentionally skipped — switching profiles
// mid-session is a UX surprise. Zone restoration is also a no-op in
// this sprint (see `useSavedViews`). Pathname is the load-bearing
// piece: redirect happens via `navigate(snap.pathname)`.

export function useShareableUrl() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const snapshot = readSnapshotFromUrl();
    if (!snapshot) return;

    const targetPath = snapshot.pathname || location.pathname;
    // Strip the v= param from URL after restore by replacing in place.
    if (targetPath !== location.pathname) {
      navigate(targetPath, { replace: true });
    } else {
      navigate(location.pathname, { replace: true });
    }
    // Run only once on mount; navigate/location refs are stable enough
    // for this single-shot effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

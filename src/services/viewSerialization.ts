// CONDUIT — view serialization service.
// Encodes/decodes the user's current view location into a compact, URL-safe
// snapshot so that views can be saved, restored, and shared via URL.
//
// `ViewKey` is defined locally here rather than imported from a hypothetical
// `@/stores/viewStore` because no such store exists yet — the platform
// derives the active destination from the route pathname (see ProfileSwitcher).
// When ARCHITECT introduces a viewStore the canonical type can move there
// and re-export from this module.

/** The five top-level destinations the shell can mount. Mirrors the local
 *  `ViewKey` defined in `dev/ProfileSwitcher.tsx` and the `id` values in
 *  `GlobalShell.navItems`. */
export type ViewKey =
  | 'nest'
  | 'atlas'
  | 'peregrine'
  | 'analytics'
  | 'vault';

/**
 * A snapshot of platform state that, when restored, reconstructs the view
 * the user was looking at. Captures route, profile, zone, and any view-
 * specific state expressed as a JSON-serializable record.
 */
export interface ViewSnapshot {
  /** schema version for future migration */
  version: 1;
  /** which top-level destination */
  view: ViewKey;
  /** active profile when the view was saved */
  profile: string | null;
  /** primary zone selection if applicable */
  zone: string | null;
  /** the URL pathname this view corresponds to */
  pathname: string;
  /** opaque per-view state (analytics tab, scroll, filters, etc.) */
  payload: Record<string, unknown>;
  /** ISO timestamp the view was saved */
  savedAt: string;
}

const URL_PARAM = 'v';

/** Encode a snapshot into a compact base64url string for URL sharing. */
export function encodeSnapshot(snap: ViewSnapshot): string {
  const json = JSON.stringify(snap);
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode a snapshot from URL string. Returns null if invalid. */
export function decodeSnapshot(encoded: string): ViewSnapshot | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = padded.length % 4 === 0 ? 0 : 4 - (padded.length % 4);
    const json = atob(padded + '='.repeat(padLen));
    const parsed = JSON.parse(json) as { version?: number };
    if (parsed.version !== 1) return null;
    return parsed as ViewSnapshot;
  } catch {
    return null;
  }
}

/** Build a URL containing the encoded view. */
export function buildShareableUrl(snap: ViewSnapshot, origin: string): string {
  const encoded = encodeSnapshot(snap);
  return `${origin}${snap.pathname}?${URL_PARAM}=${encoded}`;
}

/** Read a snapshot off the current URL. Returns null if no v= param. */
export function readSnapshotFromUrl(): ViewSnapshot | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(URL_PARAM);
  if (!encoded) return null;
  return decodeSnapshot(encoded);
}

/** Derive a `ViewKey` from a pathname. Falls back to 'nest' for unknowns. */
export function viewKeyFromPathname(pathname: string): ViewKey {
  if (pathname.startsWith('/peregrine')) return 'peregrine';
  if (pathname.startsWith('/analytics')) return 'analytics';
  if (pathname.startsWith('/atlas'))     return 'atlas';
  if (pathname.startsWith('/vault'))     return 'vault';
  if (pathname.startsWith('/nest'))      return 'nest';
  return 'nest';
}

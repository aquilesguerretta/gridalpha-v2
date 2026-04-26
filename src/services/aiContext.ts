import type { ProfileType } from '@/stores/authStore';

// View keys mirror the NavState union in GlobalShell. Defined here locally
// because `src/stores/viewStore.ts` (ARCHITECT-owned) has not shipped yet —
// once it does, this type can be re-imported from there without changing
// any consumer code.
export type ViewKey =
  | 'nest'
  | 'atlas'
  | 'peregrine'
  | 'analytics'
  | 'vault'
  | 'lmp'
  | 'spread'
  | 'battery'
  | 'gap'
  | 'genmix';

interface ContextInput {
  profile: ProfileType | null;
  view: ViewKey | string;
  zone: string | null;
}

/**
 * Builds the context block prepended to the system prompt so Claude knows
 * which screen the user is on, what profile they're using, and which zone
 * is currently selected.
 */
export function buildContextBlock({ profile, view, zone }: ContextInput): string {
  const profileLabel = profile ?? 'unknown profile';
  const viewLabel = labelForView(view);
  const zoneLabel = zone ?? 'no zone selected';

  return [
    `User profile: ${profileLabel}`,
    `Current screen: ${viewLabel}`,
    `Selected zone: ${zoneLabel}`,
  ].join('\n');
}

function labelForView(view: string): string {
  const map: Record<string, string> = {
    nest: 'The Nest (profile-specific dashboard)',
    atlas: 'Grid Atlas (geospatial map)',
    peregrine: 'Peregrine (intelligence feed)',
    analytics: 'Analytics (deep workbench)',
    vault: 'Vault (case studies + Alexandria curriculum)',
    lmp: 'LMP Intelligence full page',
    spread: 'Spark Spread full page',
    battery: 'Battery Arb full page',
    gap: 'Resource Gap full page',
  };
  return map[view] ?? view;
}

/**
 * Derive the current view from a `react-router-dom` pathname. Used by the
 * AI hook until viewStore ships — the pathname is the most reliable source
 * of truth for which top-level destination the user is on.
 */
export function viewFromPathname(pathname: string): ViewKey | string {
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return 'nest';
  if (seg === 'vault') return 'vault';
  return seg;
}

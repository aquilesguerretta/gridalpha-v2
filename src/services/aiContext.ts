// ORACLE Wave 2 — surface-aware context aggregator.
//
// Replaces the Wave 1 buildContextBlock with a richer model: every surface
// the user can be on has a registered "context provider" that produces a
// SurfaceContext snapshot describing what is on screen. The snapshot is
// captured at AIAssistant invocation time and forwarded to the system
// prompt so Claude can answer with reference to what the user is actually
// looking at.

import type { ProfileType } from '@/stores/authStore';

// Re-exported view keys (kept compatible with Wave 1 callers — useful for
// labelling and pathname → key mapping).
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

// One stable identifier per surface the AIAssistant can be invoked on.
// Each value pairs with a registered context provider in PROVIDER_REGISTRY.
export type SurfaceKey =
  | 'trader-nest'
  | 'analyst-nest'
  | 'storage-nest'
  | 'industrial-nest'
  | 'student-nest'
  | 'developer-nest'
  | 'everyone-nest'
  | 'atlas'
  | 'analytics'
  | 'peregrine'
  | 'vault-index'
  | 'vault-case-study'
  | 'vault-alexandria'
  | 'vault-lesson'
  | 'vault-entry'
  | 'unknown';

export interface VisibleDataSummary {
  /**
   * Human-readable description of what is rendered on screen — the model
   * reads this verbatim. Keep concise (2–6 short sentences).
   */
  description: string;
  /** Optional: structured key/value metrics — appended after `description`. */
  metrics?: Record<string, string | number>;
  /** Optional: short alert lines — appended as a bullet list. */
  alerts?: string[];
}

export interface SurfaceContext {
  surface: SurfaceKey;
  surfaceLabel: string;
  /** PJM zone selected on this surface (if applicable). */
  selectedZone?: string | null;
  /** Stable id for the focused entity — e.g. entry slug, case study id. */
  currentItemId?: string;
  /** Human-readable title of the focused entity. */
  currentItemTitle?: string;
  /** Alexandria reading depth (entries only). */
  currentLayer?: 'L1' | 'L2' | 'L3';
  /** Selected sub-view within a multi-tab surface (e.g. analytics tab). */
  selectedTab?: string;
  /** Condensed snapshot of on-screen data — see `VisibleDataSummary`. */
  visibleData?: VisibleDataSummary;
  /** ISO timestamp when the snapshot was captured. */
  timestamp: string;
}

export interface UserContextSummary {
  profile: ProfileType | null;
  selectedZone: string | null;
  /** Last 3 surfaces visited in the current session (oldest → newest). */
  recentSurfaces: string[];
  /** Free-form profile detail bag from authStore — included when present. */
  profileDetails?: Record<string, unknown>;
}

export interface AIContextSnapshot {
  surface: SurfaceContext;
  user: UserContextSummary;
  timestamp: string;
}

/**
 * Inputs every provider has access to. Providers are pure — they read this
 * struct and return a partial SurfaceContext. They do NOT touch React, do
 * NOT call hooks, and do NOT mutate state.
 */
export interface ProviderInput {
  /** Current router pathname — e.g. "/vault/alexandria/entry/what-is-energy". */
  pathname: string;
  /** Decoded URL search params, e.g. { layer: 'L2' }. */
  searchParams: Record<string, string>;
  /** Profile read from authStore.selectedProfile at capture time. */
  profile: ProfileType | null;
  /** Profile detail bag (industry-specific form values). */
  profileDetails: Record<string, unknown> | undefined;
  /**
   * Selected PJM zone if known to the caller. Optional because zone
   * currently lives as React-local state in GlobalShell — until ARCHITECT
   * ships viewStore, the AIAssistant passes whatever sentinel it has.
   */
  selectedZone: string | null;
  /** Optional sub-context override merged in by InlineAITrigger callers. */
  subContext?: Partial<SurfaceContext>;
}

export type ContextProvider = (input: ProviderInput) => Partial<SurfaceContext>;
export type ContextProviderRegistry = Record<SurfaceKey, ContextProvider>;

// Lazy-imported registry — populated in src/services/aiContext.registry.ts.
// We expose a getter rather than a const because the registry has to import
// each provider, and each provider imports lib/mock data (cheap but bulky).
import { PROVIDER_REGISTRY } from './aiContext.registry';
export { PROVIDER_REGISTRY };

// ───────────────────────── Surface inference ─────────────────────────

/**
 * Map a router pathname to the SurfaceKey of the surface that owns it.
 * Pure, deterministic — used by both `useAIContextSnapshot` and tests.
 */
export function surfaceFromPathname(
  pathname: string,
  profile: ProfileType | null,
): SurfaceKey {
  const trimmed = pathname.replace(/\/+$/, '');

  // Vault sub-routes — order matters (most specific first).
  if (trimmed.includes('/vault/alexandria/entry/')) return 'vault-entry';
  if (trimmed.includes('/vault/alexandria/lesson/')) return 'vault-lesson';
  if (trimmed.endsWith('/vault/alexandria')) return 'vault-alexandria';
  if (trimmed === '/vault' || trimmed === '/vault/') return 'vault-index';
  if (trimmed.startsWith('/vault/')) return 'vault-case-study';

  // Top-level destinations.
  if (trimmed.startsWith('/atlas')) return 'atlas';
  if (trimmed.startsWith('/peregrine')) return 'peregrine';
  if (trimmed.startsWith('/analytics')) return 'analytics';

  // Nest is profile-routed in GlobalShell.
  if (trimmed.startsWith('/nest') || trimmed === '' || trimmed === '/') {
    switch (profile) {
      case 'trader':     return 'trader-nest';
      case 'analyst':    return 'analyst-nest';
      case 'storage':    return 'storage-nest';
      case 'industrial': return 'industrial-nest';
      case 'student':    return 'student-nest';
      case 'developer':  return 'developer-nest';
      case 'everyone':   return 'everyone-nest';
      default:           return 'everyone-nest';
    }
  }

  return 'unknown';
}

// Human-readable label for a SurfaceKey — used in the context chip and
// in the system prompt's "Current screen" line.
export function labelForSurface(key: SurfaceKey): string {
  const map: Record<SurfaceKey, string> = {
    'trader-nest':       'Trader Nest',
    'analyst-nest':      'Analyst Nest',
    'storage-nest':      'Storage Nest',
    'industrial-nest':   'Industrial Nest',
    'student-nest':      'Student Nest',
    'developer-nest':    'Developer Nest',
    'everyone-nest':     'The Nest',
    'atlas':             'Grid Atlas',
    'analytics':         'Analytics',
    'peregrine':         'Peregrine',
    'vault-index':       'Vault',
    'vault-case-study':  'Vault · Case Study',
    'vault-alexandria':  'Vault · Alexandria',
    'vault-lesson':      'Vault · Lesson',
    'vault-entry':       'Vault · Entry',
    'unknown':           'GridAlpha',
  };
  return map[key];
}

// ─────────────────── Wave 1 compatibility shims ──────────────────────
// Some Wave 1 callers still import `buildContextBlock` and
// `viewFromPathname`. Keep those exports working — they delegate to the
// new system internally for consistency.

interface LegacyContextInput {
  profile: ProfileType | null;
  view: ViewKey | string;
  zone: string | null;
}

export function buildContextBlock({ profile, view, zone }: LegacyContextInput): string {
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
    nest:      'The Nest (profile-specific dashboard)',
    atlas:     'Grid Atlas (geospatial map)',
    peregrine: 'Peregrine (intelligence feed)',
    analytics: 'Analytics (deep workbench)',
    vault:     'Vault (case studies + Alexandria curriculum)',
    lmp:       'LMP Intelligence full page',
    spread:    'Spark Spread full page',
    battery:   'Battery Arb full page',
    gap:       'Resource Gap full page',
  };
  return map[view] ?? view;
}

export function viewFromPathname(pathname: string): ViewKey | string {
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return 'nest';
  if (seg === 'vault') return 'vault';
  return seg;
}

// ─────────────────────── Snapshot capture API ─────────────────────────
// `captureContextSnapshot` is the entry point that consumers call to get
// a complete AIContextSnapshot for the current view. It runs the matching
// provider, falls back to a generic snapshot if no provider is registered,
// and assembles the user context from the provided auth state.

export interface CaptureInput extends ProviderInput {
  surface: SurfaceKey;
  recentSurfaces: string[];
}

export function captureContextSnapshot(input: CaptureInput): AIContextSnapshot {
  const provider = PROVIDER_REGISTRY[input.surface];
  const partial = provider
    ? provider(input)
    : { surface: input.surface, surfaceLabel: labelForSurface(input.surface) };

  const now = new Date().toISOString();
  const surface: SurfaceContext = {
    surface: input.surface,
    surfaceLabel: labelForSurface(input.surface),
    selectedZone: input.selectedZone,
    timestamp: now,
    ...partial,
    // Caller-supplied subContext overrides anything from the provider —
    // this is how InlineAITrigger injects per-element hints.
    ...(input.subContext ?? {}),
  };

  const user: UserContextSummary = {
    profile: input.profile,
    selectedZone: input.selectedZone,
    recentSurfaces: input.recentSurfaces,
    profileDetails:
      input.profileDetails && Object.keys(input.profileDetails).length > 0
        ? input.profileDetails
        : undefined,
  };

  return { surface, user, timestamp: now };
}

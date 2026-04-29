import type { ReactNode } from 'react';

type Variant = 'standard' | 'hero' | 'subtle';
type Tint =
  | 'analyst'
  | 'storage'
  | 'industrial'
  | 'student'
  | 'developer';

interface Props {
  children: ReactNode;
  /**
   * Neutral white-only vignette intensities. Used by every surface that does
   * NOT belong to a single profile — Vault, Analytics tabs, generic Nest
   * fallback. Default is 'standard'.
   */
  variant?: Variant;
  /**
   * Profile-specific tinted vignette. When passed, overrides `variant`.
   * Each tint is a single subtle wash that gives the profile a distinctive
   * emotional temperature. The tint is ALWAYS additive — it sits on top of
   * the standard white-luminance vignette so the eye still reads the page
   * as the same product.
   *
   * Tints:
   * - analyst:    cool blue-gray (precision, comparison)
   * - storage:    subtle teal-blue (movement, dispatch)
   * - industrial: warm sand (operations, facility)
   * - student:    subtle green (growth, learning)
   * - developer:  warm gold (build, capital)
   */
  tint?: Tint;
}

const VARIANT_GRADIENT: Record<Variant, string> = {
  standard:
    'radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.025) 0%, transparent 70%)',
  hero:
    'radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.035) 0%, transparent 70%)',
  subtle:
    'radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.015) 0%, transparent 70%)',
};

// Each profile tint is the SAME shape as `standard`, but the central wash
// is colored. The tint is intentionally well below 0.025 so the page never
// reads as "the green page" or "the gold page" — it reads as the same
// product with a distinctive temperature.
const TINT_GRADIENT: Record<Tint, string> = {
  analyst:
    'radial-gradient(ellipse 80% 60% at center 30%, rgba(180,200,220,0.020) 0%, transparent 70%), radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.018) 0%, transparent 70%)',
  storage:
    'radial-gradient(ellipse 80% 60% at center 30%, rgba(120,200,220,0.022) 0%, transparent 70%), radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.018) 0%, transparent 70%)',
  industrial:
    'radial-gradient(ellipse 80% 60% at center 30%, rgba(220,200,180,0.022) 0%, transparent 70%), radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.018) 0%, transparent 70%)',
  student:
    'radial-gradient(ellipse 80% 60% at center 30%, rgba(180,220,200,0.020) 0%, transparent 70%), radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.018) 0%, transparent 70%)',
  developer:
    'radial-gradient(ellipse 80% 60% at center 30%, rgba(220,200,160,0.022) 0%, transparent 70%), radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.018) 0%, transparent 70%)',
};

/**
 * The atmospheric vignette layer used on every terminal surface.
 * Mounts as an aria-hidden div at z-index 0; content sits above at z-index 1.
 *
 * Variants (neutral):
 * - 'standard' — every Nest fallback, VaultIndex, Analytics tabs (default)
 * - 'hero' — destinations with a strong hero element (CaseStudyView, Alexandria)
 * - 'subtle' — for surfaces with their own dominant chart
 *
 * Tints (per-profile, override variant):
 * - 'analyst' | 'storage' | 'industrial' | 'student' | 'developer'
 *
 * Wave 1 callers (vault/analytics/nests using `variant`) continue to work
 * unchanged. Wave 2 adds the optional `tint` prop for profile-specific
 * Nests.
 */
export function PageAtmosphere({ children, variant = 'standard', tint }: Props) {
  const background = tint ? TINT_GRADIENT[tint] : VARIANT_GRADIENT[variant];
  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        overflow: 'auto',
        background: '#111117',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

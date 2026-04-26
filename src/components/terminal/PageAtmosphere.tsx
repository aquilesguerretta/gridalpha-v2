import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  variant?: 'standard' | 'hero' | 'subtle';
}

const VARIANTS: Record<NonNullable<Props['variant']>, string> = {
  standard:
    'radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.025) 0%, transparent 70%)',
  hero:
    'radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.035) 0%, transparent 70%)',
  subtle:
    'radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.015) 0%, transparent 70%)',
};

/**
 * The atmospheric vignette layer used on every terminal surface.
 * Mounts as an aria-hidden div at z-index 0; content sits above at z-index 1.
 *
 * Variants:
 * - 'standard' — every Nest, Vault index, Analytics tabs (default)
 * - 'hero' — destinations with a strong hero element (CaseStudyView, Alexandria)
 * - 'subtle' — for surfaces with their own dominant chart (Atlas, deep tabs)
 */
export function PageAtmosphere({ children, variant = 'standard' }: Props) {
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
          background: VARIANTS[variant],
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

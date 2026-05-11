// CHROMA Wave 4 — Skeleton primitive set.
//
// Loading affordance for surfaces wired to async data. Used while the
// first response is in-flight; once data lands, the consumer swaps the
// skeleton for the real component.
//
// Variants:
//   <Skeleton.Line       width={120}        />  single text line, 1em tall
//   <Skeleton.Block      height={120}       />  rectangle for cards/tiles
//   <Skeleton.Circle     size={32}          />  badges, avatars, dots
//   <Skeleton.Chart      height={240}       />  taller block with grid hints
//   <Skeleton.HeroNumber size={64}          />  large block matched to HeroNumber
//
// Visual contract:
//   - bgSurface background, 2px radius (terminal aesthetic, no pills).
//   - Shimmer: 8% cyan band sweeping L→R every 1.6s. Keyframe lives
//     in src/index.css as `ga-skeleton-shimmer`.
//   - No drop shadow.
//
// Accessibility:
//   - aria-busy="true" + role="status" on every variant so screen
//     readers announce loading state.
//   - Consumers should hide the skeleton via aria-hidden if it's
//     purely decorative (i.e., a more meaningful loading message
//     lives elsewhere).

import type { CSSProperties } from 'react';
import { C } from '@/design/tokens';

const SHIMMER_BG =
  // The skeleton itself is bgSurface; the shimmer is an electricBlue
  // band at 8% alpha, sweeping at 80% opacity peak through 1.6s.
  `linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.08) 50%, transparent 100%)`;

function baseStyle(style?: CSSProperties): CSSProperties {
  return {
    position:     'relative',
    background:   C.bgSurface,
    borderRadius: 2,
    overflow:     'hidden',
    ...style,
  };
}

function shimmerOverlay(): CSSProperties {
  return {
    position:    'absolute',
    inset:       0,
    background:  SHIMMER_BG,
    backgroundSize: '200% 100%',
    backgroundRepeat: 'no-repeat',
    animation:   'ga-skeleton-shimmer 1.6s ease-in-out infinite',
    pointerEvents: 'none',
  };
}

// ─── Line ───────────────────────────────────────────────────────────

interface LineProps {
  /** Width in px or any CSS unit. Default 100%. */
  width?: number | string;
  /** Height in px. Defaults to 1em (sits at the body text scale). */
  height?: number | string;
  style?: CSSProperties;
  label?: string;
}

function Line({ width = '100%', height = '1em', style, label }: LineProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label ?? 'Loading'}
      style={baseStyle({ width, height, ...style })}
    >
      <div aria-hidden style={shimmerOverlay()} />
    </div>
  );
}

// ─── Block ──────────────────────────────────────────────────────────

interface BlockProps {
  height: number | string;
  width?: number | string;
  style?: CSSProperties;
  label?: string;
}

function Block({ height, width = '100%', style, label }: BlockProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label ?? 'Loading'}
      style={baseStyle({ width, height, ...style })}
    >
      <div aria-hidden style={shimmerOverlay()} />
    </div>
  );
}

// ─── Circle ─────────────────────────────────────────────────────────

interface CircleProps {
  size: number;
  style?: CSSProperties;
  label?: string;
}

function Circle({ size, style, label }: CircleProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label ?? 'Loading'}
      style={baseStyle({
        width:  size,
        height: size,
        borderRadius: '50%',
        ...style,
      })}
    >
      <div aria-hidden style={shimmerOverlay()} />
    </div>
  );
}

// ─── Chart ──────────────────────────────────────────────────────────
//
// A taller skeleton block with horizontal grid-line hints so the
// loading state telegraphs "chart" rather than "generic block".

interface ChartProps {
  height: number | string;
  width?: number | string;
  /** Number of horizontal grid hint lines. Default 4. */
  gridLines?: number;
  style?: CSSProperties;
  label?: string;
}

function Chart({
  height,
  width = '100%',
  gridLines = 4,
  style,
  label,
}: ChartProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label ?? 'Loading chart'}
      style={baseStyle({ width, height, ...style })}
    >
      {/* Grid hint lines — equally spaced, 1px borderDefault */}
      <div
        aria-hidden
        style={{
          position:      'absolute',
          inset:         0,
          display:       'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding:       '8% 4%',
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: gridLines }).map((_, i) => (
          <div
            key={i}
            style={{
              height:     1,
              background: C.borderDefault,
              opacity:    0.5,
            }}
          />
        ))}
      </div>
      <div aria-hidden style={shimmerOverlay()} />
    </div>
  );
}

// ─── HeroNumber ─────────────────────────────────────────────────────
//
// Matched to FOUNDRY's HeroNumber primitive. The size prop maps to the
// font-size of the actual hero number (default 64), and the skeleton
// renders a block at roughly that height + some breathing room.

interface HeroNumberProps {
  /** The HeroNumber font-size the skeleton stands in for. Default 64. */
  size?: number;
  /** Estimated character count (drives the width). Default 5. */
  digits?: number;
  style?: CSSProperties;
  label?: string;
}

function HeroNumberSkeleton({
  size = 64,
  digits = 5,
  style,
  label,
}: HeroNumberProps) {
  // Display digit width ~= 0.62 × font-size for tabular serif/mono.
  // Add 6% to the height for visual matching.
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label ?? 'Loading hero metric'}
      style={baseStyle({
        width:  Math.round(size * 0.62 * digits),
        height: Math.round(size * 1.06),
        ...style,
      })}
    >
      <div aria-hidden style={shimmerOverlay()} />
    </div>
  );
}

// ─── Public namespaced API ──────────────────────────────────────────

export const Skeleton = {
  Line,
  Block,
  Circle,
  Chart,
  HeroNumber: HeroNumberSkeleton,
};

export default Skeleton;

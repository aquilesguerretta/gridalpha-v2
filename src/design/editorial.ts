// src/design/editorial.ts
// Editorial-context constants for the LANDING PAGE and AUTH FLOW only.
// These colors intentionally live OUTSIDE src/design/tokens.ts because they
// describe a second, narrower visual layer used only for marketing and
// onboarding surfaces. The terminal (Nest, Atlas, Analytics, Vault) must
// NEVER import from this file. If you find yourself reaching for these
// values inside a terminal view, stop and use a token from tokens.ts.
//
// Terminal backgrounds use C.bgBase / C.bgElevated / C.bgSurface / C.bgOverlay.
// Editorial backgrounds use the values below.

/**
 * The base editorial backdrop used behind the landing page and every auth
 * screen. Intentionally one notch bluer-and-darker than C.bgBase to signal
 * "pre-terminal" context.
 */
export const EDITORIAL_BG = '#0A0A0F';

/**
 * Editorial surface shades (card / widget / mock-terminal interiors) used
 * inside landing sections. Each value is a deliberate step off EDITORIAL_BG.
 * These are never used in the terminal; the terminal uses C.bgElevated/Surface.
 */
export const EDITORIAL_SURFACE_DEEP    = '#07070A'; // footer
export const EDITORIAL_SURFACE         = '#0F0F14'; // mini preview cards
export const EDITORIAL_SURFACE_RAISED  = '#14141A'; // widget / terminal preview cards
export const EDITORIAL_SURFACE_HIGHEST = '#1A1A20'; // macbook-frame chrome

/**
 * The editorial accent for the "developer / IPP" profile tile. The primary
 * token system reserves blues for C.electricBlue only; this cyan-teal is an
 * editorial decoration on the landing profile switcher. Not to be used
 * anywhere else.
 */
export const EDITORIAL_DEVELOPER_ACCENT = '#06B6D4';

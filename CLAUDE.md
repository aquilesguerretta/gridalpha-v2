# GridAlpha V2 — Design System Rules

## IDENTITY
This is a professional energy market intelligence terminal.
Visual reference: Bloomberg Terminal × Palantir Gotham × Linear.app
Not: SaaS dashboard, analytics template, Dribbble dark UI shot.

## MANDATORY TOKEN FILE
All colors, spacing, radii, and fonts MUST come from src/design/tokens.ts.
Import: `import { C, F, R, S, T } from '@/design/tokens'`
NEVER hardcode hex values, px values, or font stacks outside tokens.ts.

## TYPOGRAPHY — NON-NEGOTIABLE
- Primary font: Inter (F.sans) for body text and headlines.
- Data font: Geist Mono (F.mono) reserved for data values, prices,
  timestamps, badges, labels, and numeric readouts only.
- 4 sizes maximum per view: 10px labels, 13px secondary, 18-28px primary, 48px display.
- NEVER use Roboto, Arial, system-ui as standalone primary fonts — Inter only.
- NEVER mix font families arbitrarily: Inter for prose, Geist Mono for data.

## EXCEPTION: HeroNumber primitive
src/components/terminal/HeroNumber.tsx is the ONLY terminal component permitted to use F.display (Instrument Serif). Scoped strictly to numeric display (LMP values, spread values, hero metrics). Never for headlines, body text, or labels.

## EDITORIAL DESIGN SYSTEM — SCOPED

GridAlpha has TWO visual layers. They do not mix.

**Terminal layer** — Nest, Atlas, Analytics, Vault.
Governed by all the rules above. Inter + Geist Mono only. Tokens from
`src/design/tokens.ts` only. No F.display. No editorial colors.

**Editorial layer** — the landing page (`/`) and the auth flow
(`/login`, `/signup`, `/signup/profile`, `/signup/details`).
Allowed to use `F.display` (Instrument Serif) for headlines, and the
constants in `src/design/editorial.ts` for backgrounds, mock-surface
shades, and the single developer-profile accent. `F.display` is italic
by convention in this layer.

Hard rules:
- Terminal files must NEVER import from `src/design/editorial.ts`.
- Terminal files must NEVER use `F.display`.
- Editorial primitives (`src/components/editorial/*`) are the only
  components allowed to combine F.display with oversized type.
- Editorial colors (`EDITORIAL_BG`, `EDITORIAL_SURFACE_*`,
  `EDITORIAL_DEVELOPER_ACCENT`) must never appear inside a terminal
  view. If a terminal view needs a darker background, use
  `C.bgBase`/`C.bgElevated`/`C.bgSurface`/`C.bgOverlay` instead.
- Auth pages and landing pages must still pull every color that exists
  in `tokens.ts` (text, accent, status, border, fuel) from `C.*`.
  `src/design/editorial.ts` only covers the narrow set of values that
  do not exist in the terminal token system.
- Instrument Serif is loaded via a Google Fonts `<link>` tag in
  `index.html`. Do not add `@fontsource` packages for it.

If you find yourself reaching for `F.display` or an `EDITORIAL_*`
constant inside a file under `src/components/` that is NOT `landing/`
or `editorial/`, stop. That is a terminal file. Use a token instead.

## COLOR — NON-NEGOTIABLE
- Background system: C.bgBase (#111117) → C.bgElevated (#18181f)
  → C.bgSurface (#1f1f28) → C.bgOverlay.
- NEVER use pure black (#000) or pure neutral gray.
- Primary accent: C.electricBlue (#3B82F6) — calm blue-500, NOT neon cyan.
- Secondary accent: C.falconGold (#F59E0B). The profitability color.
- Status colors: C.alertCritical / alertHigh / alertWarning / alertNormal ONLY.
- NEVER invent a color. If the data needs a color not in tokens.ts, ask first.
- NEVER use purple-to-blue gradients as backgrounds or accents.
- NEVER use glassmorphism (frosted blur) on data cards.

## SHAPE — NON-NEGOTIABLE
- Card border-radius: R.lg (8px). MAXIMUM R.xl (12px) on modals only.
- Button border-radius: R.md (6px). NEVER rounded-full / pill shapes.
- Badge border-radius: R.sm (4px). NEVER pill badges on terminal components.
- NEVER exceed 12px border-radius on any element.

## SPACING — NON-NEGOTIABLE
- All spacing from S tokens: 4, 8, 12, 16, 24, 32, 48px.
- Card internal padding: S.lg (16px). NEVER 24px+ padding on data cards.
- NEVER use uniform spacing — related elements 8-12px, sections 24-32px.

## BORDERS
- Every card: 1px solid C.borderDefault, border-top: 1px solid C.borderAccent
- Hover state: border-top upgrades to C.borderActive
- Selected/active state: border-top upgrades to C.electricBlue at 100% opacity
- NEVER use box-shadow as the primary elevation signal — use border + background.

## MOTION — NON-NEGOTIABLE
- Duration: 150ms for micro, 200ms for panels, 250ms for view transitions.
- Easing: cubic-bezier(0.4, 0, 0.2, 1) — ease-out. ALWAYS.
- NEVER use spring, bounce, or elastic easing.
- NEVER animate layout properties (width, height, top, left).
- Animate ONLY: opacity, transform. Nothing else.
- Every animation must communicate a state change. If it's decorative: delete it.

## LAYOUT-CRITICAL ELEMENTS
Never use Tailwind classes for height, width, padding, or gap on any element
that is a direct child of a CSS Grid area or flex container that owns layout.
Use inline styles with explicit px values. Tailwind layout classes are permitted
only on decorative or content elements that do not participate in grid/flex sizing.

## WHAT THIS PLATFORM IS NOT
- Not a SaaS dashboard (no pill buttons, no gradient cards)
- Not a landing page (no scroll animations, no "coming soon" cards)
- Not a mobile app (no bottom sheets, no FABs, no swipe gestures)
- Not a consumer app (no bouncing, no haptic metaphors, no friendly illustrations)

## CURRENT DESIGN TOKENS (source of truth: src/design/tokens.ts)
- Primary font: Inter for all body text and headlines
- Data font: Geist Mono for prices, timestamps, badges, numbers
- Primary accent: #3B82F6 (blue-500) — NOT neon cyan
- Secondary accent: #F59E0B (Falcon Gold)
- Background base: #111117
- No Tailwind on layout-critical elements
- No hand-rolled SVG charts — Recharts only

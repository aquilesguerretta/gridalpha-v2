---
name: gridalpha-terminal
description: >-
  GridAlpha V2 design vocabulary — institutional terminal aesthetic
  (Palantir Gotham, Bloomberg, ISA-101 industrial HMI). Information density
  as feature. Four-tier elevation (bgBase → bgElevated → bgSurface →
  bgOverlay), Geist Mono lock on data and labels, electric-blue (calm
  blue-500) primary accent, Falcon Gold (#F59E0B) secondary for warnings
  / delays / live moments. HERO / FLOW / CONTAINED composition. ANTI-Linear,
  ANTI-Arc, ANTI-Notion aesthetic.
license: proprietary
tools: [read, write]
---

# GridAlpha Terminal Skill

This skill loads GridAlpha V2's design vocabulary into context for every
UI generation task in this repo. Reference modules cover typography,
color, composition, motion, density, and explicit anti-patterns.

When generating UI for GridAlpha V2:

- **Always** load `references/terminal-antipatterns.md` first — it
  codifies what NOT to do and prevents the most common failure modes
  (generic SaaS, AI-slop card grids, gradient hero, hero numbers with
  oversized digits + tiny labels).
- Load `references/terminal-typography.md` for any text rendering
  decision: font choice, size, casing, tabular-nums, line-height.
- Load `references/terminal-color.md` for any background, accent, alert,
  or border color decision.
- Load `references/terminal-composition.md` for any layout decision:
  HERO vs FLOW vs CONTAINED, dominant focal element rule, vertical
  rhythm.
- Load `references/terminal-motion.md` whenever animation is being
  considered. The default is no motion.
- Load `references/terminal-density.md` whenever a surface feels too
  empty or you're tempted to add whitespace.

The skill's vocabulary **supersedes** any conflicting guidance in
`CLAUDE.md` or in agent prompts. Tokens (`src/design/tokens.ts`) remain
the immutable source of truth for hex values; the references describe
the philosophy that produced those tokens and the patterns that compose
them.

See `EXAMPLES.md` for 3–5 reference surfaces in the existing codebase
that demonstrate the skill in action.

## What this skill is not

- Not a CSS framework. It does not enforce code-level rules — that's
  CHROMA's job in a future wave.
- Not a list of components. FOUNDRY's `src/components/terminal/`
  primitives are the building blocks; this skill is the *vocabulary*
  that decides how to compose them.
- Not a brand guide. GridAlpha has a landing/auth editorial surface
  (`src/components/editorial/`) with its own rules. This skill covers
  only the terminal surface (Nest, Atlas, Analytics, Vault, and the
  shared overlays that live above them).

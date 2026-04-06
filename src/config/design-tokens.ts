// src/config/design-tokens.ts
// Single source of truth for all GridAlpha V2 design constants.
// Every component imports { C, F, GLASS } from here.
// Never define colors or fonts inline in component files.

export const F = {
  mono: "'Geist Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
} as const;

export const C = {
  // ── Backgrounds ─────────────────────────────────────────────────
  obsidian:       "#0A0A0B",
  obsidianRaised: "#111114",

  // ── Primary accents ─────────────────────────────────────────────
  electricBlue:   "#00A3FF",
  cyan:           "#00FFF0",

  // ── Semantic ────────────────────────────────────────────────────
  green:          "#00E676",   // live / positive
  amber:          "#FFB800",   // warning / positive delta
  red:            "#FF3B3B",   // critical / negative
  orange:         "#F97316",   // gas fuel type

  // ── Fuel type palette ───────────────────────────────────────────
  fuelNuclear:    "#9B59B6",
  fuelGas:        "#E67E22",
  fuelWind:       "#00A3FF",
  fuelSolar:      "#F1C40F",
  fuelCoal:       "#7F8C8D",
  fuelHydro:      "#3B82F6",

  // ── Text ────────────────────────────────────────────────────────
  textPrimary:    "#FFFFFF",
  textSecondary:  "rgba(255,255,255,0.6)",
  textMuted:      "rgba(255,255,255,0.3)",
  textDim:        "rgba(255,255,255,0.2)",

  // ── Surfaces ────────────────────────────────────────────────────
  cardBg:         "rgba(255,255,255,0.03)",
  cardBorder:     "rgba(0,163,255,0.15)",
  glassBg:        "rgba(10,10,11,0.85)",
  glassBorder:    "rgba(255,255,255,0.06)",
  inputBg:        "rgba(255,255,255,0.04)",
  inputBorder:    "rgba(255,255,255,0.1)",
} as const;

export const GLASS = {
  card: {
    background:     C.cardBg,
    border:         `1px solid ${C.cardBorder}`,
    borderRadius:   8,
    backdropFilter: "blur(8px)",
  },
  panel: {
    background:     C.glassBg,
    border:         `1px solid ${C.glassBorder}`,
    backdropFilter: "blur(12px)",
  },
  overlay: {
    background:     "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
  },
} as const;

export type ColorTokens = typeof C;
export type GlassTokens  = typeof GLASS;

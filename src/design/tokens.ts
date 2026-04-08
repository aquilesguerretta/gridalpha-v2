// src/design/tokens.ts
// GridAlpha V2 Design System — Single Source of Truth
// Every color, spacing, radius, font value in the platform lives here.
// No component may hardcode a value that exists in this file.

export const C = {
  // ─── BACKGROUNDS (4-tier elevation) ───────────────────────────────
  bgBase:       '#0C0D10',   // Page canvas — blue-shifted near-black
  bgElevated:   '#151619',   // Cards, panels — 5% lift from base
  bgSurface:    '#1C1D22',   // Interactive elements, hover states
  bgOverlay:    '#252730',   // Modals, dropdowns, command palette

  // ─── TEXT ─────────────────────────────────────────────────────────
  textPrimary:   '#E5E7EB',               // Dominant data values, headings
  textSecondary: 'rgba(229,231,235,0.6)', // Labels, supporting values
  textMuted:     'rgba(229,231,235,0.35)',// Metadata, timestamps, units
  textInverse:   '#0C0D10',              // Text on colored backgrounds

  // ─── ACCENTS ──────────────────────────────────────────────────────
  electricBlue:      '#06B6D4',               // Primary interactive, selected states
  electricBlueLight: '#22D3EE',               // Hover, sparkline highlights
  electricBlueMuted: '#0891B2',               // Secondary interactive
  electricBlueWash:  'rgba(6,182,212,0.10)',  // Selected row bg, card glow

  falconGold:        '#F59E0B',               // Profitability, positive spread, secondary accent
  falconGoldLight:   '#FBBF24',               // Warning, approaching threshold
  falconGoldWash:    'rgba(245,158,11,0.10)', // Gold-tinted backgrounds

  // ─── STATUS / ALERTS (ISA-101 hierarchy) ─────────────────────────
  alertCritical:  '#EF4444',              // Scarcity events, emergency, system trips
  alertHigh:      '#F97316',              // Price spikes >$200, congestion threshold breach
  alertWarning:   '#F59E0B',              // Reserve margin warnings (same as falconGold)
  alertInfo:      '#3B82F6',              // Informational, scheduled events
  alertNormal:    '#10B981',              // System nominal, within operating range
  alertDiagnostic:'#8B5CF6',             // Background processes, system health

  // ─── BORDERS ─────────────────────────────────────────────────────
  borderDefault: 'rgba(42,43,51,0.7)',   // Default card/panel border
  borderStrong:  '#2A2B33',              // Dividers, section separators
  borderActive:  'rgba(6,182,212,0.35)', // Hover/active card top edge
  borderAccent:  'rgba(6,182,212,0.18)', // Resting card top edge (cyan whisper)
  borderAlert:   'rgba(239,68,68,0.35)', // Alert state card border

  // ─── FUEL MIX (energy industry conventions) ───────────────────────
  fuelGas:     '#F97316',   // Orange — combustion, natural gas
  fuelCoal:    '#6B7280',   // Gray — carbon, legacy
  fuelNuclear: '#FBBF24',   // Amber — uranium yellow
  fuelWind:    '#38BDF8',   // Sky blue — wind energy
  fuelSolar:   '#FDE047',   // Yellow — solar
  fuelHydro:   '#2563EB',   // Blue — water
  fuelBattery: '#A78BFA',   // Violet — storage (distinct from all fuel types)
  fuelOther:   '#9CA3AF',   // Gray fallback
} as const;

export const F = {
  mono: "'Geist Mono', 'Fira Code', monospace",
  sans: "'Geist', 'Inter', system-ui, sans-serif",
} as const;

export const R = {
  sm:   '4px',   // Tight — badges, inline chips
  md:   '6px',   // Standard — buttons, inputs
  lg:   '8px',   // Default — cards, panels
  xl:   '12px',  // Maximum allowed on any element — modals only
} as const;

export const S = {
  xs:   '4px',
  sm:   '8px',
  md:   '12px',
  lg:   '16px',
  xl:   '24px',
  xxl:  '32px',
  xxxl: '48px',
} as const;

export const T = {
  // Label — card titles, section headers (uppercase, spaced)
  labelSize:    '10px',
  labelWeight:  '500',
  labelSpacing: '0.12em',

  // Data secondary — component values, supporting metrics
  dataSmSize:   '13px',
  dataSmWeight: '400',

  // Data primary — dominant display values
  dataMdSize:   '18px',
  dataMdWeight: '600',

  // Data large — hero metrics (LMP, spread, SOC%)
  dataLgSize:   '28px',
  dataLgWeight: '600',

  // Display — oversized focal number (LMP expanded overlay)
  displaySize:  '48px',
  displayWeight:'700',
} as const;

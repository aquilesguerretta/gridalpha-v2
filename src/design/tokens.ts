// src/design/tokens.ts
// GridAlpha V2 Design System — Single Source of Truth
// Every color, spacing, radius, font value in the platform lives here.
// No component may hardcode a value that exists in this file.

export const C = {
  // ─── BACKGROUNDS (4-tier elevation) — warm dark ───────────────────
  bgBase:       '#111117',
  bgElevated:   '#18181f',
  bgSurface:    '#1f1f28',
  bgOverlay:    '#27272f',

  // ─── TEXT ─────────────────────────────────────────────────────────
  textPrimary:   '#F1F1F3',
  textSecondary: 'rgba(241,241,243,0.60)',
  textMuted:     'rgba(241,241,243,0.35)',
  textInverse:   '#111117',

  // ─── ACCENTS — calm blue-500, not neon cyan ───────────────────────
  electricBlue:      '#3B82F6',
  electricBlueLight: '#60A5FA',
  electricBlueMuted: '#2563EB',
  electricBlueWash:  'rgba(59,130,246,0.10)',

  falconGold:        '#F59E0B',
  falconGoldLight:   '#FCD34D',
  falconGoldWash:    'rgba(245,158,11,0.10)',

  // ─── STATUS / ALERTS (ISA-101 hierarchy) ─────────────────────────
  alertCritical:  '#EF4444',
  alertHigh:      '#F97316',
  alertWarning:   '#F59E0B',
  alertInfo:      '#3B82F6',
  alertNormal:    '#10B981',
  alertDiagnostic:'#8B5CF6',

  // ─── BORDERS ─────────────────────────────────────────────────────
  borderDefault: 'rgba(255,255,255,0.07)',
  borderStrong:  'rgba(255,255,255,0.12)',
  borderActive:  'rgba(59,130,246,0.40)',
  borderAccent:  'rgba(59,130,246,0.18)',
  borderAlert:   'rgba(239,68,68,0.35)',

  // ─── FUEL MIX (energy industry conventions) ───────────────────────
  fuelGas:     '#F97316',
  fuelCoal:    '#6B7280',
  fuelNuclear: '#FBBF24',
  fuelWind:    '#38BDF8',
  fuelSolar:   '#FDE047',
  fuelHydro:   '#2563EB',
  fuelBattery: '#A78BFA',
  fuelOther:   '#9CA3AF',
} as const;

export const F = {
  mono: "'Geist Mono', 'Fira Code', monospace",
  sans: "'Inter', system-ui, -apple-system, sans-serif",
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
  // Legacy scalar tokens — kept for backward compatibility
  labelSize:    '10px',
  labelWeight:  '500',
  labelSpacing: '0.12em',
  dataSmSize:   '13px',
  dataSmWeight: '400',
  dataMdSize:   '18px',
  dataMdWeight: '600',
  dataLgSize:   '28px',
  dataLgWeight: '600',
  displaySize:  '48px',
  displayWeight:'700',

  // ─── LEVEL 1 — PAGE IDENTITY ─────────────────────────────────
  pageTitle: {
    fontFamily:    F.mono,
    fontSize:      '22px',
    fontWeight:    '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color:         C.textPrimary,
  },
  pageSubtitle: {
    fontFamily: F.sans,
    fontSize:   '13px',
    fontWeight: '400',
    color:      C.textMuted,
  },

  // ─── LEVEL 2 — SECTION / CONTENT ─────────────────────────────
  sectionHeader: {
    fontFamily:    F.mono,
    fontSize:      '11px',
    fontWeight:    '600',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color:         C.textSecondary,
  },
  headline: {
    fontFamily: F.sans,
    fontSize:   '15px',
    fontWeight: '500',
    lineHeight: '1.4',
    color:      C.textPrimary,
  },
  body: {
    fontFamily: F.sans,
    fontSize:   '13px',
    fontWeight: '400',
    lineHeight: '1.6',
    color:      C.textSecondary,
  },

  // ─── LEVEL 3 — LABELS / METADATA ─────────────────────────────
  label: {
    fontFamily:    F.mono,
    fontSize:      '10px',
    fontWeight:    '500',
    letterSpacing: '0.10em',
    textTransform: 'uppercase' as const,
    color:         C.textMuted,
  },
  dataValue: {
    fontFamily:         F.mono,
    fontSize:           '13px',
    fontWeight:         '600',
    fontVariantNumeric: 'tabular-nums',
    color:              C.textPrimary,
  },
  displayValue: {
    fontFamily:         F.mono,
    fontSize:           '32px',
    fontWeight:         '700',
    fontVariantNumeric: 'tabular-nums',
    color:              C.textPrimary,
  },
} as const;

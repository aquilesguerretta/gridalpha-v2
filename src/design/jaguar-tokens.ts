// src/design/jaguar-tokens.ts
// GridAlpha Brasil — Jaguar Design System
// Portal e demais superfícies claras do lado brasileiro.
// Alexandria mantém seu próprio sistema (ver alexandria-onboarding-claude-code.md)
// — não importar daqui.

export const J = {
  // ─── PAPEL (4-tier elevation, claro) ──────────────────────────────
  // Mesma lógica de elevação por tom de papel que a Alexandria usa —
  // parentesco estrutural deliberado, valores próprios.
  papelBase:     '#F1EEE4',
  papelRaised:   '#F7F5EF',   // levemente mais claro — cards, superfícies elevadas
  papelSunken:   '#E3DDCC',   // levemente mais fundo — inputs, áreas recuadas
  papelOverlay:  '#EDE9DC',   // modais, popover

  // ─── TINTA (texto) ─────────────────────────────────────────────────
  tintaPrimaria:   '#1C140D',
  tintaSecundaria: 'rgba(28,20,13,0.60)',
  tintaMuted:      'rgba(28,20,13,0.35)',
  tintaInversa:    '#F1EEE4',   // texto sobre acento sólido

  // ─── ACENTO — ocre de pelagem, não bandeira nem bioma ─────────────
  acenteOcre:      '#C17D1F',
  acenteOcreLight: '#D99A3F',   // hover
  acenteOcreWash:  'rgba(193,125,31,0.10)',   // fundo sutil, badge, chip

  // ─── BORDAS — fio de 1px, mesma disciplina do sistema inteiro ────
  bordaDefault: 'rgba(28,20,13,0.12)',
  bordaStrong:  'rgba(28,20,13,0.20)',
  bordaAcento:  'rgba(193,125,31,0.35)',
} as const;

export const JF = {
  sans: "'Geist Sans', 'Inter', system-ui, sans-serif",
  mono: "'Geist Mono', 'Fira Code', monospace",
  // Sem terceira fonte de exibição — a distinção fica na cor e na
  // densidade da composição, não em tipografia emprestada.
} as const;

// ORACLE Wave 3 — visual grade indicator.
// 6×6 dot + 11px caps label. Color encoding follows the brief:
//   poor      → alertCritical (red)
//   partial   → alertWarning  (amber)
//   strong    → electricBlue  (cyan)  — brief said "cyan"; tokens.ts uses electricBlue
//   excellent → falconGold

import { C, F } from '@/design/tokens';
import type { GradeLevel } from '@/lib/types/grading';

interface Props {
  grade: GradeLevel;
  /** Optional override — defaults to "POOR" / "PARTIAL" / "STRONG" / "EXCELLENT". */
  label?: string;
}

const GRADE_COLOR: Record<GradeLevel, string> = {
  poor:      C.alertCritical,
  partial:   C.alertWarning,
  strong:    C.electricBlue,
  excellent: C.falconGold,
};

const GRADE_LABEL: Record<GradeLevel, string> = {
  poor:      'POOR',
  partial:   'PARTIAL',
  strong:    'STRONG',
  excellent: 'EXCELLENT',
};

export function GradeBadge({ grade, label }: Props) {
  const color = GRADE_COLOR[grade];
  return (
    <span
      role="status"
      aria-label={`Grade: ${GRADE_LABEL[grade]}`}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            6,
        fontFamily:     F.mono,
        fontSize:       11,
        fontWeight:     600,
        letterSpacing:  '0.14em',
        textTransform:  'uppercase',
        color,
      }}
    >
      <span
        aria-hidden
        style={{
          display:      'inline-block',
          width:        6,
          height:       6,
          borderRadius: '50%',
          background:   color,
        }}
      />
      <span>{label ?? GRADE_LABEL[grade]}</span>
    </span>
  );
}

export default GradeBadge;

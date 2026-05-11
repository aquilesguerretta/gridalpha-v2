// Rule registry. Each rule file lives in this directory and is added
// to ALL_RULES below. Rules are pure: given a SourceFile they return
// an array of Findings.
//
// Adding a new rule:
//   1. Create ./<rule-id>.ts exporting `default` as a Rule.
//   2. Import it here and push onto ALL_RULES.
//   3. Add the rule id + severity to the README's rule table.

import type { Rule } from '../types.js';

// Rule imports — each phase 4-7 lands one or more of these.
// Phase 4
import noTailwindOnLayout from './no-tailwind-on-layout.js';
// Phase 5
import noDecorativeSvg from './no-decorative-svg.js';
// Phase 6 (typography + color)
import requireTabularNums from './require-tabular-nums.js';
import noInterNoSystem from './no-inter-no-system.js';
import noPureBlackWhite from './no-pure-black-white.js';
import noGradientText from './no-gradient-text.js';
import noPillChipDefault from './no-pill-chip-default.js';
// Phase 7 (composition + motion)
import noBoxShadowOnCards from './no-box-shadow-on-cards.js';
import equalWeightGrid from './equal-weight-grid.js';
import noEaseOutBounce from './no-easeOutBounce.js';

export const ALL_RULES: Rule[] = [
  noTailwindOnLayout,
  noDecorativeSvg,
  requireTabularNums,
  noInterNoSystem,
  noPureBlackWhite,
  noGradientText,
  noPillChipDefault,
  noBoxShadowOnCards,
  equalWeightGrid,
  noEaseOutBounce,
];

export function findRule(id: string): Rule | undefined {
  return ALL_RULES.find((r) => r.id === id);
}

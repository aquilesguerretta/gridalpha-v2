// Phase 2 placeholder. Each real rule replaces its stub in Phases 4-7.
// The factory builds a no-op rule that matches the Rule interface so the
// registry compiles before the real logic lands.

import type { Rule, SourceFile } from '../types.js';
import type { Severity } from '../severity.js';

export function stubRule(
  id: string,
  severity: Severity,
  description: string,
  reference?: string,
): Rule {
  return {
    id,
    severity,
    description,
    reference,
    appliesTo(_file: SourceFile): boolean {
      return false;
    },
    check(_file: SourceFile) {
      return [];
    },
  };
}

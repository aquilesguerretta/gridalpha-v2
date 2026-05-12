// FORGE Wave 2 — Sensitivity scenarios.
// Three scenarios are evaluated for every strategy: base, optimistic,
// pessimistic. The runner applies these multipliers when projecting
// 10-year cashflows so the StrategyDetail view can show the NPV range.

import type { SensitivityScenario } from '@/lib/types/simulator';

export const SCENARIOS: SensitivityScenario[] = [
  {
    name: 'base',
    gridPriceMultiplier: 1.0,
    capExMultiplier: 1.0,
    solarOutputMultiplier: 1.0,
  },
  {
    name: 'optimistic',
    /** -10% grid prices over 10 years */
    gridPriceMultiplier: 0.9,
    /** -15% technology cost decline */
    capExMultiplier: 0.85,
    /** +5% solar yield (better irradiance / less soiling) */
    solarOutputMultiplier: 1.05,
  },
  {
    name: 'pessimistic',
    /** +20% grid prices */
    gridPriceMultiplier: 1.2,
    /** +5% technology cost (modest cost-decline only) */
    capExMultiplier: 1.05,
    /** -5% solar yield */
    solarOutputMultiplier: 0.95,
  },
];

export function getScenario(
  name: SensitivityScenario['name'],
): SensitivityScenario {
  const found = SCENARIOS.find((s) => s.name === name);
  if (!found) throw new Error(`Unknown sensitivity scenario: ${name}`);
  return found;
}

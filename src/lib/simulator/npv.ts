// FORGE Wave 2 — NPV utility.
// Pure financial primitives. No store reads, no time-of-day side effects.
// Discount cashflows occur at end-of-year. CapEx is paid at year zero.

/**
 * Net present value with end-of-year cashflows and year-zero capex.
 *
 *   NPV = -capEx + Σᵢ cashflowᵢ / (1 + r)^(i+1)   for i = 0..N-1
 *
 * @param capEx                Capital expenditure paid at year 0, USD.
 * @param annualCashflows      End-of-year cashflows, length N (typically 10).
 * @param discountRate         Annual discount rate, e.g. 0.08 = 8%.
 */
export function calculateNPV(
  capEx: number,
  annualCashflows: number[],
  discountRate: number,
): number {
  return annualCashflows.reduce((sum, cashflow, year) => {
    return sum + cashflow / Math.pow(1 + discountRate, year + 1);
  }, -capEx);
}

/**
 * Discounted total of an end-of-year cashflow stream, exclusive of capex.
 * Useful for splitting NPV components in the result viewer.
 */
export function discountedCashflowTotal(
  annualCashflows: number[],
  discountRate: number,
): number {
  return annualCashflows.reduce((sum, cashflow, year) => {
    return sum + cashflow / Math.pow(1 + discountRate, year + 1);
  }, 0);
}

/**
 * Simple payback period in years (linear interpolation between the year
 * cumulative savings cross zero and the year before). Returns null if
 * the project never recovers the capex within the cashflow horizon.
 */
export function calculatePaybackYears(
  capEx: number,
  annualSavings: number[],
): number | null {
  let cumulative = -capEx;
  for (let i = 0; i < annualSavings.length; i++) {
    const saving = annualSavings[i];
    const previous = cumulative;
    cumulative += saving;
    if (cumulative >= 0) {
      // Linear interpolation: previous was negative, this year crosses zero.
      // Fraction of this year needed = -previous / saving (saving > 0 here).
      if (saving <= 0) return i + 1; // can't interpolate sensibly
      const fraction = -previous / saving;
      return i + fraction;
    }
  }
  return null;
}

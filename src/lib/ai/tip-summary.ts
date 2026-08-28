import type { BaseSummary, CategorySpend, HealthMetrics, VariableSummary } from "../finance";

/** Compact financial snapshot sent to the AI to craft the daily tip.
 *  Kept small on purpose — fewer tokens, lower cost. */
export interface TipSummary {
  currency: string;
  hasData: boolean;
  netBase: number;
  available: number;
  variableSpent: number;
  dailyAllowance: number;
  daysLeft: number;
  topSpend: { name: string; spent: number }[];
  overBudget: { name: string; spent: number; budget: number; usedPct: number }[];
}

export function buildTipSummary(
  base: BaseSummary,
  variable: VariableSummary,
  spends: CategorySpend[],
  health: HealthMetrics,
  currency: string,
  hasData: boolean,
): TipSummary {
  const round = (n: number) => Math.round(n * 100) / 100;

  const topSpend = spends
    .filter((s) => s.spent > 0)
    .slice(0, 3)
    .map((s) => ({ name: s.category.name, spent: round(s.spent) }));

  const overBudget = spends
    .filter((s) => s.ratio != null && s.ratio >= 0.9 && s.budget)
    .map((s) => ({
      name: s.category.name,
      spent: round(s.spent),
      budget: round(s.budget!),
      usedPct: Math.round((s.ratio ?? 0) * 100),
    }));

  return {
    currency,
    hasData,
    netBase: round(base.netBase),
    available: round(variable.available),
    variableSpent: round(variable.variableSpent),
    dailyAllowance: round(health.dailyAllowance),
    daysLeft: health.daysLeft,
    topSpend,
    overBudget,
  };
}

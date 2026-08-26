import type {
  AppData,
  BalanceSnapshot,
  Bucket,
  Category,
  Transaction,
} from "./types";

export interface MonthContext {
  year: number;
  month: number; // 0-11
}

export function currentMonth(now = new Date()): MonthContext {
  return { year: now.getFullYear(), month: now.getMonth() };
}

export function monthBounds({ year, month }: MonthContext) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0); // last day
  return { start, end, daysInMonth: end.getDate() };
}

export function isInMonth(iso: string, ctx: MonthContext): boolean {
  const d = new Date(iso + "T00:00:00");
  return d.getFullYear() === ctx.year && d.getMonth() === ctx.month;
}

/** Days remaining in the month, including today. */
export function daysRemaining(ctx: MonthContext, now = new Date()): number {
  const { daysInMonth } = monthBounds(ctx);
  const isCurrent =
    now.getFullYear() === ctx.year && now.getMonth() === ctx.month;
  if (!isCurrent) return daysInMonth; // whole month for past/future views
  return Math.max(1, daysInMonth - now.getDate() + 1);
}

// ---------- Section 1: Entradas & Custos Fixos ----------
export interface BaseSummary {
  fixedIncome: number;
  fixedExpense: number;
  netBase: number; // fixedIncome - fixedExpense
}

export function computeBase(data: AppData): BaseSummary {
  let fixedIncome = 0;
  let fixedExpense = 0;
  for (const item of data.fixedItems) {
    if (!item.active) continue;
    if (item.type === "income") fixedIncome += item.amount;
    else fixedExpense += item.amount;
  }
  return { fixedIncome, fixedExpense, netBase: fixedIncome - fixedExpense };
}

// ---------- Section 2: Gastos variáveis / disponível ----------
export interface VariableSummary {
  variableSpent: number; // variable expenses this month
  extraIncome: number; // non-fixed income this month
  available: number; // netBase + extraIncome - variableSpent
}

export function computeVariable(
  data: AppData,
  base: BaseSummary,
  ctx: MonthContext,
): VariableSummary {
  let variableSpent = 0;
  let extraIncome = 0;
  const catById = indexBy(data.categories);
  for (const tx of data.transactions) {
    if (!isInMonth(tx.date, ctx)) continue;
    if (tx.type === "income") {
      extraIncome += tx.amount;
    } else {
      // expense — count only variable-group categories toward "free spending"
      const cat = tx.categoryId ? catById.get(tx.categoryId) : undefined;
      if (!cat || cat.group === "variable") variableSpent += tx.amount;
    }
  }
  const available = base.netBase + extraIncome - variableSpent;
  return { variableSpent, extraIncome, available };
}

// ---------- Section 3 & 7: spend by category ----------
export interface CategorySpend {
  category: Category;
  spent: number;
  budget: number | null;
  ratio: number | null; // spent / budget
  status: "normal" | "alerta" | "limite" | "estourado";
}

export function computeCategorySpend(
  data: AppData,
  ctx: MonthContext,
): CategorySpend[] {
  const spentByCat = new Map<string, number>();
  const catById = indexBy(data.categories);
  for (const tx of data.transactions) {
    if (tx.type !== "expense") continue;
    if (!isInMonth(tx.date, ctx)) continue;
    if (!tx.categoryId) continue;
    if (!catById.has(tx.categoryId)) continue;
    spentByCat.set(
      tx.categoryId,
      (spentByCat.get(tx.categoryId) ?? 0) + tx.amount,
    );
  }

  const result: CategorySpend[] = [];
  for (const cat of data.categories) {
    if (cat.kind !== "expense") continue;
    const spent = spentByCat.get(cat.id) ?? 0;
    const budget = cat.budget ?? null;
    const ratio = budget && budget > 0 ? spent / budget : null;
    result.push({
      category: cat,
      spent,
      budget,
      ratio,
      status: statusForRatio(ratio),
    });
  }
  return result.sort((a, b) => b.spent - a.spent);
}

function statusForRatio(ratio: number | null): CategorySpend["status"] {
  if (ratio === null) return "normal";
  if (ratio > 1) return "estourado";
  if (ratio >= 0.9) return "limite";
  if (ratio >= 0.7) return "alerta";
  return "normal";
}

// ---------- Section 4: Net worth / bucket evolution ----------
export function bucketCurrentBalance(
  bucket: Bucket,
  snapshots: BalanceSnapshot[],
): number {
  const forBucket = snapshots
    .filter((s) => s.bucketId === bucket.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  return forBucket.length ? forBucket[forBucket.length - 1].balance : 0;
}

export function totalNetWorth(data: AppData): number {
  return data.buckets.reduce(
    (sum, b) => sum + bucketCurrentBalance(b, data.snapshots),
    0,
  );
}

export interface NetWorthPoint {
  date: string;
  total: number;
  [bucketId: string]: number | string;
}

/**
 * Builds a time series of bucket balances. For each distinct snapshot date we
 * carry forward the last known balance of every bucket (step interpolation).
 */
export function buildNetWorthSeries(data: AppData): NetWorthPoint[] {
  const dates = Array.from(
    new Set(data.snapshots.map((s) => s.date)),
  ).sort();
  if (dates.length === 0) return [];

  const lastByBucket = new Map<string, number>();
  const points: NetWorthPoint[] = [];
  for (const date of dates) {
    for (const snap of data.snapshots.filter((s) => s.date === date)) {
      lastByBucket.set(snap.bucketId, snap.balance);
    }
    const point: NetWorthPoint = { date, total: 0 };
    let total = 0;
    for (const bucket of data.buckets) {
      const bal = lastByBucket.get(bucket.id) ?? 0;
      point[bucket.id] = bal;
      total += bal;
    }
    point.total = total;
    points.push(point);
  }
  return points;
}

// ---------- Section 5: Health indicator ----------
export interface HealthMetrics {
  available: number; // free-to-spend remaining this month
  daysLeft: number;
  dailyAllowance: number; // available / daysLeft
  spentPerDaySoFar: number;
}

export function computeHealth(
  variable: VariableSummary,
  ctx: MonthContext,
  now = new Date(),
): HealthMetrics {
  const daysLeft = daysRemaining(ctx, now);
  const dailyAllowance = variable.available / daysLeft;
  const isCurrent =
    now.getFullYear() === ctx.year && now.getMonth() === ctx.month;
  const dayOfMonth = isCurrent ? now.getDate() : monthBounds(ctx).daysInMonth;
  const spentPerDaySoFar =
    dayOfMonth > 0 ? variable.variableSpent / dayOfMonth : 0;
  return {
    available: variable.available,
    daysLeft,
    dailyAllowance,
    spentPerDaySoFar,
  };
}

// ---------- helpers ----------
function indexBy<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((i) => [i.id, i]));
}

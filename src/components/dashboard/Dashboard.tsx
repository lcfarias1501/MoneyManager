"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  CalendarClock,
  Layers,
  PieChart as PieIcon,
  Receipt,
  Scale,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useData } from "@/lib/data/store";
import {
  computeBase,
  computeCategorySpend,
  computeHealth,
  computeVariable,
  currentMonth,
  totalNetWorth,
  type MonthContext,
} from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { buildTipSummary } from "@/lib/ai/tip-summary";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Header } from "./Header";
import { StatTile } from "./StatTile";
import { DailyTipCard } from "./DailyTipCard";
import { FixedItemsList } from "./FixedItemsList";
import { SpendByCategoryChart } from "./SpendByCategoryChart";
import { NetWorthChart } from "./NetWorthChart";
import { BucketsPanel } from "./BucketsPanel";
import { CategoryBudgetTable } from "./CategoryBudgetTable";
import { RecentTransactions } from "./RecentTransactions";
import { AddCategoryButton } from "./AddCategoryButton";
import { CategoriesManager } from "./CategoriesManager";

export interface AccountInfo {
  email?: string;
  onSignOut: () => void | Promise<void>;
}

export function Dashboard({ account }: { account?: AccountInfo }) {
  const { data, ready } = useData();
  const [ctx, setCtx] = useState<MonthContext>(() => currentMonth());

  const now = new Date();
  const isCurrent = ctx.year === now.getFullYear() && ctx.month === now.getMonth();

  const metrics = useMemo(() => {
    const base = computeBase(data);
    const variable = computeVariable(data, base, ctx);
    const spends = computeCategorySpend(data, ctx);
    const health = computeHealth(variable, ctx, now);
    const netWorth = totalNetWorth(data);
    return { base, variable, spends, health, netWorth };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, ctx]);

  const hasAnyData =
    data.fixedItems.length > 0 ||
    data.transactions.length > 0 ||
    data.buckets.length > 0;

  const shiftMonth = (delta: number) => {
    setCtx((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Carregando…
      </div>
    );
  }

  const { base, variable, spends, health, netWorth } = metrics;
  const spendsWithData = spends.some((s) => s.spent > 0);
  const budgetedCategories = spends.filter((s) => s.budget != null && s.budget > 0);

  return (
    <div className="min-h-screen">
      <Header
        ctx={ctx}
        onPrev={() => shiftMonth(-1)}
        onNext={() => shiftMonth(1)}
        onToday={() => setCtx(currentMonth())}
        onPick={(year, month) => setCtx({ year, month })}
        isCurrent={isCurrent}
        account={account}
      />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
        {/* Co-piloto */}
        <DailyTipCard
          summary={buildTipSummary(
            base,
            variable,
            spends,
            health,
            data.currency,
            hasAnyData,
          )}
          enabled={!!account}
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Base líquida do mês"
            value={formatCurrency(base.netBase, data.currency)}
            hint="Entradas fixas − custos fixos"
            tone={base.netBase >= 0 ? "positive" : "negative"}
            icon={<Scale className="size-4" />}
          />
          <StatTile
            label="Disponível p/ gastar"
            value={formatCurrency(variable.available, data.currency)}
            hint={`Restam ${health.daysLeft} dia(s) no mês`}
            tone={variable.available >= 0 ? "primary" : "negative"}
            icon={<Wallet className="size-4" />}
          />
          <StatTile
            label="Gasto variável no mês"
            value={formatCurrency(variable.variableSpent, data.currency)}
            hint="Lançamentos do dia a dia"
            icon={<Receipt className="size-4" />}
          />
          <StatTile
            label="Patrimônio total"
            value={formatCurrency(netWorth, data.currency)}
            hint={`${data.buckets.length} pote(s)`}
            icon={<Layers className="size-4" />}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Entradas & Custos Fixos */}
          <Card>
            <CardHeader
              title="Entradas & Custos Fixos"
              subtitle="Sua base financeira líquida do mês"
              icon={<Scale className="size-4" />}
            />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <MiniStat
                  label="Entradas"
                  value={formatCurrency(base.fixedIncome, data.currency)}
                  tone="positive"
                />
                <MiniStat
                  label="Custos fixos"
                  value={formatCurrency(base.fixedExpense, data.currency)}
                  tone="negative"
                />
                <MiniStat
                  label="Base líquida"
                  value={formatCurrency(base.netBase, data.currency)}
                  tone={base.netBase >= 0 ? "primary" : "negative"}
                />
              </div>
              <FixedItemsList currency={data.currency} />
            </CardContent>
          </Card>

          {/* Indicadores de saúde */}
          <Card>
            <CardHeader
              title="Indicadores-chave de saúde"
              subtitle="Quanto dá pra gastar por dia sem sobressaltos"
              icon={<Activity className="size-4" />}
            />
            <CardContent>
              <HealthContent health={health} currency={data.currency} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Gasto por tipo */}
          <Card>
            <CardHeader
              title="Gasto real por tipo"
              subtitle="Onde seu dinheiro está indo neste mês"
              icon={<PieIcon className="size-4" />}
              action={<CategoriesManager currency={data.currency} />}
            />
            <CardContent>
              {spendsWithData ? (
                <SpendByCategoryChart spends={spends} currency={data.currency} />
              ) : (
                <EmptyState
                  icon={<PieIcon className="size-5" />}
                  title="Sem gastos categorizados"
                  description="Registre lançamentos com categoria para ver a divisão por tipo (lazer, mercado, transporte...)."
                />
              )}
            </CardContent>
          </Card>

          {/* Lançamentos recentes */}
          <Card>
            <CardHeader
              title="Lançamentos recentes"
              subtitle="Seus últimos movimentos"
              icon={<Receipt className="size-4" />}
            />
            <CardContent>
              <RecentTransactions currency={data.currency} />
            </CardContent>
          </Card>
        </div>

        {/* Evolução do patrimônio */}
        <Card>
          <CardHeader
            title="Evolução do patrimônio e poupança"
            subtitle="Seus potes ao longo do tempo — principal, poupança, metas"
            icon={<TrendingUp className="size-4" />}
          />
          <CardContent className="space-y-5">
            {data.snapshots.length >= 2 ? (
              <NetWorthChart data={data} />
            ) : (
              <EmptyState
                icon={<TrendingUp className="size-5" />}
                title="Ainda sem histórico suficiente"
                description="Crie potes e atualize os saldos em datas diferentes para desenhar a curva de evolução."
              />
            )}
            <BucketsPanel data={data} />
          </CardContent>
        </Card>

        {/* Limites por categoria */}
        <Card>
          <CardHeader
            title="Limites de gastos por categoria"
            subtitle="Orçamento, uso e ação recomendada"
            icon={<CalendarClock className="size-4" />}
            action={<AddCategoryButton label="Categoria c/ orçamento" />}
          />
          <CardContent>
            {budgetedCategories.length > 0 ? (
              <CategoryBudgetTable spends={spends} currency={data.currency} />
            ) : (
              <EmptyState
                icon={<CalendarClock className="size-5" />}
                title="Nenhum orçamento definido"
                description="Crie categorias variáveis com um orçamento mensal (ex.: Lazer 200€) para acompanhar o quanto já usou."
              />
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "positive" | "negative" | "primary";
}) {
  const color =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
        ? "text-negative"
        : "text-primary";
  return (
    <div className="rounded-lg bg-surface-2 p-2.5 text-center">
      <p className="text-[11px] text-muted">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold tabular-nums ${color}`}>
        {value}
      </p>
    </div>
  );
}

function HealthContent({
  health,
  currency,
}: {
  health: import("@/lib/finance").HealthMetrics;
  currency: string;
}) {
  const positive = health.dailyAllowance >= 0;
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-br from-primary-soft to-surface p-4">
        <p className="text-xs text-muted">Você pode gastar por dia</p>
        <p
          className={`mt-1 text-3xl font-bold tabular-nums ${
            positive ? "text-primary" : "text-negative"
          }`}
        >
          {formatCurrency(Math.max(0, health.dailyAllowance), currency)}
          <span className="text-base font-medium text-muted">/dia</span>
        </p>
        <p className="mt-1 text-xs text-muted">
          {positive
            ? `Gastando até esse valor, você fecha o mês dentro da meta (${health.daysLeft} dia(s) restantes).`
            : "Você já passou do disponível deste mês — segure a mão."}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MiniStat
          label="Disponível"
          value={formatCurrency(health.available, currency)}
          tone={health.available >= 0 ? "primary" : "negative"}
        />
        <MiniStat
          label="Dias restantes"
          value={String(health.daysLeft)}
          tone="primary"
        />
        <MiniStat
          label="Média/dia até agora"
          value={formatCurrency(health.spentPerDaySoFar, currency)}
          tone="negative"
        />
      </div>
    </div>
  );
}

"use client";

import type { CategorySpend } from "@/lib/finance";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/format";

const STATUS: Record<
  CategorySpend["status"],
  { label: string; tone: "positive" | "warning" | "negative" | "neutral"; action: string; bar: string }
> = {
  normal: {
    label: "Normal",
    tone: "positive",
    action: "Tudo sob controle",
    bar: "bg-positive",
  },
  alerta: {
    label: "Atenção",
    tone: "warning",
    action: "Vá com calma nesta categoria",
    bar: "bg-warning",
  },
  limite: {
    label: "No limite",
    tone: "warning",
    action: "Evite novos gastos aqui",
    bar: "bg-warning",
  },
  estourado: {
    label: "Estourado",
    tone: "negative",
    action: "Segure a mão — passou do orçamento",
    bar: "bg-negative",
  },
};

export function CategoryBudgetTable({
  spends,
  currency,
}: {
  spends: CategorySpend[];
  currency: string;
}) {
  const rows = spends.filter((s) => s.budget != null && s.budget > 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="pb-2 pr-3 font-medium">Categoria</th>
            <th className="pb-2 px-3 font-medium">Orçamento</th>
            <th className="pb-2 px-3 font-medium">Gasto atual</th>
            <th className="pb-2 px-3 font-medium">Uso</th>
            <th className="pb-2 px-3 font-medium">Status</th>
            <th className="pb-2 pl-3 font-medium">Ação recomendada</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const cfg = STATUS[s.status];
            const ratio = s.ratio ?? 0;
            return (
              <tr key={s.category.id} className="border-b border-border/60">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: s.category.color }}
                    />
                    <span className="font-medium text-foreground">
                      {s.category.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 tabular-nums text-muted">
                  {formatCurrency(s.budget!, currency)}
                </td>
                <td className="px-3 tabular-nums font-medium text-foreground">
                  {formatCurrency(s.spent, currency)}
                </td>
                <td className="px-3">
                  <div className="flex items-center gap-2">
                    <Progress
                      value={ratio}
                      className="w-24"
                      indicatorClassName={cfg.bar}
                    />
                    <span className="w-10 text-right text-xs tabular-nums text-muted">
                      {formatPercent(Math.min(1, ratio))}
                    </span>
                  </div>
                </td>
                <td className="px-3">
                  <Badge tone={cfg.tone}>{cfg.label}</Badge>
                </td>
                <td className="pl-3 text-xs text-muted">{cfg.action}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

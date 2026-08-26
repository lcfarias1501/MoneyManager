"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { CategorySpend } from "@/lib/finance";
import { colorForId } from "@/lib/palette";
import { formatCurrency, formatPercent } from "@/lib/format";

export function SpendByCategoryChart({
  spends,
  currency,
}: {
  spends: CategorySpend[];
  currency: string;
}) {
  const data = spends
    .filter((s) => s.spent > 0)
    .map((s) => ({
      id: s.category.id,
      name: s.category.name,
      value: s.spent,
      color: s.category.color || colorForId(s.category.id),
    }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase tracking-wide text-muted">
            Total
          </span>
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-1.5">
        {data.map((d) => (
          <li key={d.id} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: d.color }}
            />
            <span className="min-w-0 flex-1 truncate text-foreground">
              {d.name}
            </span>
            <span className="tabular-nums text-muted">
              {formatPercent(d.value / total)}
            </span>
            <span className="w-20 text-right font-medium tabular-nums text-foreground">
              {formatCurrency(d.value, currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

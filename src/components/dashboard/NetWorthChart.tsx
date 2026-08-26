"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AppData } from "@/lib/types";
import { buildNetWorthSeries } from "@/lib/finance";
import { formatCurrency, formatCurrencyCompact, formatDate } from "@/lib/format";

export function NetWorthChart({ data }: { data: AppData }) {
  const series = buildNetWorthSeries(data);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => formatDate(d).replace(/\sde\s\d{4}/, "")}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(v: number) => formatCurrencyCompact(v, data.currency)}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--foreground)",
            }}
            labelFormatter={(d) => formatDate(String(d))}
            formatter={(value) => [
              formatCurrency(Number(value), data.currency),
              "Patrimônio",
            ]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#nwFill)"
            dot={series.length < 12 ? { r: 3, fill: "var(--chart-1)" } : false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

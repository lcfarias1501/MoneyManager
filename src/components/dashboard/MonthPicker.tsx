"use client";

import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Menu, useMenuClose } from "@/components/ui/menu";
import type { MonthContext } from "@/lib/finance";
import { cn } from "@/lib/utils";

const MONTHS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];
const MONTHS_FULL = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function MonthPicker({
  ctx,
  onPrev,
  onNext,
  onToday,
  onPick,
  isCurrent,
}: {
  ctx: MonthContext;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onPick: (year: number, month: number) => void;
  isCurrent: boolean;
}) {
  const label = `${MONTHS_FULL[ctx.month]} de ${ctx.year}`;
  const shortLabel = `${MONTHS[ctx.month]} ${String(ctx.year).slice(2)}`;

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5">
      <button
        onClick={onPrev}
        className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground sm:p-1.5"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="size-4" />
      </button>

      <Menu
        align="start"
        triggerAriaLabel="Escolher mês"
        triggerContent={
          <>
            <CalendarDays className="hidden size-4 text-muted sm:block" />
            <span className="text-center capitalize sm:hidden">{shortLabel}</span>
            <span className="hidden min-w-36 text-center capitalize sm:inline">
              {label}
            </span>
            <ChevronDown className="size-3.5 text-muted-2" />
          </>
        }
        triggerClassName="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-sm font-medium text-foreground hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-1.5 sm:px-2"
        panelClassName="w-64 p-3"
      >
        <MonthGrid ctx={ctx} onPick={onPick} onToday={onToday} isCurrent={isCurrent} />
      </Menu>

      <button
        onClick={onNext}
        className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground sm:p-1.5"
        aria-label="Próximo mês"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function MonthGrid({
  ctx,
  onPick,
  onToday,
  isCurrent,
}: {
  ctx: MonthContext;
  onPick: (year: number, month: number) => void;
  onToday: () => void;
  isCurrent: boolean;
}) {
  const close = useMenuClose();
  const [viewYear, setViewYear] = useState(ctx.year);
  const now = new Date();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setViewYear((y) => y - 1)}
          className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground"
          aria-label="Ano anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {viewYear}
        </span>
        <button
          onClick={() => setViewYear((y) => y + 1)}
          className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground"
          aria-label="Próximo ano"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {MONTHS.map((m, i) => {
          const selected = viewYear === ctx.year && i === ctx.month;
          const isThisMonth =
            viewYear === now.getFullYear() && i === now.getMonth();
          return (
            <button
              key={m}
              onClick={() => {
                onPick(viewYear, i);
                close();
              }}
              className={cn(
                "rounded-md py-1.5 text-sm font-medium capitalize transition-colors",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-surface-2",
                !selected && isThisMonth && "ring-1 ring-inset ring-primary/40",
              )}
            >
              {m}
            </button>
          );
        })}
      </div>

      {!isCurrent && (
        <button
          onClick={() => {
            onToday();
            close();
          }}
          className="mt-2 w-full rounded-md py-1.5 text-xs font-medium text-primary hover:bg-primary-soft"
        >
          Ir para o mês atual
        </button>
      )}
    </div>
  );
}

"use client";

import { ChevronLeft, ChevronRight, LogOut, PiggyBank, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import type { MonthContext } from "@/lib/finance";
import { formatMonth } from "@/lib/format";
import type { AccountInfo } from "./Dashboard";

export function Header({
  ctx,
  onPrev,
  onNext,
  onToday,
  isCurrent,
  onNew,
  account,
}: {
  ctx: MonthContext;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  isCurrent: boolean;
  onNew: () => void;
  account?: AccountInfo;
}) {
  const label = formatMonth(new Date(ctx.year, ctx.month, 1));

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PiggyBank className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">MoneyManager</p>
            <p className="text-xs text-muted">Suas economias, organizadas</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
          <button
            onClick={onPrev}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={onToday}
            className="min-w-32 px-2 text-center text-sm font-medium capitalize text-foreground"
            title="Voltar ao mês atual"
          >
            {label}
          </button>
          <button
            onClick={onNext}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {!isCurrent && (
          <Button size="sm" variant="ghost" onClick={onToday}>
            Hoje
          </Button>
        )}

        <ThemeToggle />

        <Button size="md" onClick={onNew}>
          <Plus className="size-4" /> Novo lançamento
        </Button>

        {account && (
          <div className="flex items-center gap-1">
            {account.email && (
              <span
                className="hidden max-w-40 truncate text-xs text-muted sm:inline"
                title={account.email}
              >
                {account.email}
              </span>
            )}
            <button
              onClick={() => account.onSignOut()}
              aria-label="Sair"
              title="Sair"
              className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-negative"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

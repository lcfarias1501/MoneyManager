"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { useData } from "@/lib/data/store";
import type { Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionForm } from "@/components/forms/TransactionForm";

export function RecentTransactions({ currency }: { currency: string }) {
  const { data, deleteTransaction } = useData();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [open, setOpen] = useState(false);

  const catById = new Map(data.categories.map((c) => [c.id, c]));
  const txs = [...data.transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 12);

  if (txs.length === 0) {
    return (
      <EmptyState
        title="Sem lançamentos ainda"
        description="Use o botão “Novo lançamento” para registrar sua primeira entrada ou gasto."
      />
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {txs.map((tx) => {
          const cat = tx.categoryId ? catById.get(tx.categoryId) : undefined;
          const isIncome = tx.type === "income";
          return (
            <li key={tx.id} className="group flex items-center gap-3 py-2.5">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  isIncome ? "bg-positive-soft text-positive" : "bg-negative-soft text-negative"
                }`}
              >
                {isIncome ? (
                  <ArrowUpRight className="size-4" />
                ) : (
                  <ArrowDownLeft className="size-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {tx.description || cat?.name || (isIncome ? "Entrada" : "Gasto")}
                </p>
                <p className="text-xs text-muted">
                  {formatDate(tx.date)}
                  {cat ? ` · ${cat.name}` : ""}
                </p>
              </div>
              <span
                className={`tabular-nums text-sm font-semibold ${
                  isIncome ? "text-positive" : "text-foreground"
                }`}
              >
                {isIncome ? "+" : "−"}
                {formatCurrency(tx.amount, currency)}
              </span>
              <span className="flex items-center">
                <button
                  onClick={() => {
                    setEditing(tx);
                    setOpen(true);
                  }}
                  className="rounded p-1 text-muted-2 opacity-0 hover:text-foreground group-hover:opacity-100"
                  aria-label="Editar"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="rounded p-1 text-muted-2 opacity-0 hover:text-negative group-hover:opacity-100"
                  aria-label="Excluir"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      <TransactionForm
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
      />
    </>
  );
}

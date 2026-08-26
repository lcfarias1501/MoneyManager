"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useData } from "@/lib/data/store";
import type { FixedItem } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FixedItemForm } from "@/components/forms/FixedItemForm";

export function FixedItemsList({ currency }: { currency: string }) {
  const { data, deleteFixedItem } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FixedItem | null>(null);

  const income = data.fixedItems.filter((f) => f.type === "income");
  const expense = data.fixedItems.filter((f) => f.type === "expense");

  function edit(item: FixedItem) {
    setEditing(item);
    setOpen(true);
  }
  function add() {
    setEditing(null);
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      {data.fixedItems.length === 0 ? (
        <EmptyState
          title="Nenhum item fixo ainda"
          description="Adicione seu salário e custos obrigatórios (aluguel, contas, assinaturas) para calcular sua base do mês."
          action={
            <Button size="sm" onClick={add}>
              <Plus className="size-4" /> Adicionar item fixo
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <FixedGroup
            label="Entradas recorrentes"
            items={income}
            currency={currency}
            onEdit={edit}
            onDelete={deleteFixedItem}
          />
          <FixedGroup
            label="Custos fixos"
            items={expense}
            currency={currency}
            onEdit={edit}
            onDelete={deleteFixedItem}
          />
        </div>
      )}

      {data.fixedItems.length > 0 && (
        <Button size="sm" variant="secondary" onClick={add}>
          <Plus className="size-4" /> Adicionar item fixo
        </Button>
      )}

      <FixedItemForm open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  );
}

function FixedGroup({
  label,
  items,
  currency,
  onEdit,
  onDelete,
}: {
  label: string;
  items: FixedItem[];
  currency: string;
  onEdit: (i: FixedItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-2">—</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="group flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-surface-2"
            >
              <span className="truncate text-sm text-foreground">{item.name}</span>
              <span className="flex items-center gap-1">
                <span className="tabular-nums text-sm font-medium text-foreground">
                  {formatCurrency(item.amount, currency)}
                </span>
                <button
                  onClick={() => onEdit(item)}
                  className="rounded p-1 text-muted-2 opacity-0 hover:text-foreground group-hover:opacity-100"
                  aria-label="Editar"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="rounded p-1 text-muted-2 opacity-0 hover:text-negative group-hover:opacity-100"
                  aria-label="Excluir"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

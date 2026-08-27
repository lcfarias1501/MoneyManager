"use client";

import { type ComponentProps, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { FormActions } from "@/components/ui/form-actions";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { useData } from "@/lib/data/store";
import type { CategoryKind, Transaction } from "@/lib/types";
import { toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TransactionForm(props: ComponentProps<typeof TransactionFormInner>) {
  // Mount only while open so state resets on every open.
  if (!props.open) return null;
  return <TransactionFormInner {...props} />;
}

function TransactionFormInner({
  open,
  onClose,
  editing,
  defaultType = "expense",
}: {
  open: boolean;
  onClose: () => void;
  editing?: Transaction | null;
  defaultType?: CategoryKind;
}) {
  const { data, addTransaction, updateTransaction } = useData();

  const [type, setType] = useState<CategoryKind>(editing?.type ?? defaultType);
  const [amount, setAmount] = useState(
    editing ? String(editing.amount) : "",
  );
  const [date, setDate] = useState(editing?.date ?? toISODate(new Date()));
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [bucketId, setBucketId] = useState(editing?.bucketId ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");

  const categories = data.categories.filter((c) => c.kind === type);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return;
    const payload = {
      type,
      amount: Math.round(value * 100) / 100,
      date,
      categoryId: categoryId || null,
      bucketId: bucketId || null,
      description: description.trim() || undefined,
    };
    if (editing) updateTransaction(editing.id, payload);
    else addTransaction(payload);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar lançamento" : "Novo lançamento"}
      description="Registre uma entrada ou um gasto."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-2 p-1">
          {(["expense", "income"] as CategoryKind[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategoryId("");
              }}
              className={cn(
                "rounded-md py-2 text-sm font-medium transition-colors",
                type === t
                  ? t === "expense"
                    ? "bg-negative-soft text-negative"
                    : "bg-positive-soft text-positive"
                  : "text-muted hover:text-foreground",
              )}
            >
              {t === "expense" ? "Gasto" : "Entrada"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="amount">Valor (€)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select
            id="category"
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">— Sem categoria —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.group === "fixed" ? " (fixo)" : ""}
              </option>
            ))}
          </Select>
          {categories.length === 0 && (
            <p className="mt-1 text-xs text-muted">
              Nenhuma categoria de {type === "expense" ? "gasto" : "entrada"}{" "}
              ainda. Você pode criar em “Categorias”.
            </p>
          )}
        </div>

        {data.buckets.length > 0 && (
          <div>
            <Label htmlFor="bucket">Pote / conta (opcional)</Label>
            <Select
              id="bucket"
              value={bucketId ?? ""}
              onChange={(e) => setBucketId(e.target.value)}
            >
              <option value="">— Nenhum —</option>
              {data.buckets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="desc">Descrição (opcional)</Label>
          <Textarea
            id="desc"
            placeholder="Ex.: Almoço com amigos"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <FormActions
          onCancel={onClose}
          submitLabel={editing ? "Salvar" : "Adicionar"}
        />
      </form>
    </Modal>
  );
}

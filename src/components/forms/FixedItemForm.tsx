"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { useData } from "@/lib/data/store";
import type { CategoryKind, FixedItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FixedItemForm({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing?: FixedItem | null;
}) {
  const { data, addFixedItem, updateFixedItem } = useData();
  const [type, setType] = useState<CategoryKind>(editing?.type ?? "expense");
  const [name, setName] = useState(editing?.name ?? "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [dayOfMonth, setDayOfMonth] = useState(
    editing?.dayOfMonth ? String(editing.dayOfMonth) : "",
  );

  const categories = data.categories.filter((c) => c.kind === type);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!name.trim() || !Number.isFinite(value) || value <= 0) return;
    const day = dayOfMonth ? Math.min(31, Math.max(1, parseInt(dayOfMonth))) : null;
    const payload = {
      name: name.trim(),
      type,
      amount: Math.round(value * 100) / 100,
      categoryId: categoryId || null,
      dayOfMonth: day,
      active: editing?.active ?? true,
    };
    if (editing) updateFixedItem(editing.id, payload);
    else addFixedItem(payload);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar item fixo" : "Novo item fixo"}
      description="Entradas recorrentes (salário) ou custos obrigatórios (aluguel, contas)."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-2 p-1">
          {(["income", "expense"] as CategoryKind[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategoryId("");
              }}
              className={cn(
                "rounded-md py-1.5 text-sm font-medium transition-colors",
                type === t
                  ? t === "income"
                    ? "bg-positive-soft text-positive"
                    : "bg-negative-soft text-negative"
                  : "text-muted hover:text-foreground",
              )}
            >
              {t === "income" ? "Entrada recorrente" : "Custo fixo"}
            </button>
          ))}
        </div>

        <div>
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            placeholder={type === "income" ? "Salário" : "Aluguel"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="famount">Valor mensal (€)</Label>
            <Input
              id="famount"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="day">Dia do mês (opcional)</Label>
            <Input
              id="day"
              inputMode="numeric"
              placeholder="Ex.: 5"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div>
            <Label htmlFor="fcat">Categoria (opcional)</Label>
            <Select
              id="fcat"
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">— Sem categoria —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{editing ? "Salvar" : "Adicionar"}</Button>
        </div>
      </form>
    </Modal>
  );
}

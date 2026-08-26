"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { useData } from "@/lib/data/store";
import type { Category, CategoryGroup, CategoryKind } from "@/lib/types";
import { CHART_COLORS } from "@/lib/palette";
import { cn } from "@/lib/utils";

export function CategoryForm({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Category | null;
}) {
  const { addCategory, updateCategory } = useData();
  const [name, setName] = useState(editing?.name ?? "");
  const [kind, setKind] = useState<CategoryKind>(editing?.kind ?? "expense");
  const [group, setGroup] = useState<CategoryGroup>(editing?.group ?? "variable");
  const [budget, setBudget] = useState(
    editing?.budget != null ? String(editing.budget) : "",
  );
  const [color, setColor] = useState(editing?.color ?? CHART_COLORS[0]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const budgetValue = budget
      ? Math.round(parseFloat(budget.replace(",", ".")) * 100) / 100
      : null;
    const payload = {
      name: name.trim(),
      kind,
      group: kind === "income" ? ("fixed" as const) : group,
      color,
      budget: kind === "expense" && group === "variable" ? budgetValue : null,
    };
    if (editing) updateCategory(editing.id, payload);
    else addCategory(payload);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar categoria" : "Nova categoria"}
      description="Agrupe seus lançamentos (lazer, mercado, transporte...)."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="cname">Nome</Label>
          <Input
            id="cname"
            placeholder="Lazer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Tipo</Label>
            <Select
              value={kind}
              onChange={(e) => setKind(e.target.value as CategoryKind)}
            >
              <option value="expense">Gasto</option>
              <option value="income">Entrada</option>
            </Select>
          </div>
          {kind === "expense" && (
            <div>
              <Label>Grupo</Label>
              <Select
                value={group}
                onChange={(e) => setGroup(e.target.value as CategoryGroup)}
              >
                <option value="variable">Variável / livre</option>
                <option value="fixed">Fixo / obrigatório</option>
              </Select>
            </div>
          )}
        </div>

        {kind === "expense" && group === "variable" && (
          <div>
            <Label htmlFor="budget">Orçamento mensal (€) — opcional</Label>
            <Input
              id="budget"
              inputMode="decimal"
              placeholder="Ex.: 200"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">
              Usado nos “Limites de gastos por categoria”.
            </p>
          </div>
        )}

        <div>
          <Label>Cor</Label>
          <div className="flex flex-wrap gap-2">
            {CHART_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "size-7 rounded-full border-2 transition-transform",
                  color === c
                    ? "scale-110 border-foreground"
                    : "border-transparent",
                )}
                style={{ background: c }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>

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

"use client";

import { useState } from "react";
import { Pencil, Plus, Settings2, Trash2 } from "lucide-react";
import { useData } from "@/lib/data/store";
import type { Category } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryForm } from "@/components/forms/CategoryForm";

export function CategoriesManager({
  currency,
  variant = "ghost",
  label = "Categorias",
}: {
  currency: string;
  variant?: "primary" | "secondary" | "ghost";
  label?: string;
}) {
  const { data, deleteCategory } = useData();
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(cat: Category) {
    setEditing(cat);
    setFormOpen(true);
  }

  const categories = [...data.categories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <>
      <Button size="sm" variant={variant} onClick={() => setOpen(true)}>
        <Settings2 className="size-4" /> {label}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Gerenciar categorias"
        description="Edite, exclua ou crie categorias de entradas e gastos."
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={openAdd}>
              <Plus className="size-4" /> Nova categoria
            </Button>
          </div>

          {categories.length === 0 ? (
            <EmptyState
              title="Nenhuma categoria ainda"
              description="Crie categorias para classificar seus lançamentos (lazer, mercado, transporte...)."
            />
          ) : (
            <ul className="divide-y divide-border">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ background: cat.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {cat.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      <Badge tone={cat.kind === "income" ? "positive" : "neutral"}>
                        {cat.kind === "income" ? "Entrada" : "Gasto"}
                      </Badge>
                      {cat.kind === "expense" && (
                        <Badge tone={cat.group === "fixed" ? "warning" : "primary"}>
                          {cat.group === "fixed" ? "Fixo" : "Variável"}
                        </Badge>
                      )}
                      {cat.budget != null && cat.budget > 0 && (
                        <span className="text-xs text-muted">
                          Orç.: {formatCurrency(cat.budget, currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  {confirmingId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted">Excluir?</span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          deleteCategory(cat.id);
                          setConfirmingId(null);
                        }}
                      >
                        Sim
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmingId(null)}
                      >
                        Não
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <button
                        onClick={() => openEdit(cat)}
                        className="rounded p-1.5 text-muted-2 hover:text-foreground"
                        aria-label="Editar"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setConfirmingId(cat.id)}
                        className="rounded p-1.5 text-muted-2 hover:text-negative"
                        aria-label="Excluir"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted">
            Ao excluir uma categoria, os lançamentos ligados a ela ficam “sem
            categoria” (não são apagados).
          </p>
        </div>
      </Modal>

      <CategoryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
      />
    </>
  );
}

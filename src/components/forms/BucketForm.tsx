"use client";

import { type ComponentProps, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { FormActions } from "@/components/ui/form-actions";
import { Input, Label, Select } from "@/components/ui/field";
import { useData } from "@/lib/data/store";
import type { Bucket } from "@/lib/types";
import { CHART_COLORS } from "@/lib/palette";
import { toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function BucketForm(props: ComponentProps<typeof BucketFormInner>) {
  if (!props.open) return null;
  return <BucketFormInner {...props} />;
}

function BucketFormInner({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Bucket | null;
}) {
  const { addBucket, updateBucket, addSnapshot } = useData();
  const [name, setName] = useState(editing?.name ?? "");
  const [kind, setKind] = useState<Bucket["kind"]>(editing?.kind ?? "poupanca");
  const [goal, setGoal] = useState(editing?.goal != null ? String(editing.goal) : "");
  const [initial, setInitial] = useState("");
  const [color, setColor] = useState(editing?.color ?? CHART_COLORS[2]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const goalValue = goal
      ? Math.round(parseFloat(goal.replace(",", ".")) * 100) / 100
      : null;
    if (editing) {
      updateBucket(editing.id, { name: name.trim(), kind, goal: goalValue, color });
    } else {
      const bucket = addBucket({ name: name.trim(), kind, goal: goalValue, color });
      const initialValue = initial
        ? Math.round(parseFloat(initial.replace(",", ".")) * 100) / 100
        : 0;
      if (initialValue) {
        addSnapshot({
          bucketId: bucket.id,
          date: toISODate(new Date()),
          balance: initialValue,
        });
      }
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar pote" : "Novo pote / conta"}
      description="Separe seu dinheiro: Principal, Poupança, Viagem, Reserva..."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="bname">Nome</Label>
          <Input
            id="bname"
            placeholder="Viagem"
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
              onChange={(e) => setKind(e.target.value as Bucket["kind"])}
            >
              <option value="principal">Principal</option>
              <option value="poupanca">Poupança</option>
              <option value="meta">Meta / objetivo</option>
              <option value="custom">Outro</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="goal">Meta (€) — opcional</Label>
            <Input
              id="goal"
              inputMode="decimal"
              placeholder="Ex.: 3000"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
        </div>

        {!editing && (
          <div>
            <Label htmlFor="initial">Saldo inicial (€) — opcional</Label>
            <Input
              id="initial"
              inputMode="decimal"
              placeholder="0,00"
              value={initial}
              onChange={(e) => setInitial(e.target.value)}
            />
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
                  color === c ? "scale-110 border-foreground" : "border-transparent",
                )}
                style={{ background: c }}
                aria-label={`Cor ${c}`}
              />
            ))}
          </div>
        </div>

        <FormActions
          onCancel={onClose}
          submitLabel={editing ? "Salvar" : "Criar pote"}
        />
      </form>
    </Modal>
  );
}

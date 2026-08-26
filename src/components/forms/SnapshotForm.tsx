"use client";

import { type ComponentProps, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { useData } from "@/lib/data/store";
import { toISODate } from "@/lib/format";

export function SnapshotForm(props: ComponentProps<typeof SnapshotFormInner>) {
  if (!props.open) return null;
  return <SnapshotFormInner {...props} />;
}

function SnapshotFormInner({
  open,
  onClose,
  bucketId,
}: {
  open: boolean;
  onClose: () => void;
  bucketId?: string;
}) {
  const { data, addSnapshot } = useData();
  const [selected, setSelected] = useState(bucketId ?? data.buckets[0]?.id ?? "");
  const [date, setDate] = useState(toISODate(new Date()));
  const [balance, setBalance] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(balance.replace(",", "."));
    if (!selected || !Number.isFinite(value)) return;
    addSnapshot({
      bucketId: selected,
      date,
      balance: Math.round(value * 100) / 100,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Atualizar saldo"
      description="Registre quanto tem hoje neste pote — isso alimenta o gráfico de evolução."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Pote</Label>
          <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {data.buckets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sbal">Saldo atual (€)</Label>
            <Input
              id="sbal"
              inputMode="decimal"
              placeholder="0,00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <Label htmlFor="sdate">Data</Label>
            <Input
              id="sdate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Registrar</Button>
        </div>
      </form>
    </Modal>
  );
}

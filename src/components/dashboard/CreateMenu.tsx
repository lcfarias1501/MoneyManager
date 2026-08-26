"use client";

import { useState } from "react";
import { Plus, Receipt, RefreshCw, Repeat, Tag, Wallet } from "lucide-react";
import { useData } from "@/lib/data/store";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/menu";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { FixedItemForm } from "@/components/forms/FixedItemForm";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { BucketForm } from "@/components/forms/BucketForm";
import { SnapshotForm } from "@/components/forms/SnapshotForm";

type Which = "tx" | "fixed" | "category" | "bucket" | "snapshot" | null;

export function CreateMenu() {
  const { data } = useData();
  const [open, setOpen] = useState<Which>(null);
  const close = () => setOpen(null);
  const noBuckets = data.buckets.length === 0;

  return (
    <>
      <Menu
        triggerAriaLabel="Criar novo"
        triggerContent={<Plus className="size-5" />}
        triggerClassName="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MenuLabel>Novo</MenuLabel>
        <MenuItem icon={<Receipt className="size-4" />} onSelect={() => setOpen("tx")}>
          Lançamento
        </MenuItem>
        <MenuItem icon={<Repeat className="size-4" />} onSelect={() => setOpen("fixed")}>
          Item fixo
        </MenuItem>
        <MenuItem icon={<Tag className="size-4" />} onSelect={() => setOpen("category")}>
          Categoria
        </MenuItem>
        <MenuSeparator />
        <MenuItem icon={<Wallet className="size-4" />} onSelect={() => setOpen("bucket")}>
          Pote / conta
        </MenuItem>
        <MenuItem
          icon={<RefreshCw className="size-4" />}
          onSelect={() => setOpen("snapshot")}
          disabled={noBuckets}
        >
          Atualizar saldo
        </MenuItem>
      </Menu>

      <TransactionForm open={open === "tx"} onClose={close} />
      <FixedItemForm open={open === "fixed"} onClose={close} />
      <CategoryForm open={open === "category"} onClose={close} />
      <BucketForm open={open === "bucket"} onClose={close} />
      <SnapshotForm open={open === "snapshot"} onClose={close} />
    </>
  );
}

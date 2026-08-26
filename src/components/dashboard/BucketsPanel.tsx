"use client";

import { useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2, Wallet } from "lucide-react";
import { useData } from "@/lib/data/store";
import type { AppData, Bucket } from "@/lib/types";
import { bucketCurrentBalance } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BucketForm } from "@/components/forms/BucketForm";
import { SnapshotForm } from "@/components/forms/SnapshotForm";

export function BucketsPanel({ data }: { data: AppData }) {
  const { deleteBucket } = useData();
  const [bucketOpen, setBucketOpen] = useState(false);
  const [editing, setEditing] = useState<Bucket | null>(null);
  const [snapOpen, setSnapOpen] = useState(false);
  const [snapBucket, setSnapBucket] = useState<string | undefined>();

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {data.buckets.map((b) => {
          const balance = bucketCurrentBalance(b, data.snapshots);
          const ratio = b.goal && b.goal > 0 ? balance / b.goal : null;
          return (
            <div
              key={b.id}
              className="group rounded-xl border border-border bg-surface-2/50 p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-8 items-center justify-center rounded-lg text-white"
                    style={{ background: b.color }}
                  >
                    <Wallet className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.name}</p>
                    <p className="text-[11px] capitalize text-muted">{b.kind}</p>
                  </div>
                </div>
                <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setSnapBucket(b.id);
                      setSnapOpen(true);
                    }}
                    className="rounded p-1 text-muted-2 hover:text-foreground"
                    aria-label="Atualizar saldo"
                  >
                    <RefreshCw className="size-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditing(b);
                      setBucketOpen(true);
                    }}
                    className="rounded p-1 text-muted-2 hover:text-foreground"
                    aria-label="Editar"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => deleteBucket(b.id)}
                    className="rounded p-1 text-muted-2 hover:text-negative"
                    aria-label="Excluir"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
                {formatCurrency(balance, data.currency)}
              </p>
              {ratio != null && (
                <div className="mt-2">
                  <div className="mb-1 flex justify-between text-[11px] text-muted">
                    <span>Meta {formatCurrency(b.goal!, data.currency)}</span>
                    <span>{formatPercent(Math.min(1, ratio))}</span>
                  </div>
                  <Progress value={ratio} indicatorClassName="bg-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setEditing(null);
            setBucketOpen(true);
          }}
        >
          <Plus className="size-4" /> Novo pote
        </Button>
        {data.buckets.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSnapBucket(undefined);
              setSnapOpen(true);
            }}
          >
            <RefreshCw className="size-4" /> Atualizar saldo
          </Button>
        )}
      </div>

      <BucketForm
        open={bucketOpen}
        onClose={() => setBucketOpen(false)}
        editing={editing}
      />
      <SnapshotForm
        open={snapOpen}
        onClose={() => setSnapOpen(false)}
        bucketId={snapBucket}
      />
    </div>
  );
}

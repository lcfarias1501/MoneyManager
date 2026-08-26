import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AppData,
  BalanceSnapshot,
  Bucket,
  Category,
  FixedItem,
  Transaction,
} from "../types";
import { emptyData } from "../data/storage";
import { diffCollection, type Repository } from "../data/repository";

// ---------- row <-> domain mappers ----------
/* eslint-disable @typescript-eslint/no-explicit-any */
const toBucket = (r: any): Bucket => ({
  id: r.id,
  name: r.name,
  kind: r.kind,
  color: r.color,
  goal: r.goal,
  createdAt: r.created_at,
});
const bucketRow = (b: Bucket, userId: string) => ({
  id: b.id,
  user_id: userId,
  name: b.name,
  kind: b.kind,
  color: b.color,
  goal: b.goal ?? null,
  created_at: b.createdAt,
});

const toSnapshot = (r: any): BalanceSnapshot => ({
  id: r.id,
  bucketId: r.bucket_id,
  date: r.date,
  balance: Number(r.balance),
});
const snapshotRow = (s: BalanceSnapshot, userId: string) => ({
  id: s.id,
  user_id: userId,
  bucket_id: s.bucketId,
  date: s.date,
  balance: s.balance,
});

const toCategory = (r: any): Category => ({
  id: r.id,
  name: r.name,
  kind: r.kind,
  group: r.group,
  color: r.color,
  icon: r.icon ?? undefined,
  budget: r.budget,
  createdAt: r.created_at,
});
const categoryRow = (c: Category, userId: string) => ({
  id: c.id,
  user_id: userId,
  name: c.name,
  kind: c.kind,
  group: c.group,
  color: c.color,
  icon: c.icon ?? null,
  budget: c.budget ?? null,
  created_at: c.createdAt,
});

const toFixedItem = (r: any): FixedItem => ({
  id: r.id,
  name: r.name,
  type: r.type,
  amount: Number(r.amount),
  categoryId: r.category_id,
  dayOfMonth: r.day_of_month,
  active: r.active,
  createdAt: r.created_at,
});
const fixedItemRow = (f: FixedItem, userId: string) => ({
  id: f.id,
  user_id: userId,
  name: f.name,
  type: f.type,
  amount: f.amount,
  category_id: f.categoryId ?? null,
  day_of_month: f.dayOfMonth ?? null,
  active: f.active,
  created_at: f.createdAt,
});

const toTransaction = (r: any): Transaction => ({
  id: r.id,
  type: r.type,
  amount: Number(r.amount),
  date: r.date,
  categoryId: r.category_id,
  bucketId: r.bucket_id,
  description: r.description ?? undefined,
  createdAt: r.created_at,
});
const transactionRow = (t: Transaction, userId: string) => ({
  id: t.id,
  user_id: userId,
  type: t.type,
  amount: t.amount,
  date: t.date,
  category_id: t.categoryId ?? null,
  bucket_id: t.bucketId ?? null,
  description: t.description ?? null,
  created_at: t.createdAt,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Retries transient auth/clock-skew errors ("JWT issued at future") a few times. */
async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const transient = /issued at future|clock|exp|jwt/i.test(msg);
      if (!transient || i === attempts - 1) throw err;
      await sleep(500 * (i + 1));
    }
  }
  throw lastErr;
}

export function supabaseRepository(
  supabase: SupabaseClient,
  userId: string,
): Repository {
  async function upsert(table: string, rows: unknown[]) {
    if (rows.length === 0) return;
    await withRetry(async () => {
      const { error } = await supabase.from(table).upsert(rows);
      if (error) throw new Error(`upsert ${table}: ${error.message}`);
    });
  }
  async function remove(table: string, ids: string[]) {
    if (ids.length === 0) return;
    await withRetry(async () => {
      const { error } = await supabase.from(table).delete().in("id", ids);
      if (error) throw new Error(`delete ${table}: ${error.message}`);
    });
  }

  return {
    async loadAll() {
      const { buckets, snapshots, categories, fixedItems, transactions } =
        await withRetry(async () => {
          const [buckets, snapshots, categories, fixedItems, transactions] =
            await Promise.all([
              supabase.from("buckets").select("*"),
              supabase.from("balance_snapshots").select("*"),
              supabase.from("categories").select("*"),
              supabase.from("fixed_items").select("*"),
              supabase.from("transactions").select("*"),
            ]);

          const firstError =
            buckets.error ||
            snapshots.error ||
            categories.error ||
            fixedItems.error ||
            transactions.error;
          if (firstError) throw new Error(firstError.message);
          return { buckets, snapshots, categories, fixedItems, transactions };
        });

      return {
        ...emptyData(),
        buckets: (buckets.data ?? []).map(toBucket),
        snapshots: (snapshots.data ?? []).map(toSnapshot),
        categories: (categories.data ?? []).map(toCategory),
        fixedItems: (fixedItems.data ?? []).map(toFixedItem),
        transactions: (transactions.data ?? []).map(toTransaction),
      } satisfies AppData;
    },

    async apply(prev, next) {
      const bd = diffCollection(prev.buckets, next.buckets);
      const cd = diffCollection(prev.categories, next.categories);
      const sd = diffCollection(prev.snapshots, next.snapshots);
      const fd = diffCollection(prev.fixedItems, next.fixedItems);
      const td = diffCollection(prev.transactions, next.transactions);

      // upserts: parents first, then children (respect FKs)
      await upsert("buckets", bd.upserts.map((b) => bucketRow(b, userId)));
      await upsert("categories", cd.upserts.map((c) => categoryRow(c, userId)));
      await upsert(
        "balance_snapshots",
        sd.upserts.map((s) => snapshotRow(s, userId)),
      );
      await upsert("fixed_items", fd.upserts.map((f) => fixedItemRow(f, userId)));
      await upsert(
        "transactions",
        td.upserts.map((t) => transactionRow(t, userId)),
      );

      // deletes: children first, then parents
      await remove("transactions", td.deletes);
      await remove("fixed_items", fd.deletes);
      await remove("balance_snapshots", sd.deletes);
      await remove("categories", cd.deletes);
      await remove("buckets", bd.deletes);
    },
  };
}

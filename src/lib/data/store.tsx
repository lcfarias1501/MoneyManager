"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AppData,
  BalanceSnapshot,
  Bucket,
  Category,
  FixedItem,
  Transaction,
} from "../types";
import { uid } from "../utils";
import { emptyData } from "./storage";
import { localStorageRepository, type Repository } from "./repository";

type WithoutMeta<T> = Omit<T, "id" | "createdAt">;

interface DataContextValue {
  data: AppData;
  ready: boolean;

  // buckets
  addBucket: (b: WithoutMeta<Bucket>) => Bucket;
  updateBucket: (id: string, patch: Partial<Bucket>) => void;
  deleteBucket: (id: string) => void;

  // snapshots
  addSnapshot: (s: WithoutMeta<BalanceSnapshot>) => BalanceSnapshot;
  deleteSnapshot: (id: string) => void;

  // categories
  addCategory: (c: WithoutMeta<Category>) => Category;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // fixed items
  addFixedItem: (f: WithoutMeta<FixedItem>) => FixedItem;
  updateFixedItem: (id: string, patch: Partial<FixedItem>) => void;
  deleteFixedItem: (id: string) => void;

  // transactions
  addTransaction: (t: WithoutMeta<Transaction>) => Transaction;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // bulk
  replaceAll: (data: AppData) => void;
  resetAll: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({
  children,
  repo = localStorageRepository,
}: {
  children: React.ReactNode;
  repo?: Repository;
}) {
  const [data, setData] = useState<AppData>(() => emptyData());
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // last state successfully handed to the repository — the diff baseline
  const persistedRef = useRef<AppData>(emptyData());

  // initial load
  useEffect(() => {
    let alive = true;
    setReady(false);
    repo
      .loadAll()
      .then((loaded) => {
        if (!alive) return;
        persistedRef.current = loaded;
        setData(loaded);
      })
      .catch((err) => {
        console.error("Falha ao carregar dados:", err);
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [repo]);

  // debounced persistence (diffs against the last persisted state)
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const prev = persistedRef.current;
      if (prev === data) return;
      const snapshot = data;
      repo
        .apply(prev, snapshot)
        .then(() => {
          persistedRef.current = snapshot;
        })
        .catch((err) => {
          console.error("Falha ao salvar:", err);
        });
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, ready, repo]);

  const mutate = useCallback((fn: (d: AppData) => AppData) => {
    setData((prev) => fn(prev));
  }, []);

  const value = useMemo<DataContextValue>(() => {
    const now = () => new Date().toISOString();

    return {
      data,
      ready,

      addBucket: (b) => {
        const bucket: Bucket = { ...b, id: uid(), createdAt: now() };
        mutate((d) => ({ ...d, buckets: [...d.buckets, bucket] }));
        return bucket;
      },
      updateBucket: (id, patch) =>
        mutate((d) => ({
          ...d,
          buckets: d.buckets.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteBucket: (id) =>
        mutate((d) => ({
          ...d,
          buckets: d.buckets.filter((x) => x.id !== id),
          snapshots: d.snapshots.filter((s) => s.bucketId !== id),
          transactions: d.transactions.map((t) =>
            t.bucketId === id ? { ...t, bucketId: null } : t,
          ),
        })),

      addSnapshot: (s) => {
        const snap: BalanceSnapshot = { ...s, id: uid() };
        mutate((d) => ({ ...d, snapshots: [...d.snapshots, snap] }));
        return snap;
      },
      deleteSnapshot: (id) =>
        mutate((d) => ({
          ...d,
          snapshots: d.snapshots.filter((x) => x.id !== id),
        })),

      addCategory: (c) => {
        const cat: Category = { ...c, id: uid(), createdAt: now() };
        mutate((d) => ({ ...d, categories: [...d.categories, cat] }));
        return cat;
      },
      updateCategory: (id, patch) =>
        mutate((d) => ({
          ...d,
          categories: d.categories.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteCategory: (id) =>
        mutate((d) => ({
          ...d,
          categories: d.categories.filter((x) => x.id !== id),
          transactions: d.transactions.map((t) =>
            t.categoryId === id ? { ...t, categoryId: null } : t,
          ),
          fixedItems: d.fixedItems.map((f) =>
            f.categoryId === id ? { ...f, categoryId: null } : f,
          ),
        })),

      addFixedItem: (f) => {
        const item: FixedItem = { ...f, id: uid(), createdAt: now() };
        mutate((d) => ({ ...d, fixedItems: [...d.fixedItems, item] }));
        return item;
      },
      updateFixedItem: (id, patch) =>
        mutate((d) => ({
          ...d,
          fixedItems: d.fixedItems.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteFixedItem: (id) =>
        mutate((d) => ({
          ...d,
          fixedItems: d.fixedItems.filter((x) => x.id !== id),
        })),

      addTransaction: (t) => {
        const tx: Transaction = { ...t, id: uid(), createdAt: now() };
        mutate((d) => ({ ...d, transactions: [...d.transactions, tx] }));
        return tx;
      },
      updateTransaction: (id, patch) =>
        mutate((d) => ({
          ...d,
          transactions: d.transactions.map((x) =>
            x.id === id ? { ...x, ...patch } : x,
          ),
        })),
      deleteTransaction: (id) =>
        mutate((d) => ({
          ...d,
          transactions: d.transactions.filter((x) => x.id !== id),
        })),

      replaceAll: (next) => setData(next),
      resetAll: () => setData(emptyData()),
    };
  }, [data, ready, mutate]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within <DataProvider>");
  return ctx;
}

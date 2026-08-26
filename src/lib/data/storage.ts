import type { AppData } from "../types";

export const DATA_VERSION = 1;

export function emptyData(): AppData {
  return {
    version: DATA_VERSION,
    currency: "EUR",
    buckets: [],
    snapshots: [],
    categories: [],
    fixedItems: [],
    transactions: [],
  };
}

/**
 * Persistence contract. Today it's backed by localStorage; when Supabase is
 * connected we implement the same interface with a Supabase-backed adapter and
 * the rest of the app doesn't change.
 */
export interface StorageAdapter {
  load(): Promise<AppData | null>;
  save(data: AppData): Promise<void>;
}

const STORAGE_KEY = "money-manager:data";

export const localStorageAdapter: StorageAdapter = {
  async load() {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AppData;
      return migrate(parsed);
    } catch {
      return null;
    }
  },
  async save(data) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage may be unavailable (private mode / quota) — fail silently
    }
  },
};

/** Forward-compatible migration hook for future schema versions. */
function migrate(data: AppData): AppData {
  const base = emptyData();
  return {
    ...base,
    ...data,
    version: DATA_VERSION,
  };
}

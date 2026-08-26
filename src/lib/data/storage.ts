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

/** Forward-compatible migration hook for future schema versions. */
export function migrate(data: AppData): AppData {
  return { ...emptyData(), ...data, version: DATA_VERSION };
}

const STORAGE_KEY = "money-manager:data";

export function readLocal(): AppData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw) as AppData);
  } catch {
    return null;
  }
}

export function writeLocal(data: AppData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable (private mode / quota) — ignore
  }
}

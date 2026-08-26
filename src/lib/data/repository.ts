import type { AppData } from "../types";
import { emptyData, readLocal, writeLocal } from "./storage";

/**
 * Persistence contract used by the data store. The store computes the full next
 * state (including any cascade cleanup) and hands (prev, next) to `apply`; each
 * implementation persists that however it likes:
 *   - local: overwrite the whole blob
 *   - supabase: diff prev/next and issue row-level upserts/deletes
 */
export interface Repository {
  loadAll(): Promise<AppData>;
  apply(prev: AppData, next: AppData): Promise<void>;
}

export const localStorageRepository: Repository = {
  async loadAll() {
    return readLocal() ?? emptyData();
  },
  async apply(_prev, next) {
    writeLocal(next);
  },
};

// ---------- diff helper shared by remote repositories ----------
export interface CollectionDiff<T> {
  upserts: T[];
  deletes: string[];
}

export function diffCollection<T extends { id: string }>(
  prev: T[],
  next: T[],
): CollectionDiff<T> {
  const prevById = new Map(prev.map((x) => [x.id, x]));
  const nextIds = new Set(next.map((x) => x.id));

  const upserts = next.filter((n) => {
    const p = prevById.get(n.id);
    return !p || JSON.stringify(p) !== JSON.stringify(n);
  });
  const deletes = prev.filter((p) => !nextIds.has(p.id)).map((p) => p.id);

  return { upserts, deletes };
}

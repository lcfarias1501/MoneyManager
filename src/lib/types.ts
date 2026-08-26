// Domain model for the money manager.
// Amounts are stored as numbers in EUR (2 decimals). All ids are strings (uuid).

export type UUID = string;

/** A pool of money the user tracks over time (Principal, Poupança, Viagem...). */
export interface Bucket {
  id: UUID;
  name: string;
  kind: "principal" | "poupanca" | "meta" | "custom";
  color: string; // css color / token value
  goal?: number | null; // optional target amount (for savings goals)
  createdAt: string; // ISO date
}

/** A point-in-time balance for a bucket — drives the net-worth evolution chart. */
export interface BalanceSnapshot {
  id: UUID;
  bucketId: UUID;
  date: string; // ISO date (yyyy-mm-dd)
  balance: number;
}

export type CategoryKind = "income" | "expense";
/** fixed = recurring/obligatory (rent, bills). variable = day-to-day/free spending. */
export type CategoryGroup = "fixed" | "variable";

export interface Category {
  id: UUID;
  name: string;
  kind: CategoryKind;
  group: CategoryGroup;
  color: string;
  icon?: string; // lucide icon name
  /** monthly budget limit (only meaningful for variable expense categories) */
  budget?: number | null;
  createdAt: string;
}

/** A recurring monthly entry that defines the financial base (salary, rent, subscriptions). */
export interface FixedItem {
  id: UUID;
  name: string;
  type: CategoryKind; // income | expense
  amount: number; // positive number
  categoryId?: UUID | null;
  dayOfMonth?: number | null; // optional expected day (1-31)
  active: boolean;
  createdAt: string;
}

/** A real, dated movement — the day-to-day ledger. */
export interface Transaction {
  id: UUID;
  type: CategoryKind; // income | expense
  amount: number; // positive number
  date: string; // ISO date (yyyy-mm-dd)
  categoryId?: UUID | null;
  bucketId?: UUID | null; // which pool it affects (optional)
  description?: string;
  createdAt: string;
}

/** Full persisted state shape. */
export interface AppData {
  version: number;
  currency: string; // e.g. "EUR"
  buckets: Bucket[];
  snapshots: BalanceSnapshot[];
  categories: Category[];
  fixedItems: FixedItem[];
  transactions: Transaction[];
}

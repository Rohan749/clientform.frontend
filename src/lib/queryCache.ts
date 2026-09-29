import { errorMessage } from "./api";

/*
 * Tiny in-memory query cache (stale-while-revalidate).
 *
 * - Cached data renders instantly when you navigate back to a page.
 * - Data older than its `staleTime` is refreshed in the background, never blocking the UI.
 * - Concurrent requests for the same key share one network call.
 * - Mutations update or invalidate entries; everything is cleared on sign-out.
 *
 * Kept deliberately small: only list/detail views that are revisited often use it.
 */

export interface CacheEntry<T = unknown> {
  data?: T;
  error?: string;
  /** When data (or an error) was last received. 0 = invalidated. */
  updatedAt: number;
  promise?: Promise<T>;
}

const MAX_ENTRIES = 100;
const entries = new Map<string, CacheEntry>();
const listeners = new Map<string, Set<() => void>>();

function write(key: string, entry: CacheEntry) {
  entries.delete(key); // keep Map order = recency for eviction
  entries.set(key, entry);
  while (entries.size > MAX_ENTRIES) {
    const oldest = entries.keys().next().value;
    if (oldest === undefined) break;
    entries.delete(oldest);
  }
  listeners.get(key)?.forEach((listener) => listener());
}

export const queryCache = {
  get<T>(key: string): CacheEntry<T> | undefined {
    return entries.get(key) as CacheEntry<T> | undefined;
  },

  subscribe(key: string, listener: () => void) {
    let set = listeners.get(key);
    if (!set) listeners.set(key, (set = new Set()));
    set.add(listener);
    return () => {
      set.delete(listener);
    };
  },

  /** Fetches (or joins an in-flight fetch of) a key and stores the result. */
  fetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const current = entries.get(key) as CacheEntry<T> | undefined;
    if (current?.promise) return current.promise;

    const promise = fetcher().then(
      (data) => {
        write(key, { data, updatedAt: Date.now() });
        return data;
      },
      (error: unknown) => {
        const latest = entries.get(key);
        write(key, { data: latest?.data, error: errorMessage(error), updatedAt: Date.now() });
        throw error;
      },
    );
    write(key, { ...current, updatedAt: current?.updatedAt ?? 0, promise });
    return promise;
  },

  /** Replaces cached data (e.g. after a mutation), keeping it fresh. */
  set<T>(key: string, updater: (previous: T | undefined) => T | undefined) {
    const current = entries.get(key) as CacheEntry<T> | undefined;
    const data = updater(current?.data);
    if (data === undefined) entries.delete(key);
    else write(key, { data, updatedAt: Date.now() });
  },

  /** Marks entries whose key starts with `prefix` as stale; mounted views refetch in the background. */
  invalidate(...prefixes: string[]) {
    // Snapshot the matching keys first: write() re-inserts entries, and re-inserting while
    // iterating a Map would visit them again forever.
    const matching = [...entries.keys()].filter((key) => prefixes.some((prefix) => key.startsWith(prefix)));
    for (const key of matching) {
      const entry = entries.get(key);
      if (entry) write(key, { ...entry, updatedAt: 0 });
    }
  },

  remove(prefix: string) {
    for (const key of [...entries.keys()]) if (key.startsWith(prefix)) entries.delete(key);
  },

  clear() {
    entries.clear();
  },
};

/** Cache keys used across the dashboard, in one place so invalidation stays consistent. */
export const queryKeys = {
  dashboard: "dashboard",
  billing: "billing",
  forms: "forms",
  submissions: (filters: { status?: string; formId?: string } = {}) =>
    `submissions:list:${filters.status ?? "all"}:${filters.formId ?? "all"}`,
  submissionLists: "submissions:list:",
  submission: (id: string) => `submissions:detail:${id}`,
};

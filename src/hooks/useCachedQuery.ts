import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { type CacheEntry, queryCache } from "@/lib/queryCache";

interface Options {
  /** How long data counts as fresh (ms). Stale data is still shown while it refreshes. */
  staleTime?: number;
}

/**
 * Reads `key` from the shared query cache. Shows cached data immediately and refreshes it in
 * the background when stale, when invalidated, or when the tab becomes visible again.
 */
export function useCachedQuery<T>(key: string, fetcher: () => Promise<T>, { staleTime = 30_000 }: Options = {}) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const entry = useSyncExternalStore(
    useCallback((listener) => queryCache.subscribe(key, listener), [key]),
    () => queryCache.get<T>(key),
    () => queryCache.get<T>(key),
  ) as CacheEntry<T> | undefined;

  const reload = useCallback(() => queryCache.fetch(key, () => fetcherRef.current()), [key]);

  const revalidateIfStale = useCallback(() => {
    const current = queryCache.get(key);
    const stale = !current || Date.now() - current.updatedAt > staleTime;
    if (stale && !current?.promise) void reload().catch(() => undefined);
  }, [key, staleTime, reload]);

  // On mount, key change, and whenever the entry is invalidated (updatedAt reset to 0).
  const updatedAt = entry?.updatedAt;
  useEffect(() => {
    revalidateIfStale();
  }, [revalidateIfStale, updatedAt]);

  // Coming back to the tab: refresh if the data went stale meanwhile (e.g. new submissions).
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && revalidateIfStale();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [revalidateIfStale]);

  const hasData = entry?.data !== undefined;
  return {
    data: (entry?.data ?? null) as T | null,
    /** True only when there's nothing to show yet. Background refreshes don't set it. */
    loading: !hasData && !entry?.error,
    error: hasData ? null : (entry?.error ?? null),
    reload,
    setData: useCallback((updater: (previous: T | undefined) => T | undefined) => queryCache.set<T>(key, updater), [key]),
  };
}

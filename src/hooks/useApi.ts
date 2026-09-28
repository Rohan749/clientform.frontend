import { type DependencyList, useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "@/lib/api";

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Tiny data-fetching hook: loading/error state, stale-response protection and reload. */
export function useApi<T>(fetcher: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<ApiState<T>>({ data: null, error: null, loading: true });
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (id === requestId.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (id === requestId.current) setState({ data: null, error: errorMessage(error), loading: false });
    }
  }, []);

  useEffect(() => {
    void load();
  }, deps);

  const setData = useCallback((updater: (prev: T | null) => T | null) => {
    setState((prev) => ({ ...prev, data: updater(prev.data) }));
  }, []);

  return { ...state, reload: load, setData };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiError } from './api/types';

type State<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
};

type Options = {
  /** Delay applying the loading:true state so a fast response doesn't flash a spinner. */
  spinnerDelayMs?: number;
};

/**
 * Runs an async fetcher on mount and re-runs it when deps change.
 * `refetch()` re-triggers the same call on demand.
 */
export function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  options: Options = {}
) {
  const { spinnerDelayMs = 120 } = options;
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null });
  const nonce = useRef(0);

  const run = useCallback(async () => {
    const my = ++nonce.current;
    let showedSpinner = false;
    const timer = setTimeout(() => {
      if (nonce.current === my) {
        showedSpinner = true;
        setState((s) => ({ ...s, loading: true }));
      }
    }, spinnerDelayMs);
    try {
      const data = await fetcher();
      if (nonce.current !== my) return;
      setState({ data, loading: false, error: null });
    } catch (err) {
      if (nonce.current !== my) return;
      const apiErr = (err && typeof err === 'object' && 'status' in err)
        ? (err as ApiError)
        : { status: 0, code: 'UNKNOWN', message: String(err) };
      setState({ data: null, loading: false, error: apiErr });
    } finally {
      clearTimeout(timer);
      if (!showedSpinner) setState((s) => ({ ...s, loading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    return () => {
      nonce.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, refetch: run };
}

/**
 * useFetch.js
 *
 * Generic data-fetching hook that wraps any async function.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch(
 *     () => blogService.getAll({ page }),
 *     [page]   // re-run when these deps change
 *   );
 *
 * The hook will:
 *  1. Call fetchFn immediately on mount.
 *  2. Re-call whenever `deps` changes (like useEffect).
 *  3. Cancel any in-flight call if deps change before it resolves
 *     (via an "active" flag — avoids setting state on unmounted components).
 *  4. Expose a `refetch` function for manual re-runs.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function useFetch(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Track active invocation to ignore stale responses
  const activeRef = useRef(true);

  const execute = useCallback(async () => {
    activeRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetchFn();
      if (activeRef.current) {
        // Backend always returns { success, data, meta? }
        setData(res.data.data ?? res.data);
      }
    } catch (err) {
      if (activeRef.current) {
        const msg = err.response?.data?.message
          || err.message
          || 'Something went wrong.';
        setError(msg);
      }
    } finally {
      if (activeRef.current) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
    return () => { activeRef.current = false; };
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

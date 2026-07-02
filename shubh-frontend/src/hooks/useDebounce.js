/**
 * useDebounce.js
 *
 * Returns a debounced version of the provided value.
 * Used to delay search queries until the user stops typing.
 *
 * Usage:
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 400);
 *   useEffect(() => { search(debouncedQuery); }, [debouncedQuery]);
 */

import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

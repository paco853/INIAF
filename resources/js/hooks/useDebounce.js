import { useEffect, useState, useRef, useCallback } from 'react';

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useDebouncedCallback(callback, delay = 400, deps = []) {
  const timeoutRef = useRef();
  const cbRef = useRef(callback);
  cbRef.current = callback;

  const debounced = useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      cbRef.current(...args);
    }, delay);
  }, [delay, ...deps]);

  useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), []);
  return debounced;
}


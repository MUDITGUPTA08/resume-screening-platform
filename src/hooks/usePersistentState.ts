import { useCallback, useEffect, useState } from 'react';

// useState that survives a reload. Used for view preferences (which job is
// selected, which tab is open) so a refresh doesn't silently reset the user's
// place. Storage access is wrapped because it throws outright in private
// browsing modes and when site data is blocked.
export function usePersistentState<T extends string>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? initialValue : (stored as T);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (value) {
        window.localStorage.setItem(key, value);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Persistence is a convenience -- never let it break the render.
    }
  }, [key, value]);

  const set = useCallback((next: T) => setValue(next), []);
  return [value, set];
}

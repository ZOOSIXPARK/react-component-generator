import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, fallback: T, restore: (value: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved === null ? fallback : restore(JSON.parse(saved));
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장소가 차단되거나 용량이 부족해도 현재 작업은 계속한다.
    }
  }, [key, value]);

  return [value, setValue] as const;
}

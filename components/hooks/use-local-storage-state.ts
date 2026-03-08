"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useLocalStorageState<T>(
  initialState: T,
  key: string
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialState;

    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) return initialState;

    try {
      return JSON.parse(storedValue) as T;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue];
}

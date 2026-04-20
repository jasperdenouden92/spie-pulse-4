'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Hook to bind filter/sort/search state to URL query params.
 *
 * Usage:
 *   const { get, set, getList, setList } = useFilterParams();
 *   const search = get('search', '');
 *   const groupBy = get('groupBy', 'none');
 *   const selectedCities = getList('cities');
 *
 *   // Update:
 *   set('search', 'skyline');
 *   setList('cities', ['Amsterdam', 'Rotterdam']);
 *   set('groupBy', 'none'); // setting to default removes from URL
 */
export function useFilterParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /** Get a single string param with a default. */
  const get = useCallback((key: string, defaultValue: string = ''): string => {
    return searchParams.get(key) ?? defaultValue;
  }, [searchParams]);

  /** Get a comma-separated list param as an array. */
  const getList = useCallback((key: string): string[] => {
    const val = searchParams.get(key);
    if (!val) return [];
    return val.split(',').filter(Boolean);
  }, [searchParams]);

  /** Get a numeric param with a default. */
  const getNumber = useCallback((key: string, defaultValue: number): number => {
    const val = searchParams.get(key);
    if (val === null) return defaultValue;
    const n = parseInt(val, 10);
    return isNaN(n) ? defaultValue : n;
  }, [searchParams]);

  /** Set a single param. Empty string or matching default removes it from URL. */
  const set = useCallback((key: string, value: string, defaultValue: string = '') => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    const path = window.location.pathname;
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  }, [router, searchParams]);

  /** Set a list param (comma-separated). Empty array removes it from URL. */
  const setList = useCallback((key: string, values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length === 0) {
      params.delete(key);
    } else {
      params.set(key, values.join(','));
    }
    const qs = params.toString();
    const path = window.location.pathname;
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  }, [router, searchParams]);

  /** Set a numeric param. Matching default removes it from URL. */
  const setNumber = useCallback((key: string, value: number, defaultValue?: number) => {
    set(key, value === defaultValue ? '' : String(value));
  }, [set]);

  /** Set multiple params at once. */
  const setMany = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    const path = window.location.pathname;
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  }, [router, searchParams]);

  /** Remove multiple params at once. */
  const clearKeys = useCallback((keys: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of keys) params.delete(key);
    const qs = params.toString();
    const path = window.location.pathname;
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  }, [router, searchParams]);

  return { get, set, getList, setList, getNumber, setNumber, setMany, clearKeys };
}

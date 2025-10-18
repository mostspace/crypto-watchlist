'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface UrlState {
  search?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
  limit?: number;
}

export function useUrlState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current URL state
  const urlState = useMemo((): UrlState => {
    return {
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') || undefined,
      dir: (searchParams.get('dir') as 'asc' | 'desc') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    };
  }, [searchParams]);

  // Update URL state
  const updateUrlState = useCallback((updates: Partial<UrlState>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update parameters
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    // Update URL without causing a page reload
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [router, searchParams]);

  // Set search term
  const setSearch = useCallback((search: string) => {
    updateUrlState({ search: search || undefined });
  }, [updateUrlState]);

  // Set sort parameters
  const setSort = useCallback((sort: string, dir: 'asc' | 'desc' = 'desc') => {
    updateUrlState({ sort, dir });
  }, [updateUrlState]);

  // Set limit
  const setLimit = useCallback((limit: number) => {
    updateUrlState({ limit });
  }, [updateUrlState]);

  // Clear all URL parameters
  const clearUrlState = useCallback(() => {
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  // Generate shareable URL
  const getShareableUrl = useCallback(() => {
    const currentUrl = new URL(window.location.href);
    return currentUrl.toString();
  }, []);

  return {
    urlState,
    setSearch,
    setSort,
    setLimit,
    clearUrlState,
    getShareableUrl,
    updateUrlState,
  };
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CryptocurrencyAsset } from '@/lib/types';

interface UseInfiniteAssetsOptions {
  initialLimit?: number;
  loadMoreLimit?: number;
  sort?: 'volume' | 'price' | 'change' | 'symbol';
  dir?: 'asc' | 'desc';
  quote?: 'USDT' | 'USD';
}

interface UseInfiniteAssetsReturn {
  assets: CryptocurrencyAsset[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  addAsset: (asset: CryptocurrencyAsset) => void;
  totalLoaded: number;
  canLoadMore: boolean;
  lastUpdated: Date | null;
}

const DEFAULT_INITIAL_LIMIT = 20;
const DEFAULT_LOAD_MORE_LIMIT = 20;

export function useInfiniteAssets(options: UseInfiniteAssetsOptions = {}): UseInfiniteAssetsReturn {
  const {
    initialLimit = DEFAULT_INITIAL_LIMIT,
    loadMoreLimit = DEFAULT_LOAD_MORE_LIMIT,
    sort = 'volume',
    dir = 'desc',
    quote = 'USDT'
  } = options;

  const [assets, setAssets] = useState<CryptocurrencyAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAssets = useCallback(async (offset: number = 0, limit: number = initialLimit, isLoadMore: boolean = false) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    if (!isLoadMore) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      // API doesn't support symbol sorting, so map it to volume
      const apiSort = sort === 'symbol' ? 'volume' : sort;
      const url = `/api/assets?limit=${limit}&offset=${offset}&sort=${apiSort}&dir=${dir}&quote=${quote}`;
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      const newAssets: CryptocurrencyAsset[] = result.data || [];
      
      if (isLoadMore) {
        setAssets(prev => [...prev, ...newAssets]);
      } else {
        setAssets(newAssets);
      }
      
      setTotalLoaded(prev => isLoadMore ? prev + newAssets.length : newAssets.length);
      setLastUpdated(new Date());
      
      // No more data if we got fewer than requested
      setHasMore(newAssets.length === limit);
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request cancelled, ignore
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assets';
      setError(errorMessage);
      
      // Don't clear existing assets on load more errors
      if (!isLoadMore) {
        setAssets([]);
        setTotalLoaded(0);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      abortControllerRef.current = null;
    }
  }, [initialLimit, sort, dir, quote]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    await fetchAssets(totalLoaded, loadMoreLimit, true);
  }, [fetchAssets, isLoadingMore, hasMore, totalLoaded, loadMoreLimit]);

  const refresh = useCallback(async () => {
    setHasMore(true);
    setTotalLoaded(0);
    await fetchAssets(0, initialLimit, false);
  }, [fetchAssets, initialLimit]);

  const addAsset = useCallback((asset: CryptocurrencyAsset) => {
    setAssets(prevAssets => {
      // Check if asset is already in the list to avoid duplicates
      const exists = prevAssets.some(a => a.symbol === asset.symbol);
      if (!exists) {
        return [asset, ...prevAssets];
      }
      return prevAssets;
    });
  }, []);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    assets,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    addAsset,
    totalLoaded,
    canLoadMore: hasMore && !isLoadingMore && !isLoading,
    lastUpdated
  };
}

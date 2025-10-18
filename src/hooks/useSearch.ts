'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { CryptocurrencyAsset } from '@/lib/types';

// Enhanced search result interface
interface SearchResult extends CryptocurrencyAsset {
  relevanceScore?: number;
  matchType?: 'symbol' | 'name' | 'partial';
  searchHighlights?: {
    symbol?: string;
    name?: string;
  };
}

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
  quote?: 'USDT' | 'USD';
}

interface UseSearchReturn {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
  hasSearched: boolean;
}

const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_MIN_QUERY_LENGTH = 1;
const DEFAULT_MAX_RESULTS = 20;

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = DEFAULT_DEBOUNCE_MS,
    minQueryLength = DEFAULT_MIN_QUERY_LENGTH,
    maxResults = DEFAULT_MAX_RESULTS,
    quote = 'USDT'
  } = options;

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (query: string) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        q: query,
        limit: maxResults.toString(),
        quote,
      });

      const response = await fetch(`/api/search?${searchParams}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.data || []);
      setHasSearched(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't update state
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [maxResults, quote]);

  const debouncedSearch = useCallback((query: string) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      if (query.length >= minQueryLength) {
        performSearch(query);
      } else {
        setResults([]);
        setHasSearched(false);
        setError(null);
      }
    }, debounceMs);
  }, [performSearch, debounceMs, minQueryLength]);

  const search = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < minQueryLength) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    debouncedSearch(trimmedQuery);
  }, [debouncedSearch, minQueryLength]);

  const clearResults = useCallback(() => {
    setResults([]);
    setHasSearched(false);
    setError(null);
    
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
    hasSearched,
  };
}

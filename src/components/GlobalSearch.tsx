'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { CryptocurrencyAsset } from '@/lib/types';
import { SkeletonLoader } from './SkeletonLoader';

interface GlobalSearchProps {
  onAssetSelect?: (assets: CryptocurrencyAsset[]) => void;
  onClear?: () => void;
  onLoadingChange?: (isLoading: boolean) => void;
  placeholder?: string;
  className?: string;
  showResults?: boolean;
  maxResults?: number;
}

interface SearchResult extends CryptocurrencyAsset {
  relevanceScore?: number;
  matchType?: 'symbol' | 'name' | 'partial';
  searchHighlights?: {
    symbol?: string;
    name?: string;
  };
}

export function GlobalSearch({ 
  onAssetSelect, 
  onClear,
  onLoadingChange,
  placeholder = "Search all cryptocurrencies...",
  className = "",
  showResults = true,
  maxResults = 10
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { results, isLoading, error, search, clearResults, hasSearched } = useSearch({
    maxResults,
    debounceMs: 300,
    minQueryLength: 1,
  });

  // Trigger table filtering when search results change
  useEffect(() => {
    if (hasSearched) {
      // Pass search results to the parent component for table filtering
      // Pass empty array if no results found
      onAssetSelect?.(results);
    }
  }, [hasSearched, results, onAssetSelect]);

  // Notify parent component when loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      // Clear previous results immediately when starting a new search
      clearResults();
      search(value);
    } else {
      clearResults();
      // Call onClear when input is cleared to refresh the table
      onClear?.();
    }
  }, [search, clearResults, onClear]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle backspace and delete to clear search
    if ((e.key === 'Backspace' || e.key === 'Delete') && query.length <= 1) {
      // Input will be empty after this key press, trigger clear
      setTimeout(() => {
        if (!query.trim()) {
          clearResults();
          onClear?.();
        }
      }, 0);
    }

    // Handle Enter key to trigger search
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        search(query.trim());
      }
    }

    // Handle Escape key to clear search
    if (e.key === 'Escape') {
      setQuery('');
      clearResults();
      onClear?.();
      inputRef.current?.blur();
    }
  }, [query, clearResults, onClear, search]);



  return (
    <div className={`relative overflow-visible ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-300 transition-colors duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className="glass-input block w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 shadow-lg font-gt-walsheim"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          aria-label="Search cryptocurrencies"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
        
        {/* Clear button */}
        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery('');
              clearResults();
              onClear?.(); // Call the parent's clear handler
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

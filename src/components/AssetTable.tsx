'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { CryptocurrencyAsset } from '@/lib/types';
import { AssetRow } from './AssetRow';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useUrlState } from '@/hooks/useUrlState';
import { useInfiniteAssets } from '@/hooks/useInfiniteAssets';
import { AssetDetailsModal } from './AssetDetailsModal';
import { ConnectivityStatus } from './ConnectivityStatus';
import { GlobalSearch } from './GlobalSearch';
import { SkeletonLoader } from './SkeletonLoader';

type CryptocurrencySortField = 'symbol' | 'price' | 'change' | 'volume';
type CryptocurrencySortDirection = 'asc' | 'desc';

export function AssetTable() {
  const { urlState, setSearch, setSort } = useUrlState();
  const { isFavorite, toggleFavorite, favorites } = useFavorites();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CryptocurrencyAsset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [searchResults, setSearchResults] = useState<CryptocurrencyAsset[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  
  // Initialize state from URL
  const [searchTerm, setSearchTerm] = useState(urlState.search || '');
  const [isExactMatch, setIsExactMatch] = useState(false);
  const [currentSortField, setCurrentSortField] = useState<CryptocurrencySortField>((urlState.sort as CryptocurrencySortField) || 'volume');
  const [currentSortDirection, setCurrentSortDirection] = useState<CryptocurrencySortDirection>(urlState.dir || 'desc');

  // Use infinite assets hook
  const {
    assets,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    addAsset,
    totalLoaded,
    canLoadMore,
    lastUpdated
  } = useInfiniteAssets({
    sort: currentSortField as 'volume' | 'price' | 'change' | 'symbol',
    dir: currentSortDirection,
  });

  // Track initial load completion
  useEffect(() => {
    if (!isLoading && !hasInitiallyLoaded && assets.length > 0) {
      setHasInitiallyLoaded(true);
    }
  }, [isLoading, hasInitiallyLoaded, assets.length]);

  // Sync URL state with local state
  useEffect(() => {
    if (urlState.search !== undefined) {
      setSearchTerm(urlState.search);
    }
    if (urlState.sort) {
      setCurrentSortField(urlState.sort as CryptocurrencySortField);
    }
    if (urlState.dir) {
      setCurrentSortDirection(urlState.dir);
    }
  }, [urlState]);

  // Filter assets based on search
  const filteredAssets = useMemo(() => {
    if (isSearchMode) {
      return searchResults;
    }
    
    if (!searchTerm) return assets;
    
    const term = searchTerm.toLowerCase().trim();
    return assets.filter(asset => {
      if (isExactMatch) {
        // Exact matching for dropdown selections
        return asset.symbol.toLowerCase() === term ||
               asset.name?.toLowerCase() === term ||
               asset.symbol.replace(/USDT?$/, '').toLowerCase() === term;
      }
      
      // Partial matching for general search
      const symbolMatch = asset.symbol.toLowerCase().includes(term);
      const nameMatch = asset.name?.toLowerCase().includes(term);
      const baseSymbol = asset.symbol.replace(/USDT?$/, '').toLowerCase();
      const baseMatch = baseSymbol.includes(term);
      
      return symbolMatch || nameMatch || baseMatch;
    });
  }, [assets, searchTerm, isExactMatch, isSearchMode, searchResults]);

  // Sort assets (client-side sorting for filtered results)
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (currentSortField) {
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'price':
          aValue = a.lastPrice;
          bValue = b.lastPrice;
          break;
        case 'change':
          aValue = a.changePercent;
          bValue = b.changePercent;
          break;
        case 'volume':
        default:
          aValue = a.quoteVolume;
          bValue = b.quoteVolume;
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return currentSortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return currentSortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });
  }, [filteredAssets, currentSortField, currentSortDirection]);

  // Manual load more handler
  const handleLoadMore = useCallback(async () => {
    if (canLoadMore) {
      await loadMore();
    }
  }, [canLoadMore, loadMore]);

  // Check if table is scrollable and update scroll indicator
  useEffect(() => {
    const checkScrollable = () => {
      if (tableContainerRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = tableContainerRef.current;
        const isScrollableTable = scrollWidth > clientWidth;
        setIsScrollable(isScrollableTable);
        
        // Show scroll indicator if scrollable and not at the end
        if (isScrollableTable && scrollLeft < scrollWidth - clientWidth - 10) {
          setShowScrollIndicator(true);
        } else {
          setShowScrollIndicator(false);
        }
      }
    };

    const handleScroll = () => {
      if (tableContainerRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = tableContainerRef.current;
        // Hide indicator when scrolled to the end
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          setShowScrollIndicator(false);
        } else {
          setShowScrollIndicator(true);
        }
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      window.removeEventListener('resize', checkScrollable);
      if (tableContainer) {
        tableContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [sortedAssets]);

  const handleSort = useCallback((field: CryptocurrencySortField) => {
    const newDirection = currentSortField === field && currentSortDirection === 'asc' ? 'desc' : 'asc';
    setCurrentSortField(field);
    setCurrentSortDirection(newDirection);
    setSort(field, newDirection);
  }, [currentSortField, currentSortDirection, setSort]);

  const handleSearchChange = useCallback((value: string, exactMatch: boolean = false) => {
    setSearchTerm(value);
    setIsExactMatch(exactMatch);
    setSearch(value);
  }, [setSearch]);

  const handleAssetClick = useCallback((asset: CryptocurrencyAsset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAsset(null);
  }, []);

  const handleSearchLoadingChange = useCallback((isLoading: boolean) => {
    setIsSearchLoading(isLoading);
    // Clear search results when starting a new search
    if (isLoading) {
      setSearchResults([]);
      setIsSearchMode(false);
    }
  }, []);

  const handleSearchAssetSelect = useCallback((searchResults: CryptocurrencyAsset[]) => {
    // When search results are received, display them in the table
    setSearchResults(searchResults);
    setIsSearchMode(true);
  }, []);

  const handleSearchClear = useCallback(() => {
    // When search is cleared, reset the table to show initial assets
    setSearchResults([]);
    setIsSearchMode(false);
    setIsSearchLoading(false);
    handleSearchChange('', false); // false for partial match (general search)
  }, [handleSearchChange]);

  // Force re-render when favorites change
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [favorites]);


  const getSortIcon = (field: CryptocurrencySortField) => {
    if (currentSortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return currentSortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  if (error) {
    return (
      <div className="glass-table rounded-lg overflow-hidden">
        <div className="p-6 text-center">
          <div className="text-red-400 mb-2">⚠️ Error loading data</div>
          <div className="text-gray-400 text-sm mb-4">{error}</div>
          <button
            onClick={refresh}
            className="glass-button px-4 py-2 text-sm font-medium rounded-md text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-gt-walsheim"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Live Status Notification */}
      <ConnectivityStatus 
        isConnected={!isLoading && !error && hasInitiallyLoaded}
        isConnecting={isLoading}
        error={error}
        isInitialConnection={!hasInitiallyLoaded}
      />
      
      <div id="main-content" className={`glass-table rounded-lg ${isScrollable ? 'scrollable' : ''}`}>
      {/* Global Search Bar */}
      <div className="p-6 border-b border-white/5 relative z-50 overflow-visible">
        <GlobalSearch
          onAssetSelect={handleSearchAssetSelect}
          onClear={handleSearchClear}
          onLoadingChange={handleSearchLoadingChange}
          placeholder="Search all cryptocurrencies..."
          className="w-full"
          maxResults={15}
        />
        {(searchTerm || isSearchMode || isSearchLoading) && (
          <div className="mt-2 text-xs text-gray-400 font-gt-walsheim">
            {isSearchLoading ? (
              <div className="flex items-center">
                <div className="w-3 h-3 border border-gray-500 border-t-blue-500 rounded-full animate-spin mr-2"></div>
                Searching...
              </div>
            ) : isSearchMode ? (
              <>Showing search results: {filteredAssets.length} result{filteredAssets.length !== 1 ? 's' : ''} found</>
            ) : (
              <>Showing filtered results: {filteredAssets.length} result{filteredAssets.length !== 1 ? 's' : ''} found</>
            )}
          </div>
        )}
      </div>

      {/* Mobile scroll indicator */}
      {isScrollable && (
        <div className="md:hidden px-6 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/5">
          <div className="flex items-center justify-center text-xs text-gray-400 font-gt-walsheim">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Swipe to see more columns
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto overflow-hidden relative" ref={tableContainerRef}>
        {/* Scroll indicator */}
        {showScrollIndicator && (
          <div className="scroll-indicator visible pulse md:hidden">
          </div>
        )}
        <table className="min-w-full table-fixed">
          <thead className="glass-table-header">
            <tr>
              <th className="glass-table-header-cell px-3 py-3 text-center text-xs font-medium text-gray-200 uppercase tracking-wider font-gt-walsheim w-16 no-hover">
              </th>
              <th 
                className="glass-table-header-cell px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer focus:outline-none font-gt-walsheim hover:text-white w-1/3"
                onClick={() => handleSort('symbol')}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('symbol');
                  }
                }}
                role="button"
                aria-label="Sort by symbol"
                aria-sort={currentSortField === 'symbol' ? (currentSortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center gap-2">
                  Asset
                  {getSortIcon('symbol')}
                </div>
              </th>
              <th 
                className="glass-table-header-cell px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer focus:outline-none font-gt-walsheim hover:text-white w-1/6"
                onClick={() => handleSort('price')}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('price');
                  }
                }}
                role="button"
                aria-label="Sort by price"
                aria-sort={currentSortField === 'price' ? (currentSortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center gap-2">
                  Price (USDT)
                  {getSortIcon('price')}
                </div>
              </th>
              <th 
                className="glass-table-header-cell px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer focus:outline-none font-gt-walsheim hover:text-white w-1/6"
                onClick={() => handleSort('change')}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('change');
                  }
                }}
                role="button"
                aria-label="Sort by 24h change"
                aria-sort={currentSortField === 'change' ? (currentSortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center gap-2">
                  24h Change
                  {getSortIcon('change')}
                </div>
              </th>
              <th 
                className="glass-table-header-cell px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer focus:outline-none font-gt-walsheim hover:text-white w-1/4"
                onClick={() => handleSort('volume')}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSort('volume');
                  }
                }}
                role="button"
                aria-label="Sort by volume"
                aria-sort={currentSortField === 'volume' ? (currentSortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center gap-2">
                  Volume (USDT)
                  {getSortIcon('volume')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {(isLoading && sortedAssets.length === 0) || isSearchLoading ? (
              // Show skeleton rows while loading initially or during search
              <SkeletonLoader variant="table-row" count={10} />
            ) : (
              sortedAssets.map((asset, index) => {
                const isAssetFavorite = isFavorite(asset.symbol);
                return (
                  <AssetRow
                    key={`${asset.symbol}-${index}-${forceUpdate}`}
                    asset={asset}
                    isFavorite={isAssetFavorite}
                    onToggleFavorite={toggleFavorite}
                    onClick={() => handleAssetClick(asset)}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Load More Button and Status */}
      <div className="py-4 px-6 border-t border-white/5">
        {isLoadingMore && (
          <div 
            className="flex items-center justify-center py-4"
            role="status"
            aria-live="polite"
            aria-label="Loading more assets"
          >
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" aria-hidden="true"></div>
              <span className="text-sm font-gt-walsheim">Loading more assets...</span>
            </div>
          </div>
        )}
        
        {canLoadMore && !isLoadingMore && !searchTerm && !isSearchMode && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Left side - Assets count */}
            <div className="text-xs text-gray-400 font-gt-walsheim text-center lg:text-left">
              Showing {sortedAssets.length} asset{sortedAssets.length !== 1 ? 's' : ''}
              {searchTerm && (
                <span className="ml-1">
                  (filtered from {totalLoaded} total)
                </span>
              )}
              {!isLoading && !isLoadingMore && (
                <span className="ml-2 inline-flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Live data
                </span>
              )}
            </div>
            
            {/* Center - Load More Button */}
            <div className="flex justify-center">
              <button
                onClick={handleLoadMore}
                className="glass-button inline-flex items-center px-6 py-2 text-sm font-medium text-white rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-gt-walsheim transition-all duration-300"
                aria-label="Load more assets"
              >
                Load More Assets
              </button>
            </div>
            
            {/* Right side - Last updated */}
            <div className="text-xs text-gray-400 font-gt-walsheim text-center lg:text-right">
              {lastUpdated && (
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        )}
        
        {!hasMore && sortedAssets.length > 0 && !isSearchMode && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Left side - Assets count */}
            <div className="text-xs text-gray-400 font-gt-walsheim text-center lg:text-left">
              Showing {sortedAssets.length} asset{sortedAssets.length !== 1 ? 's' : ''}
              {searchTerm && (
                <span className="ml-1">
                  (filtered from {totalLoaded} total)
                </span>
              )}
              {!isLoading && !isLoadingMore && (
                <span className="ml-2 inline-flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Live data
                </span>
              )}
            </div>
            
            {/* Center - All loaded message */}
            <div className="text-center">
              <div className="text-gray-400 text-sm font-gt-walsheim">
                Showing all {totalLoaded} assets
              </div>
              <div className="text-xs text-gray-500 mt-1 font-gt-walsheim">
                No more assets to load
              </div>
            </div>
            
            {/* Right side - Last updated */}
            <div className="text-xs text-gray-400 font-gt-walsheim text-center lg:text-right">
              {lastUpdated && (
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        )}
        
        {/* Show assets count and last updated when no load more button is shown */}
        {!canLoadMore && !hasMore && sortedAssets.length === 0 && !isLoading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-400 font-gt-walsheim text-center sm:text-left">
              No assets to display
            </div>
            <div className="text-xs text-gray-400 font-gt-walsheim text-center sm:text-right">
              {lastUpdated && (
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {sortedAssets.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.707-2.562M15 6.343a7.962 7.962 0 00-3-1.343c-2.34 0-4.29 1.007-5.707 2.562" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white font-gt-walsheim">
            {isSearchMode ? 'No cryptocurrencies found' : 'No assets available'}
          </h3>
          <p className="mt-1 text-sm text-gray-300 font-gt-walsheim">
            {isSearchMode ? 'Try searching for a different cryptocurrency symbol or name.' : 'No cryptocurrency data is currently available.'}
          </p>
        </div>
      )}

      {/* Asset Details Modal */}
      <AssetDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        asset={selectedAsset}
      />
    </div>
    </>
  );
}

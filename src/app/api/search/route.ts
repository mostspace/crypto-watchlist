import { NextResponse } from 'next/server';
import { fetchCryptoData } from '@/lib/binance';
import { ApiResponsePayload, CryptocurrencyAsset } from '@/lib/types';
import { withRateLimit } from '@/lib/rateLimiter';
import { withOptionalAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/monitoring';
import { config } from '@/lib/env';
import { searchQuerySchema } from '@/lib/validation';
import { generateRequestId } from '@/lib/utils';

// Enhanced search result interface
interface SearchResult extends CryptocurrencyAsset {
  relevanceScore?: number;
  matchType?: 'symbol' | 'name' | 'partial';
  searchHighlights?: {
    symbol?: string;
    name?: string;
  };
}

// Advanced search index with multiple optimization strategies
interface SearchIndex {
  assets: CryptocurrencyAsset[];
  symbolIndex: Map<string, CryptocurrencyAsset[]>;
  nameIndex: Map<string, CryptocurrencyAsset[]>;
  // Fuzzy search index for partial matches
  trigramIndex: Map<string, Set<string>>;
  // Popularity index for boosting common assets
  popularityIndex: Map<string, number>;
  lastUpdated: number;
  totalAssets: number;
}

// Search cache with LRU eviction
interface SearchCacheEntry {
  results: SearchResult[];
  timestamp: number;
  query: string;
}

class SearchCache {
  private cache = new Map<string, SearchCacheEntry>();
  private maxSize = 100;
  private maxAge = 2 * 60 * 1000; // 2 minutes

  get(key: string): SearchResult[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.results;
  }

  set(key: string, results: SearchResult[]): void {
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      results,
      timestamp: Date.now(),
      query: key,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

let searchIndex: SearchIndex | null = null;
let searchCache = new SearchCache();
const INDEX_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function normalizeSearchTerm(term: string): string {
  return term.toLowerCase().trim().replace(/[^\w\s]/g, '');
}

// Generate trigrams for fuzzy matching
function generateTrigrams(text: string): string[] {
  const normalized = normalizeSearchTerm(text);
  const trigrams: string[] = [];
  
  for (let i = 0; i <= normalized.length - 3; i++) {
    trigrams.push(normalized.substring(i, i + 3));
  }
  
  return trigrams;
}

function calculateRelevanceScore(asset: CryptocurrencyAsset, query: string, matchType: string): number {
  const normalizedQuery = normalizeSearchTerm(query);
  const normalizedSymbol = normalizeSearchTerm(asset.symbol);
  const normalizedName = asset.name ? normalizeSearchTerm(asset.name) : '';
  
  let score = 0;
  
  // Exact matches get highest scores
  if (normalizedSymbol === normalizedQuery) {
    score += 100;
  } else if (normalizedSymbol.startsWith(normalizedQuery)) {
    score += 80;
  } else if (normalizedSymbol.includes(normalizedQuery)) {
    score += 60;
  }
  
  // Name matches
  if (normalizedName) {
    if (normalizedName === normalizedQuery) {
      score += 90;
    } else if (normalizedName.startsWith(normalizedQuery)) {
      score += 70;
    } else if (normalizedName.includes(normalizedQuery)) {
      score += 50;
    }
  }
  
  // Boost score for higher volume assets (popularity)
  const volumeBoost = Math.min(asset.quoteVolume / 1000000, 10);
  score += volumeBoost;
  
  // Boost score for exact symbol length match (shorter symbols are more common)
  const symbolLengthPenalty = Math.max(0, (asset.symbol.length - 6) * 2);
  score -= symbolLengthPenalty;
  
  return Math.round(score);
}

function highlightMatches(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
}

// Advanced fuzzy search using trigrams with improved matching
function fuzzySearch(index: SearchIndex, query: string): Set<string> {
  const normalizedQuery = normalizeSearchTerm(query);
  const queryTrigrams = generateTrigrams(normalizedQuery);
  const matches = new Map<string, number>(); // symbol -> overlap count
  
  // Find symbols that share trigrams with the query
  for (const trigram of queryTrigrams) {
    const symbolMatches = index.trigramIndex.get(trigram);
    if (symbolMatches) {
      symbolMatches.forEach(symbol => {
        matches.set(symbol, (matches.get(symbol) || 0) + 1);
      });
    }
  }
  
  // Only return symbols that have significant trigram overlap
  // Require at least 50% trigram overlap for fuzzy matches
  const minOverlap = Math.max(1, Math.ceil(queryTrigrams.length * 0.5));
  const filteredMatches = new Set<string>();
  
  for (const [symbol, overlapCount] of matches) {
    if (overlapCount >= minOverlap) {
      filteredMatches.add(symbol);
    }
  }
  
  return filteredMatches;
}

async function buildSearchIndex(): Promise<SearchIndex> {
  const startTime = Date.now();
  logger.info('Building advanced search index...');
  
  try {
    // Fetch all available assets
    const allAssets = await fetchCryptoData('USDT');
    
    // Build various indexes
    const symbolIndex = new Map<string, CryptocurrencyAsset[]>();
    const nameIndex = new Map<string, CryptocurrencyAsset[]>();
    const trigramIndex = new Map<string, Set<string>>();
    const popularityIndex = new Map<string, number>();
    
    // Sort assets by volume for popularity scoring
    const sortedAssets = [...allAssets].sort((a, b) => b.quoteVolume - a.quoteVolume);
    
    sortedAssets.forEach((asset, index) => {
      // Symbol index
      const symbolKey = normalizeSearchTerm(asset.symbol);
      if (!symbolIndex.has(symbolKey)) {
        symbolIndex.set(symbolKey, []);
      }
      symbolIndex.get(symbolKey)!.push(asset);
      
      // Name index
      if (asset.name) {
        const nameKey = normalizeSearchTerm(asset.name);
        if (!nameIndex.has(nameKey)) {
          nameIndex.set(nameKey, []);
        }
        nameIndex.get(nameKey)!.push(asset);
      }
      
      // Trigram index for fuzzy search
      const symbolTrigrams = generateTrigrams(asset.symbol);
      symbolTrigrams.forEach(trigram => {
        if (!trigramIndex.has(trigram)) {
          trigramIndex.set(trigram, new Set());
        }
        trigramIndex.get(trigram)!.add(asset.symbol);
      });
      
      if (asset.name) {
        const nameTrigrams = generateTrigrams(asset.name);
        nameTrigrams.forEach(trigram => {
          if (!trigramIndex.has(trigram)) {
            trigramIndex.set(trigram, new Set());
          }
          trigramIndex.get(trigram)!.add(asset.symbol);
        });
      }
      
      // Popularity index (based on volume ranking)
      popularityIndex.set(asset.symbol, Math.max(0, 100 - index));
    });
    
    const buildTime = Date.now() - startTime;
    logger.info(`Advanced search index built successfully`, { 
      assetCount: allAssets.length, 
      buildTime: `${buildTime}ms`,
      trigramCount: trigramIndex.size,
      symbolIndexSize: symbolIndex.size,
      nameIndexSize: nameIndex.size
    });
    
    return {
      assets: allAssets,
      symbolIndex,
      nameIndex,
      trigramIndex,
      popularityIndex,
      lastUpdated: Date.now(),
      totalAssets: allAssets.length
    };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error');
    logger.error('Failed to build search index', { error: errorObj.message, stack: errorObj.stack });
    throw errorObj;
  }
}

async function getSearchIndex(): Promise<SearchIndex> {
  if (!searchIndex || Date.now() - searchIndex.lastUpdated > INDEX_CACHE_DURATION) {
    searchIndex = await buildSearchIndex();
    // Clear cache when index is rebuilt
    searchCache.clear();
  }
  return searchIndex;
}

function performAdvancedSearch(index: SearchIndex, query: string, limit: number, offset: number): SearchResult[] {
  const normalizedQuery = normalizeSearchTerm(query);
  const results: SearchResult[] = [];
  const seenSymbols = new Set<string>();
  
  // 1. Exact symbol matches (highest priority)
  const exactSymbolMatches = index.symbolIndex.get(normalizedQuery) || [];
  exactSymbolMatches.forEach(asset => {
    if (!seenSymbols.has(asset.symbol)) {
      seenSymbols.add(asset.symbol);
      results.push({
        ...asset,
        relevanceScore: calculateRelevanceScore(asset, query, 'symbol'),
        matchType: 'symbol',
        searchHighlights: {
          symbol: highlightMatches(asset.symbol, query),
          name: asset.name ? highlightMatches(asset.name, query) : undefined,
        }
      });
    }
  });
  
  // 2. Symbol prefix matches
  for (const [symbolKey, assets] of index.symbolIndex) {
    if (symbolKey.startsWith(normalizedQuery) && symbolKey !== normalizedQuery) {
      assets.forEach(asset => {
        if (!seenSymbols.has(asset.symbol)) {
          seenSymbols.add(asset.symbol);
          results.push({
            ...asset,
            relevanceScore: calculateRelevanceScore(asset, query, 'symbol'),
            matchType: 'symbol',
            searchHighlights: {
              symbol: highlightMatches(asset.symbol, query),
              name: asset.name ? highlightMatches(asset.name, query) : undefined,
            }
          });
        }
      });
    }
  }
  
  // 3. Symbol contains matches
  for (const [symbolKey, assets] of index.symbolIndex) {
    if (symbolKey.includes(normalizedQuery) && !symbolKey.startsWith(normalizedQuery)) {
      assets.forEach(asset => {
        if (!seenSymbols.has(asset.symbol)) {
          seenSymbols.add(asset.symbol);
          results.push({
            ...asset,
            relevanceScore: calculateRelevanceScore(asset, query, 'partial'),
            matchType: 'partial',
            searchHighlights: {
              symbol: highlightMatches(asset.symbol, query),
              name: asset.name ? highlightMatches(asset.name, query) : undefined,
            }
          });
        }
      });
    }
  }
  
  // 4. Name matches
  for (const [nameKey, assets] of index.nameIndex) {
    if (nameKey.includes(normalizedQuery)) {
      assets.forEach(asset => {
        if (!seenSymbols.has(asset.symbol)) {
          seenSymbols.add(asset.symbol);
          const matchType = nameKey === normalizedQuery ? 'name' : 'partial';
          results.push({
            ...asset,
            relevanceScore: calculateRelevanceScore(asset, query, matchType),
            matchType,
            searchHighlights: {
              symbol: highlightMatches(asset.symbol, query),
              name: asset.name ? highlightMatches(asset.name, query) : undefined,
            }
          });
        }
      });
    }
  }
  
  // 5. Fuzzy search for partial matches (only if no good exact matches found)
  if (normalizedQuery.length >= 3 && results.length < limit) {
    const fuzzyMatches = fuzzySearch(index, query);
    fuzzyMatches.forEach(symbol => {
      if (!seenSymbols.has(symbol)) {
        const asset = index.assets.find(a => a.symbol === symbol);
        if (asset) {
          // Additional filtering: ensure the match makes sense
          const normalizedSymbol = normalizeSearchTerm(asset.symbol);
          const normalizedName = asset.name ? normalizeSearchTerm(asset.name) : '';
          
          // Skip if the match is too weak (no substring relationship)
          const hasSubstringMatch = normalizedSymbol.includes(normalizedQuery) || 
                                   normalizedQuery.includes(normalizedSymbol) ||
                                   (normalizedName && (normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName)));
          
          if (hasSubstringMatch) {
            seenSymbols.add(asset.symbol);
            results.push({
              ...asset,
              relevanceScore: calculateRelevanceScore(asset, query, 'partial') - 30, // Lower score for fuzzy matches
              matchType: 'partial',
              searchHighlights: {
                symbol: highlightMatches(asset.symbol, query),
                name: asset.name ? highlightMatches(asset.name, query) : undefined,
              }
            });
          }
        }
      }
    });
  }
  
  // Sort by relevance score (highest first)
  results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  
  // Apply pagination
  return results.slice(offset, offset + limit);
}

async function handleSearch(request: Request) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  logger.info('Search request received', { requestId, url: request.url });
  metrics.recordApiRequest();
  
  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const validationResult = searchQuerySchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      const errorMessage = `Invalid search parameters: ${validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
      logger.warn('Search validation error', { requestId, error: errorMessage });
      metrics.recordApiError(new Error(errorMessage));
      
      const response: ApiResponsePayload<null> = {
        data: null as never,
        error: errorMessage,
        requestId,
      };
      
      return NextResponse.json(response, { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId,
          'Cache-Control': 'no-cache',
        }
      });
    }

    const { q: query, limit, offset, quote, includeMetadata } = validationResult.data;
    
    // Check search cache first
    const cacheKey = `${query}-${limit}-${offset}-${quote}`;
    const cachedResults = searchCache.get(cacheKey);
    
    if (cachedResults) {
      metrics.recordCacheHit();
      logger.debug('Search cache hit', { requestId, cacheKey });
      
      const response: ApiResponsePayload<SearchResult[]> = {
        data: cachedResults,
        requestId,
      };
      
      return NextResponse.json(response, {
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId,
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=120',
          'X-Cache': 'HIT',
          'X-Search-Query': query,
          'X-Result-Count': cachedResults.length.toString(),
        }
      });
    }
    
    // Get search index
    const index = await getSearchIndex();
    
    // Perform advanced search
    const searchResults = performAdvancedSearch(index, query, limit, offset);
    
    // Filter by quote currency if needed
    const filteredResults = quote === 'USDT' 
      ? searchResults.filter(asset => asset.symbol.endsWith('USDT'))
      : searchResults.filter(asset => asset.symbol.endsWith('USD') || asset.symbol.endsWith('USDT'));
    
    // Cache the results
    searchCache.set(cacheKey, filteredResults);
    
    const responseTime = Date.now() - startTime;
    metrics.recordResponseTime(responseTime);
    
    logger.info('Search completed successfully', { 
      requestId, 
      query,
      responseTime: `${responseTime}ms`,
      resultCount: filteredResults.length,
      totalIndexSize: index.totalAssets,
      cacheSize: searchCache.size()
    });

    const response: ApiResponsePayload<SearchResult[]> = {
      data: filteredResults,
      requestId,
    };

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=120',
        'X-Cache': 'MISS',
        'X-Search-Query': query,
        'X-Result-Count': filteredResults.length.toString(),
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Search failed';
    
    logger.error('Search request failed', { 
      requestId, 
      responseTime: `${responseTime}ms`,
      error: errorMessage
    }, error instanceof Error ? error : new Error(errorMessage));
    
    metrics.recordApiError(error instanceof Error ? error : new Error(errorMessage));
    
    const response: ApiResponsePayload<null> = {
      data: null as never,
      error: 'Search service temporarily unavailable. Please try again later.',
      requestId,
    };
    
    return NextResponse.json(response, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
        'Cache-Control': 'no-cache',
      }
    });
  }
}

// Apply rate limiting and optional authentication
export const GET = withRateLimit(withOptionalAuth((request: Request) => handleSearch(request)));
import { NextResponse } from 'next/server';
import { fetchCryptoData, filterAndSortCryptocurrencyAssets } from '@/lib/binance';
import { assetsQuerySchema } from '@/lib/validation';
import { ApiResponsePayload, CryptocurrencyAsset } from '@/lib/types';
import { withRateLimit } from '@/lib/rateLimiter';
import { withOptionalAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/monitoring';
import { config } from '@/lib/env';
import { generateRequestId } from '@/lib/utils';

// Simple in-memory cache for API responses
const cache = new Map<string, { data: CryptocurrencyAsset[]; timestamp: number }>();
const CACHE_DURATION = config.cache.durationMs;
const MAX_CACHE_SIZE = config.cache.maxSize;

function getCacheKey(params: Record<string, string | number>): string {
  return JSON.stringify(params);
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

function cleanupCache(): void {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  
  // Remove expired entries
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      entriesToDelete.push(key);
    }
  }
  
  entriesToDelete.forEach(key => cache.delete(key));
  
  // If still over limit, remove oldest entries
  if (cache.size > MAX_CACHE_SIZE) {
    const sortedEntries = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const toRemove = sortedEntries.slice(0, cache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => cache.delete(key));
  }
}

async function handleGet(request: Request) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  logger.info('API request received', { requestId, url: request.url });
  metrics.recordApiRequest();
  
  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const validationResult = assetsQuerySchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      const errorMessage = `Invalid query parameters: ${validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
      logger.warn('Validation error', { requestId, error: errorMessage });
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

    const { limit, offset, quote, sort, dir, symbols } = validationResult.data;
    
    // Check cache
    const cacheKey = getCacheKey({ limit, offset, quote, sort, dir, symbols: symbols || '' });
    const cached = cache.get(cacheKey);
    
    if (cached && isCacheValid(cached.timestamp)) {
      metrics.recordCacheHit();
      logger.debug('Cache hit', { requestId, cacheKey });
      
      const response: ApiResponsePayload<CryptocurrencyAsset[]> = {
        data: cached.data,
        requestId,
      };
      
      return NextResponse.json(response, {
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId,
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=120',
          'X-Cache': 'HIT',
        }
      });
    }

    // Fetch fresh data with fallback (Binance -> CoinGecko)
    metrics.recordCacheMiss();
    logger.debug('Cache miss, fetching fresh data', { requestId, cacheKey });
    
    const normalizedAssets = await fetchCryptoData(quote);
    const filteredAssets = filterAndSortCryptocurrencyAssets(
      normalizedAssets,
      quote,
      sort,
      dir,
      limit,
      offset,
      symbols
    );

    // Update cache with cleanup
    cleanupCache();
    cache.set(cacheKey, {
      data: filteredAssets,
      timestamp: Date.now(),
    });

    const responseTime = Date.now() - startTime;
    metrics.recordResponseTime(responseTime);
    
    logger.info('API request completed successfully', { 
      requestId, 
      responseTime,
      assetCount: filteredAssets.length 
    });

    const response: ApiResponsePayload<CryptocurrencyAsset[]> = {
      data: filteredAssets,
      requestId,
    };

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=120',
        'X-Cache': 'MISS',
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    // Determine if this is a client error (4xx) or server error (5xx)
    let statusCode = 500;
    let userFriendlyMessage = 'Unable to fetch cryptocurrency data. Please try again later.';
    
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      statusCode = 504; // Gateway Timeout
      userFriendlyMessage = 'Request timed out. The cryptocurrency data service is slow to respond.';
    } else if (errorMessage.includes('API error: 429')) {
      statusCode = 429; // Too Many Requests
      userFriendlyMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
    } else if (errorMessage.includes('API error: 4')) {
      statusCode = 502; // Bad Gateway
      userFriendlyMessage = 'External service error. Please try again later.';
    } else if (errorMessage.includes('All API attempts failed')) {
      statusCode = 503; // Service Unavailable
      userFriendlyMessage = 'Cryptocurrency data services are temporarily unavailable.';
    }
    
    logger.error('API request failed', { 
      requestId, 
      responseTime,
      error: errorMessage,
      statusCode
    }, error instanceof Error ? error : new Error(errorMessage));
    
    metrics.recordApiError(error instanceof Error ? error : new Error(errorMessage));
    
    const response: ApiResponsePayload<null> = {
      data: null as never,
      error: userFriendlyMessage,
      requestId,
    };
    
    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': requestId,
        'Cache-Control': 'no-cache',
      }
    });
  }
}

// Apply rate limiting and optional authentication
export const GET = withRateLimit(withOptionalAuth((request: Request) => handleGet(request)));

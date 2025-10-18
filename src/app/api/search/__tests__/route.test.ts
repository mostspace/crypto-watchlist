import { NextRequest } from 'next/server';
import { GET } from '@/app/api/search/route';

// Mock the dependencies
jest.mock('@/lib/binance', () => ({
  fetchCryptoData: jest.fn().mockResolvedValue([
    {
      symbol: 'BTCUSDT',
      lastPrice: 45000,
      changePercent: 2.5,
      quoteVolume: 1000000000,
      name: 'Bitcoin'
    },
    {
      symbol: 'ETHUSDT',
      lastPrice: 3000,
      changePercent: -1.2,
      quoteVolume: 800000000,
      name: 'Ethereum'
    },
    {
      symbol: 'ADAUSDT',
      lastPrice: 0.5,
      changePercent: 5.8,
      quoteVolume: 200000000,
      name: 'Cardano'
    }
  ])
}));

jest.mock('@/lib/rateLimiter', () => ({
  withRateLimit: (handler: any) => handler
}));

jest.mock('@/lib/auth', () => ({
  withOptionalAuth: (handler: any) => handler
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('@/lib/monitoring', () => ({
  metrics: {
    recordApiRequest: jest.fn(),
    recordApiError: jest.fn(),
    recordResponseTime: jest.fn(),
    recordCacheHit: jest.fn(),
    recordCacheMiss: jest.fn()
  }
}));

jest.mock('@/lib/env', () => ({
  config: {
    cache: {
      durationMs: 300000,
      maxSize: 100
    }
  }
}));

describe('Search API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return search results for valid query', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?q=bitcoin&limit=10');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.requestId).toBeDefined();
  });

  it('should return error for invalid query parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?q=&limit=200');
    const response = await GET(request);
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('should handle empty search query', async () => {
    const request = new NextRequest('http://localhost:3000/api/search?q=');
    const response = await GET(request);
    
    expect(response.status).toBe(400);
  });

  it('should return cached results on subsequent requests', async () => {
    const request1 = new NextRequest('http://localhost:3000/api/search?q=bitcoin&limit=10');
    const response1 = await GET(request1);
    
    const request2 = new NextRequest('http://localhost:3000/api/search?q=bitcoin&limit=10');
    const response2 = await GET(request2);
    
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    
    const data1 = await response1.json();
    const data2 = await response2.json();
    
    expect(data1.data).toEqual(data2.data);
  });
});

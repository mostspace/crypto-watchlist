import { rateLimiter } from '../rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    // Clear the rate limiter store before each test
    // @ts-expect-error - Accessing private property for testing
    rateLimiter.store.clear();
  });

  it('should allow requests within the limit', () => {
    const result = rateLimiter.isAllowed('test-ip');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
  });

  it('should track multiple requests from same IP', () => {
    const ip = 'test-ip';
    
    // Make 60 requests (the limit)
    for (let i = 0; i < 60; i++) {
      const result = rateLimiter.isAllowed(ip);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(59 - i);
    }
  });

  it('should block requests after limit exceeded', () => {
    const ip = 'test-ip';
    
    // Exceed the limit
    for (let i = 0; i < 61; i++) {
      rateLimiter.isAllowed(ip);
    }
    
    const result = rateLimiter.isAllowed(ip);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset after time window', () => {
    const ip = 'test-ip';
    
    // Exceed the limit
    for (let i = 0; i < 61; i++) {
      rateLimiter.isAllowed(ip);
    }
    
    // Mock time to be after the reset window
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => originalDateNow() + 61000); // 61 seconds later
    
    const result = rateLimiter.isAllowed(ip);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
    
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  it('should handle different IPs independently', () => {
    const ip1 = 'ip1';
    const ip2 = 'ip2';
    
    // Exceed limit for ip1
    for (let i = 0; i < 61; i++) {
      rateLimiter.isAllowed(ip1);
    }
    
    // ip2 should still be allowed
    const result = rateLimiter.isAllowed(ip2);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
  });

  it('should extract client IP from headers', () => {
    const mockRequest = {
      headers: {
        get: jest.fn((header: string) => {
          if (header === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
          if (header === 'x-real-ip') return '192.168.1.2';
          if (header === 'cf-connecting-ip') return '192.168.1.3';
          return null;
        })
      }
    } as Request;

    const ip = rateLimiter.getClientIP(mockRequest);
    expect(ip).toBe('192.168.1.1'); // Should use first IP from x-forwarded-for
  });

  it('should fallback to unknown when no IP headers', () => {
    const mockRequest = {
      headers: {
        get: jest.fn(() => null)
      }
    } as Request;

    const ip = rateLimiter.getClientIP(mockRequest);
    expect(ip).toBe('unknown');
  });
});

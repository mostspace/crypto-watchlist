import { validateBearerToken, withAuth, withOptionalAuth } from '../auth';

describe('Authentication', () => {
  const validToken = 'crypto-watchlist-2025';
  const invalidToken = 'invalid-token';

  describe('validateBearerToken', () => {
    it('should validate correct Bearer token', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header: string) => {
            if (header === 'Authorization') return `Bearer ${validToken}`;
            return null;
          })
        }
      } as Request;

      const result = validateBearerToken(mockRequest);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject missing Authorization header', () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        }
      } as Request;

      const result = validateBearerToken(mockRequest);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing Authorization header');
    });

    it('should reject invalid Authorization header format', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header: string) => {
            if (header === 'Authorization') return 'InvalidFormat token';
            return null;
          })
        }
      } as Request;

      const result = validateBearerToken(mockRequest);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid Authorization header format. Expected: Bearer <token>');
    });

    it('should reject invalid token', () => {
      const mockRequest = {
        headers: {
          get: jest.fn((header: string) => {
            if (header === 'Authorization') return `Bearer ${invalidToken}`;
            return null;
          })
        }
      } as Request;

      const result = validateBearerToken(mockRequest);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });
  });

  describe('withAuth middleware', () => {
    it('should allow access with valid token', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const mockRequest = {
        headers: {
          get: jest.fn((header: string) => {
            if (header === 'Authorization') return `Bearer ${validToken}`;
            return null;
          })
        }
      } as Request;

      const wrappedHandler = withAuth(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest);
      expect(response.status).toBe(200);
    });

    it('should reject access with invalid token', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const mockRequest = {
        headers: {
          get: jest.fn((header: string) => {
            if (header === 'Authorization') return `Bearer ${invalidToken}`;
            return null;
          })
        }
      } as Request;

      const wrappedHandler = withAuth(mockHandler);
      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
      
      const responseData = await response.json();
      expect(responseData.error).toBe('Unauthorized');
      expect(responseData.message).toBe('Invalid API key');
    });
  });

  describe('withOptionalAuth middleware', () => {
    it('should pass authentication status to handler', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const mockRequest = {
        headers: {
          get: jest.fn((header: string) => {
            if (header === 'Authorization') return `Bearer ${validToken}`;
            return null;
          })
        }
      } as Request;

      const wrappedHandler = withOptionalAuth(mockHandler);
      await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, true);
    });

    it('should pass false for unauthenticated requests', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        }
      } as Request;

      const wrappedHandler = withOptionalAuth(mockHandler);
      await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, false);
    });
  });
});

// Simple Bearer token authentication
const VALID_API_KEY = process.env.API_KEY || 'crypto-watchlist-2025';

export interface AuthResult {
  isValid: boolean;
  error?: string;
}

export function validateBearerToken(request: Request): AuthResult {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return {
      isValid: false,
      error: 'Missing Authorization header',
    };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return {
      isValid: false,
      error: 'Invalid Authorization header format. Expected: Bearer <token>',
    };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (token !== VALID_API_KEY) {
    return {
      isValid: false,
      error: 'Invalid API key',
    };
  }

  return {
    isValid: true,
  };
}

// Authentication middleware
export function withAuth(handler: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    const authResult = validateBearerToken(request);
    
    if (!authResult.isValid) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: authResult.error,
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer',
          },
        }
      );
    }

    return handler(request);
  };
}

// Optional authentication middleware (for endpoints that work with or without auth)
export function withOptionalAuth(handler: (request: Request, isAuthenticated: boolean) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    const authResult = validateBearerToken(request);
    return handler(request, authResult.isValid);
  };
}

import { z } from 'zod';

// Env schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  LOG_LEVEL: z.enum(['ERROR', 'WARN', 'INFO', 'DEBUG']).optional(),
  API_KEY: z.string().optional(),
  API_TOKEN: z.string().optional(),
  BINANCE_API_BASE: z.string().url().optional(),
  COINGECKO_API_BASE: z.string().url().optional(),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().optional(),
  CACHE_DURATION_MS: z.coerce.number().positive().optional(),
  THROTTLE_UPDATE_INTERVAL: z.coerce.number().positive().optional(),
  MAX_CACHE_SIZE: z.coerce.number().positive().optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  CORS_CREDENTIALS: z.coerce.boolean().optional(),
  ENABLE_METRICS: z.coerce.boolean().optional(),
  METRICS_RETENTION_HOURS: z.coerce.number().positive().optional(),
  ENABLE_WEBSOCKET: z.coerce.boolean().optional(),
  ENABLE_POLLING_FALLBACK: z.coerce.boolean().optional(),
  ENABLE_PERFORMANCE_MONITORING: z.coerce.boolean().optional(),
});

// Parse env vars
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    // Use a simple fallback for env validation errors in production
    if (process.env.NODE_ENV === 'production') {
      console.warn('Environment validation failed, using defaults');
      return envSchema.parse({});
    }
    throw new Error('Invalid env config');
  }
}

export const env = validateEnv();

// Config
export const config = {
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  // API Configuration
  api: {
    key: env.API_KEY || 'crypto-watchlist-2025',
    token: env.API_TOKEN || 'crypto-watchlist-2025',
    binanceBase: env.BINANCE_API_BASE || 'https://api.binance.com/api/v3',
    coinGeckoBase: env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3',
  },
  
  // Rate Limiting
  rateLimit: {
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS || 60,
    windowMs: env.RATE_LIMIT_WINDOW_MS || 60000, // 1 minute
  },
  
  // Caching
  cache: {
    durationMs: env.CACHE_DURATION_MS || 60000, // 1 minute
    maxSize: env.MAX_CACHE_SIZE || 1000,
  },
  
  
  // Performance Configuration
  performance: {
    throttleUpdateInterval: env.THROTTLE_UPDATE_INTERVAL || 200,
  },
  
  // Security Configuration
  security: {
    allowedOrigins: env.ALLOWED_ORIGINS || (env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://your-domain.com'),
    corsCredentials: env.CORS_CREDENTIALS || true,
  },
  
  // Feature Flags
  features: {
    enablePollingFallback: env.ENABLE_POLLING_FALLBACK !== false,
    enablePerformanceMonitoring: env.ENABLE_PERFORMANCE_MONITORING !== false,
    enableMetrics: env.ENABLE_METRICS !== false,
  },
  
  // Monitoring Configuration
  monitoring: {
    metricsRetentionHours: env.METRICS_RETENTION_HOURS || 24,
  },
  
  // Logging
  logging: {
    level: env.LOG_LEVEL || (env.NODE_ENV === 'development' ? 'DEBUG' : 'INFO'),
  },
} as const;

// Type-safe environment access
export type Config = typeof config;

/**
 * Application constants and configuration values
 */

import { config } from './env';

// API Configuration
export const API_CONFIG = {
  BINANCE_BASE_URL: config.api.binanceBase,
  COINGECKO_BASE_URL: config.api.coinGeckoBase,
  DEFAULT_TIMEOUT: 10000,
  MAX_RETRIES: 3,
} as const;

// Rate Limiting
export const RATE_LIMIT_CONFIG = {
  DEFAULT_MAX_REQUESTS: config.rateLimit.maxRequests,
  DEFAULT_WINDOW_MS: config.rateLimit.windowMs,
  BURST_ALLOWANCE: 10,
} as const;

// Caching
export const CACHE_CONFIG = {
  DEFAULT_DURATION_MS: config.cache.durationMs,
  MAX_SIZE: config.cache.maxSize,
  CLEANUP_INTERVAL_MS: 300000, // 5 minutes
} as const;


// Performance Configuration
export const PERFORMANCE_CONFIG = {
  THROTTLE_UPDATE_INTERVAL: config.performance.throttleUpdateInterval,
  DEBOUNCE_SEARCH_DELAY: 300,
  LAZY_LOAD_THRESHOLD: 100,
  MEMORY_CLEANUP_INTERVAL: 300000, // 5 minutes
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DEFAULT_DURATION: 4000,
  TOAST_MAX_COUNT: 5,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  API_ERROR: 'Unable to fetch data. Please try again later.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.',
  VALIDATION_ERROR: 'Invalid input provided. Please check your request.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  FAVORITE_ADDED: 'Added to favorites',
  FAVORITE_REMOVED: 'Removed from favorites',
  DATA_REFRESHED: 'Data refreshed successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

// Asset Display Configuration
export const ASSET_DISPLAY_CONFIG = {
  DEFAULT_DECIMAL_PLACES: 2,
  PRICE_DECIMAL_PLACES: {
    HIGH: 2,    // > $1000
    MEDIUM: 4,  // $1 - $1000
    LOW: 8,     // < $1
  },
  VOLUME_DECIMAL_PLACES: 0,
  PERCENTAGE_DECIMAL_PLACES: 2,
} as const;

// Sort Options
export const SORT_OPTIONS = {
  FIELDS: ['symbol', 'price', 'change', 'volume'] as const,
  DIRECTIONS: ['asc', 'desc'] as const,
  DEFAULT_FIELD: 'volume' as const,
  DEFAULT_DIRECTION: 'desc' as const,
} as const;

// Quote Currencies
export const QUOTE_CURRENCIES = {
  USDT: 'USDT',
  USD: 'USD',
  DEFAULT: 'USDT' as const,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  FAVORITES: 'crypto-favorites',
  SETTINGS: 'crypto-settings',
  CACHE: 'crypto-cache',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_POLLING_FALLBACK: config.features.enablePollingFallback,
  ENABLE_PERFORMANCE_MONITORING: config.features.enablePerformanceMonitoring,
  ENABLE_ANALYTICS: config.features.enableMetrics,
  ENABLE_OFFLINE_MODE: false,
} as const;

// Health Check Thresholds
export const HEALTH_THRESHOLDS = {
  ERROR_RATE_WARNING: 5,      // 5%
  ERROR_RATE_CRITICAL: 10,    // 10%
  RESPONSE_TIME_WARNING: 1000, // 1s
  RESPONSE_TIME_CRITICAL: 2000, // 2s
  CACHE_HIT_RATE_WARNING: 50,  // 50%
  CACHE_HIT_RATE_CRITICAL: 30, // 30%
} as const;

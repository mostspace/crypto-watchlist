import { z } from 'zod';

// Input sanitization helpers
// TODO: Add more comprehensive sanitization if needed
// const sanitizeString = (str: string): string => {
//   return str.trim().replace(/[<>\"'&]/g, '');
// };

const sanitizeSymbols = (symbols: string): string => {
  return symbols
    .split(',')
    .map(s => s.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .filter(s => s.length > 0 && s.length <= 10)
    .slice(0, 50) // Max 50 symbols to prevent abuse
    .join(',');
};

// Enhanced validation schemas
export const assetsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  quote: z.enum(['USDT', 'USD']).default('USDT'),
  sort: z.enum(['volume', 'price', 'change']).default('volume'),
  dir: z.enum(['asc', 'desc']).default('desc'),
  symbols: z.string()
    .optional()
    .transform((val) => val ? sanitizeSymbols(val) : undefined),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(100).describe('Search query'),
  limit: z.coerce.number().min(1).max(100).default(20).describe('Maximum number of results'),
  offset: z.coerce.number().min(0).default(0).describe('Number of results to skip'),
  quote: z.enum(['USDT', 'USD']).default('USDT').describe('Quote currency'),
  includeMetadata: z.coerce.boolean().default(false).describe('Include additional metadata'),
});

export const healthQuerySchema = z.object({
  detailed: z.coerce.boolean().default(false),
  includeMetrics: z.coerce.boolean().default(true),
});


export const assetSchema = z.object({
  symbol: z.string().min(1).max(20),
  name: z.string().min(1).max(100).optional(),
  lastPrice: z.number().positive(),
  changePercent: z.number(),
  volume: z.number().nonnegative().optional(),
  quoteVolume: z.number().nonnegative().optional(),
});

export type AssetsQuery = z.infer<typeof assetsQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type HealthQuery = z.infer<typeof healthQuerySchema>;
export type Asset = z.infer<typeof assetSchema>;

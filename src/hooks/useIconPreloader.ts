'use client';

import { useEffect, useRef } from 'react';

// Most common cryptocurrencies for preloading (top 20 by market cap)
const COMMON_CRYPTOS = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'DOT', 'LINK', 'TRX',
  'MATIC', 'LTC', 'BCH', 'UNI', 'ATOM', 'NEAR', 'FTM', 'ALGO', 'VET', 'ICP'
];

// Preload cache to track which images have been preloaded
const preloadCache = new Set<string>();

// CoinGecko coin IDs mapping (for the most common cryptocurrencies)
const COINGECKO_IDS: Record<string, string> = {
  BTC: '1',
  ETH: '1027',
  BNB: '1839',
  SOL: '4128',
  XRP: '52',
  ADA: '2010',
  AVAX: '12559',
  DOT: '6636',
  LINK: '1975',
  TRX: '1958',
  MATIC: '3890',
  LTC: '2',
  BCH: '1831',
  UNI: '7083',
  ATOM: '3794',
  NEAR: '6535',
  FTM: '3513',
  ALGO: '4030',
  VET: '3077',
  ICP: '8916',
};

// Special handling for specific cryptocurrencies that need official sources
const getOfficialLogoUrl = (symbol: string): string | null => {
  const upperSymbol = symbol.toUpperCase();
  
  // Solana official logo from Solana Labs GitHub
  if (upperSymbol === 'SOL') {
    return 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
  }
  
  return null;
};

function getCoinGeckoId(symbol: string): string {
  return COINGECKO_IDS[symbol.toUpperCase()] || symbol.toLowerCase();
}

// Primary CoinGecko CDN source
const getCoinGeckoUrl = (symbol: string) => 
  `https://assets.coingecko.com/coins/images/${getCoinGeckoId(symbol)}/large/${symbol.toLowerCase()}.png`;

/**
 * Hook to preload common cryptocurrency icons for better performance
 */
export function useIconPreloader() {
  const preloadedRef = useRef(false);

  useEffect(() => {
    // Only preload once
    if (preloadedRef.current) return;
    preloadedRef.current = true;

    const preloadIcons = () => {
      COMMON_CRYPTOS.forEach(symbol => {
        const baseSymbol = symbol.toUpperCase();
        const officialLogoUrl = getOfficialLogoUrl(baseSymbol);
        const primaryUrl = officialLogoUrl || getCoinGeckoUrl(baseSymbol);
        
        if (!preloadCache.has(primaryUrl)) {
          preloadCache.add(primaryUrl);
          
          // Create a link element for preloading
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = primaryUrl;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }
      });
    };

    // Preload immediately for above-the-fold content
    preloadIcons();
    
    // Also preload on next frame to not block initial render
    requestAnimationFrame(preloadIcons);
  }, []);

  return {
    isCommonCrypto: (symbol: string) => COMMON_CRYPTOS.includes(symbol.toUpperCase()),
    preloadIcon: (symbol: string) => {
      const baseSymbol = symbol.toUpperCase();
      const officialLogoUrl = getOfficialLogoUrl(baseSymbol);
      const primaryUrl = officialLogoUrl || getCoinGeckoUrl(baseSymbol);
      
      if (!preloadCache.has(primaryUrl)) {
        preloadCache.add(primaryUrl);
        
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = primaryUrl;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    }
  };
}

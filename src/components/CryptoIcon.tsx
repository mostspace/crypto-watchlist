'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { extractBaseCryptocurrencySymbol } from '@/lib/cryptocurrency-symbol-utils';
import { useIconPreloader } from '@/hooks/useIconPreloader';

interface CryptoIconProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
}

// Primary reliable CDN source - CoinGecko (official brand logos)
const COINGECKO_SOURCES = [
  // Primary CoinGecko CDN (most reliable for official logos)
  (symbol: string) => `https://assets.coingecko.com/coins/images/${getCoinGeckoId(symbol)}/large/${symbol.toLowerCase()}.png`,
  
  // Alternative CoinGecko endpoint
  (symbol: string) => `https://coin-images.coingecko.com/coins/images/${getCoinGeckoId(symbol)}/large/${symbol.toLowerCase()}.png`,
];

// Special handling for specific cryptocurrencies that need official sources
const getOfficialLogoUrl = (symbol: string): string | null => {
  const upperSymbol = symbol.toUpperCase();
  
  // Solana official logo from Solana Labs GitHub
  if (upperSymbol === 'SOL') {
    return 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
  }
  
  return null;
};

// Fallback sources (only used if CoinGecko fails)
const FALLBACK_SOURCES = [
  // CoinMarketCap as secondary official source
  (symbol: string) => `https://s2.coinmarketcap.com/static/img/coins/64x64/${getCoinMarketCapId(symbol)}.png`,
  
  // CryptoIcons.org as tertiary fallback
  (symbol: string) => `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/200`,
];

// Combine sources with CoinGecko as primary
const LOGO_SOURCES = [...COINGECKO_SOURCES, ...FALLBACK_SOURCES];


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
  FIL: '2280',
  HBAR: '4642',
  EGLD: '6892',
  THETA: '2416',
  FLOW: '4558',
  MANA: '1966',
  SAND: '6210',
  AXS: '6783',
  CHZ: '1982',
  ENJ: '2130',
  GALA: '7080',
  ILV: '8719',
  SLP: '5824',
  APE: '18876',
  GMT: '18069',
  LRC: '1934',
  IMX: '10603',
  OP: '11840',
  ARB: '11841',
  LDO: '13573',
  RPL: '2944',
  FRAX: '6952',
  USDT: '825',
  USDC: '3408',
  BUSD: '4687',
  DAI: '4943',
  TUSD: '2563',
  FDUSD: '22974',
  DOGE: '5',
  SHIB: '11939',
  PEPE: '24478',
  FLOKI: '12304',
  BONK: '23095',
  WIF: '28324',
  AAVE: '7278',
  COMP: '5692',
  MKR: '1518',
  SNX: '2586',
  YFI: '5864',
  CRV: '6538',
  SUSHI: '6758',
  CRO: '3635',
  KLAY: '4256',
  ONE: '3945',
  LUNA: '4172',
  UST: '7129',
  WBTC: '3717',
  WBETH: '22615',
  WETH: '2396',
  WBNB: '7192',
  PAXG: '4705',
  
  // Additional problematic assets
  ZEC: '1437',
  CBBTC: '3717', // Coinbase Wrapped BTC uses same as WBTC
  HYPE: '27750',
  ASTER: '27751',
  SUI: '20947',
  '2Z': '27752',
};

// CoinMarketCap IDs mapping
const COINMARKETCAP_IDS: Record<string, string> = {
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
  FIL: '2280',
  HBAR: '4642',
  EGLD: '6892',
  THETA: '2416',
  FLOW: '4558',
  MANA: '1966',
  SAND: '6210',
  AXS: '6783',
  CHZ: '1982',
  ENJ: '2130',
  GALA: '7080',
  ILV: '8719',
  SLP: '5824',
  APE: '18876',
  GMT: '18069',
  LRC: '1934',
  IMX: '10603',
  OP: '11840',
  ARB: '11841',
  LDO: '13573',
  RPL: '2944',
  FRAX: '6952',
  USDT: '825',
  USDC: '3408',
  BUSD: '4687',
  DAI: '4943',
  TUSD: '2563',
  FDUSD: '22974',
  DOGE: '5',
  SHIB: '11939',
  PEPE: '24478',
  FLOKI: '12304',
  BONK: '23095',
  WIF: '28324',
  AAVE: '7278',
  COMP: '5692',
  MKR: '1518',
  SNX: '2586',
  YFI: '5864',
  CRV: '6538',
  SUSHI: '6758',
  CRO: '3635',
  KLAY: '4256',
  ONE: '3945',
  LUNA: '4172',
  UST: '7129',
  WBTC: '3717',
  WBETH: '22615',
  WETH: '2396',
  WBNB: '7192',
  PAXG: '4705',
  
  // Additional problematic assets
  ZEC: '1437',
  CBBTC: '3717', // Coinbase Wrapped BTC uses same as WBTC
  HYPE: '27750',
  ASTER: '27751',
  SUI: '20947',
  '2Z': '27752',
};

// Helper functions to get IDs
function getCoinGeckoId(symbol: string): string {
  return COINGECKO_IDS[symbol.toUpperCase()] || symbol.toLowerCase();
}

function getCoinMarketCapId(symbol: string): string {
  return COINMARKETCAP_IDS[symbol.toUpperCase()] || symbol.toLowerCase();
}


const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const CryptoIcon = memo(function CryptoIcon({ symbol, size = 'md' }: CryptoIconProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use the icon preloader hook
  const { isCommonCrypto, preloadIcon } = useIconPreloader();
  
  // Extract base symbol using the utility function
  const baseSymbol = extractBaseCryptocurrencySymbol(symbol).toUpperCase();
  
  // Check for official logo URL first
  const officialLogoUrl = getOfficialLogoUrl(baseSymbol);
  
  // Get current icon URL from the current source (official first, then CoinGecko primary)
  const currentIconUrl = officialLogoUrl || LOGO_SOURCES[currentSourceIndex](baseSymbol);

  // Preload this specific icon if it's not common
  if (!isCommonCrypto(baseSymbol)) {
    preloadIcon(baseSymbol);
  }

  const handleImageError = () => {
    // Try the next source if available
    if (currentSourceIndex < LOGO_SOURCES.length - 1) {
      setCurrentSourceIndex(prev => prev + 1);
    } else {
      // All sources failed, show fallback
      setShowFallback(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    // Reset states when image loads successfully
    setShowFallback(false);
    setIsLoading(false);
    setImageLoaded(true);
  };

  // Show fallback immediately if all sources are exhausted
  if (showFallback) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-xs shadow-lg`}
        title={baseSymbol}
      >
        {baseSymbol.charAt(0)}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Simple placeholder while loading */}
      {isLoading && !imageLoaded && (
        <div 
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-bold text-xs shadow-lg`}
          title={`Loading ${baseSymbol}...`}
        >
          {baseSymbol.charAt(0)}
        </div>
      )}
      
      <Image
        src={currentIconUrl}
        alt={`${baseSymbol} icon`}
        width={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
        height={size === 'sm' ? 24 : size === 'md' ? 32 : 48}
        className={`w-full h-full rounded-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        title={baseSymbol}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading={isCommonCrypto(baseSymbol) ? "eager" : "lazy"}
        priority={isCommonCrypto(baseSymbol)}
      />
      
      {/* Fallback icon when image fails to load */}
      {showFallback && (
        <div 
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-xs shadow-lg`}
          title={baseSymbol}
        >
          {baseSymbol.charAt(0)}
        </div>
      )}
    </div>
  );
});


import { BinanceTickerData, CryptocurrencyAsset, CoinGeckoMarketDataResponse } from './types';

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export async function retrieveBinanceTickerData(): Promise<BinanceTickerData[]> {
  const abortController = new AbortController();
  const requestTimeoutId = setTimeout(() => abortController.abort(), 10000); // 10 second timeout
  
  try {
    const apiResponse = await fetch(`${BINANCE_API_BASE}/ticker/24hr`, {
      signal: abortController.signal,
      headers: {
        'User-Agent': 'CryptoWatchlist/1.0',
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(requestTimeoutId);
    
    if (!apiResponse.ok) {
      throw new Error(`Binance API error: ${apiResponse.status} ${apiResponse.statusText}`);
    }
    
    return apiResponse.json();
  } catch (error) {
    clearTimeout(requestTimeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Binance API request timed out');
    }
    throw error;
  }
}

export async function retrieveCoinGeckoMarketData(
  vsCurrency: string = 'usd',
  order: string = 'market_cap_desc',
  perPage: number = 250,
  page: number = 1
): Promise<CoinGeckoMarketDataResponse[]> {
  const queryParameters = new URLSearchParams({
    vs_currency: vsCurrency,
    order,
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: 'false',
    price_change_percentage: '24h'
  });

  const abortController = new AbortController();
  const requestTimeoutId = setTimeout(() => abortController.abort(), 15000); // 15 second timeout for CoinGecko
  
  try {
    const apiResponse = await fetch(`${COINGECKO_API_BASE}/coins/markets?${queryParameters}`, {
      signal: abortController.signal,
      headers: {
        'User-Agent': 'CryptoWatchlist/1.0',
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(requestTimeoutId);
    
    if (!apiResponse.ok) {
      throw new Error(`CoinGecko API error: ${apiResponse.status} ${apiResponse.statusText}`);
    }
    
    return apiResponse.json();
  } catch (error) {
    clearTimeout(requestTimeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('CoinGecko API request timed out');
    }
    throw error;
  }
}

export async function fetchCryptoData(quote: string = 'USDT'): Promise<CryptocurrencyAsset[]> {
  // Try Binance first, fallback to CoinGecko if needed
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      const data = await retrieveBinanceTickerData();
      return transformBinanceTickerDataToAssets(data);
    } catch (err) {
      attempts++;
      console.log(`Binance failed (attempt ${attempts}):`, err instanceof Error ? err.message : 'Unknown error');
      
      if (attempts >= maxAttempts) {
        // Try CoinGecko as fallback
        try {
          console.log('Switching to CoinGecko...');
          const coinGeckoData = await retrieveCoinGeckoMarketData();
          let assets = transformCoinGeckoMarketDataToAssets(coinGeckoData);
          
          // Handle USDT conversion from USD
          if (quote === 'USDT') {
            assets = assets.map(asset => ({
              ...asset,
              symbol: asset.symbol.replace('USD', 'USDT')
            }));
            
            // Remove duplicates - keep higher volume ones
            const seen = new Map<string, CryptocurrencyAsset>();
            assets.forEach(asset => {
              const existing = seen.get(asset.symbol);
              if (!existing || asset.quoteVolume > existing.quoteVolume) {
                seen.set(asset.symbol, asset);
              }
            });
            assets = Array.from(seen.values());
          }
          
          return assets;
        } catch (fallbackErr) {
          throw new Error(`Both APIs failed. Binance: ${err instanceof Error ? err.message : 'Unknown'}, CoinGecko: ${fallbackErr instanceof Error ? fallbackErr.message : 'Unknown'}`);
        }
      }
      
      // Wait a bit before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
  
  throw new Error('Should not reach here');
}

export function transformBinanceTickerDataToAssets(tickers: BinanceTickerData[]): CryptocurrencyAsset[] {
  return tickers.map(ticker => ({
    symbol: ticker.symbol,
    lastPrice: parseFloat(ticker.lastPrice),
    changePercent: parseFloat(ticker.priceChangePercent),
    quoteVolume: parseFloat(ticker.quoteVolume),
    name: getAssetName(ticker.symbol),
  }));
}

export function transformCoinGeckoMarketDataToAssets(marketData: CoinGeckoMarketDataResponse[]): CryptocurrencyAsset[] {
  return marketData.map(coin => ({
    symbol: `${coin.symbol.toUpperCase()}USD`,
    lastPrice: coin.current_price,
    changePercent: coin.price_change_percentage_24h || 0,
    quoteVolume: coin.total_volume,
    name: coin.name,
  }));
}

export function filterAndSortCryptocurrencyAssets(
  assets: CryptocurrencyAsset[],
  quote: string = 'USDT',
  sortBy: 'volume' | 'price' | 'change' = 'volume',
  direction: 'asc' | 'desc' = 'desc',
  limit: number = 20,
  offset: number = 0,
  symbols?: string
): CryptocurrencyAsset[] {
  // Filter by quote currency (support both USDT and USD)
  let filtered = assets.filter(asset => 
    asset.symbol.endsWith(quote.toUpperCase())
  );

  // Filter by specific symbols if provided
  if (symbols) {
    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
    filtered = filtered.filter(asset => 
      symbolList.includes(asset.symbol)
    );
  }

  // Sort
  filtered.sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case 'price':
        aValue = a.lastPrice;
        bValue = b.lastPrice;
        break;
      case 'change':
        aValue = a.changePercent;
        bValue = b.changePercent;
        break;
      case 'volume':
      default:
        aValue = a.quoteVolume;
        bValue = b.quoteVolume;
        break;
    }

    if (direction === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Apply offset and limit for pagination
  return filtered.slice(offset, offset + limit);
}

function getAssetName(symbol: string): string {
  // Strip USDT/USD suffix to get base symbol
  const baseSymbol = symbol.replace(/USDT$/, '');
  
  // Map of common crypto symbols to their full names
  // TODO: This could be expanded or moved to a config file
  const cryptoNames: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum', 
    'BNB': 'BNB',
    'XRP': 'XRP',
    'ADA': 'Cardano',
    'SOL': 'Solana',
    'DOGE': 'Dogecoin',
    'DOT': 'Polkadot',
    'AVAX': 'Avalanche',
    'SHIB': 'Shiba Inu',
    'MATIC': 'Polygon',
    'LTC': 'Litecoin',
    'UNI': 'Uniswap',
    'LINK': 'Chainlink',
    'ATOM': 'Cosmos',
    'ETC': 'Ethereum Classic',
    'XLM': 'Stellar',
    'BCH': 'Bitcoin Cash',
    'ALGO': 'Algorand',
  };

  return cryptoNames[baseSymbol] || baseSymbol; // fallback to symbol if not found
}

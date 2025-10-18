import { transformBinanceTickerDataToAssets, transformCoinGeckoMarketDataToAssets, filterAndSortCryptocurrencyAssets, fetchCryptoData } from '../binance';
import { BinanceTickerData, CoinGeckoMarketDataResponse } from '../../types';

describe('binance utilities', () => {
  // Mock data for testing
  const mockCoinGeckoData: CoinGeckoMarketDataResponse[] = [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 45000,
      market_cap: 850000000000,
      market_cap_rank: 1,
      fully_diluted_valuation: 945000000000,
      total_volume: 25000000000,
      high_24h: 46000,
      low_24h: 44000,
      price_change_24h: 1000,
      price_change_percentage_24h: 2.5,
      market_cap_change_24h: 20000000000,
      market_cap_change_percentage_24h: 2.4,
      circulating_supply: 18888888,
      total_supply: 21000000,
      max_supply: 21000000,
      ath: 69000,
      ath_change_percentage: -34.8,
      ath_date: '2021-11-10T14:24:11.849Z',
      atl: 67.81,
      atl_change_percentage: 66200,
      atl_date: '2013-07-06T00:00:00.000Z',
      roi: null,
      last_updated: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 3000,
      market_cap: 360000000000,
      market_cap_rank: 2,
      fully_diluted_valuation: 360000000000,
      total_volume: 15000000000,
      high_24h: 3100,
      low_24h: 2950,
      price_change_24h: -36,
      price_change_percentage_24h: -1.2,
      market_cap_change_24h: -4320000000,
      market_cap_change_percentage_24h: -1.2,
      circulating_supply: 120000000,
      total_supply: 120000000,
      max_supply: null,
      ath: 4878,
      ath_change_percentage: -38.5,
      ath_date: '2021-11-10T14:24:19.604Z',
      atl: 0.432979,
      atl_change_percentage: 692000,
      atl_date: '2015-10-20T00:00:00.000Z',
      roi: null,
      last_updated: '2025-01-01T00:00:00.000Z',
    },
  ];

  const mockBinanceTickers: BinanceTickerData[] = [
    {
      symbol: 'BTCUSDT',
      lastPrice: '45000.00',
      priceChangePercent: '2.50',
      quoteVolume: '1000000000',
      volume: '22222.22',
      highPrice: '46000.00',
      lowPrice: '44000.00',
      openPrice: '43900.00',
      count: 1000,
    },
    {
      symbol: 'ETHUSDT',
      lastPrice: '3000.00',
      priceChangePercent: '-1.20',
      quoteVolume: '500000000',
      volume: '166666.67',
      highPrice: '3100.00',
      lowPrice: '2950.00',
      openPrice: '3036.00',
      count: 2000,
    },
    {
      symbol: 'ADAUSDT',
      lastPrice: '1.25',
      priceChangePercent: '5.80',
      quoteVolume: '100000000',
      volume: '80000000',
      highPrice: '1.30',
      lowPrice: '1.20',
      openPrice: '1.18',
      count: 5000,
    },
  ];

  describe('transformCoinGeckoMarketDataToAssets', () => {
    it('should normalize CoinGecko market data to Asset format', () => {
      const result = transformCoinGeckoMarketDataToAssets(mockCoinGeckoData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        symbol: 'BTCUSD',
        lastPrice: 45000,
        changePercent: 2.5,
        quoteVolume: 25000000000,
        name: 'Bitcoin',
      });
      expect(result[1]).toEqual({
        symbol: 'ETHUSD',
        lastPrice: 3000,
        changePercent: -1.2,
        quoteVolume: 15000000000,
        name: 'Ethereum',
      });
    });

    it('should handle missing price change percentage', () => {
      const dataWithMissingChange: CoinGeckoMarketData[] = [
        {
          ...mockCoinGeckoData[0],
          price_change_percentage_24h: null as unknown as number,
        },
      ];

      const result = transformCoinGeckoMarketDataToAssets(dataWithMissingChange);
      expect(result[0].changePercent).toBe(0);
    });
  });

  describe('transformBinanceTickerDataToAssets', () => {
    it('should normalize Binance ticker data to Asset format', () => {
      const result = transformBinanceTickerDataToAssets(mockBinanceTickers);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        symbol: 'BTCUSDT',
        lastPrice: 45000.00,
        changePercent: 2.50,
        quoteVolume: 1000000000,
        name: 'Bitcoin',
      });
      expect(result[1]).toEqual({
        symbol: 'ETHUSDT',
        lastPrice: 3000.00,
        changePercent: -1.20,
        quoteVolume: 500000000,
        name: 'Ethereum',
      });
    });

    it('should handle unknown symbols by using the base symbol as name', () => {
      const unknownTicker: BinanceTickerData = {
        ...mockBinanceTickers[0],
        symbol: 'UNKNOWNUSDT',
      };

      const result = transformBinanceTickerDataToAssets([unknownTicker]);
      expect(result[0].name).toBe('UNKNOWN');
    });
  });

  describe('filterAndSortCryptocurrencyAssets', () => {
    const normalizedBinanceAssets = transformBinanceTickerDataToAssets(mockBinanceTickers);
    const normalizedCoinGeckoAssets = transformCoinGeckoMarketDataToAssets(mockCoinGeckoData);

    it('should filter by quote currency (USDT)', () => {
      const result = filterAndSortCryptocurrencyAssets(normalizedBinanceAssets, 'USDT');
      expect(result).toHaveLength(3);
      expect(result.every(asset => asset.symbol.endsWith('USDT'))).toBe(true);
    });

    it('should filter by quote currency (USD)', () => {
      const result = filterAndSortCryptocurrencyAssets(normalizedCoinGeckoAssets, 'USD');
      expect(result).toHaveLength(2);
      expect(result.every(asset => asset.symbol.endsWith('USD'))).toBe(true);
    });

    it('should filter by specific symbols (USDT)', () => {
      const result = filterAndSortCryptocurrencyAssets(
        normalizedBinanceAssets,
        'USDT',
        'volume',
        'desc',
        10,
        0,
        'BTCUSDT,ETHUSDT'
      );
      expect(result).toHaveLength(2);
      expect(result.map(a => a.symbol)).toEqual(['BTCUSDT', 'ETHUSDT']);
    });

    it('should filter by specific symbols (USD)', () => {
      const result = filterAndSortCryptocurrencyAssets(
        normalizedCoinGeckoAssets,
        'USD',
        'volume',
        'desc',
        10,
        0,
        'BTCUSD,ETHUSD'
      );
      expect(result).toHaveLength(2);
      expect(result.map(a => a.symbol)).toEqual(['BTCUSD', 'ETHUSD']);
    });

    it('should sort by volume in descending order by default (USDT)', () => {
      const result = filterAndSortCryptocurrencyAssets(normalizedBinanceAssets, 'USDT', 'volume', 'desc');
      expect(result[0].symbol).toBe('BTCUSDT'); // Highest volume
      expect(result[1].symbol).toBe('ETHUSDT');
      expect(result[2].symbol).toBe('ADAUSDT'); // Lowest volume
    });

    it('should sort by volume in descending order by default (USD)', () => {
      const result = filterAndSortCryptocurrencyAssets(normalizedCoinGeckoAssets, 'USD', 'volume', 'desc');
      expect(result[0].symbol).toBe('BTCUSD'); // Highest volume
      expect(result[1].symbol).toBe('ETHUSD'); // Lower volume
    });

    it('should sort by price in ascending order (USDT)', () => {
      const result = filterAndSortCryptocurrencyAssets(normalizedBinanceAssets, 'USDT', 'price', 'asc');
      expect(result[0].symbol).toBe('ADAUSDT'); // Lowest price
      expect(result[1].symbol).toBe('ETHUSDT');
      expect(result[2].symbol).toBe('BTCUSDT'); // Highest price
    });

    it('should sort by price in ascending order (USD)', () => {
      const result = filterAndSortCryptocurrencyAssets(normalizedCoinGeckoAssets, 'USD', 'price', 'asc');
      expect(result[0].symbol).toBe('ETHUSD'); // Lower price
      expect(result[1].symbol).toBe('BTCUSD'); // Higher price
    });

    it('should sort by change percentage in descending order (USDT)', () => {
      const result = filterAndSortCryptocurrencyAssets(normalizedBinanceAssets, 'USDT', 'change', 'desc');
      expect(result[0].symbol).toBe('ADAUSDT'); // Highest change (5.80%)
      expect(result[1].symbol).toBe('BTCUSDT'); // Second highest (2.50%)
      expect(result[2].symbol).toBe('ETHUSDT'); // Lowest change (-1.20%)
    });

    it('should sort by change percentage in descending order (USD)', () => {
      const result = filterAndSortCryptocurrencyAssets(normalizedCoinGeckoAssets, 'USD', 'change', 'desc');
      expect(result[0].symbol).toBe('BTCUSD'); // Higher change (2.5%)
      expect(result[1].symbol).toBe('ETHUSD'); // Lower change (-1.2%)
    });

    it('should limit results', () => {
      const result = filterAndSortCryptocurrencyAssets(normalizedBinanceAssets, 'USDT', 'volume', 'desc', 2);
      expect(result).toHaveLength(2);
    });

    it('should handle empty assets array', () => {
      const result = filterAndSortCryptocurrencyAssets([], 'USDT');
      expect(result).toHaveLength(0);
    });
  });

  describe('fetchCryptoData', () => {
    // Mock fetch for testing
    const originalFetch = global.fetch;
    
    beforeEach(() => {
      global.fetch = jest.fn();
    });
    
    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should use Binance data when available', async () => {
      const mockBinanceResponse = mockBinanceTickers;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBinanceResponse),
      });

      const result = await fetchCryptoData('USDT');
      
      expect(result).toHaveLength(3);
      expect(result[0].symbol).toBe('BTCUSDT');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.binance.com/api/v3/ticker/24hr',
        expect.objectContaining({
          signal: expect.any(Object),
          headers: expect.objectContaining({
            'User-Agent': 'CryptoWatchlist/1.0',
            'Accept': 'application/json',
          }),
        })
      );
    });

    it('should fallback to CoinGecko when Binance fails', async () => {
      // Mock Binance failure (3 attempts)
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Service unavailable from a restricted location'))
        .mockRejectedValueOnce(new Error('Service unavailable from a restricted location'))
        .mockRejectedValueOnce(new Error('Service unavailable from a restricted location'));
      
      // Mock CoinGecko success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCoinGeckoData),
      });

      const result = await fetchCryptoData('USDT');
      
      expect(result).toHaveLength(2);
      expect(result.some(asset => asset.symbol === 'BTCUSDT')).toBe(true); // Should be converted from USD to USDT
      expect(result.some(asset => asset.symbol === 'ETHUSDT')).toBe(true); // Should be converted from USD to USDT
      expect(global.fetch).toHaveBeenCalledTimes(4); // 3 Binance attempts + 1 CoinGecko
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://api.binance.com/api/v3/ticker/24hr'), expect.any(Object));
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('https://api.coingecko.com/api/v3/coins/markets'), expect.any(Object));
    });

    it('should deduplicate assets when converting from USD to USDT', async () => {
      // Mock Binance failure (3 attempts)
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Service unavailable from a restricted location'))
        .mockRejectedValueOnce(new Error('Service unavailable from a restricted location'))
        .mockRejectedValueOnce(new Error('Service unavailable from a restricted location'));
      
      // Mock CoinGecko success with duplicate symbols
      const duplicateData = [
        ...mockCoinGeckoData,
        {
          ...mockCoinGeckoData[0], // BTC
          id: 'wrapped-bitcoin',
          symbol: 'btc', // Same symbol to create duplicate
          name: 'Wrapped Bitcoin',
          total_volume: 50000000000, // Higher volume than original BTC
        }
      ];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(duplicateData),
      });

      const result = await fetchCryptoData('USDT');
      
      // Should deduplicate and keep the higher volume BTC
      const btcAssets = result.filter(asset => asset.symbol === 'BTCUSDT');
      expect(btcAssets).toHaveLength(1);
      expect(btcAssets[0].quoteVolume).toBe(50000000000); // Higher volume BTC
    });

    it('should throw error when both APIs fail', async () => {
      // Mock both APIs failing
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Binance API error'))
        .mockRejectedValueOnce(new Error('CoinGecko API error'));

      await expect(fetchCryptoData('USDT')).rejects.toThrow('Both APIs failed');
    });
  });
});

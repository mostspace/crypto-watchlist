export interface BinanceTickerData {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
  openPrice: string;
  count: number;
}

export interface CoinGeckoMarketDataResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: unknown;
  last_updated: string;
}

export interface CryptocurrencyAsset {
  symbol: string;
  lastPrice: number;
  changePercent: number;
  quoteVolume: number;
  name?: string;
}

export interface ApiResponsePayload<T> {
  data: T;
  error?: string;
  requestId: string;
}


export type CryptocurrencySortField = 'price' | 'change' | 'volume';
export type CryptocurrencySortDirection = 'asc' | 'desc';

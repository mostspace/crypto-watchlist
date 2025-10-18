// Cryptocurrency symbol manipulation utilities
export const extractBaseCryptocurrencySymbol = (fullSymbol: string): string => {
  // Handle stablecoins first
  if (fullSymbol === 'USDCUSDT' || fullSymbol === 'USDCUSD') return 'USDC';
  if (fullSymbol === 'USDTUSDT' || fullSymbol === 'USDTUSD') return 'USDT';
  if (fullSymbol === 'BUSDUSDT' || fullSymbol === 'BUSDUSD') return 'BUSD';
  if (fullSymbol === 'DAIUSDT' || fullSymbol === 'DAIUSD') return 'DAI';
  if (fullSymbol === 'TUSDUSDT' || fullSymbol === 'TUSDUSD') return 'TUSD';
  if (fullSymbol === 'FDUSDUSDT' || fullSymbol === 'FDUSDUSD') return 'FDUSD';
  
  // Remove common suffixes
  const suffixes = ['USDT', 'USD', 'BUSD', 'USDC'];
  const sortedSuffixes = suffixes.sort((a, b) => b.length - a.length);
  
  for (const suffix of sortedSuffixes) {
    if (fullSymbol.length > suffix.length && fullSymbol.endsWith(suffix)) {
      const baseSymbol = fullSymbol.slice(0, -suffix.length);
      if (baseSymbol.length > 0) {
        return baseSymbol;
      }
    }
  }
  
  return fullSymbol;
};

export const resolveCryptocurrencyDisplayName = (symbol: string): string => {
  const displayNames: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'BNB': 'Binance Coin',
    'SOL': 'Solana',
    'XRP': 'XRP',
    'ADA': 'Cardano',
    'AVAX': 'Avalanche',
    'DOT': 'Polkadot',
    'LINK': 'Chainlink',
    'TRX': 'TRON',
    'MATIC': 'Polygon',
    'LTC': 'Litecoin',
    'BCH': 'Bitcoin Cash',
    'UNI': 'Uniswap',
    'ATOM': 'Cosmos',
    'NEAR': 'NEAR Protocol',
    'FTM': 'Fantom',
    'ALGO': 'Algorand',
    'VET': 'VeChain',
    'ICP': 'Internet Computer',
    'FIL': 'Filecoin',
    'HBAR': 'Hedera',
    'EGLD': 'MultiversX',
    'THETA': 'Theta Network',
    'FLOW': 'Flow',
    'MANA': 'Decentraland',
    'SAND': 'The Sandbox',
    'AXS': 'Axie Infinity',
    'CHZ': 'Chiliz',
    'ENJ': 'Enjin',
    'GALA': 'Gala',
    'ILV': 'Illuvium',
    'SLP': 'Smooth Love Potion',
    'APE': 'ApeCoin',
    'GMT': 'STEPN',
    'LRC': 'Loopring',
    'IMX': 'Immutable X',
    'OP': 'Optimism',
    'ARB': 'Arbitrum',
    'LDO': 'Lido DAO',
    'RPL': 'Rocket Pool',
    'FRAX': 'Frax',
    'USDT': 'Tether',
    'USDC': 'USD Coin',
    'BUSD': 'Binance USD',
    'DAI': 'Dai',
    'TUSD': 'TrueUSD',
    'FDUSD': 'First Digital USD',
    'DOGE': 'Dogecoin',
    'SHIB': 'Shiba Inu',
    'PEPE': 'Pepe',
    'FLOKI': 'FLOKI',
    'BONK': 'Bonk',
    'WIF': 'dogwifhat',
    'AAVE': 'Aave',
    'COMP': 'Compound',
    'MKR': 'Maker',
    'SNX': 'Synthetix',
    'YFI': 'Yearn Finance',
    'CRV': 'Curve DAO Token',
    'SUSHI': 'SushiSwap',
    'CRO': 'Cronos',
    'KLAY': 'Klaytn',
    'ONE': 'Harmony',
    'LUNA': 'Terra',
    'UST': 'TerraUSD',
    'WBTC': 'Wrapped Bitcoin',
    'WBNB': 'Wrapped BNB',
    'WBETH': 'Wrapped Beacon ETH',
    'PAXG': 'PAX Gold',
  };
  
  return displayNames[symbol.toUpperCase()] || symbol;
};

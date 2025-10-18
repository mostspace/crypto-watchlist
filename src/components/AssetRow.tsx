'use client';

import { memo, useCallback } from 'react';
import { CryptocurrencyAsset } from '@/lib/types';
import { CryptoIcon } from './CryptoIcon';
import { extractBaseCryptocurrencySymbol, resolveCryptocurrencyDisplayName } from '@/lib/cryptocurrency-symbol-utils';

interface AssetRowProps {
  asset: CryptocurrencyAsset;
  isFavorite: boolean;
  onToggleFavorite: (symbol: string) => void;
  onClick?: () => void;
}

// Helper functions for formatting
const formatDisplaySymbol = (symbol: string): string => {
  return extractBaseCryptocurrencySymbol(symbol);
};

const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  } else if (price >= 1) {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 4 
    });
  } else {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 4, 
      maximumFractionDigits: 8 
    });
  }
};

const formatChange = (change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

const getChangeTextColor = (change: number): string => {
  if (change > 0) return 'text-green-400';
  if (change < 0) return 'text-red-400';
  return 'text-gray-400';
};

const getChangeBackgroundColor = (change: number): string => {
  if (change > 0) return 'bg-green-900/30';
  if (change < 0) return 'bg-red-900/30';
  return 'bg-gray-700/30';
};

const formatVolume = (volume: number): string => {
  return volume.toLocaleString('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  });
};

export const AssetRow = memo(function AssetRow({ 
  asset, 
  isFavorite, 
  onToggleFavorite,
  onClick
}: AssetRowProps) {
  const displaySymbol = formatDisplaySymbol(asset.symbol);
    const displayName = asset.name || resolveCryptocurrencyDisplayName(displaySymbol);
  
  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when clicking favorite button
    onToggleFavorite(asset.symbol);
  }, [asset.symbol, onToggleFavorite]);

  return (
    <tr 
      className="glass-table-row group cursor-pointer hover:bg-white/5 transition-colors"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`View details for ${displaySymbol}`}
    >
      <td className="glass-table-cell px-3 py-4 whitespace-nowrap w-16">
        <div className="flex justify-center">
          <div
            onClick={handleToggleFavorite}
            className="cursor-pointer p-2 touch-manipulation"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleToggleFavorite(e as any);
              }
            }}
            aria-label={`${isFavorite ? 'Remove' : 'Add'} ${displaySymbol} to favorites`}
            aria-pressed={isFavorite}
            title={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
          >
            <svg 
              className={`w-5 h-5 transition-all duration-300 ease-in-out ${
                isFavorite 
                  ? 'text-yellow-400 hover:text-yellow-300 hover:drop-shadow-lg' 
                  : 'text-gray-400 hover:text-yellow-400 hover:drop-shadow-md'
              }`}
              fill={isFavorite ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
              />
            </svg>
          </div>
        </div>
      </td>
      <td className="glass-table-cell px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <CryptoIcon symbol={asset.symbol} size="md" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white truncate font-gt-walsheim">
              {displayName}
            </div>
            <div className="text-sm text-gray-400 font-gt-walsheim">
              {displaySymbol}
            </div>
          </div>
        </div>
      </td>
      <td className="glass-table-cell px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-white font-gt-walsheim">
          ${formatPrice(asset.lastPrice)}
        </div>
      </td>
      <td className="glass-table-cell px-6 py-4 whitespace-nowrap">
        <span 
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 font-gt-walsheim ${getChangeBackgroundColor(asset.changePercent)} ${getChangeTextColor(asset.changePercent)}`}
        >
          {formatChange(asset.changePercent)}
        </span>
      </td>
      <td className="glass-table-cell px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-300 font-gt-walsheim">
          ${formatVolume(asset.quoteVolume)}
        </div>
      </td>
    </tr>
  );
});

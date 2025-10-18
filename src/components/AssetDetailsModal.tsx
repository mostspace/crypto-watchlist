'use client';

import { Modal } from './Modal';
import { CryptocurrencyAsset } from '@/lib/types';
import { CryptoIcon } from './CryptoIcon';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useState, useEffect } from 'react';
import { extractBaseCryptocurrencySymbol } from '@/lib/cryptocurrency-symbol-utils';

interface AssetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: CryptocurrencyAsset | null;
}

export function AssetDetailsModal({ isOpen, onClose, asset }: AssetDetailsModalProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  if (!asset) return null;

  const isAssetFavorite = isFavorite(asset.symbol);
  const baseSymbol = extractBaseCryptocurrencySymbol(asset.symbol);

  const handleToggleFavorite = () => {
    setIsAnimating(true);
    // Just toggle the favorite - the useFavorites hook will handle the toast notification
    toggleFavorite(asset.symbol);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(volume);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asset Details"
      size="lg"
    >
      <div className="space-y-8">
        {/* Enhanced Asset Header with Cosmic Effects */}
        <div className="relative">
          <div className="glass-card rounded-xl border border-white/10 relative overflow-hidden">
            {/* Cosmic background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5 opacity-50"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-blue-400/10 to-transparent rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-purple-400/10 to-transparent rounded-full blur-xl"></div>
            
            <div className="relative z-10 p-6">
              <div className="flex items-center space-x-4 mb-4">
                <CryptoIcon symbol={asset.symbol} size="lg" />
                <div>
                  <h3 className="text-2xl font-bold text-white font-gt-walsheim">
                    {asset.name || baseSymbol} ({baseSymbol})
                  </h3>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${asset.changePercent >= 0 ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'}`}></div>
                <span className="text-sm text-gray-400 font-gt-walsheim">
                  {asset.changePercent >= 0 ? 'Positive momentum' : 'Negative momentum'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Price Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Price Card */}
          <div className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:border-blue-400/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-300 font-gt-walsheim uppercase tracking-wider">
                  Current Price
                </h4>
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white font-gt-walsheim">
                {formatPrice(asset.lastPrice)}
              </p>
              <div className="mt-2 text-xs text-gray-400 font-gt-walsheim">
                Real-time price
              </div>
            </div>
          </div>

          {/* 24h Change Card */}
          <div className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:border-green-400/30 transition-all duration-500">
            <div className={`absolute inset-0 bg-gradient-to-br ${asset.changePercent >= 0 ? 'from-green-500/5' : 'from-red-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-300 font-gt-walsheim uppercase tracking-wider">
                  24h Change
                </h4>
                <div className={`w-8 h-8 ${asset.changePercent >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-full flex items-center justify-center`}>
                  {asset.changePercent >= 0 ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                    </svg>
                  )}
                </div>
              </div>
              <p className={`text-3xl font-bold font-gt-walsheim ${getChangeColor(asset.changePercent)}`}>
                {formatChange(asset.changePercent)}
              </p>
              <div className="mt-2 text-xs text-gray-400 font-gt-walsheim">
                {asset.changePercent >= 0 ? 'Gaining value' : 'Losing value'}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Volume Information */}
        <div className="glass-card p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:border-purple-400/30 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-300 font-gt-walsheim uppercase tracking-wider">
                24h Trading Volume
              </h4>
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white font-gt-walsheim">
              {formatVolume(asset.quoteVolume)}
            </p>
            <div className="mt-2 text-xs text-gray-400 font-gt-walsheim">
              Total trading activity
            </div>
          </div>
        </div>


        {/* Enhanced Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            onClick={onClose}
            className="flex-1 glass-button px-6 py-3 text-sm font-medium text-white rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-gt-walsheim transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </div>
          </button>
          <button
            onClick={handleToggleFavorite}
            className={`flex-1 glass-button px-6 py-3 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-gt-walsheim transition-all duration-300 hover:scale-105 ${
              isAssetFavorite 
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300 border-red-400/20' 
                : 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 border-blue-400/20'
            } ${isAnimating ? 'animate-pulse' : ''}`}
            aria-label={isAssetFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <div className="flex items-center justify-center">
              {isAssetFavorite ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Remove from Favorites
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Add to Favorites
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
}

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from './ToastContext';
import { extractBaseCryptocurrencySymbol, resolveCryptocurrencyDisplayName } from '@/lib/cryptocurrency-symbol-utils';

interface FavoritesContextType {
  favorites: Set<string>;
  isFavorite: (symbol: string) => boolean;
  toggleFavorite: (symbol: string) => void;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [pendingToast, setPendingToast] = useState<{ type: 'success' | 'info'; symbol: string } | null>(null);
  const { addToast } = useToast();

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('crypto-favorites');
      if (stored) {
        const favoriteArray = JSON.parse(stored);
        setFavorites(new Set(favoriteArray));
      }
    } catch (error) {
      // localStorage might be disabled or corrupted
      console.error('Failed to load favorites:', error);
    }
  }, []);

  // Handle pending toast notifications
  useEffect(() => {
    if (pendingToast) {
      const displaySymbol = extractBaseCryptocurrencySymbol(pendingToast.symbol);
      const displayName = resolveCryptocurrencyDisplayName(displaySymbol);
      
      if (pendingToast.type === 'success') {
        addToast({
          type: 'success',
          title: 'Added to favorites',
          message: `${displayName} (${displaySymbol}) has been added to your watchlist`,
          duration: 3000,
        });
      } else {
        addToast({
          type: 'info',
          title: 'Removed from favorites',
          message: `${displayName} (${displaySymbol}) has been removed from your watchlist`,
          duration: 3000,
        });
      }
      
      setPendingToast(null);
    }
  }, [pendingToast, addToast]);

  // Save favorites to localStorage whenever they change
  const saveFavorites = useCallback((newFavorites: Set<string>) => {
    try {
      localStorage.setItem('crypto-favorites', JSON.stringify([...newFavorites]));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, []);

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      const wasFavorite = newFavorites.has(symbol);
      
      if (wasFavorite) {
        newFavorites.delete(symbol);
        // Schedule removal toast
        setPendingToast({ type: 'info', symbol });
      } else {
        newFavorites.add(symbol);
        // Schedule addition toast
        setPendingToast({ type: 'success', symbol });
      }
      
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  const isFavorite = useCallback((symbol: string) => {
    return favorites.has(symbol);
  }, [favorites]);

  const value = {
    favorites,
    isFavorite,
    toggleFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

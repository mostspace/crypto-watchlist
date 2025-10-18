import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../useFavorites';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ToastProvider } from '@/contexts/ToastContext';

// Mock the ToastContext
jest.mock('@/contexts/ToastContext', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
  useToast: () => ({
    addToast: jest.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useFavorites', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => 
    React.createElement(ToastProvider, null, 
      React.createElement(FavoritesProvider, null, children)
    );

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.favorites.size).toBe(0);
    expect(result.current.isFavorite('BTCUSDT')).toBe(false);
  });

  it('should load favorites from localStorage on mount', () => {
    const savedFavorites = ['BTCUSDT', 'ETHUSDT'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedFavorites));

    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.favorites.size).toBe(2);
    expect(result.current.isFavorite('BTCUSDT')).toBe(true);
    expect(result.current.isFavorite('ETHUSDT')).toBe(true);
    expect(result.current.isFavorite('ADAUSDT')).toBe(false);
  });

  it('should handle localStorage errors', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.favorites.size).toBe(0);
  });

  it('should toggle favorite status', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    // Add to favorites
    act(() => {
      result.current.toggleFavorite('BTCUSDT');
    });

    expect(result.current.isFavorite('BTCUSDT')).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'crypto-favorites',
      JSON.stringify(['BTCUSDT'])
    );

    // Remove from favorites
    act(() => {
      result.current.toggleFavorite('BTCUSDT');
    });

    expect(result.current.isFavorite('BTCUSDT')).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'crypto-favorites',
      JSON.stringify([])
    );
  });

  it('should handle multiple favorites', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.toggleFavorite('BTCUSDT');
      result.current.toggleFavorite('ETHUSDT');
      result.current.toggleFavorite('ADAUSDT');
    });

    expect(result.current.favorites.size).toBe(3);
    expect(result.current.isFavorite('BTCUSDT')).toBe(true);
    expect(result.current.isFavorite('ETHUSDT')).toBe(true);
    expect(result.current.isFavorite('ADAUSDT')).toBe(true);

    // Remove one
    act(() => {
      result.current.toggleFavorite('ETHUSDT');
    });

    expect(result.current.favorites.size).toBe(2);
    expect(result.current.isFavorite('BTCUSDT')).toBe(true);
    expect(result.current.isFavorite('ETHUSDT')).toBe(false);
    expect(result.current.isFavorite('ADAUSDT')).toBe(true);
  });

  it('should handle localStorage setItem errors', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage setItem error');
    });

    const { result } = renderHook(() => useFavorites(), { wrapper });

    // Should not throw error
    expect(() => {
      act(() => {
        result.current.toggleFavorite('BTCUSDT');
      });
    }).not.toThrow();

    // Should still update the state even if localStorage fails
    expect(result.current.isFavorite('BTCUSDT')).toBe(true);
  });
});

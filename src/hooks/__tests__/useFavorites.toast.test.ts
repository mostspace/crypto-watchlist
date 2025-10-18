import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../useFavorites';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ToastProvider } from '@/contexts/ToastContext';

// Mock the toast context
const mockAddToast = jest.fn();

jest.mock('@/contexts/ToastContext', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useFavorites with Toast Notifications', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => 
    React.createElement(ToastProvider, null, 
      React.createElement(FavoritesProvider, null, children)
    );

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should show success toast when adding to favorites', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.toggleFavorite('BTCUSDT');
    });

    // Wait for the useEffect to process the pending toast
    act(() => {
      // This will trigger the useEffect that processes pending toasts
    });

    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'success',
      title: 'Added to favorites',
      message: 'Bitcoin (BTC) has been added to your watchlist',
      duration: 3000,
    });
  });

  it('should show info toast when removing from favorites', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    // First add to favorites
    act(() => {
      result.current.toggleFavorite('BTCUSDT');
    });

    // Then remove from favorites
    act(() => {
      result.current.toggleFavorite('BTCUSDT');
    });

    // Wait for the useEffect to process the pending toasts
    act(() => {
      // This will trigger the useEffect that processes pending toasts
    });

    expect(mockAddToast).toHaveBeenCalledTimes(2);
    expect(mockAddToast).toHaveBeenLastCalledWith({
      type: 'info',
      title: 'Removed from favorites',
      message: 'Bitcoin (BTC) has been removed from your watchlist',
      duration: 3000,
    });
  });

  it('should show correct crypto name in toast messages', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.toggleFavorite('ETHUSDT');
    });

    // Wait for the useEffect to process the pending toast
    act(() => {
      // This will trigger the useEffect that processes pending toasts
    });

    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Ethereum (ETH) has been added to your watchlist',
      })
    );
  });

  it('should show correct display name for WBNB', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.toggleFavorite('WBNBUSDT');
    });

    // Wait for the useEffect to process the pending toast
    act(() => {
      // This will trigger the useEffect that processes pending toasts
    });

    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Wrapped BNB (WBNB) has been added to your watchlist',
      })
    );
  });
});

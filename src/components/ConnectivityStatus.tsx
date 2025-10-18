'use client';

import { useEffect, useState } from 'react';

interface ConnectivityStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  isInitialConnection?: boolean;
}

export function ConnectivityStatus({
  isConnected,
  isConnecting,
  error,
  isInitialConnection = false,
}: ConnectivityStatusProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const statusClasses = `
    fixed top-4 right-4 text-white px-4 py-3 rounded-full z-50 connectivity-status
    md:top-4 md:right-4 md:px-4 md:py-3
    sm:top-4 sm:right-4 sm:px-4 sm:py-3
    max-sm:top-4 max-sm:right-4 max-sm:px-3 max-sm:py-2 max-sm:text-xs
  `;

  const containerClasses = `
    flex items-center gap-3
    md:gap-3 sm:gap-3 max-sm:gap-2
  `;

  const indicatorClasses = `
    w-3 h-3 rounded-full
    md:w-3 md:h-3 sm:w-3 sm:h-3 max-sm:w-2 max-sm:h-2
  `;

  const textClasses = `
    text-sm font-gt-walsheim font-medium
    md:text-sm sm:text-sm max-sm:text-xs
  `;

  if (!isOnline) {
    return (
      <div className={statusClasses} role="status" aria-live="polite">
        <div className={containerClasses}>
          <div className="relative">
            <div className={`${indicatorClasses} bg-red-500 animate-pulse`} />
            <div className={`absolute inset-0 ${indicatorClasses} bg-red-500 animate-ping opacity-75`} />
          </div>
          <span className={textClasses}>Offline</span>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className={statusClasses} role="status" aria-live="polite">
        <div className={containerClasses}>
          <div className="relative">
            <div className={`${indicatorClasses} bg-yellow-500 animate-pulse`} />
            <div className={`absolute inset-0 ${indicatorClasses} bg-yellow-500 animate-ping opacity-75`} />
          </div>
          <span className={textClasses}>
            {isInitialConnection ? 'Connecting...' : 'Reconnecting...'}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    const isGeographicError = error.includes('region') || error.includes('geographic');
    const errorColor = isGeographicError ? 'bg-blue-500' : 'bg-red-500';
    
    return (
      <div className={statusClasses} role="status" aria-live="polite">
        <div className={containerClasses}>
          <div className="relative">
            <div className={`${indicatorClasses} ${errorColor}`} />
            <div className={`absolute inset-0 ${indicatorClasses} ${errorColor} animate-ping opacity-75`} />
          </div>
          <span className={textClasses}>
            {isGeographicError ? 'Auto-refresh active' : 'Connection Error'}
          </span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={statusClasses} role="status" aria-live="polite">
        <div className={containerClasses}>
          <div className="relative">
            <div className={`${indicatorClasses} bg-gray-500`} />
            <div className={`absolute inset-0 ${indicatorClasses} bg-gray-500 animate-ping opacity-75`} />
          </div>
          <span className={textClasses}>Disconnected</span>
        </div>
      </div>
    );
  }

  return (
    <div className={statusClasses} role="status" aria-live="polite">
      <div className={containerClasses}>
        <div className="relative">
          <div className={`${indicatorClasses} bg-green-500 animate-pulse`} />
          <div className={`absolute inset-0 ${indicatorClasses} bg-green-500 animate-ping opacity-75`} />
        </div>
        <span className={textClasses}>Live</span>
      </div>
    </div>
  );
}
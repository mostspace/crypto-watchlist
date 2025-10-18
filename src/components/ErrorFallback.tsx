'use client';

import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  retry?: () => void;
}

export function ErrorFallback({ error, resetError, retry }: ErrorFallbackProps) {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
  const isApiError = error.message.includes('HTTP') || error.message.includes('API');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="glass-card p-8 max-w-md mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
          {isNetworkError ? (
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75A9.75 9.75 0 0112 2.25z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2 font-gt-walsheim">
          {isNetworkError ? 'Connection Error' : isApiError ? 'Service Unavailable' : 'Something went wrong'}
        </h2>
        
        <p className="text-gray-300 mb-6 font-gt-walsheim">
          {isNetworkError 
            ? 'Unable to connect to our servers. Please check your internet connection.'
            : isApiError
            ? 'Our servers are temporarily unavailable. Please try again in a moment.'
            : 'We encountered an unexpected error. Please try refreshing the page.'
          }
        </p>
        
        <div className="space-y-3">
          {retry && (
            <button
              onClick={retry}
              className="glass-button w-full px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-gt-walsheim"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="glass-button w-full px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-gt-walsheim"
          >
            Refresh Page
          </button>
          <button
            onClick={resetError}
            className="glass-button w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-500 font-gt-walsheim"
          >
            Go Back
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-gray-400 cursor-pointer font-gt-walsheim">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-red-300 bg-red-900/20 p-2 rounded overflow-auto max-h-32 font-mono">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

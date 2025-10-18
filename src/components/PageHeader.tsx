'use client';

import React from 'react';

export function PageHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hidden sm:flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white font-gt-walsheim drop-shadow-lg text-glow-subtle modern-spacing">
            Crypto Watchlist
          </h1>
          <p className="mt-1 text-sm text-gray-300 font-gt-walsheim drop-shadow-md modern-spacing">
            Real-time cryptocurrency prices and market data
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { PageHeader } from '@/components/PageHeader';
import { AssetTable } from '@/components/AssetTable';
import { IconPreloader } from '@/components/IconPreloader';
import { SkipLinks } from '@/components/SkipLinks';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export default function HomePage() {
  // Initialize service worker for caching
  useServiceWorker();

  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback 
          error={new Error('Component error')} 
          resetError={() => window.location.reload()} 
        />
      }
    >
      <IconPreloader />
      <SkipLinks />
      <div className="min-h-screen relative overflow-hidden">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
          <div className="px-4 py-6 sm:px-0">
            <PageHeader />
            
            {/* Show the infinite scrolling table with Suspense boundary */}
            <Suspense fallback={<div className="text-center py-8 text-gray-400">Loading...</div>}>
              <AssetTable />
            </Suspense>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
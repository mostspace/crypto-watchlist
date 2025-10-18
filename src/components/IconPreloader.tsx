'use client';

import { useIconPreloader } from '@/hooks/useIconPreloader';

/**
 * Component to preload common cryptocurrency icons on app initialization
 * This should be included in the main layout or page component
 */
export function IconPreloader() {
  useIconPreloader();
  
  // This component doesn't render anything, it just triggers the preloading
  return null;
}

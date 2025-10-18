'use client';

import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'table-row' | 'search-item' | 'card';
  count?: number;
  className?: string;
}

export function SkeletonLoader({ 
  variant = 'table-row', 
  count = 1, 
  className = '' 
}: SkeletonLoaderProps) {
  const renderSkeleton = (index: number) => {
    const animationDelay = `${index * 0.1}s`;
    const shimmerDelay = `${index * 0.1 + 0.3}s`;

    switch (variant) {
      case 'table-row':
        return (
          <tr key={index} className={`glass-table-row ${className}`} style={{ animationDelay }}>
            <td className="glass-table-cell px-3 py-4 text-center">
              <div 
                className="w-4 h-4 bg-gray-600/60 rounded animate-pulse-skeleton relative overflow-hidden" 
                style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                  style={{ animationDelay: shimmerDelay }}
                />
              </div>
            </td>
            <td className="glass-table-cell px-6 py-4">
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 bg-gray-600/60 rounded-full mr-3 animate-pulse-skeleton relative overflow-hidden" 
                  style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
                >
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                    style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
                  />
                </div>
                <div>
                  <div 
                    className="w-16 h-4 bg-gray-600/60 rounded mb-1 animate-pulse-skeleton relative overflow-hidden" 
                    style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
                  >
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                      style={{ animationDelay: `${index * 0.1 + 0.6}s` }}
                    />
                  </div>
                  <div 
                    className="w-12 h-3 bg-gray-600/60 rounded animate-pulse-skeleton relative overflow-hidden" 
                    style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
                  >
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                      style={{ animationDelay: `${index * 0.1 + 0.7}s` }}
                    />
                  </div>
                </div>
              </div>
            </td>
            <td className="glass-table-cell px-6 py-4">
              <div 
                className="w-20 h-4 bg-gray-600/60 rounded animate-pulse-skeleton relative overflow-hidden" 
                style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                  style={{ animationDelay: shimmerDelay }}
                />
              </div>
            </td>
            <td className="glass-table-cell px-6 py-4">
              <div 
                className="w-16 h-4 bg-gray-600/60 rounded animate-pulse-skeleton relative overflow-hidden" 
                style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                  style={{ animationDelay: `${index * 0.1 + 0.6}s` }}
                />
              </div>
            </td>
            <td className="glass-table-cell px-6 py-4">
              <div 
                className="w-24 h-4 bg-gray-600/60 rounded animate-pulse-skeleton relative overflow-hidden" 
                style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                  style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
                />
              </div>
            </td>
          </tr>
        );

      case 'search-item':
        return (
          <div
            key={index}
            className={`py-2 px-3 hover:bg-white/5 transition-colors duration-200 ${className}`}
            style={{ animationDelay }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {/* Symbol skeleton */}
                <div className="h-6 w-12 bg-gray-700/50 rounded-md animate-pulse-skeleton relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>
                
                {/* Name skeleton */}
                <div className={`h-4 rounded animate-pulse-skeleton relative overflow-hidden ${
                  index % 3 === 0 ? 'w-20' : index % 3 === 1 ? 'w-28' : 'w-24'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>
              </div>
              
              {/* Price skeleton */}
              <div className="text-right flex-shrink-0 ml-2 flex flex-col justify-center space-y-1">
                <div className={`h-4 rounded animate-pulse-skeleton relative overflow-hidden ${
                  index % 2 === 0 ? 'w-16' : 'w-20'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>
                <div className={`h-3 rounded animate-pulse-skeleton relative overflow-hidden ${
                  index % 2 === 0 ? 'w-12' : 'w-14'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
            
            {/* Volume skeleton */}
            <div className="mt-1 flex justify-end">
              <div className={`h-3 rounded animate-pulse-skeleton relative overflow-hidden ${
                index % 2 === 0 ? 'w-16' : 'w-20'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        );

      case 'card':
        return (
          <div 
            key={index} 
            className={`glass-card p-4 ${className}`} 
            style={{ animationDelay }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 bg-gray-600/60 rounded-full animate-pulse-skeleton relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
              >
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                  style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
                />
              </div>
              <div className="flex-1">
                <div 
                  className="w-20 h-4 bg-gray-600/60 rounded mb-2 animate-pulse-skeleton relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
                >
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                    style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
                  />
                </div>
                <div 
                  className="w-16 h-3 bg-gray-600/60 rounded animate-pulse-skeleton relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
                >
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                    style={{ animationDelay: `${index * 0.1 + 0.6}s` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </>
  );
}

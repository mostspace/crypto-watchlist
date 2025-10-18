'use client';

import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '@/contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const toastStyles = {
  success: {
    container: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30',
    icon: 'text-green-400',
    title: 'text-green-100',
    message: 'text-green-200/80',
    progress: 'bg-green-400',
  },
  error: {
    container: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30',
    icon: 'text-red-400',
    title: 'text-red-100',
    message: 'text-red-200/80',
    progress: 'bg-red-400',
  },
  warning: {
    container: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
    icon: 'text-yellow-400',
    title: 'text-yellow-100',
    message: 'text-yellow-200/80',
    progress: 'bg-yellow-400',
  },
  info: {
    container: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    icon: 'text-blue-400',
    title: 'text-blue-100',
    message: 'text-blue-200/80',
    progress: 'bg-blue-400',
  },
};

const defaultIcons = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Special icons for favorites
const favoritesIcons = {
  added: (
    <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  removed: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
};

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const styles = toastStyles[toast.type];
  
  // Determine which icon to use
  let icon = toast.icon;
  if (!icon) {
    // Use special favorites icons for favorites-related toasts
    if (toast.title === 'Added to favorites') {
      icon = favoritesIcons.added;
    } else if (toast.title === 'Removed from favorites') {
      icon = favoritesIcons.removed;
    } else {
      icon = defaultIcons[toast.type];
    }
  }

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (toast.duration! / 50));
          return Math.max(0, newProgress);
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-xl shadow-2xl
        transform transition-all duration-300 ease-out
        w-full max-w-sm
        md:max-w-sm
        sm:max-w-sm
        max-sm:w-full max-sm:max-w-none
        ${styles.container}
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isExiting ? 'translate-x-full opacity-0 scale-95' : ''}
        ${isVisible && !isExiting ? 'max-sm:translate-y-0 max-sm:opacity-100 max-sm:scale-100' : 'max-sm:translate-y-8 max-sm:opacity-0 max-sm:scale-95'}
        ${isExiting ? 'max-sm:translate-y-8 max-sm:opacity-0 max-sm:scale-95' : ''}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute top-0 left-0 h-1 bg-black/20">
          <div
            className={`h-full transition-all duration-50 ease-linear ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex items-start gap-3 p-4
                     md:gap-3 md:p-4
                     sm:gap-3 sm:p-4
                     max-sm:gap-2 max-sm:p-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.icon}
                        md:w-5 md:h-5
                        sm:w-5 sm:h-5
                        max-sm:w-4 max-sm:h-4`}>
          {icon}
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className={`font-semibold font-gt-walsheim ${styles.title}
                          md:text-sm
                          sm:text-sm
                          max-sm:text-xs`}>
            {toast.title}
          </div>
          {toast.message && (
            <div className={`mt-1 font-gt-walsheim ${styles.message}
                            md:text-xs
                            sm:text-xs
                            max-sm:text-xs max-sm:leading-tight`}>
              {toast.message}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleRemove}
          className={`
            flex-shrink-0 rounded-lg transition-all duration-200 touch-manipulation
            hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20
            active:bg-white/20 active:scale-95
            md:p-1
            sm:p-1
            max-sm:p-1.5 max-sm:min-w-[44px] max-sm:min-h-[44px] max-sm:flex max-sm:items-center max-sm:justify-center
            ${styles.icon}
          `}
          aria-label="Close notification"
        >
          <svg className="fill-none stroke-current viewBox-0-0-24-24
                         md:w-4 md:h-4
                         sm:w-4 sm:h-4
                         max-sm:w-5 max-sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    </div>
  );
}

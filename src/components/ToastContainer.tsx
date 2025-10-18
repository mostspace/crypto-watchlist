'use client';

import React from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Toast } from './Toast';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full
                 md:top-4 md:right-4 md:max-w-sm
                 sm:top-4 sm:right-4 sm:max-w-sm
                 max-sm:top-4 max-sm:left-4 max-sm:right-4 max-sm:max-w-none
                 toast-container toast-safe-area"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}

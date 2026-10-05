import React from 'react';
import { Logo } from './Logo';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading LifeCare AI...',
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm transition-all duration-300">
        <div className="flex flex-col items-center space-y-6 animate-fade-in">
          {/* Centered official logo as explicitly requested in Section 6 */}
          <Logo size="lg" />
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 animate-pulse">
              {message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent"></div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
};

import React from 'react';
import { DocumentStatus } from '../../types';

interface BadgeProps {
  status: DocumentStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'Valid':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Valid
        </span>
      );
    case 'Expiring Soon':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          Expiring Soon
        </span>
      );
    case 'Expired':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
          Expired
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${className}`}
        >
          {status}
        </span>
      );
  }
};

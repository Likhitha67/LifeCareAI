import React from 'react';
import { ShieldCheck, HeartPulse } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs py-6 px-6 sm:px-8 text-center sm:text-left transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              LifeCare AI
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">|</span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Personal Health &amp; Document Assistant
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Technology: Authentication &bull; Database &bull; OCR &bull; Secure Storage</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            Version 1.0
          </span>
          <span>&copy; {new Date().getFullYear()} LifeCare AI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  colorScheme: 'blue' | 'emerald' | 'amber' | 'purple';
  subtext?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  count,
  icon: Icon,
  colorScheme,
  subtext,
  onClick,
}) => {
  const styles = {
    blue: {
      bg: 'bg-blue-50/80 dark:bg-blue-950/30',
      border: 'border-blue-100 dark:border-blue-900/40',
      iconBg: 'bg-blue-600 text-white',
      countText: 'text-blue-900 dark:text-blue-100',
    },
    emerald: {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
      border: 'border-emerald-100 dark:border-emerald-900/40',
      iconBg: 'bg-emerald-600 text-white',
      countText: 'text-emerald-900 dark:text-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/30',
      border: 'border-amber-100 dark:border-amber-900/40',
      iconBg: 'bg-amber-500 text-white',
      countText: 'text-amber-900 dark:text-amber-100',
    },
    purple: {
      bg: 'bg-purple-50/80 dark:bg-purple-950/30',
      border: 'border-purple-100 dark:border-purple-900/40',
      iconBg: 'bg-purple-600 text-white',
      countText: 'text-purple-900 dark:text-purple-100',
    },
  };

  const scheme = styles[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl border ${scheme.bg} ${scheme.border} shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className={`text-3xl font-extrabold mt-1 tracking-tight ${scheme.countText}`}>
            {count}
          </h3>
          {subtext && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl shadow-xs ${scheme.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

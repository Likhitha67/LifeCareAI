import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
  onClick,
}) => {
  // Sizing definitions matching original 3:2 aspect ratio
  const sizeClasses = {
    sm: 'h-10 w-auto max-w-[140px]',
    md: 'h-16 w-auto max-w-[210px]',
    lg: 'h-24 w-auto max-w-[320px]',
    xl: 'h-32 w-auto max-w-[420px]',
  };

  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center justify-center select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <img
        src="/logo.png"
        alt="LifeCare AI - Personal Health & Document Assistant"
        className={`${sizeClasses[size]} object-contain drop-shadow-sm transition-transform duration-200 hover:scale-[1.01]`}
        referrerPolicy="no-referrer"
        loading="eager"
        onError={(e) => {
          // Graceful fallback to SVG if PNG fails
          const target = e.currentTarget;
          if (!target.src.endsWith('/logo.svg')) {
            target.src = '/logo.svg';
          }
        }}
      />
      {showSubtitle && (
        <div className="mt-2 text-center">
          <p className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
            LifeCare AI
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personal Health &amp; Document Assistant
          </p>
        </div>
      )}
    </div>
  );
};

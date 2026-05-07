import React from 'react';
import { cn, getInitials } from '../../lib/utils';

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

export default function Avatar({ src, name, size = 'md', className }) {
  return (
    <div className={cn('rounded-full overflow-hidden flex-shrink-0 bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center', sizeMap[size], className)}>
      {src ? (
        <img src={src} alt={name || 'User'} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-brand-600 dark:text-brand-400">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

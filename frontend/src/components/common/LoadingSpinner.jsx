import React from 'react';
import { cn } from '../../lib/utils';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

export default function LoadingSpinner({ size = 'md', className }) {
  return (
    <div
      className={cn(
        'rounded-full border-brand-200 border-t-brand-600 animate-spin',
        sizes[size],
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      <div className="skeleton h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn('skeleton h-4 rounded', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

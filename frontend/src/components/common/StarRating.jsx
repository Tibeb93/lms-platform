import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function StarRating({ rating = 0, max = 5, size = 'sm', interactive = false, onChange }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn('focus:outline-none', interactive && 'cursor-pointer hover:scale-110 transition-transform')}
          >
            <Star
              className={cn(
                sizes[size],
                filled || half ? 'fill-amber-400 text-amber-400' : 'fill-none text-gray-300',
                interactive && 'hover:fill-amber-400 hover:text-amber-400'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

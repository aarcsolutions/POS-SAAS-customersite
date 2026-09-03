'use client';

import { cn } from '@/utils/format';
import type { Category } from '@/types/storefront';

interface CategoryPillsNavProps {
  categories: Category[];
  activeId?: string | null;
  onSelect: (category: Category) => void;
  className?: string;
}

export function CategoryPillsNav({
  categories,
  activeId = null,
  onSelect,
  className,
}: CategoryPillsNavProps) {
  return (
    <nav
      className={cn(
        'sticky top-[57px] z-30 border-b border-neutral-200 bg-white',
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 lg:px-8">
        {categories.map((category) => {
          const active = activeId === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category)}
              className={cn(
                'shrink-0 rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-wide transition sm:text-xs',
                active
                  ? 'bg-brand-accent text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
              )}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

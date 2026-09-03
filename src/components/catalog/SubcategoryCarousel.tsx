'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import type { Category } from '@/types/storefront';

interface SubcategoryCarouselProps {
  categories: Category[];
  activeId?: string | null;
  onSelect: (category: Category) => void;
}

export function SubcategoryCarousel({
  categories,
  activeId = null,
  onSelect,
}: SubcategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (categories.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -220 : 220,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative mb-8">
      {categories.length > 3 ? (
        <>
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute -left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand-accent text-white shadow-md sm:-left-4"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute -right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand-accent text-white shadow-md sm:-right-4"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      ) : null}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2 sm:gap-5"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category)}
            className="w-[160px] shrink-0 sm:w-[180px]"
          >
            <CategoryCard
              category={category}
              active={activeId === category.id}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { storefrontApi } from '@/services/storefront';
import { useBranchStore } from '@/stores/branch-store';
import type { Category } from '@/types/storefront';
import { getRootCategories } from '@/utils/category-tree';

export function ExploreMenuCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hydrated = useBranchStore((s) => s.hydrated);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    storefrontApi.getCatalog(selectedBranchId).then((data) => {
      if (!cancelled) setCategories(getRootCategories(data.categories));
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, selectedBranchId]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -280 : 280,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="heading-display mb-8 text-2xl text-brand-primary sm:text-3xl">
          Explore the Menu
        </h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute -left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand-accent text-white shadow-md sm:-left-4"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth px-6 pb-4"
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/menu?category=${cat.id}`}
                className="w-[180px] shrink-0 sm:w-[200px]"
              >
                <CategoryCard category={cat} />
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute -right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-brand-accent text-white shadow-md sm:-right-4"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

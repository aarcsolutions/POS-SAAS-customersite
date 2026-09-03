'use client';

import { ArrowLeft } from 'lucide-react';
import type { Category } from '@/types/storefront';
import { CategoryCard } from '@/components/catalog/CategoryCard';

interface CategoryGridProps {
  categories: Category[];
  selectedId?: string | null;
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  onSelect: (categoryId: string) => void;
}

export function CategoryGrid({
  categories,
  selectedId = null,
  showBack = false,
  backLabel = 'Back',
  onBack,
  onSelect,
}: CategoryGridProps) {
  return (
    <div>
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-primary transition hover:text-brand-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>
      ) : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            active={selectedId === category.id}
            onClick={() => onSelect(category.id)}
          />
        ))}
      </div>
    </div>
  );
}

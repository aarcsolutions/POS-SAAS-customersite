'use client';

import Image from 'next/image';
import { cn } from '@/utils/format';
import type { Category } from '@/types/storefront';
import { resolveCategoryImageUrl } from '@/utils/category-image';

interface CategoryCardProps {
  category: Category;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryCard({
  category,
  active = false,
  onClick,
  className,
}: CategoryCardProps) {
  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group flex w-full flex-col overflow-hidden rounded-b-2xl bg-transparent text-center transition',
        className,
      )}
    >
      <div className="relative aspect-square w-full bg-transparent p-2 sm:p-3">
        <Image
          src={resolveCategoryImageUrl(category)}
          alt={category.name}
          fill
          className="object-contain transition duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 240px"
        />
      </div>
      <div className="px-2 pb-3 pt-1 sm:px-3">
        <p
          className={cn(
            'heading-display text-xs leading-tight text-brand-primary sm:text-sm',
            active && 'text-brand-accent',
          )}
        >
          {category.name}
        </p>
        <div
          className={cn(
            'mx-auto mt-2 h-1 w-12 transition sm:w-14',
            active
              ? 'bg-brand-accent'
              : 'bg-brand-accent/40 group-hover:bg-brand-accent',
          )}
        />
      </div>
    </Comp>
  );
}

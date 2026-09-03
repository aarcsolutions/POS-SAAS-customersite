'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Category } from '@/types/storefront';

interface CategoryBreadcrumbProps {
  items: Category[];
}

export function CategoryBreadcrumb({ items }: CategoryBreadcrumbProps) {
  return (
    <nav
      aria-label="Category breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-1 text-xs font-bold uppercase tracking-wide text-brand-muted"
    >
      <Link href="/" className="transition hover:text-brand-accent">
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.id} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="text-brand-primary">{item.name}</span>
            ) : (
              <Link
                href={`/menu?category=${item.id}`}
                className="transition hover:text-brand-accent"
              >
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

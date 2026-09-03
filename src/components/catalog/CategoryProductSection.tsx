'use client';

import { ProductGrid } from '@/components/catalog/ProductGrid';
import type { Category, Product } from '@/types/storefront';
import { categorySectionId } from '@/utils/category-tree';

interface CategoryProductSectionProps {
  category: Category;
  products: Product[];
}

export function CategoryProductSection({
  category,
  products,
}: CategoryProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section
      id={categorySectionId(category.id)}
      className="scroll-mt-32 border-t border-neutral-100 py-10 first:border-t-0 first:pt-0"
    >
      <h2 className="heading-display section-underline mb-8 text-2xl text-brand-primary sm:text-3xl">
        {category.name}
      </h2>
      <ProductGrid products={products} />
    </section>
  );
}

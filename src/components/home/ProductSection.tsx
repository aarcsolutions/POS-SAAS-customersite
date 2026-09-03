'use client';

import { useEffect, useState } from 'react';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { storefrontApi } from '@/services/storefront';
import { useBranchStore } from '@/stores/branch-store';
import type { Product } from '@/types/storefront';

interface ProductSectionProps {
  title: string;
  filterKey: 'popular' | 'best';
}

export function ProductSection({ title, filterKey }: ProductSectionProps) {
  const hydrated = useBranchStore((s) => s.hydrated);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    storefrontApi.getCatalog(selectedBranchId).then((data) => {
      if (cancelled) return;
      let filtered =
        filterKey === 'popular'
          ? data.products.filter((p) => p.isPopular)
          : data.products.filter((p) => p.isBestSeller);
      if (filtered.length === 0) {
        filtered = data.products;
      }
      setProducts(filtered.slice(0, 4));
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, selectedBranchId, filterKey]);

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className="heading-display mb-8 text-2xl text-brand-primary sm:text-3xl">
          {title}
        </h2>
        <ProductGrid products={products} />
      </div>
    </section>
  );
}

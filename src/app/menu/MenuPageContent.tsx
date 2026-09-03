'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CategoryBreadcrumb } from '@/components/catalog/CategoryBreadcrumb';
import { CategoryProductSection } from '@/components/catalog/CategoryProductSection';
import { SubcategoryCarousel } from '@/components/catalog/SubcategoryCarousel';
import { MenuPageSkeleton } from '@/components/ui/LoadingSkeleton';
import { useBranchBootstrap } from '@/hooks/use-branch-bootstrap';
import { useCatalog } from '@/hooks/use-catalog';
import type { Category } from '@/types/storefront';
import {
  getCategoryBreadcrumb,
  getCategoryById,
  getChildCategories,
  getProductsForCategory,
  hasChildCategories,
  scrollToCategorySection,
} from '@/utils/category-tree';

export default function MenuPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const { catalog, loading, hydrated } = useCatalog();
  const [activeCarouselId, setActiveCarouselId] = useState<string | null>(null);

  useBranchBootstrap();

  useEffect(() => {
    if (!categoryParam) {
      router.replace('/');
    }
  }, [categoryParam, router]);

  const parentCategory = useMemo(() => {
    if (!catalog || !categoryParam) return null;
    return getCategoryById(catalog.categories, categoryParam) ?? null;
  }, [catalog, categoryParam]);

  const childCategories = useMemo(() => {
    if (!catalog || !categoryParam) return [];
    return getChildCategories(catalog.categories, categoryParam);
  }, [catalog, categoryParam]);

  const breadcrumb = useMemo(() => {
    if (!catalog || !categoryParam) return [];
    return getCategoryBreadcrumb(catalog.categories, categoryParam);
  }, [catalog, categoryParam]);

  useEffect(() => {
    setActiveCarouselId(null);
  }, [categoryParam]);

  const handleCarouselSelect = useCallback(
    (category: Category) => {
      if (!catalog) return;

      setActiveCarouselId(category.id);

      if (hasChildCategories(catalog.categories, category.id)) {
        router.push(`/menu?category=${category.id}`);
        return;
      }

      scrollToCategorySection(category.id);
    },
    [catalog, router],
  );

  if (!categoryParam) {
    return null;
  }

  if (!hydrated || loading || !catalog || !parentCategory) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <MenuPageSkeleton />
      </div>
    );
  }

  const sectionsWithProducts = childCategories.filter((category) =>
    getProductsForCategory(catalog.products, category.id).some(Boolean),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <CategoryBreadcrumb items={breadcrumb} />

      <h1 className="heading-display section-underline mb-8 text-2xl text-brand-primary sm:text-3xl">
        {parentCategory.name}
      </h1>

      <SubcategoryCarousel
        categories={childCategories}
        activeId={activeCarouselId}
        onSelect={handleCarouselSelect}
      />

      {sectionsWithProducts.length === 0 ? (
        <p className="text-sm text-brand-muted">
          Select a subcategory above to continue browsing.
        </p>
      ) : (
        sectionsWithProducts.map((category) => (
          <CategoryProductSection
            key={category.id}
            category={category}
            products={getProductsForCategory(catalog.products, category.id)}
          />
        ))
      )}
    </div>
  );
}

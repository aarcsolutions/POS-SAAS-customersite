'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CategoryImageNav,
  useCategoryNavCollapse,
} from '@/components/catalog/CategoryImageNav';
import { CategoryProductSection } from '@/components/catalog/CategoryProductSection';
import { MenuPageSkeleton } from '@/components/ui/LoadingSkeleton';
import { useBranchBootstrap } from '@/hooks/use-branch-bootstrap';
import { useCatalog } from '@/hooks/use-catalog';
import type { Category } from '@/types/storefront';
import {
  categorySectionId,
  getProductsForCategory,
  getRootCategories,
  hasChildCategories,
  scrollToCategorySection,
} from '@/utils/category-tree';

export function HomeCatalog() {
  const router = useRouter();
  const { catalog, loading, hydrated } = useCatalog();
  const [activePillId, setActivePillId] = useState<string | null>(null);
  const { collapsed: navCollapsed, menuRef } = useCategoryNavCollapse(
    hydrated && !loading && !!catalog,
  );

  useBranchBootstrap();

  const rootCategories = useMemo(
    () => (catalog ? getRootCategories(catalog.categories) : []),
    [catalog],
  );

  const leafRootSections = useMemo(
    () =>
      rootCategories.filter(
        (category) => !hasChildCategories(catalog?.categories ?? [], category.id),
      ),
    [catalog?.categories, rootCategories],
  );

  const handlePillSelect = useCallback(
    (category: Category) => {
      if (!catalog) return;

      setActivePillId(category.id);

      if (hasChildCategories(catalog.categories, category.id)) {
        router.push(`/menu?category=${category.id}`);
        return;
      }

      window.history.replaceState(null, '', `#${categorySectionId(category.id)}`);
      scrollToCategorySection(category.id);
    },
    [catalog, router],
  );

  useEffect(() => {
    if (!catalog || loading) return;

    const hash = window.location.hash.slice(1);
    if (!hash) return;

    if (hash === 'menu') {
      document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (hash.startsWith('category-')) {
      const categoryId = hash.replace('category-', '');
      const category = catalog.categories.find((c) => c.id === categoryId);
      if (!category) return;

      setActivePillId(categoryId);
      scrollToCategorySection(categoryId);
    }
  }, [catalog, loading]);

  if (!hydrated || loading || !catalog) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <MenuPageSkeleton />
      </div>
    );
  }

  return (
    <div id="menu" ref={menuRef}>
      <CategoryImageNav
        categories={rootCategories}
        activeId={activePillId}
        onSelect={handlePillSelect}
        collapsed={navCollapsed}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {leafRootSections.length === 0 ? (
          <p className="text-sm text-brand-muted">
            Select a category above to browse subcategories and products.
          </p>
        ) : (
          leafRootSections.map((category) => (
            <CategoryProductSection
              key={category.id}
              category={category}
              products={getProductsForCategory(catalog.products, category.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

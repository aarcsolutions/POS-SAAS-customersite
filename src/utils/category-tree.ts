import type { Category } from '@/types/storefront';

function bySortOrder(a: Category, b: Category): number {
  return a.sortOrder - b.sortOrder;
}

export function getCategoryById(
  categories: Category[],
  id: string,
): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getRootCategories(categories: Category[]): Category[] {
  return categories.filter((c) => c.parentId === null).sort(bySortOrder);
}

export function getChildCategories(
  categories: Category[],
  parentId: string,
): Category[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .sort(bySortOrder);
}

export function hasChildCategories(
  categories: Category[],
  categoryId: string,
): boolean {
  return categories.some((c) => c.parentId === categoryId);
}

export function getVisibleCategories(
  categories: Category[],
  navigationParentId: string | null,
): Category[] {
  if (navigationParentId === null) {
    return getRootCategories(categories);
  }
  return getChildCategories(categories, navigationParentId);
}

export function resolveCategoryNavigation(
  categories: Category[],
  categoryId: string,
): {
  navigationParentId: string | null;
  selectedCategoryId: string | null;
} {
  const category = getCategoryById(categories, categoryId);
  if (!category) {
    return { navigationParentId: null, selectedCategoryId: null };
  }

  if (hasChildCategories(categories, categoryId)) {
    return { navigationParentId: categoryId, selectedCategoryId: null };
  }

  return {
    navigationParentId: category.parentId,
    selectedCategoryId: categoryId,
  };
}

export function getCategoryHeading(
  categories: Category[],
  navigationParentId: string | null,
  selectedCategoryId: string | null,
): string {
  if (selectedCategoryId) {
    return getCategoryById(categories, selectedCategoryId)?.name ?? 'Menu';
  }
  if (navigationParentId) {
    return getCategoryById(categories, navigationParentId)?.name ?? 'Menu';
  }
  return 'Menu';
}

export function getCategoryAncestors(
  categories: Category[],
  categoryId: string,
): Category[] {
  const ancestors: Category[] = [];
  let current = getCategoryById(categories, categoryId);

  while (current?.parentId) {
    const parent = getCategoryById(categories, current.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
}

export function getCategoryBreadcrumb(
  categories: Category[],
  categoryId: string,
): Category[] {
  const current = getCategoryById(categories, categoryId);
  if (!current) return [];
  return [...getCategoryAncestors(categories, categoryId), current];
}

export function categorySectionId(categoryId: string): string {
  return `category-${categoryId}`;
}

export function getProductsForCategory<T extends { categoryId: string }>(
  products: T[],
  categoryId: string,
): T[] {
  return products.filter((product) => product.categoryId === categoryId);
}

export function scrollToCategorySection(categoryId: string): void {
  const el = document.getElementById(categorySectionId(categoryId));
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

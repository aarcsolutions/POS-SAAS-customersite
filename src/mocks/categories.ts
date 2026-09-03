import type { Category } from '@/types/storefront';

const downtownCategories: Omit<Category, 'branchId'>[] = [
  { id: 'cat-combos-dt', name: 'LA CARTA & COMBOS', parentId: null, sortOrder: 1 },
  { id: 'cat-boxes-dt', name: 'SIGNATURE BOXES', parentId: null, sortOrder: 2 },
  { id: 'cat-snacks-dt', name: 'SNACKS & BEVERAGES', parentId: null, sortOrder: 3 },
  { id: 'cat-condiments-dt', name: 'CONDIMENTS', parentId: null, sortOrder: 4 },
];

function forBranch(branchId: string, prefix: string): Category[] {
  return downtownCategories.map((c) => ({
    ...c,
    id: c.id.replace('-dt', `-${prefix}`),
    branchId,
  }));
}

export const mockCategories: Category[] = [
  ...forBranch('branch-downtown', 'dt'),
  ...forBranch('branch-mall', 'mall'),
  ...forBranch('branch-airport', 'airport'),
];

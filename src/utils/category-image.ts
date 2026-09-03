import type { Category } from '@/types/storefront';

const FILE_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_PUBLIC_BASE_URL || 'http://localhost:3005';

const CATEGORY_PLACEHOLDER = (id: string) =>
  `https://picsum.photos/seed/${id}/200/200`;

export function resolveCategoryImageUrl(
  category: Pick<Category, 'id' | 'imageUrl'>,
): string {
  const url = category.imageUrl?.trim();
  if (!url) return CATEGORY_PLACEHOLDER(category.id);
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${FILE_PUBLIC_BASE_URL}${url}`;
  return url;
}

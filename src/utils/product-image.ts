const FILE_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_FILE_PUBLIC_BASE_URL || 'http://localhost:3005';

export function resolveProductImageUrl(url: string): string {
  const trimmed = url?.trim();
  if (!trimmed) return 'https://picsum.photos/seed/product/400/300';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) return `${FILE_PUBLIC_BASE_URL}${trimmed}`;
  return trimmed;
}

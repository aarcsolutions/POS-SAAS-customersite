import type { TenantInfo } from '@/types/storefront';

export const mockTenant: TenantInfo = {
  id: 'tenant-1',
  name: 'Burger House',
  slug: 'burger',
  logoUrl: null,
  tagline: 'Fresh burgers, fast delivery',
  features: { catering: true, reservations: true, reviews: true },
};

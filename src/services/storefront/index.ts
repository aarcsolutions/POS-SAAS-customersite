import api, { unwrapApiData, type ApiEnvelope } from '@/services/lib/api';
import type {
  Branch,
  Catalog,
  CheckoutPayload,
  OrderResponse,
  OrderTrackResult,
  Product,
  PromoValidationResult,
  TenantInfo,
} from '@/types/storefront';
import { DELIVERY_FEE } from '@/utils/format';

async function getTenantInfo(): Promise<TenantInfo> {
  const { data } = await api.get<ApiEnvelope<{
    id: string;
    title: string;
    slug: string;
    description?: string | null;
  }>>('/auth/tenantInfo');

  const tenant = unwrapApiData(data);
  return {
    id: tenant.id,
    name: tenant.title,
    slug: tenant.slug,
    logoUrl: null,
    tagline: tenant.description ?? 'Order online',
  };
}

async function getBranches(): Promise<Branch[]> {
  const { data } = await api.get<ApiEnvelope<Branch[]>>('/storefront/branches');
  return unwrapApiData(data);
}

async function getCatalog(branchId: string | null): Promise<Catalog> {
  const { data } = await api.get<ApiEnvelope<Catalog>>('/storefront/catalog', {
    params: branchId ? { branch_id: branchId } : undefined,
  });
  return unwrapApiData(data);
}

async function getProduct(productId: string): Promise<Product | null> {
  try {
    const { data } = await api.get<ApiEnvelope<Product>>(
      `/storefront/products/${productId}`,
    );
    return unwrapApiData(data);
  } catch {
    return null;
  }
}

async function validatePromo(
  code: string,
  subtotal: number,
  branchId: string | null,
): Promise<PromoValidationResult> {
  const { data } = await api.post<ApiEnvelope<PromoValidationResult>>(
    '/storefront/validate-promo',
    {
      code: code.trim(),
      subtotal,
      branch_id: branchId,
    },
  );
  return unwrapApiData(data);
}

async function checkout(payload: CheckoutPayload): Promise<OrderResponse> {
  const { data } = await api.post<ApiEnvelope<OrderResponse>>(
    '/storefront/checkout',
    {
      branch_id: payload.branchId ?? null,
      order_type: payload.orderType,
      customer_name: payload.customerName,
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      city: payload.city,
      promo_code: payload.promoCode,
      delivery_fee:
        payload.orderType === 'delivery' ? DELIVERY_FEE : 0,
      items: payload.items.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
      })),
    },
  );
  return unwrapApiData(data);
}

async function trackOrder(orderNumber: string): Promise<OrderTrackResult> {
  const { data } = await api.get<ApiEnvelope<OrderTrackResult>>(
    '/storefront/track-order',
    {
      params: { order_number: orderNumber.trim() },
    },
  );
  return unwrapApiData(data);
}

export const storefrontApi = {
  getTenantInfo,
  getBranches,
  getCatalog,
  getProduct,
  validatePromo,
  checkout,
  trackOrder,
};

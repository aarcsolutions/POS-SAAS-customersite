import api, { unwrapApiData, type ApiEnvelope } from '@/services/lib/api';
import type {
  Branch,
  Catalog,
  CheckoutPayload,
  CustomerAuthResponse,
  CustomerLoginPayload,
  CustomerSignupPayload,
  CustomerUpdateProfilePayload,
  MyOrderSummary,
  OrderResponse,
  OrderTrackResult,
  Product,
  PromoValidationResult,
  TenantInfo,
} from '@/types/storefront';
import { DELIVERY_FEE } from '@/utils/format';

async function getTenantInfo(): Promise<TenantInfo> {
  try {
    const { data } = await api.get<
      ApiEnvelope<{
        id: string;
        title: string;
        slug: string;
        description?: string | null;
        primary_color?: string;
        primary_dark?: string;
        accent_color?: string;
        gold_color?: string;
        logo_url?: string | null;
        hero_image_url?: string | null;
        hero_video_url?: string | null;
        favicon_url?: string | null;
        hero_eyebrow?: string | null;
        hero_title_override?: string | null;
        hero_tagline?: string | null;
        hero_cta_label?: string | null;
        features?: {
          catering: boolean;
          reservations: boolean;
          reviews?: boolean;
        };
      }>
    >('/storefront/branding');

    const branding = unwrapApiData(data);
    return {
      id: branding.id,
      name: branding.title,
      slug: branding.slug,
      logoUrl: branding.logo_url ?? null,
      tagline:
        branding.hero_tagline?.trim() ||
        branding.description ||
        'Order online',
      primaryColor: branding.primary_color,
      primaryDark: branding.primary_dark,
      accentColor: branding.accent_color,
      goldColor: branding.gold_color,
      heroImageUrl: branding.hero_image_url ?? null,
      heroVideoUrl: branding.hero_video_url ?? null,
      faviconUrl: branding.favicon_url ?? null,
      heroEyebrow: branding.hero_eyebrow ?? null,
      heroTitle: branding.hero_title_override ?? null,
      heroCtaLabel: branding.hero_cta_label ?? null,
      features: {
        catering: !!branding.features?.catering,
        reservations: !!branding.features?.reservations,
        reviews: !!branding.features?.reviews,
      },
    };
  } catch {
    const { data } = await api.get<
      ApiEnvelope<{
        id: string;
        title: string;
        slug: string;
        description?: string | null;
      }>
    >('/auth/tenantInfo');

    const tenant = unwrapApiData(data);
    return {
      id: tenant.id,
      name: tenant.title,
      slug: tenant.slug,
      logoUrl: null,
      tagline: tenant.description ?? 'Order online',
      features: { catering: false, reservations: false, reviews: false },
    };
  }
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

function mapTokenTrackPayload(raw: Record<string, unknown>): OrderTrackResult {
  return {
    id: (raw.id as string | undefined) ?? undefined,
    orderNumber: String(raw.order_number ?? raw.orderNumber ?? ''),
    status: (raw.status as OrderTrackResult['status']) || 'pending',
    orderType: String(raw.order_type ?? raw.orderType ?? 'takeaway'),
    deliveryAddress:
      (raw.delivery_address as string | null | undefined) ??
      (raw.deliveryAddress as string | null | undefined) ??
      null,
    deliveryCity:
      (raw.delivery_city as string | null | undefined) ??
      (raw.deliveryCity as string | null | undefined) ??
      null,
    deliveryPhone:
      (raw.delivery_phone as string | null | undefined) ??
      (raw.deliveryPhone as string | null | undefined) ??
      null,
    paymentMethod:
      (raw.payment_method as string | null | undefined) ??
      (raw.paymentMethod as string | null | undefined) ??
      null,
    paymentStatus:
      (raw.payment_status as string | undefined) ??
      (raw.paymentStatus as string | undefined) ??
      'unpaid',
    driver:
      (raw.driver as OrderTrackResult['driver']) ?? null,
    createdAt:
      (raw.created_at as string | undefined) ??
      (raw.createdAt as string | undefined),
    hasReview: !!(raw.has_review ?? raw.hasReview),
    customerId:
      (raw.customer_id as string | null | undefined) ??
      (raw.customerId as string | null | undefined) ??
      null,
  };
}

async function trackByToken(
  tenantSlug: string,
  token: string,
): Promise<OrderTrackResult> {
  const { data } = await api.get<ApiEnvelope<Record<string, unknown>>>(
    `/orders/track/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(token)}`,
  );
  return mapTokenTrackPayload(unwrapApiData(data) as Record<string, unknown>);
}

async function deliverByToken(
  tenantSlug: string,
  token: string,
): Promise<{ orderNumber: string; status: string }> {
  const { data } = await api.post<
    ApiEnvelope<{ order_number?: string; orderNumber?: string; status: string }>
  >(
    `/orders/track/${encodeURIComponent(tenantSlug)}/${encodeURIComponent(token)}/deliver`,
  );
  const result = unwrapApiData(data);
  return {
    orderNumber: String(result.order_number ?? result.orderNumber ?? ''),
    status: String(result.status),
  };
}

export interface ReservePayload {
  branchId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  partySize: number;
  reservedAt: string;
  notes?: string;
}

async function reserve(payload: ReservePayload): Promise<{ id: string }> {
  const { data } = await api.post<ApiEnvelope<{ id: string }>>(
    '/storefront/reserve',
    {
      branch_id: payload.branchId,
      guest_name: payload.guestName,
      guest_phone: payload.guestPhone || undefined,
      guest_email: payload.guestEmail || undefined,
      party_size: payload.partySize,
      reserved_at: payload.reservedAt,
      notes: payload.notes || undefined,
    },
  );
  return unwrapApiData(data);
}

export interface CateringInquiryPayload {
  branchId: string;
  customerId?: string;
  contactName: string;
  contactPhone?: string;
  contactEmail: string;
  eventName?: string;
  eventAt: string;
  partySize: number;
  venueType?: 'on_premise' | 'off_premise';
  venueAddress?: string;
  notes?: string;
}

async function cateringInquiry(
  payload: CateringInquiryPayload,
): Promise<{ id: string }> {
  const { data } = await api.post<ApiEnvelope<{ id: string }>>(
    '/storefront/catering-inquiry',
    {
      branch_id: payload.branchId,
      customer_id: payload.customerId || undefined,
      contact_name: payload.contactName,
      contact_phone: payload.contactPhone || undefined,
      contact_email: payload.contactEmail,
      event_name: payload.eventName || undefined,
      event_at: payload.eventAt,
      party_size: payload.partySize,
      venue_type: payload.venueType || undefined,
      venue_address: payload.venueAddress || undefined,
      notes: payload.notes || undefined,
    },
  );
  return unwrapApiData(data);
}

async function getMyOrders(customerId: string): Promise<MyOrderSummary[]> {
  const { data } = await api.get<ApiEnvelope<MyOrderSummary[]>>(
    '/storefront/my-orders',
    {
      params: { customer_id: customerId },
    },
  );
  return unwrapApiData(data);
}

async function createReview(payload: {
  customerId: string;
  orderId: string;
  rating: number;
  comment?: string;
}): Promise<void> {
  const { data } = await api.post<ApiEnvelope<unknown>>('/storefront/reviews', {
    customer_id: payload.customerId,
    order_id: payload.orderId,
    rating: payload.rating,
    comment: payload.comment || undefined,
  });
  unwrapApiData(data);
}

async function signup(
  payload: CustomerSignupPayload,
): Promise<CustomerAuthResponse> {
  const { data } = await api.post<ApiEnvelope<CustomerAuthResponse>>(
    '/storefront/signup',
    {
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim() || undefined,
      password: payload.password,
      address: payload.address?.trim() || undefined,
      city: payload.city?.trim() || undefined,
    },
  );
  return unwrapApiData(data);
}

async function login(
  payload: CustomerLoginPayload,
): Promise<CustomerAuthResponse> {
  const { data } = await api.post<ApiEnvelope<CustomerAuthResponse>>(
    '/storefront/login',
    {
      identifier: payload.identifier.trim(),
      password: payload.password,
    },
  );
  return unwrapApiData(data);
}

async function updateProfile(
  payload: CustomerUpdateProfilePayload,
): Promise<CustomerAuthResponse> {
  const { data } = await api.put<ApiEnvelope<CustomerAuthResponse>>(
    '/storefront/update-profile',
    {
      customer_id: payload.customerId,
      name: payload.name.trim(),
      email: payload.email?.trim() || null,
      address: payload.address?.trim() || null,
      city: payload.city?.trim() || null,
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
  trackByToken,
  deliverByToken,
  reserve,
  cateringInquiry,
  getMyOrders,
  createReview,
  signup,
  login,
  updateProfile,
};

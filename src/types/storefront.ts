export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  tagline: string;
  primaryColor?: string;
  primaryDark?: string;
  accentColor?: string;
  goldColor?: string;
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
  faviconUrl?: string | null;
  heroEyebrow?: string | null;
  heroTitle?: string | null;
  heroCtaLabel?: string | null;
  features?: {
    catering: boolean;
    reservations: boolean;
    reviews?: boolean;
  };
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  branchId: string | null;
  name: string;
  parentId: string | null;
  sortOrder: number;
  imageUrl: string | null;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  branchId: string | null;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  imageUrls?: string[];
  variants: ProductVariant[];
  isPopular?: boolean;
  isBestSeller?: boolean;
  servingText?: string;
}

export interface Catalog {
  categories: Category[];
  products: Product[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export type OrderType = 'takeaway' | 'delivery';

export interface CheckoutPayload {
  branchId: string | null;
  orderType: OrderType;
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  promoCode?: string;
  items: CartItem[];
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  trackingToken: string;
  estimatedMinutes: number;
  message: string;
}

export interface PromoValidationResult {
  valid: boolean;
  discount?: number;
  code?: string;
  message: string;
}

export type OrderTrackStatus =
  | 'pending'
  | 'accepted'
  | 'in_kitchen'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export interface OrderTrackDriver {
  id: string;
  name: string;
  phone: string;
}

export interface OrderTrackResult {
  id?: string;
  orderNumber: string;
  status: OrderTrackStatus;
  orderType: string;
  deliveryAddress?: string | null;
  deliveryCity?: string | null;
  deliveryPhone?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: string;
  driver?: OrderTrackDriver | null;
  createdAt?: string;
  hasReview?: boolean;
  customerId?: string | null;
}

export interface MyOrderSummary {
  id: string;
  orderNumber: string;
  orderType: string;
  status: OrderTrackStatus | string;
  finalTotal: number;
  subtotal?: number;
  discount?: number;
  taxAmount?: number;
  deliveryFee?: number;
  paymentStatus?: string;
  paymentMethod?: string | null;
  createdAt?: string;
  deliveryAddress?: string | null;
  deliveryCity?: string | null;
  items?: CartItem[];
  source?: 'account' | 'guest';
  hasReview?: boolean;
}

export interface CustomerAuthResponse {
  token: string;
  customerId: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
}

export interface CustomerSignupPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
  address?: string;
  city?: string;
}

export interface CustomerLoginPayload {
  identifier: string;
  password: string;
}

export interface CustomerUpdateProfilePayload {
  customerId: string;
  name: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
}

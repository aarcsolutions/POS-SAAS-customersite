'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  Package,
  Star,
} from 'lucide-react';
import OrderReviewModal from '@/components/orders/OrderReviewModal';
import { Button } from '@/components/ui/Button';
import { useTenant } from '@/components/providers/TenantProvider';
import { storefrontApi } from '@/services/storefront';
import { useAuthStore } from '@/stores/auth-store';
import { useGuestOrdersStore } from '@/stores/guest-orders-store';
import type { MyOrderSummary } from '@/types/storefront';
import { cn, formatRs } from '@/utils/format';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  accepted: 'bg-sky-50 text-sky-700',
  in_kitchen: 'bg-orange-50 text-orange-700',
  ready: 'bg-emerald-50 text-emerald-700',
  out_for_delivery: 'bg-indigo-50 text-indigo-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-600',
};

export default function MyOrdersPage() {
  const { tenant } = useTenant();
  const reviewsEnabled = !!tenant?.features?.reviews;
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const customer = useAuthStore((s) => s.customer);
  const guestOrders = useGuestOrdersStore((s) => s.orders);

  const [accountOrders, setAccountOrders] = useState<MyOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewOrder, setReviewOrder] = useState<MyOrderSummary | null>(null);
  const [savingReview, setSavingReview] = useState(false);

  const loadAccountOrders = useCallback(() => {
    if (!customer?.customerId) {
      setAccountOrders([]);
      return;
    }

    setLoading(true);
    setError(null);

    storefrontApi
      .getMyOrders(customer.customerId)
      .then((orders) => {
        setAccountOrders(
          orders.map((o) => ({ ...o, source: 'account' as const })),
        );
      })
      .catch(() => {
        setError('Could not load your orders. Please try again.');
        setAccountOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [customer?.customerId]);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (!authHydrated || !customer?.customerId) {
      setAccountOrders([]);
      setLoading(false);
      setError(null);
      return;
    }

    loadAccountOrders();
  }, [authHydrated, customer?.customerId, loadAccountOrders]);

  const orders: MyOrderSummary[] = useMemo(() => {
    if (customer?.customerId) return accountOrders;

    return guestOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      orderType: o.orderType,
      status: o.status,
      finalTotal: o.total,
      subtotal: o.subtotal,
      discount: o.discount,
      taxAmount: o.gst,
      deliveryFee: o.deliveryFee,
      createdAt: o.placedAt,
      items: o.items,
      source: 'guest' as const,
      hasReview: false,
    }));
  }, [accountOrders, customer?.customerId, guestOrders]);

  const handleSubmitReview = async (data: {
    rating: number;
    comment: string;
  }) => {
    if (!customer?.customerId || !reviewOrder) return;
    setSavingReview(true);
    try {
      await storefrontApi.createReview({
        customerId: customer.customerId,
        orderId: reviewOrder.id,
        rating: data.rating,
        comment: data.comment,
      });
      setReviewOrder(null);
      loadAccountOrders();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Could not submit review. Please try again.';
      setError(message);
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div>
      <div className="border-b border-neutral-200 bg-white px-4 py-3 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="bg-brand-primary-dark px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-brand-gold" />
          <h1 className="heading-display text-2xl text-white sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-2 text-sm text-white/75">
            {customer
              ? `Orders for ${customer.name}`
              : 'Guest orders for this session (clears on page refresh)'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
        {!customer ? (
          <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You are browsing as a guest. Place orders stay here until you
            refresh.{' '}
            <Link href="/login" className="font-bold underline">
              Login
            </Link>{' '}
            to save orders permanently to your account.
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-brand-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading orders…
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!loading && !error && orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 px-6 py-14 text-center">
            <Package className="mx-auto mb-3 h-10 w-10 text-brand-muted" />
            <p className="text-sm font-semibold text-neutral-800">
              No orders yet
            </p>
            <p className="mt-1 text-sm text-brand-muted">
              Your recent orders will show up here after checkout.
            </p>
            <Link href="/menu" className="mt-5 inline-block">
              <Button variant="primary">Browse Menu</Button>
            </Link>
          </div>
        ) : null}

        {!loading && orders.length > 0 ? (
          <ul className="space-y-4">
            {orders.map((order) => {
              const canReview =
                reviewsEnabled &&
                !!customer?.customerId &&
                order.status === 'completed' &&
                !order.hasReview;

              return (
                <li
                  key={order.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                        Order ID
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-neutral-900">
                        {order.orderNumber}
                      </p>
                      {order.createdAt ? (
                        <p className="mt-1 text-xs text-brand-muted">
                          {new Date(order.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide',
                        STATUS_STYLES[order.status] ??
                          'bg-neutral-100 text-neutral-700',
                      )}
                    >
                      {String(order.status).replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <p className="capitalize text-brand-muted">
                      {order.orderType}
                      {order.items?.length
                        ? ` · ${order.items.length} item${order.items.length > 1 ? 's' : ''}`
                        : ''}
                    </p>
                    <p className="text-lg font-bold text-brand-accent">
                      {formatRs(Number(order.finalTotal) || 0)}
                    </p>
                  </div>

                  {order.items && order.items.length > 0 ? (
                    <ul className="mt-3 space-y-1 border-t border-neutral-100 pt-3">
                      {order.items.slice(0, 4).map((item) => (
                        <li
                          key={`${item.productId}-${item.variantId}`}
                          className="flex justify-between text-xs text-neutral-700"
                        >
                          <span>
                            {item.name}
                            {item.variantName ? ` (${item.variantName})` : ''} ×{' '}
                            {item.quantity}
                          </span>
                          <span className="font-semibold text-brand-gold">
                            {formatRs(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                      {order.items.length > 4 ? (
                        <li className="text-xs text-brand-muted">
                          +{order.items.length - 4} more items
                        </li>
                      ) : null}
                    </ul>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/track-order?number=${encodeURIComponent(order.orderNumber)}`}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-brand-accent px-5 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-accent-hover"
                    >
                      Track Order
                    </Link>
                    {canReview ? (
                      <button
                        type="button"
                        onClick={() => setReviewOrder(order)}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-brand-accent bg-white px-5 text-xs font-bold uppercase tracking-wide text-brand-accent transition hover:bg-brand-accent/5"
                      >
                        <Star className="h-3.5 w-3.5" />
                        Review
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {reviewOrder ? (
        <OrderReviewModal
          open
          orderLabel={`Order ${reviewOrder.orderNumber}`}
          customerName={customer?.name}
          saving={savingReview}
          onClose={() => setReviewOrder(null)}
          onSubmit={handleSubmitReview}
        />
      ) : null}
    </div>
  );
}

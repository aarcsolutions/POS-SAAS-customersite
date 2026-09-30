'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  PackageSearch,
  Phone,
  Star,
  Truck,
  XCircle,
} from 'lucide-react';
import OrderReviewModal from '@/components/orders/OrderReviewModal';
import { OrderJourneyStepper } from '@/components/orders/OrderJourneyStepper';
import { Button } from '@/components/ui/Button';
import { useTenant } from '@/components/providers/TenantProvider';
import { useOrderTrackSocket } from '@/hooks/use-order-track-socket';
import { storefrontApi } from '@/services/storefront';
import { useAuthStore } from '@/stores/auth-store';
import type { OrderTrackResult } from '@/types/storefront';
import { cn } from '@/utils/format';

const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);

const STATUS_HEADLINE: Record<string, string> = {
  pending: 'Order placed — waiting for confirmation',
  accepted: 'Order confirmed',
  in_kitchen: 'Your order is being prepared',
  ready: 'Your order is ready',
  out_for_delivery: 'Your order is on the way',
  completed: 'Order delivered successfully',
  cancelled: 'This order was cancelled',
};

function reviewSkipKey(orderNumber: string) {
  return `review-skip:${orderNumber}`;
}

export default function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get('number') ?? '';
  const { tenant } = useTenant();
  const reviewsEnabled = !!tenant?.features?.reviews;
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const customer = useAuthStore((s) => s.customer);

  const [orderNumber, setOrderNumber] = useState(initialNumber);
  const [order, setOrder] = useState<OrderTrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [trackedNumber, setTrackedNumber] = useState<string | null>(null);
  const [promptReview, setPromptReview] = useState(false);
  const [manualReview, setManualReview] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const inFlightRef = useRef(false);
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  const canReviewOrder = Boolean(
    reviewsEnabled &&
      order &&
      order.status === 'completed' &&
      !order.hasReview &&
      order.id &&
      customer?.customerId &&
      (!order.customerId || order.customerId === customer.customerId),
  );

  const fetchOrder = useCallback(async (number: string, silent = false) => {
    const trimmed = number.trim();
    if (!trimmed) {
      setError('Please enter your order number');
      return;
    }

    if (inFlightRef.current) return;
    inFlightRef.current = true;

    if (!silent) {
      setLoading(true);
      setError(null);
      setSearched(true);
    }

    try {
      const result = await storefrontApi.trackOrder(trimmed);
      setOrder(result);
      setTrackedNumber(trimmed);
      setError(null);
    } catch (err: unknown) {
      if (!silent) {
        setOrder(null);
        setTrackedNumber(null);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ??
          'Order not found. Please check the number and try again.';
        setError(message);
      }
    } finally {
      inFlightRef.current = false;
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (initialNumber.trim()) {
      setOrderNumber(initialNumber);
      void fetchOrder(initialNumber);
    }
  }, [initialNumber, fetchOrder]);

  useOrderTrackSocket({
    enabled: Boolean(
      trackedNumber && order && !TERMINAL_STATUSES.has(order.status),
    ),
    join: trackedNumber
      ? { mode: 'number', orderNumber: trackedNumber }
      : null,
    onUpdate: (partial) => {
      setOrder((prev) => (prev ? { ...prev, ...partial } : prev));
    },
    onReconnectRefresh: () => {
      if (trackedNumber) void fetchOrder(trackedNumber, true);
    },
  });

  useEffect(() => {
    if (!order) {
      prevStatusRef.current = null;
      setPromptReview(false);
      return;
    }

    const prev = prevStatusRef.current;
    prevStatusRef.current = order.status;

    if (!canReviewOrder) {
      setPromptReview(false);
      return;
    }

    const skipped =
      typeof window !== 'undefined' &&
      sessionStorage.getItem(reviewSkipKey(order.orderNumber)) === '1';

    if (skipped) {
      setPromptReview(false);
      return;
    }

    if (prev === null || prev !== 'completed') {
      setPromptReview(true);
    }
  }, [order, canReviewOrder]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void fetchOrder(orderNumber);
  };

  const closeReviewPrompt = (skip = false) => {
    if (skip && order?.orderNumber) {
      sessionStorage.setItem(reviewSkipKey(order.orderNumber), '1');
    }
    setPromptReview(false);
    setManualReview(false);
  };

  const handleSubmitReview = async (data: {
    rating: number;
    comment: string;
  }) => {
    if (!customer?.customerId || !order?.id) return;
    setSavingReview(true);
    try {
      await storefrontApi.createReview({
        customerId: customer.customerId,
        orderId: order.id,
        rating: data.rating,
        comment: data.comment,
      });
      setOrder((prev) => (prev ? { ...prev, hasReview: true } : prev));
      closeReviewPrompt(false);
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
          <PackageSearch className="mx-auto mb-3 h-10 w-10 text-brand-gold" />
          <h1 className="heading-display text-2xl text-white sm:text-3xl">
            Track Your Order
          </h1>
          <p className="mt-2 text-sm text-white/75">
            Enter your order number to see live journey updates
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <label
            htmlFor="order-number"
            className="mb-2 block text-sm font-semibold text-neutral-800"
          >
            Order Number
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="order-number"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. ORD-000001"
              className="h-12 flex-1 rounded-xl border border-neutral-200 px-4 text-sm font-medium uppercase tracking-wide text-neutral-900 outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="min-w-[140px] shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Track'
              )}
            </Button>
          </div>
        </form>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {order ? (
          <div className="mt-6 space-y-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  Order Number
                </p>
                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {order.orderNumber}
                </p>
              </div>
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
                  order.status === 'cancelled'
                    ? 'bg-rose-50 text-rose-600'
                    : order.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-brand-accent-soft text-brand-accent',
                )}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="rounded-xl bg-neutral-50 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-800">
                {STATUS_HEADLINE[order.status] ?? 'Tracking your order'}
              </p>
              {order.createdAt ? (
                <p className="mt-1 text-xs text-brand-muted">
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              ) : null}
            </div>

            {order.status === 'cancelled' ? (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <XCircle className="h-5 w-5 shrink-0" />
                <span>This order is no longer active.</span>
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-100 bg-white px-2 py-5 sm:px-4">
                <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-brand-muted">
                  Order Journey
                </p>
                <OrderJourneyStepper
                  status={order.status}
                  orderType={order.orderType}
                />
              </div>
            )}

            {(order.deliveryAddress || order.deliveryCity) && (
              <div className="flex gap-2 text-sm text-neutral-700">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <span>
                  {[order.deliveryCity, order.deliveryAddress]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}

            {order.deliveryPhone ? (
              <div className="flex gap-2 text-sm text-neutral-700">
                <Phone className="h-4 w-4 text-brand-accent" />
                <span>{order.deliveryPhone}</span>
              </div>
            ) : null}

            {order.driver && order.status === 'out_for_delivery' ? (
              <div className="flex gap-3 rounded-xl bg-brand-accent-soft px-4 py-3 text-sm text-neutral-800">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
                    Your Driver
                  </p>
                  <p className="font-semibold">{order.driver.name}</p>
                  <p className="text-brand-accent">{order.driver.phone}</p>
                </div>
              </div>
            ) : null}

            {canReviewOrder ? (
              <button
                type="button"
                onClick={() => setManualReview(true)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-brand-accent bg-white text-xs font-bold uppercase tracking-wide text-brand-accent transition hover:bg-brand-accent/5 sm:w-auto sm:px-6"
              >
                <Star className="h-4 w-4" />
                Leave a Review
              </button>
            ) : null}
          </div>
        ) : searched && !loading && !error ? (
          <p className="mt-6 text-center text-sm text-brand-muted">
            No order found for that number.
          </p>
        ) : null}
      </div>

      {(promptReview || manualReview) && canReviewOrder && order ? (
        <OrderReviewModal
          open
          orderLabel={`Order ${order.orderNumber}`}
          customerName={customer?.name}
          saving={savingReview}
          showSkip={promptReview && !manualReview}
          onClose={() => closeReviewPrompt(true)}
          onSkip={() => closeReviewPrompt(true)}
          onSubmit={handleSubmitReview}
        />
      ) : null}
    </div>
  );
}

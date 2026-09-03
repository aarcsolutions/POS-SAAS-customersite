'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  PackageSearch,
  Phone,
  Truck,
  XCircle,
} from 'lucide-react';
import { OrderJourneyStepper } from '@/components/orders/OrderJourneyStepper';
import { Button } from '@/components/ui/Button';
import { storefrontApi } from '@/services/storefront';
import type { OrderTrackResult } from '@/types/storefront';
import { cn } from '@/utils/format';

const STATUS_HEADLINE: Record<string, string> = {
  pending: 'Order placed — waiting for confirmation',
  accepted: 'Order confirmed',
  in_kitchen: 'Your order is being prepared',
  ready: 'Your order is ready',
  out_for_delivery: 'Your order is on the way',
  completed: 'Order delivered successfully',
  cancelled: 'This order was cancelled',
};

export default function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialNumber = searchParams.get('number') ?? '';

  const [orderNumber, setOrderNumber] = useState(initialNumber);
  const [order, setOrder] = useState<OrderTrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchOrder = async (number: string) => {
    const trimmed = number.trim();
    if (!trimmed) {
      setError('Please enter your order number');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const result = await storefrontApi.trackOrder(trimmed);
      setOrder(result);
    } catch (err: unknown) {
      setOrder(null);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Order not found. Please check the number and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialNumber.trim()) {
      void fetchOrder(initialNumber);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void fetchOrder(orderNumber);
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
                      : 'bg-red-50 text-brand-accent',
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
              <div className="flex gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-neutral-800">
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
          </div>
        ) : searched && !loading && !error ? (
          <p className="mt-6 text-center text-sm text-brand-muted">
            No order found for that number.
          </p>
        ) : null}
      </div>
    </div>
  );
}

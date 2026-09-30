'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatRs } from '@/utils/format';
import { resolveProductImageUrl } from '@/utils/product-image';
import {
  loadOrderReceipt,
  useReceiptStore,
  type OrderReceipt,
} from '@/utils/order-receipt';

export default function OrderConfirmationContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const orderIdParam = params?.id;
  const orderId = Array.isArray(orderIdParam)
    ? orderIdParam[0]
    : (orderIdParam ?? '');
  const orderNumberFromQuery = searchParams.get('number') ?? '';

  const storeReceipt = useReceiptStore((s) => s.receipt);
  const hydrate = useReceiptStore((s) => s.hydrate);

  const [receipt, setReceipt] = useState<OrderReceipt | null>(() =>
    loadOrderReceipt(orderId),
  );

  useEffect(() => {
    const loaded = hydrate() ?? loadOrderReceipt(orderId);
    if (loaded) setReceipt(loaded);
  }, [orderId, hydrate]);

  useEffect(() => {
    if (storeReceipt) setReceipt(storeReceipt);
  }, [storeReceipt]);

  const orderNumber = useMemo(
    () => receipt?.orderNumber || orderNumberFromQuery || '—',
    [receipt?.orderNumber, orderNumberFromQuery],
  );

  const trackHref =
    orderNumber && orderNumber !== '—'
      ? `/track-order?number=${encodeURIComponent(orderNumber)}`
      : '/track-order';

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="bg-brand-primary-dark px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="heading-display text-2xl text-white sm:text-3xl">
            Your order has been placed
          </h1>
          <p className="mt-2 text-sm text-white/75">
            We&apos;ve received your order and started preparing it.
          </p>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-6">
          <div className="rounded-xl bg-neutral-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
              Order ID
            </p>
            <p className="mt-1 text-xl font-bold text-neutral-900">
              {orderNumber}
            </p>
            {receipt?.orderType ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                {receipt.orderType}
              </p>
            ) : null}
          </div>

          {receipt?.items?.length ? (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-brand-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Items
                </h2>
              </div>
              <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-100">
                {receipt.items.map((item) => (
                  <li
                    key={`${item.productId}-${item.variantId}`}
                    className="flex gap-3 px-3 py-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveProductImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover bg-neutral-100"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-neutral-900">
                        {item.name}
                      </p>
                      {item.variantName ? (
                        <p className="mt-0.5 text-[11px] text-brand-muted">
                          {item.variantName}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-brand-muted">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-brand-gold">
                      {formatRs(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-center text-sm text-brand-muted">
              Order #{orderNumber} is confirmed. Open tracking for live status.
            </p>
          )}

          {receipt ? (
            <div className="space-y-2 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-muted">Subtotal</span>
                <span>{formatRs(receipt.subtotal)}</span>
              </div>
              {receipt.deliveryFee > 0 ? (
                <div className="flex justify-between">
                  <span className="text-brand-muted">Delivery Fee</span>
                  <span>{formatRs(receipt.deliveryFee)}</span>
                </div>
              ) : null}
              {receipt.discount > 0 ? (
                <div className="flex justify-between text-emerald-600">
                  <span>
                    Discount
                    {receipt.promoCode ? ` (${receipt.promoCode})` : ''}
                  </span>
                  <span>-{formatRs(receipt.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-brand-muted">GST (16%)</span>
                <span>{formatRs(receipt.gst)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-3">
                <span className="heading-display text-sm">Total</span>
                <span className="text-xl font-bold text-brand-accent">
                  {formatRs(receipt.total)}
                </span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-1">
            <Link
              href={trackHref}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-accent px-8 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition hover:bg-brand-accent-hover"
            >
              Track Your Order
            </Link>
            <Link href="/menu" className="block">
              <Button variant="outline" size="lg" className="w-full">
                Back to Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('number') ?? '—';

  return (
    <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="heading-display text-3xl text-neutral-900 sm:text-4xl">
          Order Confirmed!
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-brand-muted">
          Thank you for your order. Your order number is{' '}
          <strong className="text-neutral-900">{orderNumber}</strong>. It will
          appear in Admin → Orders (delivery/takeaway filter).
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/track-order?number=${encodeURIComponent(orderNumber)}`}
            className="inline-block"
          >
            <Button variant="primary" size="lg" className="min-w-[200px]">
              Track Order
            </Button>
          </Link>
          <Link href="/menu" className="inline-block">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              Back to Menu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

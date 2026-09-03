'use client';

import Link from 'next/link';
import { CartLineItems } from '@/components/cart/CartLineItems';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCartStore } from '@/stores/cart-store';
import { formatRs } from '@/utils/format';

export function OrderSummary({ showCheckoutLink = true }: { showCheckoutLink?: boolean }) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the menu and add items to get started."
        actionLabel="View menu"
        onAction={() => {
          window.location.href = '/menu';
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white">
        <CartLineItems readOnly={!showCheckoutLink} compact={!showCheckoutLink} />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold uppercase tracking-wide text-brand-muted">
            Subtotal
          </span>
          <span className="price-gold font-bold">{formatRs(subtotal)}</span>
        </div>
        {showCheckoutLink ? (
          <Link href="/checkout" className="mt-4 block">
            <Button className="w-full" size="lg">
              Proceed to checkout
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

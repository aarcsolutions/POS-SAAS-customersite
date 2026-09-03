'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartLineItems } from '@/components/cart/CartLineItems';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBranchBootstrap } from '@/hooks/use-branch-bootstrap';
import { useBranchStore } from '@/stores/branch-store';
import { useCartStore } from '@/stores/cart-store';
import { formatRs } from '@/utils/format';

export default function CartPage() {
  const router = useRouter();
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const setBranchId = useCartStore((s) => s.setBranchId);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());

  useBranchBootstrap();

  useEffect(() => {
    setBranchId(selectedBranchId);
  }, [selectedBranchId, setBranchId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
      <h1 className="heading-display mb-6 text-2xl text-brand-primary">
        Your Cart
      </h1>
      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse the menu and add items to get started."
          actionLabel="View menu"
          onAction={() => router.push('/menu')}
        />
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <CartLineItems />
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="heading-display text-sm">Total</span>
            <span className="price-gold text-xl">{formatRs(subtotal)}</span>
          </div>
          <Button
            className="mt-4 w-full"
            size="lg"
            onClick={() => router.push('/checkout')}
          >
            Checkout
          </Button>
        </div>
      )}
    </div>
  );
}

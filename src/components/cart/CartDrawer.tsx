'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { CartLineItems } from '@/components/cart/CartLineItems';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import { formatRs } from '@/utils/format';

export function CartDrawer() {
  const router = useRouter();
  const cartOpen = useUiStore((s) => s.cartOpen);
  const closeCart = useUiStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const itemCount = useCartStore((s) => s.getItemCount());

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  if (!cartOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close cart"
        className="fixed inset-x-0 top-14 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 bg-black/40 xl:inset-0"
        onClick={closeCart}
      />
      <aside className="fixed right-0 top-14 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-50 flex w-full max-w-[400px] flex-col bg-white shadow-2xl xl:top-0 xl:bottom-0 xl:h-full">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="heading-display text-base text-neutral-900">
            Your Cart ({itemCount})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Browse the menu and add items to get started."
              actionLabel="View menu"
              onAction={() => {
                closeCart();
                router.push('/menu');
              }}
            />
          ) : (
            <CartLineItems />
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-neutral-100 px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="heading-display text-sm text-neutral-700">
                Total
              </span>
              <span className="price-gold text-xl">{formatRs(subtotal)}</span>
            </div>
            <Button className="w-full rounded-full" size="lg" onClick={handleCheckout}>
              Checkout
            </Button>
            <button
              type="button"
              onClick={clearCart}
              className="mt-3 w-full text-center text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-accent"
            >
              Clear cart
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}

export function CartDrawerHost() {
  return <CartDrawer />;
}

'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatRs } from '@/utils/format';

interface CartLineItemsProps {
  compact?: boolean;
  readOnly?: boolean;
}

export function CartLineItems({
  compact = false,
  readOnly = false,
}: CartLineItemsProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  if (items.length === 0) return null;

  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((item) => (
        <li
          key={item.variantId}
          className={compact ? 'flex gap-3 py-3' : 'flex gap-3 p-4'}
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-900">
              {item.name}
            </p>
            {!readOnly ? (
              <p className="price-gold mt-0.5 text-sm">{formatRs(item.price)}</p>
            ) : (
              <p className="mt-0.5 text-xs text-brand-muted">
                Qty: {item.quantity}
              </p>
            )}
            {readOnly ? (
              <p className="price-gold mt-1 text-sm font-bold">
                {formatRs(item.price * item.quantity)}
              </p>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.variantId, item.quantity - 1)
                  }
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.variantId, item.quantity + 1)
                  }
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.variantId)}
                  className="ml-auto text-brand-muted hover:text-brand-accent"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

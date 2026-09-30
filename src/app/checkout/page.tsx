'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { useBranchStore } from '@/stores/branch-store';
import { useCartStore } from '@/stores/cart-store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const items = useCartStore((s) => s.items);
  const setBranchId = useCartStore((s) => s.setBranchId);

  useEffect(() => {
    setBranchId(selectedBranchId);
  }, [selectedBranchId, setBranchId]);

  // Only kick empty-cart visitors away on first load — NOT after Place Order
  // (clearCart would otherwise race and send users to /menu instead of receipt)
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/menu');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  return (
    <div>
      <div className="border-b border-neutral-200 bg-white px-4 py-3 lg:px-8">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Menu
        </Link>
      </div>
      <div className="bg-brand-primary-dark px-4 py-6 lg:px-8">
        <h1 className="heading-display text-center text-2xl text-white sm:text-3xl">
          Secure Checkout
        </h1>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <CheckoutForm />
      </div>
    </div>
  );
}

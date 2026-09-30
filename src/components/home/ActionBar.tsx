'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useTenant } from '@/components/providers/TenantProvider';

export function ActionBar() {
  const { tenant, loading } = useTenant();
  const showReserve = !!tenant?.features?.reservations;
  const showCatering = !!tenant?.features?.catering;

  if (loading) {
    return (
      <section className="border-b border-neutral-200 bg-white py-8">
        <div className="mx-auto max-w-3xl px-4 text-center text-sm text-neutral-400">
          Loading…
        </div>
      </section>
    );
  }

  if (!showReserve && !showCatering) {
    return (
      <section className="border-b border-neutral-200 bg-white py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 px-4">
          <Link
            href="/menu"
            className="text-sm font-bold uppercase tracking-widest text-brand-gold underline underline-offset-4 hover:opacity-80"
          >
            Start Order
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-neutral-200 bg-white py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 px-4 sm:flex-row sm:flex-wrap sm:gap-6">
        {showReserve ? (
          <Link href="/reserve">
            <Button variant="dark" size="lg" className="min-w-[200px]">
              Reserve Table
            </Button>
          </Link>
        ) : null}
        {showCatering ? (
          <Link href="/catering">
            <Button variant="dark" size="lg" className="min-w-[200px]">
              Catering Inquiry
            </Button>
          </Link>
        ) : null}
        <span className="text-sm font-medium text-neutral-500">OR</span>
        <Link
          href="/menu"
          className="text-sm font-bold uppercase tracking-widest text-brand-gold underline underline-offset-4 hover:opacity-80"
        >
          Start Order
        </Link>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

export function ActionBar() {
  return (
    <section className="border-b border-neutral-200 bg-white py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 px-4 sm:flex-row sm:gap-6">
        <Button
          variant="dark"
          size="lg"
          className="min-w-[200px]"
          onClick={() => toast.info('Table reservations — coming soon')}
        >
          Reserve Table
        </Button>
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

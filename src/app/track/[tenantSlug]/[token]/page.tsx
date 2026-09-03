'use client';

import Link from 'next/link';
import { PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TrackPreviewPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <PackageSearch className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Order tracking preview</h1>
        <p className="mt-2 text-sm text-slate-500">
          Live order tracking will connect to the public track API in Phase 14.
          For now, use the Admin track page or check your order confirmation.
        </p>
        <Link href="/menu" className="mt-6 inline-block">
          <Button>Back to menu</Button>
        </Link>
      </div>
    </div>
  );
}

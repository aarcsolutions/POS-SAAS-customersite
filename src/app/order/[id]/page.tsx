import { Suspense } from 'react';
import OrderConfirmationContent from './OrderConfirmationContent';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16">
          <LoadingSkeleton className="h-80 w-full" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}

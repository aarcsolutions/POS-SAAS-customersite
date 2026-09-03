import { Suspense } from 'react';
import MenuPageContent from './MenuPageContent';
import { MenuPageSkeleton } from '@/components/ui/LoadingSkeleton';

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <MenuPageSkeleton />
        </div>
      }
    >
      <MenuPageContent />
    </Suspense>
  );
}

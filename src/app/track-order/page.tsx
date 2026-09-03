import { Suspense } from 'react';
import TrackOrderContent from './TrackOrderContent';

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-brand-muted">
          Loading…
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

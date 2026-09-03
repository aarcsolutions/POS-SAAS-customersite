import { cn } from '@/utils/format';

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-200/80',
        className,
      )}
    />
  );
}

export function MenuPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-56 w-full" />
        ))}
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="lg:grid lg:min-h-[calc(100vh-57px)] lg:grid-cols-2">
      <LoadingSkeleton className="min-h-[320px] w-full lg:min-h-[calc(100vh-57px)]" />
      <div className="space-y-4 px-4 py-8 lg:px-10">
        <LoadingSkeleton className="h-8 w-2/3" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-5/6" />
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

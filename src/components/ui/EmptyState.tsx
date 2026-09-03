import { PackageOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-accent shadow-sm">
        {icon ?? <PackageOpen className="h-7 w-7" />}
      </div>
      <h3 className="heading-display text-lg text-brand-primary">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-brand-muted">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

'use client';

import { MapPin } from 'lucide-react';
import type { Branch } from '@/types/storefront';
import { cn } from '@/utils/format';

interface BranchCardProps {
  branch: Branch;
  selected?: boolean;
  onSelect: (branchId: string) => void;
}

export function BranchCard({ branch, selected, onSelect }: BranchCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(branch.id)}
      className={cn(
        'flex w-full flex-col rounded-2xl border p-5 text-left transition hover:shadow-md',
        selected
          ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
          : 'border-slate-200 bg-white hover:border-amber-200',
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
        <MapPin className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{branch.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{branch.address}</p>
      <p className="text-sm text-slate-400">{branch.city}</p>
    </button>
  );
}

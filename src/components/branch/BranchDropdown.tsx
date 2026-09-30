'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { MAIN_BRANCH_LABEL } from '@/constants/branch';
import { useBranchStore } from '@/stores/branch-store';
import { useCartStore } from '@/stores/cart-store';
import { cn } from '@/utils/format';
import { notifySuccess } from '@/utils/notify';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface BranchDropdownProps {
  tenantName?: string;
}

export function BranchDropdown({ tenantName = 'Store' }: BranchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pendingBranchId, setPendingBranchId] = useState<string | null | undefined>(
    undefined
  );
  const ref = useRef<HTMLDivElement>(null);

  const branches = useBranchStore((s) => s.branches);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const selectBranch = useBranchStore((s) => s.selectBranch);
  const selectedBranch = useBranchStore((s) =>
    s.selectedBranchId === null
      ? null
      : (s.branches.find((b) => b.id === s.selectedBranchId) ?? null),
  );
  const setBranchId = useCartStore((s) => s.setBranchId);
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const applyBranch = (branchId: string | null) => {
    selectBranch(branchId);
    setBranchId(branchId);
    setOpen(false);
    notifySuccess(
      'Branch Updated',
      branchId === null ? 'Main location selected' : 'Branch updated',
    );
  };

  const handleSelect = (branchId: string | null) => {
    if (branchId === selectedBranchId) {
      setOpen(false);
      return;
    }

    if (itemCount > 0) {
      setPendingBranchId(branchId);
      return;
    }

    applyBranch(branchId);
  };

  const label = selectedBranch
    ? selectedBranch.name.toUpperCase()
    : MAIN_BRANCH_LABEL.toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="nav-link flex items-center gap-1.5 whitespace-nowrap"
      >
        <MapPin className="h-3.5 w-3.5 text-brand-accent" />
        <span className="hidden lg:inline">FIND {tenantName.toUpperCase()}</span>
        <span className="lg:hidden">{label}</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[240px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          <div className="border-b border-neutral-100 px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
              Select branch
            </p>
          </div>
          <ul>
            <li>
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={cn(
                  'w-full px-4 py-3 text-left transition hover:bg-brand-accent-soft',
                  selectedBranchId === null && 'bg-brand-accent-soft',
                )}
              >
                <p className="text-sm font-bold text-brand-primary">
                  {MAIN_BRANCH_LABEL}
                </p>
                <p className="text-xs text-brand-muted">
                  Tenant-wide menu (no branch)
                </p>
              </button>
            </li>
            {branches.map((branch) => (
              <li key={branch.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(branch.id)}
                  className={cn(
                    'w-full px-4 py-3 text-left transition hover:bg-brand-accent-soft',
                    selectedBranchId === branch.id && 'bg-brand-accent-soft',
                  )}
                >
                  <p className="text-sm font-bold text-brand-primary">
                    {branch.name}
                  </p>
                  <p className="text-xs text-brand-muted">{branch.address}</p>
                  {branch.city ? (
                    <p className="text-xs text-brand-muted">{branch.city}</p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingBranchId !== undefined}
        title="Switch branch?"
        message="Switching branch will load a different cart. Your current branch cart is saved separately. Continue?"
        confirmLabel="Switch"
        onCancel={() => setPendingBranchId(undefined)}
        onConfirm={() => {
          const next = pendingBranchId ?? null;
          setPendingBranchId(undefined);
          applyBranch(next);
        }}
      />
    </div>
  );
}

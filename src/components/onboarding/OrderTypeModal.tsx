'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Crosshair,
  ExternalLink,
  Loader2,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTenant } from '@/components/providers/TenantProvider';
import { StoreSelect } from '@/components/ui/StoreSelect';
import { MAIN_BRANCH_LABEL } from '@/constants/branch';
import { useBranchBootstrap } from '@/hooks/use-branch-bootstrap';
import { useBranchStore } from '@/stores/branch-store';
import { useCartStore } from '@/stores/cart-store';
import { useOrderPrefsStore } from '@/stores/order-prefs-store';
import type { Branch, OrderType } from '@/types/storefront';
import { cn } from '@/utils/format';

const EXCLUDED_PATHS = ['/login', '/signup'];

function buildDirectionsUrl(branch: Branch | null): string {
  if (!branch) return '#';
  const query = [branch.address, branch.city].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function OrderTypeModal() {
  const pathname = usePathname();
  const { tenant } = useTenant();

  useBranchBootstrap();

  const hydrated = useBranchStore((s) => s.hydrated);
  const branches = useBranchStore((s) => s.branches);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const selectBranch = useBranchStore((s) => s.selectBranch);
  const setBranchId = useCartStore((s) => s.setBranchId);

  const orderType = useOrderPrefsStore((s) => s.orderType);
  const welcomeCompleted = useOrderPrefsStore((s) => s.welcomeCompleted);
  const setOrderType = useOrderPrefsStore((s) => s.setOrderType);
  const completeWelcome = useOrderPrefsStore((s) => s.completeWelcome);

  const [pendingBranchId, setPendingBranchId] = useState<string | null>(
    selectedBranchId,
  );
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const excluded = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));
  const visible = hydrated && !welcomeCompleted && !excluded;

  useEffect(() => {
    if (visible) {
      setPendingBranchId(selectedBranchId);
    }
  }, [visible, selectedBranchId]);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  const selectValue =
    pendingBranchId ?? (orderType === 'delivery' ? 'main' : '');

  const handleBranchChange = (value: string) => {
    setPendingBranchId(value === 'main' ? null : value || null);
    setError(null);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location is not supported in this browser.');
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocating(false);
        if (branches.length > 0) {
          setPendingBranchId(branches[0].id);
          toast.success(`Nearest outlet selected: ${branches[0].name}`);
        } else {
          setPendingBranchId(null);
          toast.success(`${MAIN_BRANCH_LABEL} location selected`);
        }
      },
      () => {
        setLocating(false);
        toast.error('Could not access your location. Please select manually.');
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const selectedBranch = useMemo(() => {
    if (pendingBranchId === null) return null;
    return branches.find((b) => b.id === pendingBranchId) ?? null;
  }, [branches, pendingBranchId]);

  const branchOptions = useMemo(() => {
    const items = branches.map((branch) => ({
      value: branch.id,
      label: branch.name,
      sublabel: [branch.address, branch.city].filter(Boolean).join(', '),
    }));

    if (orderType === 'delivery') {
      return [
        { value: 'main', label: MAIN_BRANCH_LABEL, sublabel: 'Tenant-wide menu' },
        ...items,
      ];
    }

    return items;
  }, [branches, orderType]);

  const handleSelect = () => {
    if (orderType === 'takeaway' && !pendingBranchId) {
      setError('Please select a branch for pick-up.');
      return;
    }

    selectBranch(pendingBranchId);
    setBranchId(pendingBranchId);
    completeWelcome();
    setError(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-type-modal-title"
      >
        <div className="overflow-hidden rounded-t-3xl bg-[#b85c5c] px-6 py-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-md">
            {tenant?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-14 w-14 object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-brand-primary">
                {(tenant?.name ?? 'S').slice(0, 1)}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          <h2
            id="order-type-modal-title"
            className="text-center text-lg font-bold text-neutral-800"
          >
            Select Your Order Type
          </h2>

          <div className="mt-4 flex overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 p-1">
            {(['delivery', 'takeaway'] as OrderType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setOrderType(type);
                  setError(null);
                  if (type === 'takeaway' && pendingBranchId === null && branches[0]) {
                    setPendingBranchId(branches[0].id);
                  }
                }}
                className={cn(
                  'flex-1 rounded-full px-4 py-2.5 text-sm font-bold capitalize transition',
                  orderType === type
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900',
                )}
              >
                {type === 'takeaway' ? 'Pick-Up' : 'Delivery'}
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-brand-muted">
            {orderType === 'delivery'
              ? 'Please select your location'
              : 'Which outlet would you like to pick-up from?'}
          </p>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="mx-auto mt-3 flex items-center gap-2 rounded-full border border-[#e8a4a4] px-4 py-2 text-sm font-semibold text-[#d47373] transition hover:bg-red-50 disabled:opacity-60"
          >
            {locating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crosshair className="h-4 w-4" />
            )}
            Use Current Location
          </button>

          <div className="relative z-20 mt-5">
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              {orderType === 'delivery' ? 'Please select your location' : 'Select Branch'}
            </label>
            <StoreSelect
              value={selectValue}
              onChange={handleBranchChange}
              options={branchOptions}
              placeholder={
                orderType === 'delivery'
                  ? 'Please select your location'
                  : 'Select a branch'
              }
              aria-label={
                orderType === 'delivery' ? 'Delivery location' : 'Pick-up branch'
              }
            />
          </div>

          {orderType === 'takeaway' && selectedBranch ? (
            <div className="mt-4 rounded-2xl bg-[#fff0f0] p-4">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900">Branch Location</p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {[selectedBranch.address, selectedBranch.city]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  <a
                    href={buildDirectionsUrl(selectedBranch)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-accent hover:underline"
                  >
                    Get Directions
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="mt-3 text-center text-xs font-semibold text-brand-accent">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSelect}
            className="mt-5 w-full rounded-2xl bg-brand-accent py-3.5 text-base font-bold text-white shadow-md shadow-red-200/60 transition hover:bg-[#c91530]"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

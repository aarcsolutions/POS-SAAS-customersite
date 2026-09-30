'use client';

import { useEffect, useRef } from 'react';
import { storefrontApi } from '@/services/storefront';
import { useBranchStore } from '@/stores/branch-store';
import { useCartStore } from '@/stores/cart-store';
import type { Branch } from '@/types/storefront';

/** Shared in-flight / cached branches fetch — prevents request storms */
let branchesPromise: Promise<Branch[]> | null = null;
let branchesFetchedAt = 0;
const BRANCHES_TTL_MS = 60_000;

function loadBranches(force = false): Promise<Branch[]> {
  const now = Date.now();
  if (
    !force &&
    branchesPromise &&
    now - branchesFetchedAt < BRANCHES_TTL_MS
  ) {
    return branchesPromise;
  }

  branchesFetchedAt = now;
  branchesPromise = storefrontApi
    .getBranches()
    .then((branches) => branches)
    .catch((err) => {
      branchesPromise = null;
      branchesFetchedAt = 0;
      throw err;
    });

  return branchesPromise;
}

export function useBranchBootstrap() {
  const hydrated = useBranchStore((s) => s.hydrated);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const setBranches = useBranchStore((s) => s.setBranches);
  const selectBranch = useBranchStore((s) => s.selectBranch);
  const setBranchId = useCartStore((s) => s.setBranchId);
  const bootedRef = useRef(false);

  // Fetch branches once after store rehydration (not on every branch change)
  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    loadBranches()
      .then((branches) => {
        if (cancelled) return;

        const current = useBranchStore.getState();
        const prev = current.branches;
        const same =
          prev.length === branches.length &&
          prev.every((b, i) => b.id === branches[i]?.id);

        if (!same) {
          setBranches(branches);
        }

        const selected = current.selectedBranchId;
        const validSelection =
          selected === null || branches.some((b) => b.id === selected);

        if (!validSelection) {
          selectBranch(null);
          setBranchId(null);
        } else if (!bootedRef.current) {
          setBranchId(selected);
        }

        bootedRef.current = true;
      })
      .catch(() => {
        // Keep UI usable; next mount/navigation can retry after TTL reset
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, selectBranch, setBranchId, setBranches]);

  // Keep cart branch in sync when user changes branch (no API call)
  useEffect(() => {
    if (!hydrated || !bootedRef.current) return;
    setBranchId(selectedBranchId);
  }, [hydrated, selectedBranchId, setBranchId]);
}

export function useRequireBranch() {
  // Branch selection is handled via header dropdown — Main (null) is valid.
}

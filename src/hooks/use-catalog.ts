'use client';

import { useEffect, useState } from 'react';
import { storefrontApi } from '@/services/storefront';
import { useBranchStore } from '@/stores/branch-store';
import type { Catalog } from '@/types/storefront';

export function useCatalog() {
  const hydrated = useBranchStore((s) => s.hydrated);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const [catalogState, setCatalogState] = useState<{
    branchId: string | null;
    catalog: Catalog | null;
  }>({ branchId: null, catalog: null });

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    storefrontApi.getCatalog(selectedBranchId).then((data) => {
      if (!cancelled) {
        setCatalogState({ branchId: selectedBranchId, catalog: data });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hydrated, selectedBranchId]);

  const catalog =
    catalogState.branchId === selectedBranchId ? catalogState.catalog : null;
  const loading = hydrated && !catalog;

  return { catalog, loading, hydrated };
}

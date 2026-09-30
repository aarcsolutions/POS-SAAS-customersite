'use client';

import { useEffect, useState } from 'react';
import { storefrontApi } from '@/services/storefront';
import { useBranchStore } from '@/stores/branch-store';
import type { Catalog } from '@/types/storefront';

/** Shared catalog cache per branch to avoid duplicate fetches */
const catalogCache = new Map<
  string,
  { promise: Promise<Catalog>; at: number }
>();
const CATALOG_TTL_MS = 30_000;

function cacheKey(branchId: string | null): string {
  return branchId ?? 'main';
}

function loadCatalog(branchId: string | null): Promise<Catalog> {
  const key = cacheKey(branchId);
  const cached = catalogCache.get(key);
  const now = Date.now();
  if (cached && now - cached.at < CATALOG_TTL_MS) {
    return cached.promise;
  }

  const promise = storefrontApi
    .getCatalog(branchId)
    .then((data) => data)
    .catch((err) => {
      catalogCache.delete(key);
      throw err;
    });

  catalogCache.set(key, { promise, at: now });
  return promise;
}

export function useCatalog() {
  const hydrated = useBranchStore((s) => s.hydrated);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const [catalogState, setCatalogState] = useState<{
    branchId: string | null;
    catalog: Catalog | null;
  }>({ branchId: null, catalog: null });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    setFailed(false);

    loadCatalog(selectedBranchId)
      .then((data) => {
        if (!cancelled) {
          setCatalogState({ branchId: selectedBranchId, catalog: data });
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, selectedBranchId]);

  const catalog =
    catalogState.branchId === selectedBranchId ? catalogState.catalog : null;
  const loading = hydrated && !catalog && !failed;

  return { catalog, loading, hydrated, failed };
}

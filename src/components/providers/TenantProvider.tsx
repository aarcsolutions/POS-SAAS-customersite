'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { storefrontApi } from '@/services/storefront';
import type { TenantInfo } from '@/types/storefront';

interface TenantContextValue {
  tenant: TenantInfo | null;
  loading: boolean;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  loading: true,
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    storefrontApi
      .getTenantInfo()
      .then((data) => {
        if (!cancelled) {
          setTenant(data);
          setLoading(false);
          if (data.name) {
            document.title = `${data.name} | Order Online`;
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTenant({
            id: 'unknown',
            name: 'Storefront',
            slug: 'store',
            logoUrl: null,
            tagline: 'Order online',
          });
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}

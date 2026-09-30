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

function applyBrandingTheme(tenant: TenantInfo) {
  const root = document.documentElement;
  if (tenant.primaryColor) {
    root.style.setProperty('--brand-primary', tenant.primaryColor);
  }
  if (tenant.primaryDark) {
    root.style.setProperty('--brand-primary-dark', tenant.primaryDark);
  }
  if (tenant.accentColor) {
    root.style.setProperty('--brand-accent', tenant.accentColor);
  }
  if (tenant.goldColor) {
    root.style.setProperty('--brand-gold', tenant.goldColor);
  }

  if (tenant.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = tenant.faviconUrl;
  }
}

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
          applyBrandingTheme(data);
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
            features: { catering: false, reservations: false, reviews: false },
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

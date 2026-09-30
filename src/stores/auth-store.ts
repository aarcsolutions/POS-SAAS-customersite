'use client';

import { create } from 'zustand';

export interface CustomerAuth {
  customerId: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  token?: string | null;
}

interface AuthState {
  customer: CustomerAuth | null;
  hydrated: boolean;
  setCustomer: (customer: CustomerAuth | null) => void;
  hydrate: () => void;
  logout: () => void;
}

const AUTH_KEY = 'storefront-customer-auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  customer: null,
  hydrated: false,

  setCustomer: (customer) => {
    if (typeof window !== 'undefined') {
      try {
        if (customer) {
          localStorage.setItem(AUTH_KEY, JSON.stringify(customer));
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      } catch {
        // ignore
      }
    }
    set({ customer, hydrated: true });
  },

  hydrate: () => {
    if (get().hydrated) return;
    if (typeof window === 'undefined') {
      set({ hydrated: true });
      return;
    }
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        set({ customer: JSON.parse(raw) as CustomerAuth, hydrated: true });
        return;
      }
    } catch {
      // ignore
    }
    set({ customer: null, hydrated: true });
  },

  logout: () => {
    get().setCustomer(null);
  },
}));

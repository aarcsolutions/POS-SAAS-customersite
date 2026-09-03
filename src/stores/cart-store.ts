'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { cartScopeKey } from '@/constants/branch';
import type { CartItem } from '@/types/storefront';

interface CartState {
  branchId: string | null;
  items: CartItem[];
  setBranchId: (branchId: string | null) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

function loadItemsForBranch(branchId: string | null): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`storefront-cart:${cartScopeKey(branchId)}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItemsForBranch(branchId: string | null, items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  const key = `storefront-cart:${cartScopeKey(branchId)}`;
  if (items.length === 0) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(items));
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      branchId: null,
      items: [],

      setBranchId: (branchId) => {
        const current = get();
        if (current.branchId === branchId) return;
        const items = loadItemsForBranch(branchId);
        set({ branchId, items });
      },

      addItem: (item, quantity = 1) => {
        const { branchId, items } = get();
        if (branchId === undefined) return;

        const existing = items.find((i) => i.variantId === item.variantId);
        let next: CartItem[];

        if (existing) {
          next = items.map((i) =>
            i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        } else {
          next = [...items, { ...item, quantity }];
        }

        saveItemsForBranch(branchId, next);
        set({ items: next });
      },

      updateQuantity: (variantId, quantity) => {
        const { branchId, items } = get();
        if (branchId === undefined) return;

        const next =
          quantity <= 0
            ? items.filter((i) => i.variantId !== variantId)
            : items.map((i) =>
                i.variantId === variantId ? { ...i, quantity } : i,
              );

        saveItemsForBranch(branchId, next);
        set({ items: next });
      },

      removeItem: (variantId) => {
        get().updateQuantity(variantId, 0);
      },

      clearCart: () => {
        const { branchId } = get();
        saveItemsForBranch(branchId, []);
        set({ items: [] });
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'storefront-cart-active',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ branchId: state.branchId }),
    },
  ),
);

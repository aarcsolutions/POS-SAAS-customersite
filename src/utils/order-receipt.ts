'use client';

import { create } from 'zustand';
import type { CartItem, OrderType } from '@/types/storefront';

export interface OrderReceipt {
  orderId: string;
  orderNumber: string;
  orderType: OrderType;
  customerName: string;
  phone: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  gst: number;
  total: number;
  promoCode?: string | null;
  placedAt: string;
}

const STORAGE_KEY = 'storefront-last-order-receipt';

function readStorage(): OrderReceipt | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OrderReceipt;
  } catch {
    return null;
  }
}

function writeStorage(receipt: OrderReceipt): void {
  if (typeof window === 'undefined') return;
  const raw = JSON.stringify(receipt);
  try {
    sessionStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // ignore
  }
}

interface ReceiptState {
  receipt: OrderReceipt | null;
  setReceipt: (receipt: OrderReceipt) => void;
  hydrate: () => OrderReceipt | null;
  clear: () => void;
}

export const useReceiptStore = create<ReceiptState>((set, get) => ({
  receipt: null,

  setReceipt: (receipt) => {
    writeStorage(receipt);
    set({ receipt });
  },

  hydrate: () => {
    const current = get().receipt;
    if (current) return current;
    const stored = readStorage();
    if (stored) set({ receipt: stored });
    return stored;
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    set({ receipt: null });
  },
}));

export function saveOrderReceipt(receipt: OrderReceipt): void {
  useReceiptStore.getState().setReceipt(receipt);
}

export function loadOrderReceipt(orderId?: string): OrderReceipt | null {
  const state = useReceiptStore.getState();
  const receipt = state.receipt ?? state.hydrate();
  if (!receipt) return null;
  if (orderId && receipt.orderId !== orderId) {
    // still return last receipt if ids mismatch after refresh with query number
    return receipt;
  }
  return receipt;
}

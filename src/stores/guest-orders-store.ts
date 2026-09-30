'use client';

import { create } from 'zustand';
import type { CartItem, OrderType, OrderTrackStatus } from '@/types/storefront';

/** Guest order snapshot — kept in memory only (clears on full page refresh). */
export interface GuestOrder {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  status: OrderTrackStatus;
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

interface GuestOrdersState {
  orders: GuestOrder[];
  addOrder: (order: GuestOrder) => void;
  clear: () => void;
}

export const useGuestOrdersStore = create<GuestOrdersState>((set, get) => ({
  orders: [],

  addOrder: (order) => {
    const existing = get().orders.filter((o) => o.id !== order.id);
    set({ orders: [order, ...existing] });
  },

  clear: () => set({ orders: [] }),
}));

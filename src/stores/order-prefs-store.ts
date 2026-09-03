'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { OrderType } from '@/types/storefront';

interface OrderPrefsState {
  orderType: OrderType;
  welcomeCompleted: boolean;
  setOrderType: (type: OrderType) => void;
  completeWelcome: () => void;
}

export const useOrderPrefsStore = create<OrderPrefsState>()(
  persist(
    (set) => ({
      orderType: 'delivery',
      welcomeCompleted: false,
      setOrderType: (orderType) => set({ orderType }),
      completeWelcome: () => set({ welcomeCompleted: true }),
    }),
    {
      name: 'storefront-order-prefs',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

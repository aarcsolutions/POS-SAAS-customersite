import { create } from 'zustand';

interface UiState {
  cartOpen: boolean;
  mobileMenuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  cartOpen: false,
  mobileMenuOpen: false,
  openCart: () => set({ cartOpen: true, mobileMenuOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () =>
    set((s) => ({
      cartOpen: !s.cartOpen,
      mobileMenuOpen: s.cartOpen ? s.mobileMenuOpen : false,
    })),
  openMobileMenu: () => set({ mobileMenuOpen: true, cartOpen: false }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  toggleMobileMenu: () =>
    set((s) => ({
      mobileMenuOpen: !s.mobileMenuOpen,
      cartOpen: s.mobileMenuOpen ? s.cartOpen : false,
    })),
}));

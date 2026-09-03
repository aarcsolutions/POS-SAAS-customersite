'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Branch } from '@/types/storefront';

const STORAGE_KEY = 'storefront-selected-branch';

interface BranchState {
  selectedBranchId: string | null;
  branches: Branch[];
  hydrated: boolean;
  setBranches: (branches: Branch[]) => void;
  selectBranch: (branchId: string | null) => void;
  clearBranch: () => void;
  setHydrated: (value: boolean) => void;
  getSelectedBranch: () => Branch | null;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      selectedBranchId: null,
      branches: [],
      hydrated: false,
      setBranches: (branches) => set({ branches }),
      selectBranch: (branchId) => set({ selectedBranchId: branchId }),
      clearBranch: () => set({ selectedBranchId: null }),
      setHydrated: (value) => set({ hydrated: value }),
      getSelectedBranch: () => {
        const { selectedBranchId, branches } = get();
        if (selectedBranchId === null) return null;
        return branches.find((b) => b.id === selectedBranchId) ?? null;
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ selectedBranchId: state.selectedBranchId }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

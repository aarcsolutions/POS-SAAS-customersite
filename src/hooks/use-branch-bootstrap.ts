'use client';



import { useEffect } from 'react';

import { storefrontApi } from '@/services/storefront';

import { useBranchStore } from '@/stores/branch-store';

import { useCartStore } from '@/stores/cart-store';



export function useBranchBootstrap() {

  const hydrated = useBranchStore((s) => s.hydrated);

  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const setBranches = useBranchStore((s) => s.setBranches);

  const selectBranch = useBranchStore((s) => s.selectBranch);

  const setBranchId = useCartStore((s) => s.setBranchId);



  useEffect(() => {

    if (!hydrated) return;



    let cancelled = false;



    storefrontApi.getBranches().then((branches) => {

      if (cancelled) return;

      setBranches(branches);



      const validSelection =

        selectedBranchId === null ||

        branches.some((b) => b.id === selectedBranchId);



      const activeBranchId = validSelection ? selectedBranchId : null;



      if (!validSelection) {

        selectBranch(null);

      }



      setBranchId(activeBranchId);

    });



    return () => {

      cancelled = true;

    };

  }, [hydrated, selectBranch, selectedBranchId, setBranchId, setBranches]);

}



export function useRequireBranch() {

  // Branch selection is handled via header dropdown — Main (null) is valid.

}


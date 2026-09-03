'use client';



import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { productMatchesBranch } from '@/constants/branch';

import { useBranchStore } from '@/stores/branch-store';

import { useCartStore } from '@/stores/cart-store';

import { useUiStore } from '@/stores/ui-store';

import type { Product } from '@/types/storefront';



export function useAddToCart() {

  const router = useRouter();

  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const addItem = useCartStore((s) => s.addItem);

  const openCart = useUiStore((s) => s.openCart);



  const addProduct = useCallback(

    (product: Product, variantId?: string) => {

      if (!productMatchesBranch(product.branchId, selectedBranchId)) {

        toast.error('This item is not available at your selected branch.');

        return false;

      }



      if (product.variants.length > 1 && !variantId) {

        router.push(`/product/${product.id}`);

        return false;

      }



      const variant = variantId

        ? product.variants.find((v) => v.id === variantId)

        : product.variants[0];



      if (!variant) return false;



      addItem(

        {

          productId: product.id,

          variantId: variant.id,

          name: product.name,

          variantName: variant.name,

          price: variant.price,

          imageUrl: product.imageUrl,

        },

        1,

      );



      toast.success(`${product.name} added to cart`);

      openCart();

      return true;

    },

    [addItem, openCart, router, selectedBranchId],

  );



  return { addProduct };

}


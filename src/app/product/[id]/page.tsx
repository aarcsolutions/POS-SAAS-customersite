'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import { ProductImageGallery } from '@/components/catalog/ProductImageGallery';
import { ProductDetailSkeleton } from '@/components/ui/LoadingSkeleton';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { productMatchesBranch } from '@/constants/branch';
import { useBranchBootstrap } from '@/hooks/use-branch-bootstrap';
import { storefrontApi } from '@/services/storefront';
import { useBranchStore } from '@/stores/branch-store';
import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import type { Product } from '@/types/storefront';
import { cn, formatRs } from '@/utils/format';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const addItem = useCartStore((s) => s.addItem);
  const setBranchId = useCartStore((s) => s.setBranchId);
  const openCart = useUiStore((s) => s.openCart);

  const [productState, setProductState] = useState<{
    productId: string | null;
    product: Product | null;
  }>({ productId: null, product: null });
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);

  useBranchBootstrap();

  useEffect(() => {
    setBranchId(selectedBranchId);
  }, [selectedBranchId, setBranchId]);

  useEffect(() => {
    let cancelled = false;

    storefrontApi.getProduct(params.id).then((data) => {
      if (cancelled) return;
      setProductState({ productId: params.id, product: data });
      if (data?.variants[0]) {
        setSelectedVariantId(data.variants[0].id);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const product =
    productState.productId === params.id ? productState.product : null;
  const loading = productState.productId !== params.id;

  const selectedVariant = product?.variants.find(
    (v) => v.id === selectedVariantId,
  );

  const galleryImages =
    product?.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : product?.imageUrl
        ? [product.imageUrl]
        : [];

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    if (!productMatchesBranch(product.branchId, selectedBranchId)) {
      toast.error('This item is not available at your selected branch.');
      return;
    }

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        name: product.name,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        imageUrl: product.imageUrl,
      },
      quantity,
    );

    toast.success(`${product.name} added to cart`);
    openCart();
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 lg:px-8">
        <EmptyState
          title="Product not found"
          description="This item may no longer be available."
          actionLabel="Back to menu"
          onAction={() => router.push('/menu')}
        />
      </div>
    );
  }

  return (
    <div className="lg:grid lg:min-h-[calc(100vh-57px)] lg:grid-cols-2">
      <div className="lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)]">
        <ProductImageGallery images={galleryImages} alt={product.name} />
      </div>

      <div className="mx-auto w-full max-w-xl px-4 py-8 lg:max-w-none lg:px-10 lg:py-12 xl:px-16">
        <h1 className="heading-display text-2xl text-brand-primary sm:text-3xl">
          {product.name}
        </h1>
        <p className="mt-3 text-brand-muted">{product.description}</p>

        <div className="mt-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-muted">
            Choose size
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                className={cn(
                  'rounded-full border px-4 py-2.5 text-sm font-medium transition',
                  selectedVariantId === variant.id
                    ? 'border-brand-accent bg-red-50 text-brand-accent ring-2 ring-red-100'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-accent',
                )}
              >
                {variant.name} · {formatRs(variant.price)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-muted">
            Quantity
          </p>
          <div className="inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-3 py-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={handleAddToCart}>
            Add to Cart · {formatRs((selectedVariant?.price ?? 0) * quantity)}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/menu')}
          >
            Back to menu
          </Button>
        </div>
      </div>
    </div>
  );
}

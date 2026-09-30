'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { Product } from '@/types/storefront';
import { useAddToCart } from '@/hooks/use-add-to-cart';
import { formatRs } from '@/utils/format';
import { resolveProductImageUrl } from '@/utils/product-image';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addProduct } = useAddToCart();
  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const imageUrl = resolveProductImageUrl(
    product.imageUrls?.[0] ?? product.imageUrl,
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addProduct(product);
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_4px_18px_rgba(0,0,0,0.1)]">
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-[4/3] w-full bg-white"
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-contain p-1.5 sm:p-3"
          sizes="(max-width: 640px) 45vw, 240px"
        />
      </Link>

      <div className="flex flex-1 flex-col px-2 pb-2.5 pt-1 sm:px-3.5 sm:pb-3.5 sm:pt-1.5">
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-[11px] font-bold uppercase leading-snug tracking-wide text-neutral-900 sm:text-sm">
            {product.name}
          </h3>
        </Link>

        {product.description ? (
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-brand-muted sm:mt-1 sm:text-xs">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:pt-3">
          <span className="text-[11px] font-bold text-neutral-900 sm:text-sm">
            {formatRs(minPrice)}
          </span>
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex w-full shrink-0 items-center justify-center gap-0.5 rounded-full bg-brand-accent px-2 py-1.5 text-[9px] font-bold uppercase tracking-wide text-white transition hover:bg-brand-accent-hover sm:w-auto sm:px-3 sm:py-2 sm:text-[10px]"
          >
            <Plus className="h-3 w-3" strokeWidth={3} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

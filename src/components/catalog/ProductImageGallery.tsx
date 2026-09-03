'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/format';
import { resolveProductImageUrl } from '@/utils/product-image';

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ProductImageGallery({
  images,
  alt,
  className,
}: ProductImageGalleryProps) {
  const galleryImages = useMemo(
    () =>
      images.length > 0
        ? images.map(resolveProductImageUrl)
        : ['https://picsum.photos/seed/product/400/300'],
    [images],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  return (
    <div className={cn('flex h-full min-h-[320px] flex-col bg-neutral-50', className)}>
      <div className="relative min-h-0 flex-1">
        <Image
          src={activeImage}
          alt={alt}
          fill
          className="object-contain p-6 sm:p-10"
          sizes="50vw"
          priority
        />
      </div>

      {galleryImages.length > 1 ? (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex gap-3 overflow-x-auto scroll-smooth">
            {galleryImages.map((image, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-neutral-50 transition sm:h-24 sm:w-24',
                    selected
                      ? 'border-brand-accent ring-2 ring-red-100'
                      : 'border-transparent hover:border-neutral-300',
                  )}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${alt} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

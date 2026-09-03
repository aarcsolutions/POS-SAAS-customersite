'use client';

import Link from 'next/link';
import Image from 'next/image';
import { mockHeroProduct } from '@/mocks/products';
import { Button } from '@/components/ui/Button';

export function HeroBanner() {
  return (
    <section className="relative min-h-[420px] overflow-hidden sm:min-h-[520px]">
      <Image
        src={mockHeroProduct.imageUrl}
        alt={mockHeroProduct.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <h1 className="heading-display text-3xl text-white sm:text-5xl">
          {mockHeroProduct.title}
        </h1>
        <p className="mt-3 text-sm font-bold uppercase tracking-widest text-white/90 sm:text-base">
          {mockHeroProduct.subtitle}
        </p>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
          {mockHeroProduct.description}
        </p>
        <Link href="/menu" className="mt-8">
          <Button variant="secondary" size="lg" className="min-w-[180px]">
            Order Now
          </Button>
        </Link>
      </div>
    </section>
  );
}

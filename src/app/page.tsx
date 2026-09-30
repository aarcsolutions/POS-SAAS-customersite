'use client';

import { ActionBar } from '@/components/home/ActionBar';
import { HeroBanner } from '@/components/home/HeroBanner';
import { HomeCatalog } from '@/components/home/HomeCatalog';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <ActionBar />
      <HomeCatalog />
    </>
  );
}

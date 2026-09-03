'use client';

import { ActionBar } from '@/components/home/ActionBar';
import { HeroBanner } from '@/components/home/HeroBanner';
import { HomeCatalog } from '@/components/home/HomeCatalog';
import { useBranchBootstrap } from '@/hooks/use-branch-bootstrap';

export default function HomePage() {
  useBranchBootstrap();

  return (
    <>
      <HeroBanner />
      <ActionBar />
      <HomeCatalog />
    </>
  );
}

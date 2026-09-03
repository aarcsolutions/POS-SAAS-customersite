'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User } from 'lucide-react';
import { toast } from 'sonner';
import { BranchDropdown } from '@/components/branch/BranchDropdown';
import { CartDrawerHost } from '@/components/cart/CartDrawer';
import { useTenant } from '@/components/providers/TenantProvider';
import { useBranchBootstrap } from '@/hooks/use-branch-bootstrap';
import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/utils/format';

const STUB_LINKS = [
  { label: 'Catering', key: 'catering' },
  { label: 'Our Values', key: 'values' },
  { label: 'Download App', key: 'app' },
] as const;

export function StoreHeader() {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useUiStore((s) => s.openCart);

  useBranchBootstrap();

  const hideNav =
    pathname.startsWith('/login') || pathname.startsWith('/signup');

  const handleStub = () => {
    toast.info('Coming soon');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primary text-lg font-bold text-white">
              {(tenant?.name ?? 'S').slice(0, 1)}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="heading-display text-xs text-brand-primary">
                {tenant?.name ?? 'Storefront'}
              </p>
            </div>
          </Link>

          {!hideNav ? (
            <nav className="hidden items-center gap-6 xl:flex">
              <Link
                href="/"
                className={cn(
                  'nav-link',
                  pathname === '/' && 'text-brand-accent',
                )}
              >
                Home
              </Link>
              <Link
                href="/#menu"
                className={cn(
                  'nav-link',
                  pathname.startsWith('/menu') && 'text-brand-accent',
                )}
              >
                Menu
              </Link>
              <Link
                href="/track-order"
                className={cn(
                  'nav-link',
                  pathname.startsWith('/track-order') && 'text-brand-accent',
                )}
              >
                Track Order
              </Link>
              {STUB_LINKS.map((link) => (
                <button
                  key={link.key}
                  type="button"
                  onClick={handleStub}
                  className="nav-link"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          ) : null}

          <div className="flex items-center gap-3 sm:gap-5">
            {!hideNav ? (
              <BranchDropdown tenantName={tenant?.name} />
            ) : null}

            <Link
              href="/login"
              className="nav-link hidden items-center gap-1.5 sm:flex"
            >
              <User className="h-4 w-4" />
              Login
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative text-brand-primary"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-accent px-1 text-[9px] font-bold text-white">
                  {itemCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {!hideNav ? (
          <nav className="flex gap-4 overflow-x-auto border-t border-neutral-100 px-4 py-2 xl:hidden">
            <Link
              href="/"
              className={cn(
                'nav-link shrink-0',
                pathname === '/' && 'text-brand-accent',
              )}
            >
              Home
            </Link>
            <Link
              href="/#menu"
              className={cn(
                'nav-link shrink-0',
                pathname.startsWith('/menu') && 'text-brand-accent',
              )}
            >
              Menu
            </Link>
            <Link
              href="/track-order"
              className={cn(
                'nav-link shrink-0',
                pathname.startsWith('/track-order') && 'text-brand-accent',
              )}
            >
              Track Order
            </Link>
            {STUB_LINKS.map((link) => (
              <button
                key={link.key}
                type="button"
                onClick={handleStub}
                className="nav-link shrink-0"
              >
                {link.label}
              </button>
            ))}
          </nav>
        ) : null}
      </header>
      <CartDrawerHost />
    </>
  );
}

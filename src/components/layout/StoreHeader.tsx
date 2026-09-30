'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, ShoppingBag, User } from 'lucide-react';
import { toast } from 'sonner';
import { BranchDropdown } from '@/components/branch/BranchDropdown';
import { CartDrawerHost } from '@/components/cart/CartDrawer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { MobileSideMenu } from '@/components/layout/MobileSideMenu';
import { useTenant } from '@/components/providers/TenantProvider';
import { useBranchBootstrap } from '@/hooks/use-branch-bootstrap';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/utils/format';

export function StoreHeader() {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const openCart = useUiStore((s) => s.openCart);
  const openMobileMenu = useUiStore((s) => s.openMobileMenu);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const customer = useAuthStore((s) => s.customer);
  const logout = useAuthStore((s) => s.logout);

  useBranchBootstrap();

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
  };

  return (
    <>
      <header className="sticky top-0 z-[60] border-b border-neutral-200 bg-white">
        {/* Mobile header */}
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 xl:hidden">
          <button
            type="button"
            onClick={openMobileMenu}
            className="rounded-lg p-2 text-brand-primary hover:bg-brand-primary-soft"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" strokeWidth={1.75} />
          </button>

          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center justify-center"
            aria-label={tenant?.name ?? 'Home'}
          >
            {tenant?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt={tenant.name ?? 'Store'}
                className="h-10 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <span className="heading-display truncate text-sm text-brand-primary">
                {tenant?.name ?? 'Storefront'}
              </span>
            )}
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <BranchDropdown tenantName={tenant?.name} />
          </div>
        </div>

        {/* Desktop header */}
        <div className="mx-auto hidden max-w-7xl items-center justify-between gap-4 px-4 py-3 xl:flex lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
            aria-label={tenant?.name ?? 'Home'}
          >
            {tenant?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenant.logoUrl}
                alt={tenant.name ?? 'Store'}
                className="h-14 w-auto max-w-[200px] object-contain"
              />
            ) : (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primary text-lg font-bold text-white">
                  {(tenant?.name ?? 'S').slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="heading-display text-xs text-brand-primary">
                    {tenant?.name ?? 'Storefront'}
                  </p>
                </div>
              </>
            )}
          </Link>

          <nav className="flex items-center gap-6">
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
            {tenant?.features?.catering ? (
              <Link
                href="/catering"
                className={cn(
                  'nav-link',
                  pathname.startsWith('/catering') && 'text-brand-accent',
                )}
              >
                Catering
              </Link>
            ) : null}
            {tenant?.features?.reservations ? (
              <Link
                href="/reserve"
                className={cn(
                  'nav-link',
                  pathname.startsWith('/reserve') && 'text-brand-accent',
                )}
              >
                Reserve
              </Link>
            ) : null}
            <Link
              href="/track-order"
              className={cn(
                'nav-link',
                pathname.startsWith('/track-order') && 'text-brand-accent',
              )}
            >
              Track Order
            </Link>
            <Link
              href="/my-orders"
              className={cn(
                'nav-link',
                pathname.startsWith('/my-orders') && 'text-brand-accent',
              )}
            >
              My Orders
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <BranchDropdown tenantName={tenant?.name} />

            {customer ? (
              <div className="flex items-center gap-3">
                <span className="max-w-[120px] truncate text-xs font-bold uppercase tracking-wide text-brand-primary">
                  {customer.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-link"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login?redirect=/account"
                className="nav-link flex items-center gap-1.5"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
            )}

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
      </header>

      <MobileSideMenu />
      <MobileBottomNav />
      <CartDrawerHost />
    </>
  );
}

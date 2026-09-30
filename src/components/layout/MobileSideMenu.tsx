'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useTenant } from '@/components/providers/TenantProvider';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/utils/format';

export function MobileSideMenu() {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const open = useUiStore((s) => s.mobileMenuOpen);
  const close = useUiStore((s) => s.closeMobileMenu);
  const customer = useAuthStore((s) => s.customer);
  const logout = useAuthStore((s) => s.logout);

  if (!open) return null;

  const links = [
    { href: '/', label: 'Home', match: (p: string) => p === '/' },
    {
      href: '/menu',
      label: 'Menu',
      match: (p: string) => p.startsWith('/menu') || p.startsWith('/product'),
    },
    ...(tenant?.features?.catering
      ? [
          {
            href: '/catering',
            label: 'Catering',
            match: (p: string) => p.startsWith('/catering'),
          },
        ]
      : []),
    ...(tenant?.features?.reservations
      ? [
          {
            href: '/reserve',
            label: 'Reserve',
            match: (p: string) => p.startsWith('/reserve'),
          },
        ]
      : []),
    {
      href: '/track-order',
      label: 'Track Order',
      match: (p: string) => p.startsWith('/track-order'),
    },
    {
      href: customer ? '/account' : '/login?redirect=/account',
      label: 'My Account',
      match: (p: string) =>
        p.startsWith('/account') || p.startsWith('/login'),
    },
    {
      href: '/my-orders',
      label: 'My Orders',
      match: (p: string) => p.startsWith('/my-orders'),
    },
  ];

  const handleLogout = () => {
    logout();
    close();
    toast.success('Logged out');
  };

  return (
    <div className="fixed inset-0 z-[60] xl:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/45"
        onClick={close}
      />
      <aside className="absolute left-0 top-0 flex h-full w-[min(100%,300px)] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4">
          <div className="min-w-0">
            <p className="heading-display truncate text-sm text-brand-primary">
              {tenant?.name ?? 'Menu'}
            </p>
            {customer ? (
              <p className="mt-0.5 truncate text-xs text-brand-muted">
                {customer.name}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className={cn(
                'block rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider transition',
                link.match(pathname)
                  ? 'bg-brand-accent-soft text-brand-accent'
                  : 'text-brand-primary hover:bg-brand-primary-soft',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-neutral-100 p-4">
          {customer ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-full border border-neutral-200 py-3 text-sm font-bold uppercase tracking-wider text-brand-primary"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login?redirect=/account"
              onClick={close}
              className="flex w-full items-center justify-center rounded-full bg-brand-accent py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-accent-hover"
            >
              Login
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}

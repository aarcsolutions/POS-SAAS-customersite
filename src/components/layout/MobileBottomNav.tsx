'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  ShoppingBag,
  UserRound,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/utils/format';

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  active: boolean;
  badge?: number;
};

export function MobileBottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const openCart = useUiStore((s) => s.openCart);
  const customer = useAuthStore((s) => s.customer);

  const accountHref = customer ? '/account' : '/login?redirect=/account';

  const items: NavItem[] = [
    {
      key: 'menu',
      label: 'Menu',
      href: '/menu',
      icon: UtensilsCrossed,
      active:
        pathname === '/' ||
        pathname.startsWith('/menu') ||
        pathname.startsWith('/product'),
    },
    {
      key: 'cart',
      label: 'Cart',
      icon: ShoppingBag,
      onClick: openCart,
      active: false,
      badge: itemCount,
    },
    {
      key: 'track',
      label: 'Track',
      href: '/track-order',
      icon: ClipboardList,
      active:
        pathname.startsWith('/track-order') || pathname.startsWith('/track'),
    },
    {
      key: 'account',
      label: 'Account',
      href: accountHref,
      icon: UserRound,
      active:
        pathname.startsWith('/account') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup'),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] xl:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const className = cn(
            'relative flex flex-col items-center justify-center gap-1 px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide transition',
            item.active ? 'text-brand-accent' : 'text-brand-primary/70',
          );

          if (item.onClick) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className={className}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-accent px-1 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </button>
            );
          }

          return (
            <Link key={item.key} href={item.href!} className={className}>
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

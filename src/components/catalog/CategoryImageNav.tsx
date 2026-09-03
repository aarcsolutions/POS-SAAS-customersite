'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { cn } from '@/utils/format';
import type { Category } from '@/types/storefront';

interface CategoryImageNavProps {
  categories: Category[];
  activeId?: string | null;
  onSelect: (category: Category) => void;
  collapsed?: boolean;
  className?: string;
}

const COLLAPSED_HEIGHT = 44;

export function CategoryImageNav({
  categories,
  activeId = null,
  onSelect,
  collapsed = false,
  className,
}: CategoryImageNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const [expandedHeight, setExpandedHeight] = useState(280);

  useEffect(() => {
    const el = expandedRef.current;
    if (!el) return;

    const measure = () => {
      setExpandedHeight(el.scrollHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [categories]);

  const scroll = (dir: 'left' | 'right') => {
    const container = collapsed ? pillsRef.current : scrollRef.current;
    container?.scrollBy({
      left: dir === 'left' ? -280 : 320,
      behavior: 'smooth',
    });
  };

  return (
    <nav
      className={cn(
        'sticky top-[57px] z-30 border-b border-neutral-200 bg-white',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto max-w-7xl px-4 transition-[padding] duration-500 ease-in-out lg:px-8',
          collapsed ? 'py-3' : 'py-5',
        )}
      >
        <div
          className="relative overflow-hidden transition-[height] duration-500 ease-in-out"
          style={{ height: collapsed ? COLLAPSED_HEIGHT : expandedHeight }}
        >
          {/* Expanded image cards */}
          <div
            ref={expandedRef}
            className={cn(
              'absolute inset-x-0 top-0 transition-all duration-500 ease-in-out',
              collapsed
                ? 'pointer-events-none -translate-y-3 opacity-0'
                : 'translate-y-0 opacity-100',
            )}
            aria-hidden={collapsed}
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => scroll('left')}
                tabIndex={collapsed ? -1 : 0}
                className={cn(
                  'absolute -left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-accent text-white shadow-md transition-all duration-300 hover:opacity-90 sm:-left-3',
                  collapsed && 'scale-75 opacity-0',
                )}
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto scroll-smooth px-8 pb-2 sm:gap-6 sm:px-10"
              >
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="w-[168px] shrink-0 sm:w-[200px] lg:w-[220px]"
                  >
                    <CategoryCard
                      category={category}
                      active={activeId === category.id}
                      onClick={() => onSelect(category)}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => scroll('right')}
                tabIndex={collapsed ? -1 : 0}
                className={cn(
                  'absolute -right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-accent text-white shadow-md transition-all duration-300 hover:opacity-90 sm:-right-3',
                  collapsed && 'scale-75 opacity-0',
                )}
                aria-label="Scroll categories right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Collapsed text pills */}
          <div
            className={cn(
              'absolute inset-x-0 top-0 transition-all duration-500 ease-in-out',
              collapsed
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-3 opacity-0',
            )}
            aria-hidden={!collapsed}
          >
            <div
              ref={pillsRef}
              className="flex h-11 items-center gap-2 overflow-x-auto scroll-smooth"
            >
              {categories.map((category) => {
                const active = activeId === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelect(category)}
                    tabIndex={collapsed ? 0 : -1}
                    className={cn(
                      'shrink-0 rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors duration-300 sm:text-xs',
                      active
                        ? 'bg-brand-accent text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
                    )}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

/** Collapses category image nav into pills as soon as the menu section sticks. */
export function useCategoryNavCollapse(enabled: boolean) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const STICKY_HEADER = 57;

    const update = () => {
      const menu = menuRef.current;
      if (!menu) return;

      const menuTop = menu.getBoundingClientRect().top;

      setCollapsed((prev) => {
        if (prev) return menuTop < STICKY_HEADER + 72;
        return menuTop <= STICKY_HEADER + 8;
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [enabled]);

  return { collapsed, menuRef };
}

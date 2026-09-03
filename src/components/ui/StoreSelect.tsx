'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/format';

export type StoreSelectOption = {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
};

interface StoreSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: StoreSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function StoreSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: StoreSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const menuHeight = Math.min(options.length * 56 + 16, 224);
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const shouldOpenUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;

      setMenuStyle({
        left: rect.left,
        width: rect.width,
        top: shouldOpenUp ? rect.top - menuHeight - 8 : rect.bottom + 8,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const menu = open && menuStyle ? (
    <ul
      ref={menuRef}
      id={listId}
      role="listbox"
      style={{
        position: 'fixed',
        top: menuStyle.top,
        left: menuStyle.left,
        width: menuStyle.width,
        zIndex: 200,
      }}
      className="max-h-56 overflow-auto rounded-xl border border-neutral-200 bg-white py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <li
            key={opt.value}
            role="option"
            aria-selected={isSelected}
            aria-disabled={opt.disabled}
            className={cn(
              'mx-1.5 flex cursor-pointer items-start justify-between gap-2 rounded-lg px-3 py-2.5 transition',
              opt.disabled
                ? 'cursor-not-allowed text-neutral-300'
                : isSelected
                  ? 'bg-red-50 font-semibold text-brand-accent'
                  : 'text-neutral-800 hover:bg-neutral-50',
            )}
            onClick={() => {
              if (!opt.disabled) pick(opt.value);
            }}
          >
            <div className="min-w-0">
              <span className="block truncate text-sm">{opt.label}</span>
              {opt.sublabel ? (
                <span className="mt-0.5 block truncate text-xs text-brand-muted">
                  {opt.sublabel}
                </span>
              ) : null}
            </div>
            {isSelected ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
            ) : null}
          </li>
        );
      })}
    </ul>
  ) : null;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          'relative flex h-12 w-full items-center rounded-xl border bg-white px-4 pr-10 text-left text-sm transition-all',
          'focus:outline-none focus:ring-2 focus:ring-brand-accent/15',
          open
            ? 'border-brand-accent ring-2 ring-brand-accent/10'
            : 'border-neutral-200 hover:border-neutral-300',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span
          className={cn(
            'block min-w-0 truncate font-medium',
            selected ? 'text-neutral-900' : 'text-brand-muted',
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 transition-transform',
            open && 'rotate-180 text-brand-accent',
          )}
        />
      </button>

      {typeof document !== 'undefined' && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}

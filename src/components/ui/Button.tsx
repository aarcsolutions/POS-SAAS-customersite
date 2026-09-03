import { cn } from '@/utils/format';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'dark' | 'gold';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-accent text-white hover:bg-[#c91530] shadow-sm disabled:opacity-50 uppercase tracking-wide font-bold',
  secondary:
    'bg-brand-primary text-white hover:bg-[#6a1a1a] disabled:opacity-50 uppercase tracking-wide font-bold',
  dark:
    'bg-brand-primary-dark text-white hover:bg-[#3a100a] disabled:opacity-50 uppercase tracking-wide font-bold',
  ghost: 'bg-transparent text-brand-primary hover:bg-red-50',
  outline:
    'border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50',
  gold:
    'bg-brand-gold text-white hover:bg-[#b08f3f] disabled:opacity-50 uppercase tracking-wide font-bold',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

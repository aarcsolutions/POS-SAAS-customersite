import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Wider card for multi-column forms */
  wide?: boolean;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: AuthLayoutProps) {
  return (
    <div
      className={`mx-auto flex min-h-[calc(100vh-8rem)] flex-col justify-center px-4 py-10 ${
        wide ? 'max-w-2xl' : 'max-w-md'
      }`}
    >
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="heading-display text-2xl text-brand-primary">{title}</h1>
          <p className="mt-2 text-sm text-brand-muted">{subtitle}</p>
        </div>
        {children}
        {footer ? <div className="mt-6 text-center text-sm">{footer}</div> : null}
      </div>
      <p className="mt-6 text-center text-sm text-brand-muted">
        <Link
          href="/menu"
          className="font-bold uppercase tracking-wide text-brand-gold hover:underline"
        >
          Continue browsing as guest
        </Link>
      </p>
    </div>
  );
}

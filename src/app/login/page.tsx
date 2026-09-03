'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Account login — available in next release');
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Sign in to your customer account (coming soon)"
      footer={
        <span className="text-brand-muted">
          No account?{' '}
          <Link href="/signup" className="font-bold uppercase tracking-wide text-brand-gold hover:underline">
            Sign up
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
            Email or phone
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-brand-accent"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
            Password
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-brand-accent"
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Login
        </Button>
        <p className="text-center text-xs text-brand-muted">
          Guest checkout is available — no account required to order.
        </p>
      </form>
    </AuthLayout>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { storefrontApi } from '@/services/storefront';
import { useAuthStore } from '@/stores/auth-store';
import {
  normalizePhone,
  validateLoginIdentifier,
} from '@/utils/auth-validation';
import { cn } from '@/utils/format';

type FieldErrors = {
  identifier?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const setCustomer = useAuthStore((s) => s.setCustomer);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const idErr = validateLoginIdentifier(identifier);
    if (idErr) next.identifier = idErr;
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const raw = identifier.trim();
      const auth = await storefrontApi.login({
        identifier: raw.includes('@') ? raw : normalizePhone(raw),
        password,
      });

      setCustomer({
        customerId: auth.customerId,
        name: auth.name,
        phone: auth.phone,
        email: auth.email,
        address: auth.address,
        city: auth.city,
        token: auth.token,
      });

      toast.success('Welcome back');
      const redirect = new URLSearchParams(window.location.search).get(
        'redirect',
      );
      router.push(
        redirect && redirect.startsWith('/') ? redirect : '/account',
      );
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Invalid phone/email or password';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Login"
      subtitle="Sign in to your customer account"
      footer={
        <span className="text-brand-muted">
          No account?{' '}
          <Link
            href="/signup"
            className="font-bold uppercase tracking-wide text-brand-gold hover:underline"
          >
            Sign up
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-normal text-neutral-600">
            Mobile number or email
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setErrors((prev) => {
                const next = { ...prev };
                delete next.identifier;
                return next;
              });
            }}
            className={cn(
              'w-full rounded-lg border px-4 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-brand-accent/10',
              errors.identifier
                ? 'border-brand-accent focus:border-brand-accent'
                : 'border-neutral-200 focus:border-brand-accent',
            )}
            placeholder="Mobile number or email"
            autoComplete="username"
          />
          {errors.identifier ? (
            <p className="mt-1 text-xs text-brand-accent">
              {errors.identifier}
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-normal text-neutral-600">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => {
                const next = { ...prev };
                delete next.password;
                return next;
              });
            }}
            className={cn(
              'w-full rounded-lg border px-4 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-brand-accent/10',
              errors.password
                ? 'border-brand-accent focus:border-brand-accent'
                : 'border-neutral-200 focus:border-brand-accent',
            )}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-brand-accent">
              {errors.password}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Login'}
        </Button>
        <p className="text-center text-xs text-brand-muted">
          Guest checkout is still available — no account required to order.
        </p>
      </form>
    </AuthLayout>
  );
}

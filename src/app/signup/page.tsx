'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { CitySelect } from '@/components/ui/CitySelect';
import { storefrontApi } from '@/services/storefront';
import { useAuthStore } from '@/stores/auth-store';
import {
  normalizePhone,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '@/utils/auth-validation';
import { cn } from '@/utils/format';

const inputClass =
  'w-full rounded-lg border px-4 py-2.5 text-sm font-normal outline-none transition focus:ring-2 focus:ring-brand-accent/10';
const labelClass =
  'mb-1.5 block text-sm font-normal text-neutral-600';

type FieldErrors = {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const setCustomer = useAuthStore((s) => s.setCustomer);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const nameErr = validateName(name);
    const phoneErr = validatePhone(phone);
    const emailErr = validateEmail(email, false);
    const passwordErr = validatePassword(password);

    if (nameErr) next.name = nameErr;
    if (phoneErr) next.phone = phoneErr;
    if (emailErr) next.email = emailErr;
    if (passwordErr) next.password = passwordErr;

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
      const auth = await storefrontApi.signup({
        name: name.trim(),
        phone: normalizePhone(phone),
        email: email.trim() || undefined,
        password,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
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

      toast.success('Account created successfully');
      router.push('/account');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Could not create account. Please try again.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Save your details for faster delivery checkout"
      wide
      footer={
        <span className="text-brand-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold uppercase tracking-wide text-brand-gold hover:underline"
          >
            Login
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError('name');
              }}
              onBlur={() => {
                const err = validateName(name);
                setErrors((prev) =>
                  err ? { ...prev, name: err } : (() => {
                    const next = { ...prev };
                    delete next.name;
                    return next;
                  })(),
                );
              }}
              className={cn(
                inputClass,
                errors.name
                  ? 'border-brand-accent focus:border-brand-accent'
                  : 'border-neutral-200 focus:border-brand-accent',
              )}
              placeholder="Your name"
              autoComplete="name"
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-brand-accent">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label className={labelClass}>Mobile number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                clearFieldError('phone');
              }}
              onBlur={() => {
                const err = validatePhone(phone);
                setErrors((prev) =>
                  err ? { ...prev, phone: err } : (() => {
                    const next = { ...prev };
                    delete next.phone;
                    return next;
                  })(),
                );
              }}
              className={cn(
                inputClass,
                errors.phone
                  ? 'border-brand-accent focus:border-brand-accent'
                  : 'border-neutral-200 focus:border-brand-accent',
              )}
              placeholder="Your mobile number"
              autoComplete="tel"
              inputMode="tel"
            />
            {errors.phone ? (
              <p className="mt-1 text-xs text-brand-accent">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <div>
            <label className={labelClass}>Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError('email');
              }}
              onBlur={() => {
                const err = validateEmail(email, false);
                setErrors((prev) =>
                  err ? { ...prev, email: err } : (() => {
                    const next = { ...prev };
                    delete next.email;
                    return next;
                  })(),
                );
              }}
              className={cn(
                inputClass,
                errors.email
                  ? 'border-brand-accent focus:border-brand-accent'
                  : 'border-neutral-200 focus:border-brand-accent',
              )}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-brand-accent">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError('password');
              }}
              onBlur={() => {
                const err = validatePassword(password);
                setErrors((prev) =>
                  err ? { ...prev, password: err } : (() => {
                    const next = { ...prev };
                    delete next.password;
                    return next;
                  })(),
                );
              }}
              className={cn(
                inputClass,
                errors.password
                  ? 'border-brand-accent focus:border-brand-accent'
                  : 'border-neutral-200 focus:border-brand-accent',
              )}
              placeholder="Min 6 chars, letter + number"
              autoComplete="new-password"
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-brand-accent">
                {errors.password}
              </p>
            ) : (
              <p className="mt-1 text-xs text-neutral-400">
                Letter + number required
              </p>
            )}
          </div>

          <div className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
            <label className={labelClass}>City</label>
            <CitySelect
              value={city}
              onChange={setCity}
              placeholder="Select city"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Delivery address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className={cn(
                inputClass,
                'border-neutral-200 focus:border-brand-accent',
              )}
              placeholder="Street, building, landmark"
              autoComplete="street-address"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
    </AuthLayout>
  );
}

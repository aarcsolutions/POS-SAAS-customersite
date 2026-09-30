'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardList, Loader2, LogOut, MapPin, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { storefrontApi } from '@/services/storefront';
import { useAuthStore } from '@/stores/auth-store';
import { validateEmail, validateName } from '@/utils/auth-validation';
import { toast } from 'sonner';

type FieldErrors = {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
};

export default function AccountPage() {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const customer = useAuthStore((s) => s.customer);
  const setCustomer = useAuthStore((s) => s.setCustomer);
  const logout = useAuthStore((s) => s.logout);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!customer) {
      router.replace('/login?redirect=/account');
      return;
    }
    setName(customer.name || '');
    setEmail(customer.email || '');
    setAddress(customer.address || '');
    setCity(customer.city || '');
  }, [hydrated, customer, router]);

  if (!hydrated || !customer) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-brand-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const nameErr = validateName(name);
    if (nameErr) next.name = nameErr;
    const emailErr = validateEmail(email, false);
    if (emailErr) next.email = emailErr;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const auth = await storefrontApi.updateProfile({
        customerId: customer.customerId,
        name,
        email: email.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
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
      setEditingAddress(false);
      toast.success('Profile updated');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Could not update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/login');
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8 lg:px-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
          <UserRound className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="heading-display text-xl text-brand-primary">
            My Account
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            Manage your details and delivery address
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
          />
          {errors.name ? (
            <p className="mt-1 text-xs text-brand-accent">{errors.name}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
            Phone
          </label>
          <input
            type="text"
            value={customer.phone}
            disabled
            className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm text-brand-muted"
          />
          <p className="mt-1 text-[11px] text-brand-muted">
            Phone number cannot be changed
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
            placeholder="Optional"
          />
          {errors.email ? (
            <p className="mt-1 text-xs text-brand-accent">{errors.email}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-accent" />
              <p className="text-xs font-bold uppercase tracking-wide text-brand-primary">
                Delivery address
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditingAddress((v) => !v)}
              className="text-xs font-bold uppercase tracking-wide text-brand-accent"
            >
              {editingAddress ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingAddress ? (
            <div className="space-y-3">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="Street, area, landmark"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
              />
            </div>
          ) : (
            <div className="text-sm text-neutral-700">
              {address || city ? (
                <>
                  <p>{address || '—'}</p>
                  {city ? (
                    <p className="mt-1 text-brand-muted">{city}</p>
                  ) : null}
                </>
              ) : (
                <p className="text-brand-muted">No address saved yet</p>
              )}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save changes
        </Button>
      </form>

      <div className="mt-4 space-y-3">
        <Link
          href="/my-orders"
          className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-primary shadow-sm"
        >
          <ClipboardList className="h-5 w-5 text-brand-accent" />
          My Orders
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-primary shadow-sm"
        >
          <LogOut className="h-5 w-5 text-brand-accent" />
          Logout
        </button>
      </div>
    </div>
  );
}

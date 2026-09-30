'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useBranchBootstrap } from '@/hooks/use-branch-bootstrap';
import { storefrontApi } from '@/services/storefront';
import { useAuthStore } from '@/stores/auth-store';
import { useBranchStore } from '@/stores/branch-store';
import {
  normalizePhone,
  validateName,
  validatePhone,
  validateEmail,
} from '@/utils/auth-validation';
import { notifyError, notifySuccess } from '@/utils/notify';
import { useTenant } from '@/components/providers/TenantProvider';

type FieldErrors = {
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  date?: string;
  time?: string;
  partySize?: string;
  branch?: string;
};

function toLocalDateValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toLocalTimeValue(d: Date) {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export default function ReservePage() {
  const router = useRouter();
  useBranchBootstrap();
  const { tenant, loading: tenantLoading } = useTenant();

  const customer = useAuthStore((s) => s.customer);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const branches = useBranchStore((s) => s.branches);
  const selectBranch = useBranchStore((s) => s.selectBranch);
  const getSelectedBranch = useBranchStore((s) => s.getSelectedBranch);

  const soon = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 90);
    d.setSeconds(0, 0);
    return d;
  }, []);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [date, setDate] = useState(toLocalDateValue(soon));
  const [time, setTime] = useState(toLocalTimeValue(soon));
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (tenantLoading) return;
    if (!tenant?.features?.reservations) {
      router.replace('/');
    }
  }, [tenantLoading, tenant?.features?.reservations, router]);

  useEffect(() => {
    if (!customer) return;
    setGuestName((prev) => prev || customer.name || '');
    setGuestPhone((prev) => prev || customer.phone || '');
    setGuestEmail((prev) => prev || customer.email || '');
  }, [customer]);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const nameErr = validateName(guestName);
    if (nameErr) next.guestName = nameErr;
    const phoneErr = validatePhone(guestPhone);
    if (phoneErr) next.guestPhone = phoneErr;
    const emailErr = validateEmail(guestEmail, false);
    if (emailErr) next.guestEmail = emailErr;
    if (!date) next.date = 'Date is required';
    if (!time) next.time = 'Time is required';
    if (!selectedBranchId) {
      next.branch = 'Please select a branch from the header first';
    }
    if (!Number.isFinite(partySize) || partySize < 1) {
      next.partySize = 'Guests must be at least 1';
    }
    if (date && time) {
      const reservedAt = new Date(`${date}T${time}`);
      if (Number.isNaN(reservedAt.getTime())) {
        next.time = 'Invalid date or time';
      } else if (reservedAt.getTime() < Date.now() - 60_000) {
        next.time = 'Please choose a future date and time';
      }
    }
    return next;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    const first = Object.values(next)[0];
    if (first) {
      notifyError('Please fix the highlighted fields', first);
      return;
    }
    if (!selectedBranchId) return;

    setSubmitting(true);
    try {
      const reservedAt = new Date(`${date}T${time}`).toISOString();
      await storefrontApi.reserve({
        branchId: selectedBranchId,
        guestName: guestName.trim(),
        guestPhone: normalizePhone(guestPhone),
        guestEmail: guestEmail.trim() || undefined,
        partySize,
        reservedAt,
        notes: notes.trim() || undefined,
      });
      notifySuccess(
        'Reservation requested',
        'We received your request. The restaurant will confirm shortly.',
      );
      router.push('/');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Could not submit reservation. Please try again.';
      notifyError('Reservation failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBranch = getSelectedBranch();
  const minDate = toLocalDateValue(new Date());

  if (tenantLoading || !tenant?.features?.reservations) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-neutral-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-neutral-200 bg-white px-4 py-3 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="bg-brand-primary-dark px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-brand-gold" />
          <h1 className="heading-display text-2xl text-white sm:text-3xl">
            Reserve a Table
          </h1>
          <p className="mt-2 text-sm text-white/75">
            Send a request — staff will confirm in the Admin portal
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 py-8 lg:px-8">
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
              Branch
            </label>
            {branches.length > 0 ? (
              <select
                value={selectedBranchId ?? ''}
                onChange={(e) =>
                  selectBranch(e.target.value ? e.target.value : null)
                }
                className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
              >
                <option value="">Select a branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="rounded-xl bg-neutral-50 px-3 py-3 text-sm text-brand-muted">
                {selectedBranch
                  ? selectedBranch.name
                  : 'No branches loaded — use the header branch picker.'}
              </p>
            )}
            {errors.branch ? (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {errors.branch}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
              Your name
            </label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
              placeholder="Full name"
            />
            {errors.guestName ? (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {errors.guestName}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
              Mobile number
            </label>
            <input
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
              placeholder="03xx xxxxxxx"
            />
            {errors.guestPhone ? (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {errors.guestPhone}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
              Email (optional)
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
              placeholder="For confirmation updates"
            />
            {errors.guestEmail ? (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {errors.guestEmail}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
                Date
              </label>
              <input
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
              />
              {errors.date ? (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  {errors.date}
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
              />
              {errors.time ? (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  {errors.time}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
              Guests
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value) || 1)}
              className="h-11 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
            />
            {errors.partySize ? (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {errors.partySize}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
              placeholder="Occasion, seating preference…"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Request reservation'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

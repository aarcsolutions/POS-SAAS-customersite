'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';

const inputClass =
  'w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-brand-accent';
const labelClass =
  'mb-1.5 block text-xs font-bold uppercase tracking-wide text-brand-muted';

export default function SignupPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Account registration — available in next release');
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register for faster checkout (coming soon)"
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Full name</label>
          <input type="text" className={inputClass} placeholder="Your name" />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" className={inputClass} placeholder="03xx xxxxxxx" />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" className={inputClass} placeholder="you@example.com" />
        </div>
        <div>
          <label className={labelClass}>Password</label>
          <input type="password" className={inputClass} placeholder="Create a password" />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Sign up
        </Button>
      </form>
    </AuthLayout>
  );
}

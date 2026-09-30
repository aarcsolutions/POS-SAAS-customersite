'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useTenant } from '@/components/providers/TenantProvider';

export function HeroBanner() {
  const { tenant, loading } = useTenant();
  const name =
    tenant?.heroTitle?.trim() || tenant?.name?.trim() || 'Order Online';
  const tagline =
    tenant?.tagline?.trim() || 'Fresh food, ready when you are';
  const eyebrow = tenant?.heroEyebrow?.trim() || 'Order Online';
  const cta = tenant?.heroCtaLabel?.trim() || 'Order Now';
  const initial = name.slice(0, 1).toUpperCase() || 'S';
  const heroImage = tenant?.heroImageUrl;
  const heroVideo = tenant?.heroVideoUrl;
  const hasMedia = !!(heroVideo || heroImage);

  return (
    <section className="relative min-h-[420px] overflow-hidden bg-gradient-to-br from-brand-primary-dark via-brand-primary-dark to-brand-primary sm:min-h-[520px]">
      {heroVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          poster={heroImage || undefined}
        />
      ) : heroImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(201,21,48,0.4), transparent 40%)',
          }}
        />
      )}

      {hasMedia ? (
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/60" />
      ) : null}

      <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        {tenant?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tenant.logoUrl}
            alt={name}
            className="mb-6 h-20 w-20 rounded-full border-2 border-brand-gold/60 bg-white/95 object-contain p-2"
          />
        ) : (
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-brand-gold/60 bg-white/10 text-3xl font-bold text-brand-gold backdrop-blur-sm">
            {loading ? '…' : initial}
          </div>
        )}
        <h1 className="heading-display text-3xl text-white sm:text-5xl">
          {name}
        </h1>
        <p className="mt-3 text-sm font-bold uppercase tracking-widest text-brand-gold sm:text-base">
          {eyebrow}
        </p>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
          {tagline}
        </p>
        <Link href="/menu" className="mt-8">
          <Button variant="secondary" size="lg" className="min-w-[180px]">
            {cta}
          </Button>
        </Link>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { CartLineItems } from '@/components/cart/CartLineItems';
import { Button } from '@/components/ui/Button';
import { CitySelect } from '@/components/ui/CitySelect';
import { storefrontApi } from '@/services/storefront';
import { useBranchStore } from '@/stores/branch-store';
import { useCartStore } from '@/stores/cart-store';
import type { OrderType } from '@/types/storefront';
import { useOrderPrefsStore } from '@/stores/order-prefs-store';
import { calcOrderTotals, formatRs } from '@/utils/format';
import { saveOrderReceipt } from '@/utils/order-receipt';
import { useGuestOrdersStore } from '@/stores/guest-orders-store';
import { useAuthStore } from '@/stores/auth-store';

interface FormErrors {
  customerName?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const addGuestOrder = useGuestOrdersStore((s) => s.addOrder);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const customer = useAuthStore((s) => s.customer);
  const isLoggedIn = !!customer;

  const defaultOrderType = useOrderPrefsStore((s) => s.orderType);
  const [orderType, setOrderType] = useState<OrderType>(defaultOrderType);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [prefilled, setPrefilled] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const totals = calcOrderTotals(
    subtotal,
    orderType === 'delivery',
    appliedPromo?.discount ?? 0,
  );

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (prefilled || !customer) return;
    setCustomerName(customer.name || '');
    setPhone(customer.phone || '');
    setAddress(customer.address || '');
    setCity(customer.city || '');
    setPrefilled(true);
  }, [customer, prefilled]);

  useEffect(() => {
    if (appliedPromo) {
      setAppliedPromo(null);
      setPromoError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset coupon when cart total changes
  }, [subtotal]);

  const handlePromoCodeChange = (value: string) => {
    setPromoCode(value);
    if (appliedPromo || promoError) {
      setAppliedPromo(null);
      setPromoError(null);
    }
  };

  const handleApplyCoupon = async () => {
    const code = promoCode.trim();
    if (!code) return;

    setPromoLoading(true);
    setPromoError(null);
    setAppliedPromo(null);

    try {
      const result = await storefrontApi.validatePromo(
        code,
        subtotal,
        selectedBranchId,
      );

      if (!result.valid) {
        setPromoError(result.message);
        return;
      }

      setAppliedPromo({
        code: result.code ?? code.toUpperCase(),
        discount: result.discount ?? 0,
      });
      setPromoCode(result.code ?? code.toUpperCase());
    } catch {
      setPromoError('Could not validate coupon. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!customerName.trim()) next.customerName = 'Name is required';
    if (!phone.trim()) next.phone = 'Phone is required';
    if (orderType === 'delivery') {
      if (!address.trim()) next.address = 'Address is required for delivery';
      if (!city.trim()) next.city = 'City is required for delivery';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const order = await storefrontApi.checkout({
        branchId: selectedBranchId,
        orderType,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: orderType === 'delivery' ? address.trim() : undefined,
        city: orderType === 'delivery' ? city.trim() : undefined,
        promoCode: appliedPromo?.code || promoCode.trim() || undefined,
        items,
      });

      const orderId = order.id;
      const orderNumber =
        order.orderNumber ||
        (order as { order_number?: string }).order_number ||
        '';

      if (!orderId || !orderNumber) {
        toast.error('Order placed but confirmation details are missing.');
        return;
      }

      // Snapshot cart BEFORE clear — used by receipt page
      saveOrderReceipt({
        orderId,
        orderNumber,
        orderType,
        customerName: customerName.trim(),
        phone: phone.trim(),
        items: items.map((item) => ({ ...item })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        deliveryFee: totals.deliveryFee,
        gst: totals.gst,
        total: totals.total,
        promoCode: appliedPromo?.code ?? null,
        placedAt: new Date().toISOString(),
      });

      // Guest (no account): keep order in memory until page refresh
      if (!isLoggedIn) {
        addGuestOrder({
          id: orderId,
          orderNumber,
          orderType,
          status: 'pending',
          customerName: customerName.trim(),
          phone: phone.trim(),
          items: items.map((item) => ({ ...item })),
          subtotal: totals.subtotal,
          discount: totals.discount,
          deliveryFee: totals.deliveryFee,
          gst: totals.gst,
          total: totals.total,
          promoCode: appliedPromo?.code ?? null,
          placedAt: new Date().toISOString(),
        });
      }

      // Go to receipt first, then clear cart (avoids checkout empty-cart redirect race)
      router.replace(
        `/order/${orderId}?number=${encodeURIComponent(orderNumber)}`,
      );
      clearCart();
    } catch {
      toast.error('Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-5 py-4">
              <h2 className="heading-display text-sm text-neutral-900">
                Order Summary
              </h2>
            </div>
            <div className="px-5">
              <CartLineItems readOnly compact />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="mb-4 flex gap-2">
              {(['takeaway', 'delivery'] as OrderType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                    orderType === type
                      ? 'bg-brand-accent text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <h2 className="heading-display mb-4 text-sm text-neutral-900">
              Delivery Details
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-brand-muted">
                  Full Name
                </label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-brand-accent"
                  placeholder="Your name"
                />
                {errors.customerName ? (
                  <p className="mt-1 text-xs text-brand-accent">
                    {errors.customerName}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-brand-muted">
                  Phone Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-brand-accent"
                  placeholder="03xx xxxxxxx"
                />
                {errors.phone ? (
                  <p className="mt-1 text-xs text-brand-accent">{errors.phone}</p>
                ) : null}
              </div>
              {orderType === 'delivery' ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-brand-muted">
                      City
                    </label>
                    <CitySelect
                      value={city}
                      onChange={setCity}
                      placeholder="Select city"
                    />
                    {errors.city ? (
                      <p className="mt-1 text-xs text-brand-accent">{errors.city}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-brand-muted">
                      Full Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-brand-accent"
                      placeholder="Street, building, landmark"
                    />
                    {errors.address ? (
                      <p className="mt-1 text-xs text-brand-accent">
                        {errors.address}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="heading-display mb-4 text-sm text-neutral-900">
              Payment Method
            </h2>
            <div className="flex items-center gap-3 rounded-xl border-2 border-brand-accent bg-brand-accent-soft p-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-4 border-brand-accent bg-white">
                <div className="h-2 w-2 rounded-full bg-brand-accent" />
              </div>
              <Banknote className="h-5 w-5 text-brand-primary" />
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  Cash on Delivery
                </p>
                <p className="text-xs text-brand-muted">Pay when you receive</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="heading-display mb-3 text-sm text-neutral-900">
              Have a Coupon?
            </h2>
            <div className="flex gap-2">
              <input
                value={promoCode}
                onChange={(e) => handlePromoCodeChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleApplyCoupon();
                  }
                }}
                className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm uppercase outline-none focus:border-brand-accent"
                placeholder="Enter code"
              />
              <Button
                type="button"
                variant="dark"
                size="sm"
                onClick={() => void handleApplyCoupon()}
                disabled={promoLoading || !promoCode.trim()}
              >
                {promoLoading ? 'Checking…' : 'Apply'}
              </Button>
            </div>
            {promoError ? (
              <p className="mt-2 text-xs font-semibold text-brand-accent">
                {promoError}
              </p>
            ) : null}
            {appliedPromo ? (
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                Coupon applied — you save {formatRs(appliedPromo.discount)}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-muted">Subtotal</span>
                <span>{formatRs(totals.subtotal)}</span>
              </div>
              {orderType === 'delivery' ? (
                <div className="flex justify-between">
                  <span className="text-brand-muted">Delivery Fee</span>
                  <span>{formatRs(totals.deliveryFee)}</span>
                </div>
              ) : null}
              {appliedPromo ? (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-{formatRs(appliedPromo.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-brand-muted">GST (16%)</span>
                <span>{formatRs(totals.gst)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-3">
                <span className="heading-display text-sm">Total</span>
                <span className="text-xl font-bold text-brand-accent">
                  {formatRs(totals.total)}
                </span>
              </div>
            </div>
            <Button
              type="submit"
              className="mt-5 w-full"
              size="lg"
              disabled={submitting}
            >
              {submitting ? 'Placing order…' : 'Place Order >'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

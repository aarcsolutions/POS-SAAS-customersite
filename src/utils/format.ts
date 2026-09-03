export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRs(amount: number): string {
  return `RS ${amount.toLocaleString('en-PK')}`;
}

export const DELIVERY_FEE = 150;
export const GST_RATE = 0.16;

export function calcOrderTotals(
  subtotal: number,
  isDelivery: boolean,
  discount = 0,
) {
  const deliveryFee = isDelivery ? DELIVERY_FEE : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const gst = Math.round((discountedSubtotal + deliveryFee) * GST_RATE);
  const total = discountedSubtotal + deliveryFee + gst;
  return { subtotal, discount, deliveryFee, gst, total };
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

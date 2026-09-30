'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/format';

interface Props {
  open: boolean;
  orderLabel: string;
  customerName?: string | null;
  saving?: boolean;
  showSkip?: boolean;
  onClose: () => void;
  onSkip?: () => void;
  onSubmit: (data: { rating: number; comment: string }) => Promise<void> | void;
}

export default function OrderReviewModal({
  open,
  orderLabel,
  customerName,
  saving = false,
  showSkip = false,
  onClose,
  onSkip,
  onSubmit,
}: Props) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a rating');
      return;
    }
    setError('');
    await onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-brand-muted transition hover:bg-neutral-100 hover:text-neutral-800"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-neutral-100 px-5 pb-4 pt-5 pr-12">
          <h2 className="heading-display text-xl text-brand-primary-dark">
            Rate your order
          </h2>
          <p className="mt-1 text-sm font-semibold text-brand-accent">
            {customerName?.trim()
              ? `Thanks for ordering, ${customerName.trim()}!`
              : 'Thanks for ordering!'}
          </p>
          <p className="mt-1 text-xs text-brand-muted">{orderLabel}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-muted">
              Rating
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => {
                const active = value <= (hover || rating);
                return (
                  <button
                    key={value}
                    type="button"
                    onMouseEnter={() => setHover(value)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(value)}
                    className="rounded-lg p-1 transition hover:scale-110"
                    aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  >
                    <Star
                      className={cn(
                        'h-8 w-8',
                        active
                          ? 'fill-brand-accent text-brand-accent'
                          : 'text-neutral-300',
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-brand-muted">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell us how we did…"
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15"
            />
          </div>

          {error ? (
            <p className="text-xs text-rose-600">{error}</p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {showSkip ? (
              <button
                type="button"
                onClick={onSkip ?? onClose}
                disabled={saving}
                className="order-2 h-11 rounded-full px-4 text-xs font-bold uppercase tracking-wide text-brand-muted transition hover:text-brand-primary sm:order-1"
              >
                Skip for now
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="order-2 h-11 rounded-full border border-neutral-200 px-5 text-xs font-bold uppercase tracking-wide text-neutral-700 transition hover:bg-neutral-50 sm:order-1"
              >
                Cancel
              </button>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="order-1 h-11 min-w-[140px] sm:order-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

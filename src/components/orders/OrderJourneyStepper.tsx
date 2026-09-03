'use client';

import { Check } from 'lucide-react';
import type { OrderTrackStatus } from '@/types/storefront';
import { cn } from '@/utils/format';

type JourneyStep = {
  key: OrderTrackStatus;
  label: string;
};

const DELIVERY_STEPS: JourneyStep[] = [
  { key: 'pending', label: 'Placed' },
  { key: 'accepted', label: 'Confirmed' },
  { key: 'in_kitchen', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'out_for_delivery', label: 'On the Way' },
  { key: 'completed', label: 'Delivered' },
];

const TAKEAWAY_STEPS: JourneyStep[] = [
  { key: 'pending', label: 'Placed' },
  { key: 'accepted', label: 'Confirmed' },
  { key: 'in_kitchen', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Collected' },
];

function getSteps(orderType: string): JourneyStep[] {
  return orderType === 'delivery' ? DELIVERY_STEPS : TAKEAWAY_STEPS;
}

function getActiveIndex(steps: JourneyStep[], status: OrderTrackStatus): number {
  if (status === 'completed') return steps.length;
  if (status === 'cancelled') {
    const idx = steps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  }
  const idx = steps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

interface OrderJourneyStepperProps {
  status: OrderTrackStatus;
  orderType: string;
}

export function OrderJourneyStepper({
  status,
  orderType,
}: OrderJourneyStepperProps) {
  const steps = getSteps(orderType);
  const activeIndex = getActiveIndex(steps, status);
  const isCancelled = status === 'cancelled';
  const isComplete = status === 'completed';

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex min-w-[520px] items-start px-1">
        {steps.map((step, index) => {
          const isPast = !isCancelled && (isComplete || index < activeIndex);
          const isCurrent =
            !isCancelled && !isComplete && index === activeIndex;
          const isUpcoming =
            !isCancelled && !isComplete && index > activeIndex;

          const lineCompleted = isPast || (isComplete && index < steps.length - 1);
          const lineActive =
            !isCancelled &&
            !isComplete &&
            index === activeIndex &&
            index < steps.length - 1;

          return (
            <div
              key={step.key}
              className={cn(
                'flex flex-1 items-start',
                index < steps.length - 1 ? 'min-w-0' : 'shrink-0',
              )}
            >
              <div className="flex w-full min-w-0 flex-col items-center">
                <div
                  className={cn(
                    'relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all',
                    isPast &&
                      'border-brand-accent bg-brand-accent text-white shadow-sm shadow-red-200/60',
                    isCurrent &&
                      'border-brand-accent bg-white text-brand-accent ring-4 ring-brand-accent/15',
                    isUpcoming && 'border-neutral-200 bg-white text-neutral-300',
                    isCancelled &&
                      index === 0 &&
                      'border-rose-400 bg-rose-50 text-rose-500',
                    isCancelled &&
                      index > 0 &&
                      'border-neutral-200 bg-neutral-50 text-neutral-300',
                  )}
                >
                  {isPast ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <span
                      className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        isPast || isCurrent
                          ? 'bg-brand-accent'
                          : 'bg-neutral-200',
                        isCurrent && 'animate-pulse',
                      )}
                    />
                  )}
                  {isCurrent ? (
                    <span className="absolute inset-0 animate-ping rounded-full border border-brand-accent/40" />
                  ) : null}
                </div>

                <p
                  className={cn(
                    'mt-2 max-w-[4.5rem] text-center text-[10px] font-bold uppercase leading-tight tracking-wide sm:max-w-none sm:text-xs',
                    (isPast || isCurrent) && 'text-brand-accent',
                    isUpcoming && 'text-neutral-400',
                    isCancelled && 'text-neutral-400',
                    isComplete && 'text-brand-accent',
                  )}
                >
                  {step.label}
                </p>
              </div>

              {index < steps.length - 1 ? (
                <div className="mt-[1.125rem] flex h-1 min-w-[1.5rem] flex-1 items-center px-0.5">
                  <div
                    className={cn(
                      'h-1 w-full rounded-full',
                      lineCompleted && 'bg-brand-accent',
                      lineActive && 'journey-line-active',
                      !lineCompleted && !lineActive && 'bg-neutral-200',
                    )}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

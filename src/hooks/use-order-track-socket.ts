'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { OrderTrackResult, OrderTrackStatus } from '@/types/storefront';
import { getApiBaseUrl, getTenantDomain } from '@/utils/env';

type TrackJoin =
  | { mode: 'token'; tenantSlug: string; token: string }
  | { mode: 'number'; orderNumber: string };

type OrderSocketPayload = {
  order?: Record<string, unknown>;
};

function mapSocketOrder(raw: Record<string, unknown>): Partial<OrderTrackResult> {
  const status = (raw.status as OrderTrackStatus) || undefined;
  const driverRaw = raw.driver as OrderTrackResult['driver'] | undefined;

  return {
    orderNumber:
      (raw.orderNumber as string) ||
      (raw.order_number as string) ||
      undefined,
    status,
    orderType:
      (raw.orderType as string) ||
      (raw.order_type as string) ||
      undefined,
    deliveryAddress:
      (raw.deliveryAddress as string | null | undefined) ??
      (raw.delivery_address as string | null | undefined),
    deliveryCity:
      (raw.deliveryCity as string | null | undefined) ??
      (raw.delivery_city as string | null | undefined),
    deliveryPhone:
      (raw.deliveryPhone as string | null | undefined) ??
      (raw.delivery_phone as string | null | undefined),
    paymentMethod:
      (raw.paymentMethod as string | null | undefined) ??
      (raw.payment_method as string | null | undefined),
    paymentStatus:
      (raw.paymentStatus as string | undefined) ??
      (raw.payment_status as string | undefined),
    driver: driverRaw ?? null,
    createdAt:
      (raw.createdAt as string | undefined) ??
      (raw.created_at as string | undefined),
  };
}

/**
 * Live order status over gateway /realtime (guest track:join).
 * No interval polling — reconnect re-joins and optionally refreshes via onReconnectRefresh.
 */
export function useOrderTrackSocket(options: {
  enabled: boolean;
  join: TrackJoin | null;
  onUpdate: (partial: Partial<OrderTrackResult>) => void;
  onReconnectRefresh?: () => void;
}) {
  const { enabled, join, onUpdate, onReconnectRefresh } = options;
  const onUpdateRef = useRef(onUpdate);
  const onRefreshRef = useRef(onReconnectRefresh);
  onUpdateRef.current = onUpdate;
  onRefreshRef.current = onReconnectRefresh;

  useEffect(() => {
    if (!enabled || !join) return;

    const socket: Socket = io(`${getApiBaseUrl()}/realtime`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelayMax: 10_000,
    });

    const emitJoin = () => {
      if (join.mode === 'token') {
        socket.emit('track:join', {
          mode: 'token',
          tenantSlug: join.tenantSlug,
          token: join.token,
        });
      } else {
        socket.emit('track:join', {
          mode: 'number',
          domain: getTenantDomain(),
          orderNumber: join.orderNumber,
        });
      }
    };

    const handleOrderEvent = (payload: OrderSocketPayload) => {
      if (!payload?.order || typeof payload.order !== 'object') return;
      onUpdateRef.current(mapSocketOrder(payload.order));
    };

    socket.on('connect', () => {
      emitJoin();
    });

    socket.on('reconnect', () => {
      emitJoin();
      onRefreshRef.current?.();
    });

    socket.on('track:joined', (payload: { order?: Record<string, unknown> }) => {
      if (payload?.order) {
        onUpdateRef.current(mapSocketOrder(payload.order));
      }
    });

    socket.on('order:updated', handleOrderEvent);
    socket.on('order:created', handleOrderEvent);

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [
    enabled,
    join?.mode === 'token'
      ? `token:${join.tenantSlug}:${join.token}`
      : join?.mode === 'number'
        ? `number:${join.orderNumber}`
        : 'off',
  ]);
}

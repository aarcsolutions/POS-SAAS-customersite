'use client';

import { toast } from 'sonner';

export function notifySuccess(title: string, description?: string) {
  toast.success(title, { description });
}

export function notifyError(title: string, description?: string) {
  toast.error(title, { description });
}

export function notifyInfo(title: string, description?: string) {
  toast.info(title, { description });
}

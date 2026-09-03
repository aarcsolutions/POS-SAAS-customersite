import axios from 'axios';
import { getApiBaseUrl, getTenantDomain } from '@/utils/env';

export interface ApiEnvelope<T> {
  statusCode?: number;
  status: boolean;
  message: string;
  data: T;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.headers.domain = getTenantDomain();
  return config;
});

export function unwrapApiData<T>(payload: ApiEnvelope<T>): T {
  if (payload?.status === false) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
}

export default api;

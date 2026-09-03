export function getAppPort(): string {
  return process.env.NEXT_PUBLIC_APP_PORT || process.env.PORT || '3021';
}

export function getTenantHost(): string {
  return process.env.NEXT_PUBLIC_TENANT_HOST || 'localhost';
}

export function getTenantDomain(): string {
  const override = process.env.NEXT_PUBLIC_TENANT_DOMAIN?.trim();
  if (override) {
    return override.toLowerCase();
  }

  if (typeof window !== 'undefined' && window.location?.host) {
    return window.location.host.toLowerCase();
  }

  return `${getTenantHost()}:${getAppPort()}`;
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
}

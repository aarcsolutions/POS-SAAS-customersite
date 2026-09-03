import type { NextConfig } from "next";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocalValue(key: string): string | undefined {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return undefined;

  const prefix = `${key}=`;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (trimmed.startsWith(prefix)) {
      const value = trimmed.slice(prefix.length).trim();
      return value || undefined;
    }
  }

  return undefined;
}

function loadEnvLocalPort(): string {
  return (
    loadEnvLocalValue("PORT") ||
    process.env.PORT ||
    "3021"
  );
}

const tenantHost = process.env.NEXT_PUBLIC_TENANT_HOST || "localhost";
const port = loadEnvLocalPort();
const tenantDomain =
  process.env.NEXT_PUBLIC_TENANT_DOMAIN?.trim() ||
  loadEnvLocalValue("NEXT_PUBLIC_TENANT_DOMAIN") ||
  `${tenantHost}:${port}`;

const filePublicBaseUrl =
  process.env.NEXT_PUBLIC_FILE_PUBLIC_BASE_URL?.trim() ||
  loadEnvLocalValue("NEXT_PUBLIC_FILE_PUBLIC_BASE_URL") ||
  "http://localhost:3005";

function imageRemotePatternFromBaseUrl(baseUrl: string) {
  try {
    const url = new URL(baseUrl);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/uploads/**",
    };
  } catch {
    return null;
  }
}

const fileServicePattern = imageRemotePatternFromBaseUrl(filePublicBaseUrl);

function isLocalFileService(baseUrl: string): boolean {
  try {
    const { hostname } = new URL(baseUrl);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname === "::1"
    );
  } catch {
    return false;
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_PORT: port,
    NEXT_PUBLIC_TENANT_DOMAIN: tenantDomain,
    NEXT_PUBLIC_FILE_PUBLIC_BASE_URL: filePublicBaseUrl,
  },
  images: {
    ...(isLocalFileService(filePublicBaseUrl)
      ? { dangerouslyAllowLocalIP: true }
      : {}),
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      ...(fileServicePattern ? [fileServicePattern] : []),
    ],
  },
};

export default nextConfig;

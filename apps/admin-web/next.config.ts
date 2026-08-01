import type { NextConfig } from "next";

/**
 * Origin of the commerce API, derived from `API_BASE_URL`
 * (e.g. `http://143.198.211.47:9090/api/v1/admin` → `http://143.198.211.47:9090`).
 * Used to proxy media over the server-side connection — see the `/media` rewrite
 * below and `src/core/utils/media-url.ts`.
 */
function apiOrigin(): string {
  const base = process.env.API_BASE_URL;
  if (base) {
    try {
      return new URL(base).origin;
    } catch {
      // fall through to the default below
    }
  }
  return "http://143.198.211.47:9090";
}

const nextConfig: NextConfig = {
  transpilePackages: ["@platform/ecommerce-core", "@platform/crm-core"],
  async rewrites() {
    return [
      // The API serves images over plain HTTP; the deployed dashboard is HTTPS,
      // so the browser blocks them as mixed content. Proxy `/media/*` to the API
      // origin so images are fetched server-side and returned over HTTPS.
      // `mediaSrc()` rewrites the API's absolute HTTP URLs onto this path.
      {
        source: "/media/:path*",
        destination: `${apiOrigin()}/:path*`,
      },
    ];
  },
};

export default nextConfig;

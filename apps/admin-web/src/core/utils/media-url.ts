/**
 * Rewrite an absolute HTTP media URL from the commerce API to a same-origin
 * `/media/...` path.
 *
 * The commerce API is served over plain HTTP (see `API_BASE_URL`), so its image
 * URLs come back as `http://…/storage/…`. On the deployed dashboard — which is
 * served over HTTPS — the browser blocks those HTTP images as mixed content and
 * they render blank, even though the surrounding data (fetched server-side)
 * loads fine. The `/media/:path*` rewrite in `next.config.ts` proxies that path
 * to the API origin over the server-side connection, so the browser only ever
 * requests images from its own HTTPS origin.
 *
 * Left untouched (returned as-is): already-relative paths, `https:` URLs, and
 * local previews (`blob:` / `data:`), so object-URL previews of not-yet-uploaded
 * files keep working.
 */
export function mediaSrc(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:") {
      return `/media${parsed.pathname}${parsed.search}`;
    }
    // https: / blob: / data: — safe to load directly.
    return url;
  } catch {
    // Relative or malformed URL — leave it to resolve against the page origin.
    return url;
  }
}
